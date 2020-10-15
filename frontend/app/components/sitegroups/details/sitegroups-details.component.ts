import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { MatDialog } from "@angular/material";
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';

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

    constructor(
        private _cmrService: CmrService,
        private _router: Router,
        private _route: ActivatedRoute,
        protected _mapService: MapService,
        public dialog: MatDialog,
        private _dataService: DataService // used in template
    ) {
      super(_mapService);
    }

    ngOnInit() {
        this._route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code]
                }];
                this.path = [...this.path];

                this.properties = this.module.forms.sitegroup.display_properties;
                this.fields = this.module.forms.sitegroup.fields;
                this.siteListProperties = this.module.forms.site.display_list;
                this.siteFieldsDef = this.module.forms.site.fields;
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getOneSiteGroup(params.id_sitegroup).subscribe((data) => {
                    this.sitegroup = data;

                    this._cmrService.getAllSitesBySiteGroup(this.sitegroup.id_sitegroup).subscribe((data) => this.sites = data);
                    this._cmrService.getAllIndividualsBySiteGroup(this.sitegroup.id_sitegroup).subscribe((data) => this.individuals = data);
                });
                this._cmrService.getOneSiteGroupGeometry(params.id_sitegroup).subscribe((data) => {
                  this.mapFeatures = {'features':data};
                  this._cmrService.getAllSitesGeometriesBySiteGroup(params.id_sitegroup).subscribe((data) => {
                    this.mapFeatures['features'] = this.mapFeatures['features'].concat(data);
                    this.mapFeatures = {...this.mapFeatures};
                  });
                });
            });
        });
    }
}