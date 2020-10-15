import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

/**
 * This component is the detail page of a CMR Individual.
 */
@Component({
    selector : 'pnx-cmr-individual-details',
    templateUrl: './individual-details.component.html',
    styleUrls: ['./../../../../style.scss', './individual-details.component.scss']
})
export class IndividualDetailsComponent extends BaseMapViewComponent implements OnInit {
  
  @ViewChild(DatatableComponent) tableHistoric: DatatableComponent;
    public path: Array<any> = [];
    public module: Module = new Module();
    public individual: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];
    public historic: Array<any> = [];
    public historicListProperties: Array<any>= [];
    public historicFieldsDef: any = {};
    public selected: Array<any> = [];
    public graphs: Array<any> = [];
    public mapFeatures: any = {};
    public mapFeaturesTemp: any = {};

    private _firstResizeDone = false;
    

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _mapListService: MapListService,
        private _dataService: DataService // used in template
    ) {
      super();
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.individual.display_properties;
                this.fields = this.module.forms.individual.fields;
                this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code]
                }];
                this.path = [...this.path];
                this._cmrService.getOneIndividual(params.id_individual).subscribe((data) => this.individual = data);

                this.historicListProperties = this.module.forms.observation.individual_historic_display_list;
                this.historicFieldsDef = Object.assign({},this.module.forms.observation.fields);
                for (var grp of Object.keys(this.module.forms.observation.groups)) {
                  this.historicFieldsDef = Object.assign(this.historicFieldsDef,this.module.forms.observation.groups[grp].fields);
                }

                this._cmrService.getAllObservationsByIndividual(params.id_individual).subscribe((data) => {
                  this.historic = data;
                  for (let item of this.module.forms.observation.individual_histogram_items) {
                    let histoData = [];
                    for (let obs of this.historic) {
                      histoData.push({
                        x: obs['visit_date'],
                        y: obs[item.field]
                      });
                    }
                      let graph = {
                      label: this.historicFieldsDef[item.field].attribut_label,
                      data: histoData,
                      color: item.color
                    }
                    this.graphs.push(graph);
                  }
                  this.graphs = [...this.graphs];
                  // Problem: only 1 line instead of N
                });
              this._cmrService.getAllObservationsGeometriesByIndividual(params.id_individual).subscribe((data) => {
                this.mapFeaturesTemp = {'features': data};
              });
            });
        });
    }

    /**
     * This method refresh the map size when clicking on tab (only first time).
     * Because map panel size not well made when placed on second tab. 
     */
    refreshMapSize() {
      if (!this._firstResizeDone) {
        setTimeout(function() {
          this.calcCardContentHeight();
          this.mapFeatures = this.mapFeaturesTemp;
          setTimeout(this.initFeatures.bind(this), 500);
        }.bind(this), 300);
        this._firstResizeDone = true;
      }
    }

    /**
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     */
    initFeatures() {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
        this.setPopup(lyr, this.route, ft);
        lyr.setStyle(this.getMapStyle());
        let onLyrClickFct = this.onFeatureLayerClick(ft);
        lyr.off('click', onLyrClickFct);
        lyr.on('click', onLyrClickFct);
      }
    }
    /**
     * Called when click on a row in the table.
     * @param event 
     */
    onHistoricRowClick(event) {
      if (!(event && event.type === 'click')) {
        return;
      }
      this.updateFeaturesStyle(this.mapFeatures,[event.row.id_observation]);
      for (let ft of this.mapFeatures['features']) {
        let lyr = this.findFeatureLayer(ft.id, ft.object_type);
        if (ft.id === event.row.id_observation) {
          lyr.openPopup();
        } else {
          lyr.closePopup();
        }
      }
      this._mapListService.zoomOnSelectedLayer(this._mapService.map, this.findFeatureLayer(event.row.id_observation, 'observation'));
    }
    
    /**
     * Called when click on a feature on the map.
     * @param feature 
     */
    onFeatureLayerClick(feature) {
      return (event) => {
        this.updateFeaturesStyle(this.mapFeatures, [feature.id]);
        this.setSelected(feature.id);
      }
    }

    /**
     * Update the selection in table.
     * @param id_feature 
     */
    setSelected(id_feature) {
      // this.table._internalRows permet d'avoir les ligne triées et d'avoir les bons index
      const index_row_selected = this.tableHistoric._internalRows.findIndex(row => row.id_observation === id_feature);
      if (index_row_selected === -1) {
        return;
      }
      this.selected = [this.tableHistoric._internalRows[index_row_selected]];
      this.selected = [...this.selected];
      this.tableHistoric.offset = Math.floor((index_row_selected) / this.tableHistoric._limit);
    }
}