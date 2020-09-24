import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ModuleDatasetChoiceComponent } from "./../datasetchoice/module-datasetchoice.component";

/**
 * This component is the home page of a CMR Sub-module.
 */
@Component({
    selector : 'pnx-cmr-module-home',
    templateUrl: './module-home.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class ModuleHomeComponent implements OnInit {
    public module: any = {config:{},forms:{site:{}}};
    public dataset: any = {};
    public cardContentHeight: any;
    public sites: Array<any> = [];
    public individuals: Array<any> = [];
    public siteListProperties: Array<any> = [];
    public siteFieldsDef: any = {};

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _router: Router,
        private _mapService: MapService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.route.params.subscribe(params => {
            if (params.id_dataset != "none") {
              this._cmrService.getDatasetInfo(params.id_dataset).subscribe((data) => this.dataset = data);
            }
            this._cmrService.loadOneModule(params.module).pipe(
              mergeMap(() => {
                return of(true);
              }),
              mergeMap(() => {
                this.module = this._cmrService.getModule(params.module);
                if (this.module.config.use_dataset_filter) {
                }
                this.siteListProperties = this.module.forms.site.display_list;
                this.siteFieldsDef = this.module.forms.site.fields;
                this._cmrService.getAllSitesByModule(this.module.id_module, params.id_dataset).subscribe((data) => this.sites = data);
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
    onClickChangeDataset() {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {};
      dialogConfig.maxHeight = window.innerHeight - 20 + "px";
      dialogConfig.position = { top: "30px" };
      var dialogRef = this.dialog.open(ModuleDatasetChoiceComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this._router.navigate(['..',result],{relativeTo: this.route});
          }
      });
    }
}