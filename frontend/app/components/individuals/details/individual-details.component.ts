import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
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
export class IndividualDetailsComponent extends BaseMapViewComponent implements OnInit {
    public path: Array<any> = [];
    public module: Module = new Module();
    public individual: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];
    public historic: Array<any> = [];
    public historicListProperties: Array<any>= [];
    public historicFieldsDef: any = {};

    public graphs: Array<any> = [];

    

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute,
        private _dataService: DataService // used in template
    ) {
      super();
    }

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
                this.historicFieldsDef = Object.assign({},this.module.forms.observation.fields);
                for (var grp of Object.keys(this.module.forms.observation.groups)) {
                  this.historicFieldsDef = Object.assign(this.historicFieldsDef,this.module.forms.observation.groups[grp].fields);
                }

                this._cmrService.getAllObservationsByIndividual(params.id_individual).subscribe((data) => {
                  this.historic = data;
                  for (let item of this.module.forms.observation.individual_histogram_items) {
                    let histoData = [];
                    for (let obs of this.historic) {
                      histoData.push({
                        x: obs['visit_date'],
                        y: obs[item.field]
                      });
                    }
                      let graph = {
                      label: this.historicFieldsDef[item.field].attribut_label,
                      data: histoData,
                      color: item.color
                    }
                    this.graphs.push(graph);
                  }
                  this.graphs = [...this.graphs];
                  // Problem: only 1 line instead of N
                });
            });
        });
    }
}