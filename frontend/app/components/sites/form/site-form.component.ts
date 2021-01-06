import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormService } from "@geonature_common/form/form.service";
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from '../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';

/**
 * Component for the site form.
 */
@Component({
  selector : 'pnx-cmr-site-form',
  templateUrl: './site-form.component.html',
  styleUrls: ['./../../../../style.scss', './site-form.component.scss']
})
export class SiteFormComponent extends BaseMapViewComponent implements OnInit {
  public path = [];
  public module: Module = new Module();
  public leafletDrawOptions: any = {};
  public siteForm: FormGroup;
  public siteFormDefinitions = [];
  public site: any = {};
  public sitegroup: any = {};
  public geometry;

  public waitControl = false;
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
    private _dataService: DataService,
    private _formService: FormService
  ) {
    super();
  }

  ngOnInit() {
    this.siteForm = this._formBuilder.group({});
    // remove the current draw
    this._mapService.removeAllLayers(this._mapService.map, this._mapService.leafletDrawFeatureGroup);
    // Remove previously imported GPS File
    this._mapService.removeAllLayers(this._mapService.map, this._mapService.fileLayerFeatureGroup);
    // remove the current marker
    if (this._mapService.marker) {
      this._mapService.map.removeLayer(this._mapService.marker);
    }
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
      this.path = this._dataService.buildBreadcrumbPath("site", this.module, {});
      if (this._route.snapshot.paramMap.get('id_sitegroup')) {
        this._cmrService.getOneSiteGroupGeometry(this._route.snapshot.paramMap.get('id_sitegroup')).subscribe(
          (data) => {
            let sitegroup = data[0].properties;
            this.sitegroup = data;
            this.mapFeatures = {'features': data };
            this.path = this._dataService.buildBreadcrumbPath("site", this.module, {id_sitegroup: sitegroup.id_sitegroup, sitegroup:sitegroup});
            this.path = [...this.path];
            this.initData = this._cmrService.getSpecificService(this.module.module_code).initSite(this.siteForm, sitegroup);
            this.siteForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.site.fields));
            setTimeout(function() {
                // Get all sites of this sitegroup to display other sites
                this._cmrService.getAllSitesGeometriesBySiteGroup(this._route.snapshot.paramMap.get('id_sitegroup'), {}).subscribe(
                  (dataAllSites) => {
                    this.mapFeatures = {'features': data.concat(dataAllSites)};
                    setTimeout(function() {
                      this.initFeatures(this._route, this.module);
                      for (let ft of this.mapFeatures['features']) {
                        var lyr = this.findFeatureLayer(sitegroup.id, 'sitegroup');
                        if (lyr) {
                          lyr.bringToBack(); // force the sitegroup in back, to not be in front of imported points from GPS.
                        }
                      }
                      }.bind(this), 300);
                  },
                  (error) => {
                    this.initFeatures(this._route, this.module);
                    for (let ft of this.mapFeatures['features']) {
                      var lyr = this.findFeatureLayer(sitegroup.id, 'sitegroup');
                      if (lyr) {
                        lyr.bringToBack(); // force the sitegroup in back, to not be in front of imported points from GPS.
                      }
                    }
                  });
              
            }.bind(this), 300);
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
      this._cmrService.getOneSiteGeometry(editId).subscribe((data) => {
        this.site = data[0].properties;
        this.siteForm.patchValue(this._dataService.formatDataForBeforeEdition(this.site, this.module.forms.site.fields));
        this.siteForm.patchValue({'geom':data[0].geometry});
        this.geometry = data[0].geometry;
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
  }

  /**
   * Called when user draw a geometry
   * @param geojson 
   */
  setNewGeometry(geojson) {
    this.addNewGeometry(geojson, false);
  }

  /**
   * Called when user selects a geometry imported from file.
   * @param geojson 
   */
  onGeomChangeGPSFile(geojson) {
    if (geojson.geometry.coordinates.length > 2) {
      geojson.geometry.coordinates = [geojson.geometry.coordinates[0], geojson.geometry.coordinates[1]];
    }
    this.addNewGeometry(geojson, true);
  }

  addNewGeometry(geojson, get_properties) {
    if (this.module.forms.site.check_site_within_sitegroup) {
      this.waitControl = true;
      this._cmrService.checkSiteGroupContainsSite(this._route.snapshot.paramMap.get('id_sitegroup'), geojson.geometry).subscribe((data) => {
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

  onSubmit(addVisit) {
    this.bSaving = true;
    var formData = this._dataService.formatPropertiesBeforeSave(this.siteForm.value,this.module.forms.site.fields);
    formData['id_module'] = this.module.id_module;
    if (this._route.snapshot.paramMap.get('id_sitegroup')) {
      formData['id_sitegroup'] = this._route.snapshot.paramMap.get('id_sitegroup');
    }
    this._cmrService.saveSite(formData).subscribe(result => {
      this.bSaving = false;
      if (this.bChainInput) { // update form resetting all fields not configured to be kept.
        var patch = {};
        for (var k of Object.keys(formData)) {
          if( this.module.forms.site.properties_to_keep_when_chaining.indexOf(k) > -1) {
            patch[k] = this.siteForm.value[k]
          }
        }
        this.siteForm.reset();
        this.siteForm.patchValue(this._dataService.formatDataForBeforeEdition(this.initData, this.module.forms.site.fields));
        this.siteForm.patchValue(this._dataService.formatDataForBeforeEdition(patch, this.module.forms.site.fields));
        
        // Clear drawn geom or selection on GPS layers if any
        let layers = this._mapService.fileLayerFeatureGroup.getLayers();
        for (let lyr of layers) {
          if (lyr['setStyle']) {
            lyr['setStyle'](this._mapService.searchStyle);
          }
        }
        // remove the current draw
        this._mapService.removeAllLayers(this._mapService.map, this._mapService.leafletDrawFeatureGroup);
        // remove the current marker
        if (this._mapService.marker) {
          this._mapService.map.removeLayer(this._mapService.marker);
        }
        if (this.sitegroup) {
          // Refresh the list of all sites created within this sitegroup.
          this._cmrService.getAllSitesGeometriesBySiteGroup(this._route.snapshot.paramMap.get('id_sitegroup'), {}).subscribe(
            (dataAllSites) => {
              this.mapFeatures = {'features': this.sitegroup.concat(dataAllSites)};
              setTimeout(function() {
                this.initFeatures(this._route, this.module);
                for (let ft of this.mapFeatures['features']) {
                  var lyr = this.findFeatureLayer(this.sitegroup.id, 'sitegroup');
                  if (lyr) {
                    lyr.bringToBack(); // force the sitegroup in back, to not be in front of imported points from GPS.
                  }
                }
                }.bind(this), 300);
            });
          }

        // Inform user the creation is done
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

  /**
   * Called when click on a feature on the map.
   * @param sitegroup 
   */
  onSitegroupLayerClick(sitegroup) {
    return (event) => {
      this.updateFeaturesStyle(this.mapFeatures, [sitegroup.id], 'sitegroup');
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(sitegroup.id, 'sitegroup');
        if (lyr) {
          lyr.bringToBack(); // force the sitegroup in back, to not be in front of imported points from GPS.
        }
      }
    }
  }/**
   * Initialize the feature with:
   * * add a popup (with name and hyperlink)
   */
  initFeatures(route, module) {
    for (let ft of this.mapFeatures['features']) {
      var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
      this.setPopup(lyr, route, ft, module);
      lyr.setStyle(this.getMapStyle(ft['object_type']));
      // Other sites are less semi-transparent
      if (ft.object_type == 'site' && ft.properties.id_site != this.site.id_site) {
        ft['hidden'] = true;
        lyr.setStyle(this.getMapStyle('siteother'));
      } else if (ft.object_type == 'site' && ft.properties.id_site == this.site.id_site) {
        lyr.bringToFront();
        ft['object_type'] = 'currentsite';
        lyr.setStyle(this.getMapStyle('currentsite'));
      }
      let onLyrClickFct = this.onFeatureLayerClick(ft, ft['object_type']);
      lyr.off('click', onLyrClickFct);
      lyr.on('click', onLyrClickFct);
    }
  }
}