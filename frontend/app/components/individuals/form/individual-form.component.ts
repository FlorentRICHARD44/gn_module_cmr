import { Component, HostListener, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';
import { Module } from '../../../class/module';

@Component({
    selector : 'pnx-cmr-individual-form',
    templateUrl: './individual-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class IndividualFormComponent implements OnInit {
    public path = [];
    public module: Module = new Module();
    public individual: any = {};
    public fields: any = {};
    public individualForm: FormGroup;
    public individualFormDefinitions: Array<any> = [];

    public bEdit = false;

    constructor(
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder
    ) {
    }

    ngOnInit() {
        this.individualForm = this._formBuilder.group({});
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
            this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
              this._router.routeReuseStrategy.shouldReuseRoute = () => false;
              this._router.onSameUrlNavigation = 'reload';
              this._router.navigate(['.'],{relativeTo: this._route});
            });
          } else {
            this.module = data;
            this.path = [{
                "text": "Module: " + this.module.module_label, 
                "link": ['module',this.module.module_code]
            }];
            var schema = this.module.forms.individual.fields;
            this.individualFormDefinitions = this._dataService.buildFormDefinitions(schema);
            var editId = this._route.snapshot.paramMap.get('edit');
            if (editId) {
                this.bEdit = true;
                this._cmrService.getOneIndividual(editId).subscribe((data) => {
                    this.individual = data;
                    this.individualForm.patchValue(data);
                });
            }
        }
    }

    onSubmit() {
        var formData = this._dataService.formatPropertiesBeforeSave(this.individualForm.value, this.module.forms.individual.fields);
        formData["id_module"] = this.module.id_module;
    
        this._cmrService.saveIndividual(formData).subscribe(result => {
            this._router.navigate([result.id_individual],{relativeTo: this._route});
        });
    }
}