import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from "@angular/material";
import { Router, ActivatedRoute } from '@angular/router';
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
    public mapFeatures = {};
 
    public individuals: Array<any> = [];
    public individualListProperties: Array<any> = [];
    public individualFieldsDef: any = {};
    public sites: Array<any> = [];
    public siteListProperties: Array<any> = [];
    public siteFieldsDef: any = {};

    @ViewChild(DatatableComponent) tableSite: DatatableComponent;
    public selected=[];
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
                  this.mapFeatures = {'features':data};
                  this._cmrService.getAllIndividualsBySiteGroup(this.sitegroup.id_sitegroup).subscribe((data) => this.individuals = data);
                  setTimeout(this.initFeatures.bind(this), 300);
                  this._cmrService.getAllSitesGeometriesBySiteGroup(params.id_sitegroup).subscribe((data) => {
                    this.sites = data.map(site => site.properties);
                    this.mapFeatures['features'] = this.mapFeatures['features'].concat(data);
                    this.mapFeatures = {...this.mapFeatures};
                    setTimeout(this.initFeatures.bind(this), 300);
                  });
                });
            });
        });
    }

    /**
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     */
    initFeatures() {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
        lyr.setStyle(this.getMapStyle(ft['object_type']));
        if (ft['object_type'] == 'site') {
          this.setPopup(lyr, this._route, ft, this.module);
          let onLyrClickFct = this.onSiteLayerClick(ft);
          lyr.off('click', onLyrClickFct);
          lyr.on('click', onLyrClickFct);
        }
      }
    }
    /**
     * Called when click on a feature on the map.
     * @param site
     */
    onSiteLayerClick(site) {
      return (event) => {
        this.updateFeaturesStyle(this.mapFeatures, [site.id], 'site');
        this.setSelected(site.id);
      }
    }
    /**
     * Called when click on a row in the table.
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
}