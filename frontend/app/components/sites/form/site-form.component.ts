import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';

@Component({
    selector : 'pnx-cmr-site-form',
    templateUrl: './site-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class SiteFormComponent implements OnInit {
    public path = [];
    public module: any = {config:{},forms:{site:{}}};
    public cardContentHeight: any;
    public leafletDrawOptions: any = {};
    public siteForm: FormGroup;
    public siteFormDefinitions = [];

    public bChainInput = false;

    constructor(
        private _cmrService: CmrService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _cmrMapService: CmrMapService,
        private _formBuilder: FormBuilder,
        private _commonService: CommonService
    ) {
        
    }

    ngOnInit() {
        this.siteForm = this._formBuilder.group({});
        this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionReadOnly();
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
          this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._router.navigate(['.'],{relativeTo: this._route});
          });
        } else {
          this.module = data;
          this.path = [{
              "text": "Module: " + this.module.module_label, 
              "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset')],
          }];
          this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionDrawAll(this.module.forms.site.geometry_types);
          var schema = this.module.forms.site.fields;
          this.siteFormDefinitions = Object.keys(schema)
              // medias toujours à la fin
              //.sort((a, b) => { return a == 'medias' ? +1 : b == "medias" ? -1 : 0 })
              .filter((attribut_name) => schema[attribut_name].type_widget)
              .map((attribut_name) => {
                  const elem = schema[attribut_name];
                  elem["attribut_name"] = attribut_name;
                  return elem;
              });
        }
    }
     
    ngAfterViewInit() {
        setTimeout(() => this.calcCardContentHeight(), 300);
    }
    @HostListener("window:resize", ["$event"])
    onResize(event) {
      this.calcCardContentHeight();
    }
    calcCardContentHeightParent(minusHeight?) {
      const windowHeight = window.innerHeight;
      const tbH = document.getElementById("app-toolbar")
        ? document.getElementById("app-toolbar").offsetHeight
        : 0;
      const height = windowHeight - tbH - (minusHeight || 0);
      return height;
    }
    calcCardContentHeight() {
      let minusHeight = 10;
  
      this.cardContentHeight = this.calcCardContentHeightParent(minusHeight + 20)
  
      // resize map after resize container
      if (this._mapService.map) {
        setTimeout(() => {
          this._mapService.map.invalidateSize();
        }, 10);
      }
    }

    setNewGeometry(geojson) {

    }

    onSubmit(addVisit) {
        var formData = this.siteForm.value;
        formData['id_module'] = this.module.id_module;
        var id_dataset = this._route.snapshot.paramMap.get('id_dataset');
        if (id_dataset != 'none') {
          formData['id_dataset'] = id_dataset;
        }
        this._cmrService.saveSite(formData).subscribe(result => {
            if (this.bChainInput) { // update form resetting all fields not configured to be kept.
              this.siteForm.reset();
              var patch = {};
              for (var k of Object.keys(formData)) {
                if( this.module.forms.site.properties_to_keep_when_chaining.indexOf(k) > -1) {
                  patch[k] = formData[k]
                }
              }
              this.siteForm.patchValue(patch);
              this._commonService.regularToaster(
                "info",
                "Formulaire enregistré!"
              );
            } else if (addVisit) {
              this._router.navigate(['..', 'site', result.id_site, 'visit'],{relativeTo: this._route});
            } else {  // go the details page
              this._router.navigate(['..', 'site', result.id_site],{relativeTo: this._route});
            }
          });
    }
}