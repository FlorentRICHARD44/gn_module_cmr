import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { MapService } from "@geonature_common/map/map.service";
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
    private moduleName = "";
    public cardContentHeight: any;
    public leafletDrawOptions: any = {};
    public siteForm: FormGroup;
    public siteFormDefinitions = [];

    constructor(
        private _cmrService: CmrService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _cmrMapService: CmrMapService,
        private _formBuilder: FormBuilder
    ) {
        
    }

    ngOnInit() {
        //this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionReadOnly();
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        this.module = data;
        this.path = [{
            "text": "Module: " + this.module.module_label, 
            "link": ['module',this.module.module_code]
        }];
        this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionDrawAll(data.forms.site.geometry_types);
        var schema = data.forms.site.fields;
        var fields = {};
        /*for (let f of Object.keys(schema)) {
            fields[f] = null;
        }*/
        this.siteForm = this._formBuilder.group(fields);
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

    onSubmit() {
        var formData = this.siteForm.value;
        formData['id_module'] = this.module.id_module;
        this._cmrService.saveSite(formData).subscribe(result => {
            this._router.navigate(['..', 'site', result.id_site],{relativeTo: this._route});
          });
    }
}