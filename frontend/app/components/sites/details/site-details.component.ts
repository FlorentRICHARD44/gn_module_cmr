import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

/**
 * This component is the home page of a CMR Site.
 */
@Component({
    selector : 'pnx-cmr-site-details',
    templateUrl: './site-details.component.html',
    styleUrls: ['./../../../../style.scss', './site-details.component.scss']
})
export class SiteDetailsComponent implements OnInit {
    public path: Array<any> = [];
    public module: any = {config:{},forms:{site:{}}};
    public cardContentHeight: any;
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
        private _mapService: MapService,
        private _dataService: DataService // used in template
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.site.display_properties;
                this.fields = this.module.forms.site.fields;
                this.visitListProperties = this.module.forms.visit.display_list;
                this.visitFieldsDef = this.module.forms.visit.fields;
                this._cmrService.getOneSite(params.id_site).subscribe((data) => {
                  this.site = data;
                  this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code]
                  }];
                  if (this.site.id_sitegroup) {
                    this.path.push({
                      "text": this.module.forms.sitegroup.label + ": " + this.site.sitegroup.name,
                      "link": ['module',this.module.module_code, 'sitegroup', this.site.id_sitegroup]
                    });
                  }
                  this.path = [...this.path];
                
                });
                this._cmrService.getAllVisitsBySite(params.id_site).subscribe((data) => this.visits = data);
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getAllIndividualsBySite(params.id_site).subscribe((data) => this.individuals = data);
            })
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
}