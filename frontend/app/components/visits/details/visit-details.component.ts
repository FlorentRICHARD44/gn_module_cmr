import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { IndividualFormObsComponent } from "./../../individuals/form-obs/individual-form-obs.component";
import { Module } from '../../../class/module';
import { BaseMapViewComponent } from '../../BaseMapViewComponent';

/**
 * This component is the home page of a CMR Visit.
 */
@Component({
    selector : 'pnx-cmr-visit-details',
    templateUrl: './visit-details.component.html',
    styleUrls: ['./../../../../style.scss', './visit-details.component.scss']
})
export class VisitDetailsComponent extends BaseMapViewComponent implements OnInit {
    public path: Array<any> = [];
    public module: Module = new Module();
    public visit: any = {};
    public properties: Array<any> = [];
    public fields: Array<any> = [];
    public observations: Array<any> = [];
    public observationListProperties: Array<String> = [];
    public observationFieldsDef: any = {};

    constructor(
        private _cmrService: CmrService,
        private _router: Router,
        private _route: ActivatedRoute,
        public dialog: MatDialog,
        private _dataService: DataService // used in template
    ) {
      super();
    }

    ngOnInit() {
        this._route.params.subscribe(params => {
            this._cmrService.loadOneModule(params.module).subscribe(() => {
                this.module = this._cmrService.getModule(params.module);
                this.properties = this.module.forms.visit.display_properties;
                this.fields = this.module.forms.visit.fields;

                this.observationListProperties = this.module.forms.observation.display_list;
                this.observationFieldsDef = this.module.forms.observation.fields;
                
                this._cmrService.getOneVisit(params.id_visit).subscribe((data) => {
                    this.visit = data;
                    
                    this._cmrService.getOneSite(this.visit.id_site).subscribe((data) => {
                      this.path = [{
                        "text": "Module: " + this.module.module_label, 
                        "link": ['module',this.module.module_code]
                      }];
                      if (data.id_sitegroup) {
                        this.path.push({
                          "text": this.module.forms.sitegroup.label + ": " + data.sitegroup.name,
                          "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup]
                        });
                        this.path.push({
                          "text": this.module.forms.site.label + ": " + data.name,
                          "link": ['module',this.module.module_code, 'sitegroup', data.id_sitegroup, 'site', this._route.snapshot.paramMap.get('id_site')],
                        });
                      } else {
                        this.path.push({
                          "text": this.module.forms.site.label + ": " + data.name,
                          "link": ['module',this.module.module_code, 'site', this._route.snapshot.paramMap.get('id_site')],
                        });
                      }
                      this.path = [...this.path];
                    });

                    this._cmrService.getAllObservationsByVisit(this.visit.id_visit).subscribe((data) => this.observations = data);
                });
            })
        });
    }
    onClickAddObservation() {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        module: this.module,
        visit: this.visit
      };
      dialogConfig.maxHeight = window.innerHeight - 10 + "px";
      dialogConfig.width = '500px';
      dialogConfig.position = { top: "30px" };
      var dialogRef = this.dialog.open(IndividualFormObsComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this._router.navigate(['individual',result,'observation'],{relativeTo: this._route});
          }
      });
    }
}