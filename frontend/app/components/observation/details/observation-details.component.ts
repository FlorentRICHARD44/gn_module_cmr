import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';

@Component({
    selector : 'pnx-cmr-observation-details',
    templateUrl: './observation-details.component.html',
    styleUrls: ['./../../../../style.scss', './observation-details.component.scss']
})
export class ObservationDetailsComponent extends BaseMapViewComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public observation: any = {};
    public properties: Array<any> [];
    public fields: any = {};
    public site: any = {};
    public visit: any = {};
    public individual: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public observationForm: FormGroup;
    public observationFormDefinitions = [];

    public formGroups: Array<any> = [];

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute) {
      super();
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
                    this.observation = data;
                    this.formGroups = this.module.forms.observation.groups;
                    var i = 1;
                    for (var grp of this.formGroups) {
                        grp['id'] = i;
                        grp['properties'] = Object.keys(grp['fields']).filter((attribut_name) => grp['fields'][attribut_name].type_widget != 'html');
                        i++;
                        grp['formDef'] = this._dataService.buildFormDefinitions(grp['fields']);
                    }
                
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
                    this._cmrService.getOneSite(this.visit.id_site).subscribe((data) => {
                        this.path = [{
                          "text": "Module: " + this.module.module_label, 
                          "link": ['module',this.module.module_code]
                        }];
                        if (data.id_sitegroup){
                          this.path = this.path.concat([
                            {
                              "text": this.module.forms.sitegroup.label + ": " + data.sitegroup.name,
                              "link":  ['module',this.module.module_code, 'sitegroup', data.id_sitegroup]
                            },{
                              "text": this.module.forms.site.label + ": " + this.site.name,
                              "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site')],
                           }, {
                              "text": this.module.forms.visit.label,
                              "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                          }]);
                        } else {
                          this.path = this.path.concat([{
                              "text": this.module.forms.site.label + ": " + this.site.name,
                              "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site')],
                           }, {
                              "text": this.module.forms.visit.label,
                              "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site'), 'visit', this._route.snapshot.paramMap.get('id_visit')],
                          }]);
                        }
                        this.path = [...this.path];
                      });
                });
            });
        });
    }
}