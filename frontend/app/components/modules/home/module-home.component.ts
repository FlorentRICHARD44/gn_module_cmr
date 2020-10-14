import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
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

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _router: Router,
        private _mapService: MapService,
        public dialog: MatDialog,
        private _dataService: DataService
    ) {}

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
                this._cmrService.getAllSitegroupsByModule(this.module.id_module).subscribe((data) => this.sitegroups = data);
                this._cmrService.getAllSitesByModule(this.module.id_module).subscribe((data) => this.sites = data);
                this.individualListProperties = this.module.forms.individual.display_list;
                this.individualFieldsDef = this.module.forms.individual.fields;
                this._cmrService.getAllIndividualsByModule(this.module.id_module).subscribe((data) => this.individuals = data);
                
                this._cmrService.getAllSitegroupsGeometriesByModule(this.module.id_module).subscribe((data) => {
                  this.mapFeatures = {'features':data};
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
}