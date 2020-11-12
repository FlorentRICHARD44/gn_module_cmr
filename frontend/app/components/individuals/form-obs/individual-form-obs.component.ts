import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CmrService } from "./../../../services/cmr.service";
import { DataService } from "./../../../services/data.service";
import { Module } from '../../../class/module';

/**
 * A popup to create an observation from the visit.
 * User has to either select an existing individual or to create a new one.
 * Once submitted, the user is redirected to new observation form.
 */
@Component({
  selector: 'gn-cmr-individual-form-obs',
  templateUrl: './individual-form-obs.component.html',
  styleUrls: ['./../../../../style.scss'],
})
export class IndividualFormObsComponent implements OnInit {
  public module: Module = new Module();
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
    private _formBuilder: FormBuilder) {
      this.data = options;
      this.module = this.data.module;
  }

  ngOnInit() {
    var schema = this.data.module.forms.individual.fields;
    var fields = {};
    this.individualForm = this._formBuilder.group(fields);
    this.individualFormDefinitions = this._dataService.buildFormDefinitions(schema);
    this._cmrService.getAllIndividualsByModule(this.data.module.id_module).subscribe((data) => this.individuals = data);
    setTimeout(function() {
      let initData = this._cmrService.getSpecificService(this.module.module_code).initIndividual(this.individualForm);
      this.individualForm.patchValue(this._dataService.formatDataForBeforeEdition(initData, this.module.forms.individual.fields));
    }.bind(this), 200);
  }

  ngAfterViewInit() {
    this.individualForm.disable();
    this._dataService.addFormValidatorsToForm(this.individualForm, this.module.forms.individual);
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
