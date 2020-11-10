import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * A disclaimer popup that ask the user if they want to continue "Yes" or not "No".
 * if "No" is choosen or user clicks outside the popup, the popup is closed
 * if "Yes" is choosen, emit an end event
 */
@Component({
  selector: 'gn-cmr-module-disclaimer',
  templateUrl: './module-disclaimer.component.html',
  styleUrls: ['./../../../../style.scss', './module-disclaimer.component.scss'],
})
export class ModuleDisclaimerComponent {
  data: any;

  constructor(
    public dialogRef: MatDialogRef<ModuleDisclaimerComponent>, 
    @Inject(MAT_DIALOG_DATA) public options: any) {
      this.data = options;
  }
}