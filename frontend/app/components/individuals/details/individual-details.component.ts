import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from "@geonature_common/map/map.service";
import { Module } from '../../../class/module';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

/**
 * This component is the detail page of a CMR Individual.
 */
@Component({
    selector : 'pnx-cmr-individual-details',
    templateUrl: './individual-details.component.html',
    styleUrls: ['./../../../../style.scss', './individual-details.component.scss']
})
export class IndividualDetailsComponent implements OnInit {
    public path: Array<any> = [];
    public module: Module = new Module();
    public cardContentHeight: any;
    public individual: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];
    public historic: Array<any> = [];
    public historicListProperties: Array<any>= [];
    public historicFieldsDef: any = {};

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
                this.properties = this.module.forms.individual.display_properties;
                this.fields = this.module.forms.individual.fields;
                this.path = [{
                    "text": "Module: " + this.module.module_label, 
                    "link": ['module',this.module.module_code]
                }];
                this.path = [...this.path];
                this._cmrService.getOneIndividual(params.id_individual).subscribe((data) => this.individual = data);

                this.historicListProperties = this.module.forms.observation.individual_historic_display_list;
                this.historicFieldsDef = this.module.forms.observation.fields;
                this._cmrService.getAllObservationsByIndividual(params.id_individual).subscribe((data) => this.historic = data);
            });
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