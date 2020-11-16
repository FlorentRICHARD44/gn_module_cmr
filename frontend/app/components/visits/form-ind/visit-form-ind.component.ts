import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

/**
 * Component to create a visit from an individual.
 * Select an existing site or create it in this form.
 */
@Component({
  selector : 'pnx-cmr-visit-form-find',
  templateUrl: './visit-form-ind.component.html',
  styleUrls: ['./../../../../style.scss']
})
export class VisitFormIndComponent extends BaseMapViewComponent implements OnInit {
  public path = [];
  public module: Module = new Module();
  public individual: any = {};
  public sitegroups: Array<any> = []; // List of sitegroups for selection
  public sitegroupsGeojson: Array<any> = [];
  public sites: Array<any> = []; // List of sites for selection
  public sitesGeojson: Array<any> = [];
  public site: any = {};
  public visit: any = {};
  public visitForm: FormGroup;
  public genericVisitForm: FormGroup;
  public visitFormDefinitions = [];

  public bSaving = false;
  public initData = {};
  public selectionType = "select"; // Choice if 'select' an existing site or 'create' it.
  public siteForm: FormGroup;
  public siteFormDefinitions: Array<any> = [];
  public selectedSitegroup = null;
  public waitControl = false;
  public leafletDrawOptions: any = {};

  constructor(
    private _cmrService: CmrService,
    private _cmrMapService: CmrMapService,
    private _dataService: DataService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _commonService: CommonService
  ) {
    super();
  }

  ngOnInit() {
    this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionReadOnly();
    this.siteForm = this._formBuilder.group({});
    this.genericVisitForm =  this._formBuilder.group({});
    this.visitForm = this._formBuilder.group({ // use a not generic form to manage the "observation" checkbox
      'observation': true
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
      this.leafletDrawOptions = this._cmrMapService.getLeafletDrawOptionDrawAll(this.module.forms.site.geometry_types);
      if (this.module.config.use_sitegroup) {
        this._cmrService.getAllSitegroupsGeometriesByModuleFiltered(this.module.id_module, {}).subscribe((data) => {
          this.sitegroupsGeojson = data;
          this.sitegroups = []
          for (let sg of data) {
            this.sitegroups.push(sg.properties);
          }
        });
      }
      var schema = data.forms.visit.fields;
      this.visitFormDefinitions = this._dataService.buildFormDefinitions(schema);
      this.siteFormDefinitions = this._dataService.buildFormDefinitions(this.module.forms.site.fields);
      this._cmrService.getOneIndividual(this._route.snapshot.paramMap.get('id_individual')).subscribe((data) => {
        this.individual = data;
        this.path = this._dataService.buildBreadcrumbPath('visit-individual', this.module, {individual: data});
        this.path = [...this.path];
        this.initData = this._cmrService.getSpecificService(this.module.module_code).initVisit(this.genericVisitForm, {});
        this.genericVisitForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.visit.fields));
      });
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.siteForm.addControl( // Add a control with required for the geometry.
      "geom",
      this._formBuilder.control("", Validators.required)
    );
    this._dataService.addFormValidatorsToForm(this.siteForm, this.module.forms.site);
    this._dataService.addFormValidatorsToForm(this.genericVisitForm, this.module.forms.visit);
  }

  onSubmit(addObservation) {
    this.bSaving = true;

    // site form values
    var siteFormData = this._dataService.formatPropertiesBeforeSave(this.siteForm.value,this.module.forms.site.fields);
    siteFormData['id_module'] = this.module.id_module;
    if (this.selectedSitegroup !== null && this.selectedSitegroup !== 'null') {
      siteFormData['id_sitegroup'] = this.selectedSitegroup;
    }
    // Save site
    this._cmrService.saveSite(siteFormData).subscribe(resultSite => {
      // Visit form values
      var formValues = this.genericVisitForm.value;
      formValues['observation'] = this.visitForm.get('observation').value;
      var formData = this._dataService.formatPropertiesBeforeSave(formValues, this.module.forms.visit.fields);
      formData['id_site'] = resultSite.id_site;

      // Then save visit
      this._cmrService.saveVisit(formData).subscribe(result => {
        this.bSaving = false;
        let nextRoute = ['../../..'];
        if (this.module.config.use_sitegroup && this.selectedSitegroup !== null && this.selectedSitegroup !== 'null') {
          nextRoute = nextRoute.concat(['sitegroup', this.selectedSitegroup]);
        }
        nextRoute = nextRoute.concat(['site', resultSite.id_site, 'visit', result.id_visit, 'individual', this._route.snapshot.params.id_individual, 'observation']);
        this._router.navigate(nextRoute,{relativeTo: this._route});
      });
    });
  }

  onSelectSitegroup(event) {
    this.mapFeatures = {'features': []};
    for (let item of this.sitegroupsGeojson) {
      if (item.properties.id_sitegroup == event.target.value) {
        this.mapFeatures = {'features': [item]};
        // Apply style
        setTimeout(function() {
          let lyr = this.findFeatureLayer(item.id, 'sitegroup');
          lyr.setStyle(this.getMapStyle('sitegroup'));
        }.bind(this), 300);
      }
    }
    this.mapFeatures = {...this.mapFeatures};
  }

  /**
   * Called when user draw a geometry.
   * @param geojson 
   */
  setNewGeometry(geojson) {
    this.addNewGeometry(geojson, false);
  }

  /**
   * Called when user selects a geometry from imported file.
   * @param geojson 
   */
  onGeomChangeGPSFile(geojson) {
    if (geojson.geometry.coordinates.length > 2) {
      geojson.geometry.coordinates = [geojson.geometry.coordinates[0], geojson.geometry.coordinates[1]]
    }
    this.addNewGeometry(geojson, true);
  }

  addNewGeometry(geojson, get_properties) {
    if (this.module.forms.site.check_site_within_sitegroup && this.selectedSitegroup !== null && this.selectedSitegroup !== 'null') {
      this.waitControl = true;
      this._cmrService.checkSiteGroupContainsSite(this.selectedSitegroup, geojson.geometry).subscribe((data) => {
        this.waitControl = false;
        if (data.contains_site) {
          this.siteForm.patchValue({
            geom: geojson ? geojson.geometry : undefined
          });
          if (get_properties) {
            this.siteForm.patchValue({
              name: geojson.properties.name,
              comments: geojson.properties.desc
            });
          }
          this._commonService.regularToaster(
            "success",
            "Géométrie valide"
          );
        } else {
          this.siteForm.patchValue({
            geom: undefined
          });
          this._commonService.regularToaster(
            "error",
            this.module.forms.site.label + " en dehors de " + this.module.forms.sitegroup.label
          );
        }
      });
    } else {
      this.siteForm.patchValue({
        geom: geojson ? geojson.geometry : undefined
      });
      if (get_properties) {
        this.siteForm.patchValue({
          name: geojson.properties.name,
          comments: geojson.properties.desc
        });
      }
    }
  }
}