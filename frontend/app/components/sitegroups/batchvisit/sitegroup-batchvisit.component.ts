import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CmrService } from '../../../services/cmr.service';
import { DataService } from '../../../services/data.service';

/**
 * A popup to create a visit for each selected site.
 * if "No" is choosen or user clicks outside the popup, the popup is closed
 * if "Yes" is choosen, emit an end event
 */
@Component({
  selector: 'gn-cmr-sitegroup-batchvisit',
  templateUrl: './sitegroup-batchvisit.component.html',
  styleUrls: ['./../../../../style.scss', './sitegroup-batchvisit.component.scss'],
})
export class SitegroupBatchVisitComponent {
  data: any;
  public genericVisitForm: FormGroup;
  public visitFormDefinitions = [];
  public bSaving = false;

  constructor(
    public dialogRef: MatDialogRef<SitegroupBatchVisitComponent>, 
    @Inject(MAT_DIALOG_DATA) public options: any,
    private _dataService: DataService,
    private _formBuilder: FormBuilder,
    private _cmrService: CmrService) {
    this.data = options;
    this.visitFormDefinitions = this._dataService.buildFormDefinitions(this.data.module.forms.visit.fields);
    this.genericVisitForm = this._formBuilder.group({});
  }

  ngAfterViewInit() {
    let initData = this._cmrService.getSpecificService(this.data.module.module_code).initVisit(this.genericVisitForm, undefined);
    this.genericVisitForm.patchValue(this._dataService.formatDataForBeforeEdition(initData, this.data.module.forms.visit.fields));
  }

  /**
   * When user clicks on a site visit checkbox:
   * * if checked, the corresponding observation checkbox is enabled.
   * * if not checked, the corresponding observation checkbox is disabled.
   * @param id_site 
   * @param checked 
   */
  onVisitCheckboxChange(id_site, checked) {
    (<HTMLInputElement>document.getElementById('site-observ-'+id_site)).disabled = !checked;
  }

  /**
   * Manage the check all checkbox for sites visits.
   * @param checked
   */
  onAllVisitsChechboxChange(checked) {
    for (let site of this.data.sites) {
      (<HTMLInputElement>document.getElementById('site-visit-'+site.id_site)).checked = checked;
      (<HTMLInputElement>document.getElementById('site-observ-'+site.id_site)).disabled = !checked;
    }
  }

  /**
   * Manage the check all checkbox for observations.
   * @param checked 
   */
  onAllObservationsChechboxChange(checked) {
    for (let site of this.data.sites) {
      (<HTMLInputElement>document.getElementById('site-observ-'+site.id_site)).checked = checked;
    }

  }

  onSubmit() {
    let visitsToCreate = [];
    let visitValue = this._dataService.formatPropertiesBeforeSave(this.genericVisitForm.value, this.data.module.forms.visit.fields);

    // Prepare the list of visits to creates by checking the status of each site.
    for (let site of this.data.sites) {
      let input = <HTMLInputElement>document.getElementById('site-visit-' + site.id_site);
      if (input.checked) {
        let obsInput = <HTMLInputElement>document.getElementById('site-observ-' + site.id_site);
        let visitSite = {
          id_site: site.id_site,
          observation: obsInput.checked === true
        };
        Object.assign(visitSite, visitValue);
        visitsToCreate.push(visitSite);
      }
    }

    // Create all visits and close popup.
    if (visitsToCreate) { // No need else, Button to submit is disabled when no site is checked.
      this.bSaving = true;
      this._cmrService.createVisitsInBatch({visits: visitsToCreate}).subscribe((result) => {
        this.bSaving = false;
        this.dialogRef.close(result);
      });
    }
  }
}