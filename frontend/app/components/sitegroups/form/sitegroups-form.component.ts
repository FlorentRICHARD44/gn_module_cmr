import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService, SpecificService } from '../../../services/cmr.service';
import { CmrMapService } from '../../../services/cmr-map.service';
import { DataService } from '../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

/**
 * Component for the sitegroup form.
 */
@Component({
  selector : 'pnx-cmr-sitegroup-form',
  templateUrl: './sitegroups-form.component.html',
  styleUrls: ['./../../../../style.scss']
})
export class SiteGroupFormComponent extends BaseMapViewComponent implements OnInit {
  public path = [];
  public module: Module = new Module();
  public leafletDrawOptions: any = {};
  public sitegroupForm: FormGroup;
  public sitegroupFormDefinitions = [];
  public sitegroup: any = {};
  public mapFeature;

  public bChainInput = false;
  public bEdit = false;
  public bSaving = false;
  public initData = {};

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
    this.sitegroupForm = this._formBuilder.group({});
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
      this.path = BreadcrumbComponent.buildPath("sitegroup", this.module);
      this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionDrawAll(this.module.forms.sitegroup.geometry_types);

      setTimeout(function() {
        this.initData = this._cmrService.getSpecificService(this.module.module_code).initSitegroup(this.sitegroupForm);
        this.sitegroupForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.sitegroup.fields));
      }.bind(this), 200);
      for (let item of ['polygon', 'polyline','circlemarker']) {
        if (this.leafletDrawOptions.draw[item]) {
          this.leafletDrawOptions.draw[item] = {
            shapeOptions: this.getMapStyle('sitegroup')
          }
        }
      }
      var schema = this.module.forms.sitegroup.fields;
      this.sitegroupFormDefinitions = this._dataService.buildFormDefinitions(schema);

      var editId = this._route.snapshot.paramMap.get('edit');
      if (editId) {
        this.bEdit = true;
        this._cmrService.getOneSiteGroupGeometry(editId).subscribe((data) => {
          this.sitegroup = data[0].properties;
          this.sitegroupForm.patchValue(this._dataService.formatDataForBeforeEdition(this.sitegroup, this.module.forms.sitegroup.fields));
          this.sitegroupForm.patchValue({'geom':data[0].geometry});
          this.mapFeature = data[0];
          setTimeout(this.updateEditingStyle.bind(this), 300);
        });
      }
    }
  }

  /**
   * Apply the normal style to edited item.
   */
  updateEditingStyle() {
    var layers = this._mapService.map['_layers'];
    for (let key of Object.keys(layers)) {
      if ('editing' in layers[key]) {
        layers[key].setStyle(this.getMapStyle('sitegroup'));
      }
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.sitegroupForm.addControl( // Add control with required for the geometry.
      "geom",
      this._formBuilder.control("", Validators.required)
    );
  }

  /**
   * Called when new geometry is drawn.
   * @param geojson 
   */
  setNewGeometry(geojson) {
    this.sitegroupForm.patchValue({
      geom: geojson ? geojson.geometry : undefined
    });
  }

  onSubmit(addVisit) {
    this.bSaving = true;
    var formData = this._dataService.formatPropertiesBeforeSave(this.sitegroupForm.value,this.module.forms.sitegroup.fields);
    formData['id_module'] = this.module.id_module;
    this._cmrService.saveSiteGroup(formData).subscribe(result => {
      this.bSaving = false;
      if (this.bChainInput) { // update form resetting all fields not configured to be kept.
        this.sitegroupForm.reset();
        var patch = {};
        for (var k of Object.keys(formData)) {
          if ( this.module.forms.site.properties_to_keep_when_chaining.indexOf(k) > -1) {
            patch[k] = formData[k]
          }
        }
        this.sitegroupForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.sitegroup.fields));
        this.sitegroupForm.patchValue(patch);
        this._commonService.regularToaster(
          "info",
          "Formulaire enregistré!"
        );
      } else if (addVisit) {
        this._router.navigate(['..', 'sitegroup', result.id_sitegroup, 'site'],{relativeTo: this._route});
      } else {  // go the details page
        this._router.navigate(['..', 'sitegroup', result.id_sitegroup],{relativeTo: this._route});
      }
    });
  }
}