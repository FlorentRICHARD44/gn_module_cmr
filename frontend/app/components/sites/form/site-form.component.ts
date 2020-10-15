import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from '../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

@Component({
    selector : 'pnx-cmr-site-form',
    templateUrl: './site-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class SiteFormComponent extends BaseMapViewComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public leafletDrawOptions: any = {};
    public siteForm: FormGroup;
    public siteFormDefinitions = [];
    public site: any = {};
    public geometry;

    public bChainInput = false;
    public bEdit = false;

    constructor(
        private _cmrService: CmrService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cmrMapService: CmrMapService,
        private _formBuilder: FormBuilder,
        private _commonService: CommonService,
        private _dataService: DataService
    ) {
        super();
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
          this.path =
          this.path = BreadcrumbComponent.buildPath("site", this.module, {});
          if (this._route.snapshot.paramMap.get('id_sitegroup')) {
            this._cmrService.getOneSiteGroup(this._route.snapshot.paramMap.get('id_sitegroup')).subscribe(
              (data) => {
                this.path = BreadcrumbComponent.buildPath("site", this.module, {id_sitegroup: data.id_sitegroup, sitegroup:{name: data.name}});
                this.path = [...this.path];
              }
            );
          }
          this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionDrawAll(this.module.forms.site.geometry_types);
          var schema = this.module.forms.site.fields;
          this.siteFormDefinitions = this._dataService.buildFormDefinitions(schema);
        }
        var editId = this._route.snapshot.paramMap.get('edit');
        if (editId) {
          this.bEdit = true;
          this._cmrService.getOneSite(editId).subscribe((data) => {
            this.site = data;
            this.siteForm.patchValue(this._dataService.formatDataForBeforeEdition(data, this.module.forms.site.fields));
            this._cmrService.getOneSiteGeometry(editId).subscribe((data) => {
              this.siteForm.patchValue({'geom':data[0].geometry});
                this.geometry = data[0].geometry;
            });
          });
        }
    }
     
    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.siteForm.addControl(
          "geom",
          this._formBuilder.control("", Validators.required)
        );
    }

    setNewGeometry(geojson) {
      this.siteForm.patchValue({
        geom: geojson ? geojson.geometry : undefined
      });
    }

    onSubmit(addVisit) {
        var formData = this._dataService.formatPropertiesBeforeSave(this.siteForm.value,this.module.forms.site.fields);
        formData['id_module'] = this.module.id_module;
        if (this._route.snapshot.paramMap.get('id_sitegroup')) {
          formData['id_sitegroup'] = this._route.snapshot.paramMap.get('id_sitegroup');
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