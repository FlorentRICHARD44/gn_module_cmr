import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CmrService } from "./../../../services/cmr.service";
import { DataService } from "./../../../services/data.service";

/**
 * A disclaimer popup that ask the user if they want to continue "Yes" or not "No".
 * if "No" is choosen or user clicks outside the popup, the popup is closed
 * if "Yes" is choosen, emit an end event
 */
@Component({
    selector: 'gn-cmr-individual-form-obs',
    templateUrl: './individual-form-obs.component.html',
    styleUrls: ['./../../../../style.scss'],
})
export class IndividualFormObsComponent implements OnInit {
    public selectionType = 'select';
    data: any;
    public selectedIndividual = undefined;
    public individuals: Array<any> = []
    public individualForm: FormGroup;
    public individualFormDefinitions: Array<any> = [];

    constructor(
        public dialogRef: MatDialogRef<IndividualFormObsComponent>, 
        @Inject(MAT_DIALOG_DATA) public options: any,
        private _cmrService: CmrService,
        private _dataService: DataService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _route: ActivatedRoute) {
            this.data = options;
    }

    ngOnInit() {
        var schema = this.data.module.forms.individual.fields;
        var fields = {};
        this.individualForm = this._formBuilder.group(fields);
        this.individualFormDefinitions = this._dataService.buildFormDefinitions(schema);
        this._cmrService.getAllIndividualsByModule(this.data.module.id_module).subscribe((data) => this.individuals = data);
    }

    ngAfterViewInit() {
        this.individualForm.disable();
    }

    onSelectionChange() {
        if (this.selectionType == 'create') {
            this.individualForm.enable();
        } else {
            this.individualForm.disable();
        }
    }
    onCreateObservation() {
        this.dialogRef.close(this.selectedIndividual);
    }
    onSubmitNewIndividual() {
        var formData = this._dataService.formatPropertiesBeforeSave(this.individualForm.value, this.data.module.forms.individual.fields);
        formData['id_module'] = this.data.module.id_module;
        this._cmrService.saveIndividual(this.individualForm.value).subscribe(result => {
            this.dialogRef.close(result.id_individual);
        });
    }
}
