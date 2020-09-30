import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from './../../../services/data.service';

@Component({
    selector : 'pnx-cmr-visit-form',
    templateUrl: './visit-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class VisitFormComponent implements OnInit {
    public path = [];
    public module: any = {config:{},forms:{site:{}}};
    public site: any = {};
    public cardContentHeight: any;
    public visitForm: FormGroup;
    public visitFormDefinitions = [];

    public bChainInput = false;

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _cmrMapService: CmrMapService,
        private _formBuilder: FormBuilder,
        private _commonService: CommonService
    ) {
        
    }

    ngOnInit() {
        this.visitForm = this._formBuilder.group({});
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
          this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._router.navigate(['.'],{relativeTo: this._route});
          });
        } else {
          this.module = data;
          var schema = data.forms.visit.fields;
          this.visitFormDefinitions = Object.keys(schema)
              .filter((attribut_name) => schema[attribut_name].type_widget)
              .map((attribut_name) => {
                  const elem = schema[attribut_name];
                  elem["attribut_name"] = attribut_name;
                  return elem;
              });
          this._cmrService.getOneSite(this._route.snapshot.paramMap.get('id_site')).subscribe((data) => {
              this.site = data;
              this.path = [{
                  "text": "Module: " + this.module.module_label, 
                  "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset')]
              },{
                  "text": this.module.forms.site.label + ": " + this.site.name,
                  "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site')],
              }];
          });
        }
    }
     
    ngAfterViewInit() {
        this.visitForm.patchValue({"id_site": this._route.snapshot.paramMap.get('id_site')});
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

    onSubmit() {
        var formData = this._dataService.formatPropertiesBeforeSave(this.visitForm.value, this.module.forms.visit.fields);
        formData['id_site'] = this.site.id_site;
        this._cmrService.saveVisit(formData).subscribe(result => {
            if (this.bChainInput) { // update form resetting all fields not configured to be kept.
              this.visitForm.reset();
              var patch = {};
              for (var k of Object.keys(formData)) {
                if( this.module.forms.visit.properties_to_keep_when_chaining.indexOf(k) > -1) {
                  patch[k] = formData[k]
                }
              }
              this.visitForm.patchValue(patch);
              this._commonService.regularToaster(
                "info",
                "Formulaire enregistré!"
              );
            } else {  // go the details page
              this._router.navigate(['..', 'visit', result.id_visit],{relativeTo: this._route});
            }
          });
    }
}