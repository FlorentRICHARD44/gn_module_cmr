import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MediaService } from '@geonature_common/service/media.service';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';
import { BreadcrumbComponent } from '../../common/breadcrumb/breadcrumb.component';

@Component({
    selector : 'pnx-cmr-observation-details',
    templateUrl: './observation-details.component.html',
    styleUrls: ['./../../../../style.scss', './observation-details.component.scss']
})
export class ObservationDetailsComponent extends BaseMapViewComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public observation: any = {individual:{}};
    public medias: [];
    public properties: Array<any> [];
    public fields: any = {};
    public individualProperties: Array<any> = [];
    public individualFields: any = {};
    public observationForm: FormGroup;
    public observationFormDefinitions = [];

    public formGroups: Array<any> = [];

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private ms: MediaService,
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
                    this.medias = this.observation.medias;
                    this.formGroups = this.module.forms.observation.groups;
                    var i = 1;
                    for (var grp of this.formGroups) {
                        grp['id'] = i;
                        grp['properties'] = Object.keys(grp['fields']).filter((attribut_name) => ['html','medias'].indexOf(grp['fields'][attribut_name].type_widget) == -1);
                        i++;
                        grp['formDef'] = this._dataService.buildFormDefinitions(grp['fields']);
                    }
                    this.path = BreadcrumbComponent.buildPath('observation', this.module, this.observation);
                    this.path = [...this.path];
                    this._cmrService.getOneSiteGeometry(params.id_site).subscribe((data) => {
                      if (params.id_sitegroup) {
                        this._cmrService.getOneSiteGroupGeometry(params.id_sitegroup).subscribe((dataSitegroup) => {
                          this.mapFeatures = {'features': dataSitegroup.concat(data)};
                          setTimeout(function(){ this.initFeatures(this._route, this.module);}.bind(this), 300);
                        });
                      } else {
                        this.mapFeatures = {'features': data};
                        setTimeout(function(){this.initFeatures(this._route, this.module);}.bind(this), 300);
                      }
                    });
                });
            });
        });
  }
}