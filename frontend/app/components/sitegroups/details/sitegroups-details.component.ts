import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

/**
 * This component is the home page of a CMR Site Group.
 */
@Component({
    selector : 'pnx-cmr-sitegroup-details',
    templateUrl: './sitegroups-details.component.html',
    styleUrls: ['./../../../../style.scss', './sitegroups-details.component.scss']
})
export class SiteGroupDetailsComponent extends BaseMapViewComponent implements OnInit {
    public path: Array<any> = [];
    public module: Module = new Module();
    public sitegroup: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];
    public medias: Array<any> = [];
 
    public individuals: Array<any> = [];
    public individualListProperties: Array<any> = [];
    public individualFieldsDef: any = {};
    public sites: Array<any> = [];
    public siteListProperties: Array<any> = [];
    public siteFieldsDef: any = {};

    public mapDataSitegroups = [];
    public mapDataSites = [];
    public mapDataIndividuals = [];
    public bShowIndividuals = false;

    @ViewChild(DatatableComponent) tableSite: DatatableComponent;
    public selected=[];
    public selectedIndividual = []
    constructor(
        private _cmrService: CmrService,
        private _route: ActivatedRoute,
        public dialog: MatDialog,
        private _mapListService: MapListService,
        private _dataService: DataService // used in template
    ) {
      super();
    }

    ngOnInit() {
        this._route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.path = BreadcrumbComponent.buildPath('sitegroup',this.module);
                this.path = [...this.path];

                this.properties = this.module.forms.sitegroup.display_properties;
                this.fields = this.module.forms.sitegroup.fields;
                this.siteListProperties = this.module.forms.site.display_list;
                this.siteFieldsDef = this.module.forms.site.fields;
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getOneSiteGroupGeometry(params.id_sitegroup).subscribe((data) => {
                  this.sitegroup = data[0].properties;
                  this.mapDataSitegroups = data;
                  this.mapFeatures = {"features": this.mapDataSitegroups};
                    setTimeout(this.initFeaturesSites.bind(this), 300);
                  this._cmrService.getAllIndividualsBySiteGroup(this.sitegroup.id_sitegroup).subscribe((data) => this.individuals = data);
                  this._cmrService.getAllSitesBySiteGroup(params.id_sitegroup).subscribe((data) => this.sites = data);
                  this._cmrService.getAllSitesGeometriesBySiteGroup(params.id_sitegroup).subscribe((data) => {
                    this.mapDataSites = data;
                    this.mapFeatures = {"features": this.mapDataSitegroups.concat(data)};
                    setTimeout(this.initFeaturesSites.bind(this), 300);
                    this._cmrService.getAllIndividualsGeometriesBySiteGroup(params.id_sitegroup).subscribe((data) => {
                      this.mapDataIndividuals = data;
                  });
                });
            });
        });
        });
    }

    /**
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     * need to override here to use the click only on sites.
     */
    initFeaturesSites() {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
        lyr.setStyle(this.getMapStyle(ft['object_type']));
        if (ft['object_type'] == 'site') {
          ft['hidden'] = false;
          this.setPopup(lyr, this._route, ft, this.module);
          let onLyrClickFct = this.onFeatureLayerClick(ft, 'site');
          lyr.off('click', onLyrClickFct);
          lyr.on('click', onLyrClickFct);
        }
      }
    }

    /**
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     * need to override here to use the click only on individuals.
     */
    initFeaturesIndividuals() {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
        lyr.setStyle(this.getMapStyle(ft['object_type']));
        if (ft.object_type == 'site') {
          ft['hidden'] = true;
          lyr.setStyle(this.getMapStyle('hidden'));
        }
        /*if (ft['object_type'] == 'observation') {
          let onLyrClickFct = this.onFeatureLayerClick(ft, 'observation');
          lyr.off('click', onLyrClickFct);
          lyr.on('click', onLyrClickFct);
        }*/
      }
    }

    /**
     * Called when click on a row in the site table.
     * @param event 
     */
    onSiteRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyle(this.mapFeatures, [event.row.id_site], 'site');
      for (let ft of this.mapFeatures['features']) {
        let lyr = this.findFeatureLayer(ft.id, ft.object_type);
        if (ft.id === event.row.id_site) {
          lyr.openPopup();
        } else {
          lyr.closePopup();
        }
      }
      this._mapListService.zoomOnSelectedLayer(this._mapService.map, this.findFeatureLayer(event.row.id_site, 'site'));
    }

    onIndividualRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyleIndividual(this.mapFeatures, [event.row.id_individual], 'observation');
    }
    /**
     * Update the style of features on map according new status.
     * @param selected 
     */
    updateFeaturesStyleIndividual(mapFeatures, selected, object_type) {
      for (let ft of mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft.object_type);
        if (ft.hidden) {
          lyr.setStyle(this.getMapStyle('hidden'));
        } else if (ft.object_type == object_type && selected.indexOf(ft.properties.id_individual) > -1) {
          lyr.setStyle(this.getMapStyle(ft.object_type + '-selected'));
          lyr.bringToFront();
        } else {
          lyr.setStyle(this.getMapStyle(ft.object_type));
        }
      }
  }

    /**
     * Update the selection in table.
     * @param id_site 
     */
    setSelected(id_site) {
      // this.table._internalRows permet d'avoir les ligne triées et d'avoir les bons index
      const index_row_selected = this.tableSite._internalRows.findIndex(row => row.id_site === id_site);
      if (index_row_selected === -1) {
        return;
      }
      this.selected = [this.tableSite._internalRows[index_row_selected]];
      this.selected = [...this.selected];
      this.tableSite.offset = Math.floor((index_row_selected) / this.tableSite._limit);
    }

    showIndividuals() {
      this.bShowIndividuals = true;
      this.mapFeatures = {"features": this.mapDataSitegroups.concat(this.mapDataSites.concat(this.mapDataIndividuals))};
      setTimeout(function() {
        this.initFeaturesIndividuals()
      }.bind(this), 300);
    }

    showSites() {
      this.bShowIndividuals = false;
      this.mapFeatures = {"features": this.mapDataSitegroups.concat(this.mapDataSites)};
      setTimeout(function() {
        this.initFeaturesSites()
      }.bind(this), 300);
    }
}