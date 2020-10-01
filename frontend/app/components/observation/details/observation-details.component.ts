import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapService } from "@geonature_common/map/map.service";
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

@Component({
    selector : 'pnx-cmr-observation-details',
    templateUrl: './observation-details.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class ObservationDetailsComponent implements OnInit {
    public path = [];
    public module: any = {config:{},forms:{observation:{},site:{},visit:{fields:{}}}};
    public observation: any = {};
    public properties: Array<any> [];
    public fields: any = {};
    public site: any = {};
    public visit: any = {};
    public individual: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public cardContentHeight: any;
    public observationForm: FormGroup;
    public observationFormDefinitions = [];

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _mapService: MapService,
        private _formBuilder: FormBuilder
    ) {
    }

    ngOnInit() {
        this._route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.observation.display_properties;
                this.fields = this.module.forms.observation.fields;
                this.individualProperties = this.module.forms.individual.display_properties;
                this.individualFields = this.module.forms.individual.fields;
                this._cmrService.getOneObservation(params.id_observation).subscribe((data) => {
                    this.observation = data
                
                    this._cmrService.getOneIndividual(this.observation.id_individual).subscribe((data) => {
                        this.individual = data;
                    });
                });
                this._cmrService.getOneVisit(this._route.snapshot.paramMap.get('id_visit')).subscribe((data) => {
                    this.visit = data;
                    this.site = {
                        id_site: this.visit.id_site,
                        name: this.visit.site_name
                    };
                    this.path = [{
                        "text": "Module: " + this.module.module_label, 
                        "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset')]
                    }, {
                        "text": this.module.forms.site.label + ": " + this.site.name,
                        "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site')],
                    }, {
                        "text": "Visite",
                        "link": ['module',this.module.module_code, 'dataset',this._route.snapshot.paramMap.get('id_dataset'), 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                    }];
                });
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