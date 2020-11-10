import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { CommonService } from "@geonature_common/service/common.service";
import leafletImage from 'leaflet-image';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

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
  public nbMedias = 0; // Count the number of medias in individual and observation to know if show the export medias button

  private _firstResizeDone = false;
  @ViewChild(NgbModal)
  public modalCol: NgbModal;
  public modalReference;

  constructor(
    private _cmrService: CmrService,
    private _router: Router,
    private route: ActivatedRoute,
    private _mapListService: MapListService,
    public ngbModal: NgbModal,
    private _commonService: CommonService,
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
        this.path = BreadcrumbComponent.buildPath('individual', this.module);
        this.path = [...this.path];
        this._cmrService.getOneIndividual(params.id_individual).subscribe((data) => {
          this.individual = data;
          this.nbMedias = this.nbMedias + this.individual.medias.length;
        });

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
              this.nbMedias = this.nbMedias + obs.medias.length;
              histoData.push({
                x: obs['visit_date'],
                y: obs[item.field]
              });
            }
            let graph = {
              label: this.historicFieldsDef[item.field].attribut_label,
              data: histoData,
              color: item.color
            };
            this.graphs.push(graph);
          }
          this.graphs = [...this.graphs];
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
        setTimeout(function() {this.initFeatures(this.route, this.module);}.bind(this), 500);
      }.bind(this), 300);
      this._firstResizeDone = true;
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
    this.updateFeaturesStyle(this.mapFeatures,[event.row.id_observation], 'observation');
    for (let ft of this.mapFeatures['features']) {
      let lyr = this.findFeatureLayer(ft.id, ft.object_type);
      if (ft.id === event.row.id_observation) {
        lyr.bringToFront();
        lyr.openPopup();
      } else {
        lyr.closePopup();
      }
    }
    this._mapListService.zoomOnSelectedLayer(this._mapService.map, this.findFeatureLayer(event.row.id_observation, 'observation'));
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

  openModalDownload(event, modal) {
    document.getElementById('nav-historic-tab').click(); // force display of map when clicking on export
    this.modalReference = this.ngbModal.open(modal, { size: "lg" });
  }

  getFicheIndividual() {
    var me = this;
    leafletImage(this._mapService.map, function(err, canvas) {
      me._cmrService.getFicheIndividual(me.route.snapshot.params.module, me.route.snapshot.params.id_individual, canvas.toDataURL('image/png'));
    });
  }

  getMediaZip() {
    this._cmrService.getIndividualMediasZip(this.route.snapshot.params.id_individual);
  }

  deleteIndividual() {
    this._cmrService.deleteObject('individual', this.route.snapshot.params.id_individual).subscribe(
      (data) => {
        this.modalReference.close()
        this._router.navigate(['../..'],{relativeTo: this.route});
      },
      (error => {
        this.modalReference.close()
        this._commonService.regularToaster(
          "error",
          "Erreur lors de la suppression!"
        );
      })
    )
  }
}