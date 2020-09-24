import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

/**
 * A disclaimer popup that ask the user to choose its dataset.
 */
@Component({
    selector: 'gn-cmr-module-datasetchoice',
    templateUrl: './module-datasetchoice.component.html',
    styleUrls: ['./../../../../style.scss', './module-datasetchoice.component.scss'],
})
export class ModuleDatasetChoiceComponent implements OnInit {
    data: any;
    public selectDatasetForm: FormControl;

    constructor(
        public dialogRef: MatDialogRef<ModuleDatasetChoiceComponent>, 
        @Inject(MAT_DIALOG_DATA) public options: any) {
            this.data = options;
    }

    ngOnInit() {
        this.selectDatasetForm = new FormControl(null, Validators.required);
    }
}