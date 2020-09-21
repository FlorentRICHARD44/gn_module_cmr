import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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