import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

@Component({
    selector : 'pnx-cmr-observation-form',
    templateUrl: './observation-form.component.html',
    styleUrls: ['./../../../../style.scss', './observation-form.component.scss']
})
export class ObservationFormComponent extends BaseMapViewComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public observation: any = {};
    public site: any = {};
    public visit: any = {};
    public individual: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public allForm: FormGroup;
    public observationForm: FormGroup;
    public observationFormDefinitions = [];
    public externalAssetsPath;

    // Management of additional form groups
    public formGroups: Array<any> = [];

    public bEdit = false;
    private _document = {};

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder
    ) {
      super();
    }

    ngOnInit() {
        this.externalAssetsPath = this._cmrService.getExternalAssetsPath();
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
            for (let grp of this.formGroups) {
              grp['id'] = i;
              grp['form'] = this._formBuilder.group({});
              this.allForm.addControl('child' + i,grp['form']);
              i++;
              grp['formDef'] = this._dataService.buildFormDefinitions(grp['fields']);
            }
            this._cmrService.getOneVisit(this._route.snapshot.paramMap.get('id_visit')).subscribe((data) => {
                this.visit = data;
                this.path = BreadcrumbComponent.buildPath('observation', this.module, {visit: this.visit});
                this.path = [...this.path];
            });
            this._cmrService.getOneIndividual(this._route.snapshot.paramMap.get('id_individual')).subscribe((data) => {
                this.individual = data;
            });
            this._cmrService.getOneSiteGeometry(this._route.snapshot.paramMap.get('id_site')).subscribe((data) => {
              if (this._route.snapshot.paramMap.get('id_sitegroup')) {
                this._cmrService.getOneSiteGroupGeometry(this._route.snapshot.paramMap.get('id_sitegroup')).subscribe((dataSitegroup) => {
                  this.mapFeatures = {'features': dataSitegroup.concat(data)};
                  setTimeout(function() {this.initFeatures(this._route, this.module);}.bind(this), 300);
                });
              } else {
                this.mapFeatures = {'features': data};
                setTimeout(function() {this.initFeatures(this._route, this.module);}.bind(this), 300);
              }
            });
            var editId = this._route.snapshot.paramMap.get('edit');
            if (editId) {
                this.bEdit = true;
                this._cmrService.getOneObservation(editId).subscribe((data) => {
                    this.observation = data;
                    this.observationForm.patchValue(this._dataService.formatDataForBeforeEdition(data, this.module.forms.observation.fields));
                    for (let grp of this.formGroups) {
                      grp['form'].patchValue(this._dataService.formatDataForBeforeEdition(data, grp['fields']));
                      if (grp['yesno_field']) {
                        let yesno_field = grp['form'].get(grp['yesno_field']);
                        setTimeout(() => this.updateStatus(grp, yesno_field), 500);
                      }
                    }
                });
            }
        }
    }

    ngAfterViewInit() {
      super.ngAfterViewInit();
      for (let grp of this.formGroups) {
        if (grp['yesno_field']) {
          let yesno_field = grp['form'].get(grp['yesno_field']);
          if (yesno_field) {
            yesno_field.registerOnChange(() => this.updateStatus(grp, yesno_field));
            this.updateStatus(grp, yesno_field); // Execute once
          }
        }
      }
    }

    /* Manage Yes/No updates in the form groups.
       * If Yes is selected, the other fields are enabled and their required value is applied.
       * If No is selected, the other fields are disabled and doesn't matter for the form validation.
       * Disabled fieds are not pushed when saved and so their previous value are lost if previously saved.
       */
    updateStatus(grp, yesno_field) {
      for (let field of Object.keys(grp['fields'])) {
        if (field != grp['yesno_field']) {
          if (yesno_field.value == grp['yesno_yesvalue']) {
            grp['form'].get(field).enable();
          } else {
            /* Strange behaviour, need to enable then disable in short time
             * Otherwise the disable is not taken into account.
             */
            grp['form'].get(field).enable();
            setTimeout(() => grp['form'].get(field).disable(), 100);
          }
        }
      }
    };

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