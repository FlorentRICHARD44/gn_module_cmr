import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, ValidatorFn } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';

@Component({
    selector : 'pnx-cmr-observation-form',
    templateUrl: './observation-form.component.html',
    styleUrls: ['./../../../../style.scss', './observation-form.component.scss']
})
export class ObservationFormComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public observation: any = {};
    public site: any = {};
    public visit: any = {};
    public individual: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public cardContentHeight: any;
    public allForm: FormGroup;
    public observationForm: FormGroup;
    public observationFormDefinitions = [];

    // Management of additional form groups
    public formGroups: Array<any> = [];

    public bEdit = false;
    private _document = {};

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
        this.allForm = this._formBuilder.group({});
        this.observationForm = this._formBuilder.group({});
        this.allForm.addControl('child0',this.observationForm);
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
            this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
              this._router.routeReuseStrategy.shouldReuseRoute = () => false;
              this._router.onSameUrlNavigation = 'reload';
              this._router.navigate(['.'],{relativeTo: this._route});
            });
        } else {
            this.module = data;
            this.individualProperties = this.module.forms.individual.display_properties;
            this.individualFields = this.module.forms.individual.fields;
            this.observationFormDefinitions = this._dataService.buildFormDefinitions(this.module.forms.observation.fields);

            this.formGroups = this.module.forms.observation.groups;
            var i = 1;
            for (var grp of this.formGroups) {
              grp['id'] = i;
              grp['form'] = this._formBuilder.group({});
              this.allForm.addControl('child' + i,grp['form']);
              i++;
              grp['formDef'] = this._dataService.buildFormDefinitions(grp['fields']);
            }
            this._cmrService.getOneVisit(this._route.snapshot.paramMap.get('id_visit')).subscribe((data) => {
                this.visit = data;
                this.site = {
                    id_site: this.visit.id_site,
                    name: this.visit.site_name
                };
                this._cmrService.getOneSite(this.visit.id_site).subscribe((data) => {
                  this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code]
                  }];
                  if (data.id_sitegroup){
                    this.path = this.path.concat([
                      {
                        "text": this.module.forms.sitegroup.label + ": " + data.sitegroup.name,
                        "link":  ['module',this.module.module_code, 'sitegroup', data.id_sitegroup]
                      },{
                        "text": this.module.forms.site.label + ": " + this.site.name,
                        "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site')],
                     }, {
                        "text": this.module.forms.visit.label,
                        "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                    }]);
                  } else {
                    this.path = this.path.concat([{
                        "text": this.module.forms.site.label + ": " + this.site.name,
                        "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site')],
                     }, {
                        "text": this.module.forms.visit.label,
                        "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                    }]);
                  }
                  this.path = [...this.path];
                });
            });
            this._cmrService.getOneIndividual(this._route.snapshot.paramMap.get('id_individual')).subscribe((data) => {
                this.individual = data;
            });
            var editId = this._route.snapshot.paramMap.get('edit');
            if (editId) {
                this.bEdit = true;
                this._cmrService.getOneObservation(editId).subscribe((data) => {
                    this.observation = data;
                    this.observationForm.patchValue(this._dataService.formatDataForBeforeEdition(data, this.module.forms.observation.fields));
                    for (var grp of this.formGroups) {
                      grp['form'].patchValue(this._dataService.formatDataForBeforeEdition(data, grp['fields']));
                      for (var field of Object.keys(grp['fields'])) {
                        if (grp['fields'][field].type_widget == "checkbox") {
                          for (var i = 0; i < data[field].length; i++) {
                            var input = <HTMLInputElement>(document.getElementById(data[field][i]));
                            input.checked = true;
                        }
                      }
                    }
                  }
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
        var data = this.observationForm.value;
        var fields =  JSON.parse(JSON.stringify(this.module.forms.observation.fields));
        for (let grp of this.formGroups) {
          data = Object.assign(data, grp['form'].value);
          fields = Object.assign(fields, grp['fields'])
        }

        var formData = this._dataService.formatPropertiesBeforeSave(data, fields);
        formData["id_visit"] = this._route.snapshot.paramMap.get('id_visit'),
        formData["id_individual"] = this._route.snapshot.paramMap.get('id_individual')
    
        this._cmrService.saveObservation(formData).subscribe(result => {
            this._router.navigate(['../../..'],{relativeTo: this._route});
        });
    }
}