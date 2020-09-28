import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

/**
 * This component is the home page of a CMR Visit.
 */
@Component({
    selector : 'pnx-cmr-visit-details',
    templateUrl: './visit-details.component.html',
    styleUrls: ['./../../../../style.scss', './visit-details.component.scss']
})
export class VisitDetailsComponent implements OnInit {
    public path: Array<any> = [];
    public module: any = {config:{},forms:{site:{}}};
    public cardContentHeight: any;
    public visit: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];

    constructor(
        private _cmrService: CmrService,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _dataService: DataService // used in template
    ) {}

    ngOnInit() {
        this._route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.visit.display_properties;
                this.fields = this.module.forms.visit.fields;
                this._cmrService.getOneVisit(params.id_visit).subscribe((data) => {
                    this.visit = data
                    this.path = [{
                        "text": "Module: " + this.module.module_label, 
                        "link": ['module',this.module.module_code, 'dataset', params.id_dataset]
                    },{
                        "text": this.module.forms.site.label + ": " + this.visit.site_name,
                        "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site')],
                    }];
                    this.path = [...this.path];
                });
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