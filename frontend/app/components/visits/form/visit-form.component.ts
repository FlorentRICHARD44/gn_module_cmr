import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';

@Component({
    selector : 'pnx-cmr-visit-form',
    templateUrl: './visit-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class VisitFormComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public site: any = {};
    public cardContentHeight: any;
    public visit: any = {};
    public visitForm: FormGroup;
    public genericVisitForm: FormGroup;
    public visitFormDefinitions = [];

    public bChainInput = false;
    public bEdit = false;

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _formBuilder: FormBuilder,
        private _commonService: CommonService
    ) {
        
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
          this._cmrService.getOneSite(this._route.snapshot.paramMap.get('id_site')).subscribe((data) => {
              this.site = data;
              this.path = [{
                  "text": "Module: " + this.module.module_label, 
                  "link": ['module',this.module.module_code]
              }];
              if (this.site.id_sitegroup) {
                this.path.push({
                  "text": this.module.forms.sitegroup.label + ": " + this.site.sitegroup.name,
                  "link": ['module',this.module.module_code, 'sitegroup', this.site.id_sitegroup]
                });
                this.path.push({
                  "text": this.module.forms.site.label + ": " + this.site.name,
                  "link": ['module',this.module.module_code, 'sitegroup', this.site.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site')],
                });
              } else {
                this.path.push({
                  "text": this.module.forms.site.label + ": " + this.site.name,
                  "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site')],
                });
              }
              this.path = [...this.path];
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
      var formValues = this.genericVisitForm.value;
      formValues['observation'] = this.visitForm.get('observation').value;
      var formData = this._dataService.formatPropertiesBeforeSave(formValues, this.module.forms.visit.fields);
      formData['id_site'] = this.site.id_site;
      this._cmrService.saveVisit(formData).subscribe(result => {
        if (this.bChainInput) { // update form resetting all fields not configured to be kept.
          this.visitForm.reset();
          this.genericVisitForm.reset();
          var patch = {};
          for (var k of Object.keys(formData)) {
            if( this.module.forms.visit.properties_to_keep_when_chaining.indexOf(k) > -1) {
              patch[k] = formData[k]
            }
          }
          this.visitForm.patchValue(patch);
          this.genericVisitForm.patchValue(patch);
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