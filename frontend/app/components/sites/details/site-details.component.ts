import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaService } from '@geonature_common/service/media.service';
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

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        public ms: MediaService,
        private _dataService: DataService // used in template
    ) {
      super();
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.site.display_properties;
                this.fields = this.module.forms.site.fields;
                this.visitListProperties = this.module.forms.visit.display_list;
                this.visitFieldsDef = this.module.forms.visit.fields;
                this._cmrService.getOneSiteGeometry(params.id_site).subscribe((data) => {
                  this.site = data[0].properties;
                  this.medias = this.site.medias;
                  this.path = BreadcrumbComponent.buildPath("site", this.module, this.site);
                  this.path = [...this.path];
                  if (params.id_sitegroup) {
                    this._cmrService.getOneSiteGroupGeometry(params.id_sitegroup).subscribe((dataSitegroup) => {
                      this.mapFeatures = {'features': dataSitegroup.concat(data)};
                      setTimeout(function() {this.initFeatures(this.route, this.module);}.bind(this), 300);
                    });
                  } else {
                    this.mapFeatures = {'features': data};
                    setTimeout(function() {this.initFeatures(this.route, this.module);}.bind(this), 300);
                  }
                });
                this._cmrService.getAllVisitsBySite(params.id_site).subscribe((data) => this.visits = data);
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getAllIndividualsBySite(params.id_site).subscribe((data) => this.individuals = data);
            })
        });
    }
}