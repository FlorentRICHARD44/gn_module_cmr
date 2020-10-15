import { Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { Layer } from '@librairies/leaflet';
import { MapService } from "@geonature_common/map/map.service";
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { CmrService } from './../../../services/cmr.service';
import { CmrMapService } from './../../../services/cmr-map.service';
import { DataService } from './../../../services/data.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { Module } from '../../../class/module';

/**
 * This component is the home page of a CMR Sub-module.
 */
@Component({
    selector : 'pnx-cmr-module-home',
    templateUrl: './module-home.component.html',
    styleUrls: ['./../../../../style.scss', './module-home.component.scss']
})
export class ModuleHomeComponent implements OnInit {
    public module: Module = new Module();
    public properties: Array<any> = [];
    public fields: any = {};
    public cardContentHeight: any;
    public individuals: Array<any> = [];
    public individualListProperties: Array<any> = [];
    public individualFieldsDef: any = {};
    public sitegroups: Array<any> = [];
    public sitegroupListProperties: Array<any> = [];
    public sitegroupFieldsDef: any = {};
    public sites: Array<any> = [];
    public siteListProperties: Array<any> = [];
    public siteFieldsDef: any = {};
    public mapFeatures = {};
    public selected = [];

    @ViewChild(DatatableComponent) tableSitegroup: DatatableComponent;
    public styles = {};

    constructor(
        private _cmrService: CmrService,
        private _cmrMapService: CmrMapService,
        private route: ActivatedRoute,
        private _router: Router,
        private _mapService: MapService,
        private _mapListService: MapListService,
        public dialog: MatDialog,
        private _dataService: DataService
    ) {}

    ngOnInit() {
      this.styles = this._cmrMapService.getMapFeaturesStyles();
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).pipe(
              mergeMap(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.module.display_properties;
                this.fields = this.module.forms.module.fields;
                this.sitegroupListProperties = this.module.forms.sitegroup.display_list;
                this.sitegroupFieldsDef = this.module.forms.sitegroup.fields;
                this.siteListProperties = this.module.forms.site.display_list;
                this.siteFieldsDef = this.module.forms.site.fields;
                this._cmrService.getAllSitegroupsByModule(this.module.id_module).subscribe((data) => this.sitegroups = data);
                this._cmrService.getAllSitesByModule(this.module.id_module).subscribe((data) => this.sites = data);
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getAllIndividualsByModule(this.module.id_module).subscribe((data) => this.individuals = data);
                
                this._cmrService.getAllSitegroupsGeometriesByModule(this.module.id_module).subscribe((data) => {
                  this.mapFeatures = {'features':data};
                  setTimeout(this.initFeatures.bind(this), 500);
                });
                return of(true);
              })
            ).subscribe(() => {});
        });
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
    /**
     * Find a feature layer by its id.
     * @param id 
     */
    findSitegroupLayer(id): Layer {
      const layers = this._mapService.map['_layers'];
      const layerKey = Object.keys(layers).find(key => {
        const feature = layers[key] && layers[key].feature;
        return feature && (feature['id'] === id || feature.properties['id'] === id);
      });
      return layerKey && layers[layerKey];
    }

    /**
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     */
    initFeatures() {
      for (let ft of this.mapFeatures['features']) {
        var url_base = [location.href];
        if (ft['object_type'] == 'sitegroup') {
          url_base.push('sitegroup', ft['id']);
        } else if (ft['object_type'] == 'site') {
          url_base.push('site', ft['id']);
        }
        var lyr = this.findSitegroupLayer(ft.id);
        this.setPopup(lyr, url_base);
        lyr.setStyle(this.styles['default']);
        let onLyrClickFct = this.onSitegroupLayerClick(ft);
        lyr.off('click', onLyrClickFct);
        lyr.on('click', onLyrClickFct);
      }
    }
    /**
     * Build a popup to the feature.
     * @param layer 
     * @param url_base 
     */
    setPopup(layer, url_base) {  
      if (layer._popup) {
        return;
      }
      const url = url_base.join('/');
      const sPopup = `
      <div>
        <h5>  <a href=${url}>${layer['feature'].properties.name}</a></h5>
      </div>
      `;
      layer.bindPopup(sPopup).closePopup();
    }
    /**
     * Called when click on a feature on the map.
     * @param sitegroup 
     */
    onSitegroupLayerClick(sitegroup) {
      return (event) => {
        this.updateFeaturesStyle([sitegroup.id]);
        this.setSelected(sitegroup.id);
      }
    }

    /**
     * Called when click on a row in the table.
     * @param event 
     */
    onSitegroupRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyle([event.row.id_sitegroup]);
      for (let ft of this.mapFeatures['features']) {
        let lyr = this.findSitegroupLayer(ft.id);
        if (ft.id === event.row.id_sitegroup) {
          lyr.openPopup();
        } else {
          lyr.closePopup();
        }
      }
      this._mapListService.zoomOnSelectedLayer(this._mapService.map, this.findSitegroupLayer(event.row.id_sitegroup));
    }
    /**
     * Update the style of features on map according new status.
     * @param selected 
     */
    updateFeaturesStyle(selected) {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findSitegroupLayer(ft.id);
        if (selected.indexOf(ft.id) > -1) {
          lyr.setStyle(this.styles['selected']);
        } else {
          lyr.setStyle(this.styles['default']);
        }
      }
    }

    /**
     * Update the selection in table.
     * @param id_sitegroup 
     */
    setSelected(id_sitegroup) {
      // this.table._internalRows permet d'avoir les ligne triées et d'avoir les bons index
      const index_row_selected = this.tableSitegroup._internalRows.findIndex(row => row.id_sitegroup === id_sitegroup);
      if (index_row_selected === -1) {
        return;
      }
      this.selected = [this.tableSitegroup._internalRows[index_row_selected]];
      this.selected = [...this.selected];
      this.tableSitegroup.offset = Math.floor((index_row_selected) / this.tableSitegroup._limit);
    }
}