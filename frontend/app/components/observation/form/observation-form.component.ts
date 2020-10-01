import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

@Component({
    selector : 'pnx-cmr-observation-form',
    templateUrl: './observation-form.component.html',
    styleUrls: ['./../../../../style.scss', './observation-form.component.scss']
})
export class ObservationFormComponent implements OnInit {
    public path = [];
    public module: any = {config:{},forms:{observation:{},site:{}}};
    public observation: any = {};
    public site: any = {};
    public visit: any = {};
    public individual: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public cardContentHeight: any;
    public observationForm: FormGroup;
    public observationFormDefinitions = [];

    public bEdit = false;

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _formBuilder: FormBuilder
    ) {
    }

    ngOnInit() {
        this.observationForm = this._formBuilder.group({});
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
            this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
              this._router.routeReuseStrategy.shouldReuseRoute = () => false;
              this._router.onSameUrlNavigation = 'reload';
              this._router.navigate(['.'],{relativeTo: this._route});
            });
          } else {
            this.module = data;
            var schema = this.module.forms.observation.fields;
            this.individualProperties = this.module.forms.individual.display_properties;
            this.individualFields = this.module.forms.individual.fields;
            this.observationFormDefinitions = this._dataService.buildFormDefinitions(schema);
            this._cmrService.getOneVisit(this._route.snapshot.paramMap.get('id_visit')).subscribe((data) => {
                this.visit = data;
                this.site = {
                    id_site: this.visit.id_site,
                    name: this.visit.site_name
                };
                this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset')]
                }, {
                    "text": this.module.forms.site.label + ": " + this.site.name,
                    "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site')],
                }, {
                    "text": "Visite",
                    "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                }];
            });
            this._cmrService.getOneIndividual(this._route.snapshot.paramMap.get('id_individual')).subscribe((data) => {
                this.individual = data;
            });
            var editId = this._route.snapshot.paramMap.get('edit');
            if (editId) {
                this.bEdit = true;
                this._cmrService.getOneObservation(editId).subscribe((data) => {
                    this.observation = data;
                    this.observationForm.patchValue(data);
                });
            }
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

    onSubmit() {
        var formData = this._dataService.formatPropertiesBeforeSave(this.observationForm.value, this.module.forms.observation.fields);
        formData["id_visit"] = this._route.snapshot.paramMap.get('id_visit'),
        formData["id_individual"] = this._route.snapshot.paramMap.get('id_individual')
    
        this._cmrService.saveObservation(formData).subscribe(result => {
            this._router.navigate(['../../..'],{relativeTo: this._route});
        });
    }
}