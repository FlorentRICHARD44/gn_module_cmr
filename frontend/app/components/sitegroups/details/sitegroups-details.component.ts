import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from '@librairies/@swimlane/ngx-datatable';
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';
import { SitegroupBatchVisitComponent } from '../batchvisit/sitegroup-batchvisit.component';

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
    public medias = [];
    public properties: Array<any> = [];
    public fields: Array<any> = [];
 
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

    public waitControl = false;
    public filterSiteDisplay = false;
    public filterIndividualDisplay = false;

    @ViewChild(DatatableComponent) tableSite: DatatableComponent;
    public selected=[];
    public selectedIndividual = []
    constructor(
        private _cmrService: CmrService,
        private _route: ActivatedRoute,
        public dialog: MatDialog,
        private _mapListService: MapListService,
        private _commonService: CommonService,
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
                  this.medias = this.sitegroup.medias || [];
                  this.mapDataSitegroups = data;
                  this.mapFeatures = {"features": this.mapDataSitegroups};
                    setTimeout(this.initFeaturesSites.bind(this), 300);
                  this.applySiteSearch({});
                  this.applyIndividualSearch({});
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
      this.selectedIndividual = [];
      this.mapFeatures = {"features": this.mapDataSitegroups.concat(this.mapDataSites.concat(this.mapDataIndividuals))};
      setTimeout(function() {
        this.initFeaturesIndividuals()
      }.bind(this), 300);
    }

    showSites() {
      this.bShowIndividuals = false;
      this.selected = [];
      this.mapFeatures = {"features": this.mapDataSitegroups.concat(this.mapDataSites)};
      setTimeout(function() {
        this.initFeaturesSites()
      }.bind(this), 300);
    }

    onClickBatchVisit() {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {module: this.module, sites: this.sites};
      dialogConfig.maxHeight = window.innerHeight - 20 + "px";
      dialogConfig.position = { top: "30px" };
      var dialogRef = this.dialog.open(SitegroupBatchVisitComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => { 
          if (result) {
              // Need to refresh list of sites to have new nb visits.
              this.applySiteSearch({});
              // info to user.
              this._commonService.regularToaster(
                "info",
                result.visits.length + " visites créées"
              );
          }
      });
    }

    applySiteSearch(event) {
      this.waitControl = true;
      var params = event ? event : {};
      this._cmrService.getAllSitesGeometriesBySiteGroup(this._route.snapshot.params.id_sitegroup, params).subscribe(
        (data) => {
          this.mapDataSites = data;
          this.sites = [];
          for (let site of data) {
            this.sites.push(site.properties);
          }
          this.mapFeatures = {"features": this.mapDataSitegroups.concat(data)};
          this.waitControl = false;
          this.selected = [];
          setTimeout(this.showSites.bind(this), 300);
      },
      (error) => {
        this.mapDataSites = [];
        this.sites = [];
        this.selected = [];
        this.waitControl = false;
        setTimeout(this.showSites.bind(this), 300);
      });
    }

    applyIndividualSearch(event) {
      this.waitControl = true;
      var params = event ? event : {};
      this._cmrService.getAllIndividualsGeometriesBySiteGroup(this._route.snapshot.params.id_sitegroup, params).subscribe(
        (data) => {
          this.waitControl = false;
          this.mapDataIndividuals = data;
          let individualsId = [];
          let obsPerIndividual = {};
          this.individuals = [];
          for (let item of data) {
            if (individualsId.indexOf(item.properties.individual.id_individual) == -1) {
              individualsId.push(item.properties.individual.id_individual);
              this.individuals.push(item.properties.individual);
            }
            if (!obsPerIndividual.hasOwnProperty(item.properties.individual.id_individual)) {
              obsPerIndividual[item.properties.individual.id_individual] = 0;
            }
            obsPerIndividual[item.properties.individual.id_individual]++;
          }
          for (let indi of this.individuals) {
            indi['nb_observations'] = obsPerIndividual[indi.id_individual];
          }
          this.individuals = [...this.individuals];
          this.selectedIndividual = [];
          this.showIndividuals();
      },
      (error) => {
        this.waitControl = false;
        this.selectedIndividual = [];
        this.mapDataIndividuals = [];
        this.individuals = [];
        this.showIndividuals();
      });
    }
}