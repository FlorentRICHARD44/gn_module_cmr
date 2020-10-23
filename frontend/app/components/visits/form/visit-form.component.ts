import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService, SpecificService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { IndividualFormObsComponent } from "./../../individuals/form-obs/individual-form-obs.component";
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

@Component({
    selector : 'pnx-cmr-visit-form',
    templateUrl: './visit-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class VisitFormComponent extends BaseMapViewComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public site: any = {};
    public visit: any = {};
    public visitForm: FormGroup;
    public genericVisitForm: FormGroup;
    public visitFormDefinitions = [];

    public bChainInput = false;
    public bEdit = false;
    public bSaving = false;
    public initData = {};

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _commonService: CommonService
    ) {
        super();
    }

    ngOnInit() {
        this.genericVisitForm =  this._formBuilder.group({});
        this.visitForm = this._formBuilder.group({ // use a not generic form to manage the "observation" checkbox
          'observation': null
        });

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
          this.visitFormDefinitions = this._dataService.buildFormDefinitions(schema);
          this._cmrService.getOneSiteGeometry(this._route.snapshot.paramMap.get('id_site')).subscribe((data) => {
            this.site = data[0].properties;
            this.initData = this._cmrService.getSpecificService(this.module.module_code).initVisit(this.genericVisitForm, this.site);
            this.genericVisitForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.visit.fields));
            this.path = BreadcrumbComponent.buildPath('visit', this.module, {site: data[0].properties});
              this.path = [...this.path];
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
            this._cmrService.getOneVisit(editId).subscribe((data) => {
              this.visit = data;
              var fields = this.module.forms.visit.fields;
              var formattedValues = this._dataService.formatDataForBeforeEdition(data, fields);
              this.visitForm.patchValue(formattedValues);
              this.genericVisitForm.patchValue(formattedValues);
            });
          }
        }
    }
     
    ngAfterViewInit() {
      super.ngAfterViewInit();
      this.visitForm.patchValue({"id_site": this._route.snapshot.paramMap.get('id_site')});
    }

    onSubmit(addObservation) {
      this.bSaving = true;
      var formValues = this.genericVisitForm.value;
      formValues['observation'] = this.visitForm.get('observation').value;
      var formData = this._dataService.formatPropertiesBeforeSave(formValues, this.module.forms.visit.fields);
      formData['id_site'] = this.site.id_site;
      this._cmrService.saveVisit(formData).subscribe(result => {
        this.bSaving = false;
        if (this.bChainInput) { // update form resetting all fields not configured to be kept.
          this.visitForm.reset();
          this.genericVisitForm.reset();
          var patch = {};
          for (var k of Object.keys(formData)) {
            if( this.module.forms.visit.properties_to_keep_when_chaining.indexOf(k) > -1) {
              patch[k] = formData[k]
            }
          }
          this.genericVisitForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.visit.fields));
          this.visitForm.patchValue(patch);
          this.genericVisitForm.patchValue(patch);
          this._commonService.regularToaster(
            "info",
            "Formulaire enregistré!"
          );
        } else if (addObservation) {  // go the details page
          let idVisit = result.id_visit;
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {
            module: this.module,
            visit: this.visit
          };
          dialogConfig.maxHeight = window.innerHeight - 10 + "px";
          dialogConfig.width = '500px';
          dialogConfig.position = { top: "30px" };
          var dialogRef = this.dialog.open(IndividualFormObsComponent, dialogConfig);
          dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this._router.navigate(['..', 'visit', idVisit,'individual',result, 'observation'],{relativeTo: this._route});
              }
          });
        } else {  // go the details page
          this._router.navigate(['..', 'visit', result.id_visit],{relativeTo: this._route});
        }
      });
    }
}