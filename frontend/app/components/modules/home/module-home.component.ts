import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from '@librairies/rxjs';
import { mergeMap } from '@librairies/rxjs/operators';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { BaseMapViewComponent } from './../../BaseMapViewComponent';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { MatDialog } from "@angular/material";
import { Module } from '../../../class/module';

/**
 * This component is the home page of a CMR Sub-module.
 */
@Component({
    selector : 'pnx-cmr-module-home',
    templateUrl: './module-home.component.html',
    styleUrls: ['./../../../../style.scss', './module-home.component.scss']
})
export class ModuleHomeComponent extends BaseMapViewComponent implements OnInit {
    public module: Module = new Module();
    public properties: Array<any> = [];
    public fields: any = {};
    public individuals: Array<any> = [];
    public individualListProperties: Array<any> = [];
    public individualFieldsDef: any = {};
    public sitegroups: Array<any> = [];
    public sitegroupListProperties: Array<any> = [];
    public sitegroupFieldsDef: any = {};
    public sites: Array<any> = [];
    public siteListProperties: Array<any> = [];
    public siteFieldsDef: any = {};
    public selected = [];
    public selectedIndividual = [];
    public obsStyle;

    public mapFeaturesIndividuals;

    @ViewChild(DatatableComponent) tableSitegroup: DatatableComponent;

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _router: Router,
        private _mapListService: MapListService,
        public dialog: MatDialog,
        private _dataService: DataService
    ) {
      super();
      this.obsStyle = this.getMapStyle('observation');
    }

    ngOnInit() {
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
                this._cmrService.getAllSitesByModule(this.module.id_module).subscribe((data) => this.sites = data);
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getAllIndividualsByModule(this.module.id_module).subscribe((data) => this.individuals = data);
                
                this._cmrService.getAllSitegroupsByModule(this.module.id_module).subscribe((data) => this.sitegroups = data);
                this._cmrService.getAllSitegroupsGeometriesByModule(this.module.id_module).subscribe((data) => {
                  this.mapFeatures = {'features':data};
                  setTimeout(function() {this.initFeatures(this.route,this.module);}.bind(this), 500);
                  this._cmrService.getAllIndividualsGeometriesByModule(this.module.id_module).subscribe((data)=> {
                    this.mapFeaturesIndividuals = {'features': data};
                  });
                });
                return of(true);
              })
            ).subscribe(() => {});
        });
    }

    /**
     * Called when click on a row in the sitegroup table.
     * @param event 
     */
    onSitegroupRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyle(this.mapFeatures, [event.row.id_sitegroup], 'sitegroup');
      for (let ft of this.mapFeatures['features']) {
        let lyr = this.findFeatureLayer(ft.id, ft.object_type);
        if (ft.id === event.row.id_sitegroup) {
          lyr.openPopup();
        } else {
          lyr.closePopup();
        }
      }
      this._mapListService.zoomOnSelectedLayer(this._mapService.map, this.findFeatureLayer(event.row.id_sitegroup, 'sitegroup'));
    }

    /**
     * Called when click on a row in the individual table.
     * @param event 
     */
    onIndividualRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyleIndividual(this.mapFeaturesIndividuals, [event.row.id_individual], 'observation');
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