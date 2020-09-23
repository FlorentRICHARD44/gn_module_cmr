import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';

/**
 * This component is the home page of a CMR Sub-module.
 */
@Component({
    selector : 'pnx-cmr-module-home',
    templateUrl: './module-home.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class ModuleHomeComponent implements OnInit {
    public module: any = {config:{}};
    public cardContentHeight: any;
    public sites: Array<any> = [];
    public individuals: Array<any> = [];

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _mapService: MapService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).pipe(
              mergeMap(() => {
                return of(true);
              }),
              mergeMap(() => {
                this.module = this._cmrService.getModule(params.module);
                this._cmrService.getAllSitesByModule(this.module.id_module).subscribe((data) => this.sites = data);
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