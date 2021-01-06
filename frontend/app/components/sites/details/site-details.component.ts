import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "@geonature_common/service/common.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

/**
 * This component is the home page of a CMR Site.
 */
@Component({
  selector : 'pnx-cmr-site-details',
  templateUrl: './site-details.component.html',
  styleUrls: ['./../../../../style.scss', './site-details.component.scss']
})
export class SiteDetailsComponent extends BaseMapViewComponent implements OnInit {
  public path: Array<any> = [];
  public module: Module = new Module();
  public site: any = {};
  public medias: Array<any> = [];
  public visits: Array<any> = [];
  public visitListProperties: Array<any> = [];
  public visitFieldsDef: any = {};
  public individuals: Array<any> = [];
  public properties: Array<any> = [];
  public fields: Array<any> = [];
  public individualListProperties: Array<any> = [];
  public individualFieldsDef: any = {};

  public waitControl = false;
  public filterIndividualDisplay = false;
  public filterVisitDisplay = false;
  @ViewChild(NgbModal)
  public modalCol: NgbModal;
  public modalReference;

  constructor(
    private _cmrService: CmrService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _commonService: CommonService,
    public ngbModal: NgbModal,
    private _dataService: DataService // used in template
  ) {
    super();
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      this._cmrService.loadOneModule(params.module).subscribe(() => {
        this.module = this._cmrService.getModule(params.module);
        this.properties = this.module.forms.site.display_properties;
        this.fields = this.module.forms.site.fields;
        this.visitListProperties = this.module.forms.visit.display_list;
        this.visitFieldsDef = this.module.forms.visit.fields;
        this._cmrService.getOneSiteGeometry(params.id_site).subscribe((data) => {
          this.site = data[0].properties;
          this.medias = this.site.medias;
          this.path = this._dataService.buildBreadcrumbPath("site", this.module, this.site);
          this.path = [...this.path];
          if (params.id_sitegroup) {
            this._cmrService.getOneSiteGroupGeometry(params.id_sitegroup).subscribe((dataSitegroup) => {
              // Get all sites of this sitegroup to display other sites
              this._cmrService.getAllSitesGeometriesBySiteGroup(params.id_sitegroup, {}).subscribe((dataAllSites) => {
                this.mapFeatures = {'features': dataSitegroup.concat(dataAllSites)};
                setTimeout(function() {this.initFeatures(this._route, this.module);}.bind(this), 300);
              });
            });
          } else {
            this.mapFeatures = {'features': data};
            setTimeout(function() {this.initFeatures(this._route, this.module);}.bind(this), 300);
          }
        });
        this.individualListProperties = this.module.forms.individual.display_list;
        this.individualFieldsDef = this.module.forms.individual.fields;
        this.applyVisitSearch({});
        this.applyIndividualSearch({});
      });
    });
  }

  applyIndividualSearch(event) {
    this.waitControl = true;
    var params = event ? event : {};
    this._cmrService.getAllIndividualsBySite(this._route.snapshot.params.id_site, params).subscribe(
      (data) => {
        this.individuals = data;
        this.waitControl = false;
      },
      (error) => {
        this.individuals = [];
        this.waitControl = false;
      });
  }

  applyVisitSearch(event) {
    this.waitControl = true;
    var params = event ? event : {};

    this._cmrService.getAllVisitsBySite(this._route.snapshot.params.id_site, params).subscribe(
      (data) => {
        this.visits = data;
        this.waitControl = false;
      },
      (error) => {
        this.visits = [];
        this.waitControl = false;
      });
  }

  openModalDownload(event, modal) {
    this.modalReference = this.ngbModal.open(modal, { size: "lg" });
  }

  deleteSite() {
    this._cmrService.deleteObject('site', this._route.snapshot.params.id_site).subscribe(
      (data) => {
        this.modalReference.close()
        this._router.navigate(['../..'],{relativeTo: this._route});
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

  /**
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