import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

/**
 * This component shows a filter with criterias
 * @Input filters: list of attributes to use as criterias
 * @Input fieldsDef: definition of fields including criterias attributes.
 * @Output: onSearch: emit event with criteria values when clicking on "Search Button"
 */
@Component({
    selector: 'gn-cmr-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit{
    @Input()
    filters = [];
    @Input()
    fieldsDef = {};
    @Output()
    onSearch = new EventEmitter()

    
    public filterForm: FormGroup;

    constructor(private _formBuilder: FormBuilder) {}
    
    ngOnInit() {
        this.filterForm = this._formBuilder.group({});
        for (let filter of this.filters) {
            if (filter && filter.type != 'date') {
              this.filterForm.addControl(filter.field, new FormControl());
            } else {
                this.filterForm.addControl(filter.field + '_min', new FormControl());
                this.filterForm.addControl(filter.field + '_max', new FormControl());
            }
        }
    }

    onSearchClick($event) {
        let values = {};
        for (let key of Object.keys(this.filterForm.value)) {
            if (this.filterForm.value[key] && this.filterForm.value[key] != 'null' && 
                (!Array.isArray(this.filterForm.value[key]) || this.filterForm.value[key].length > 0)) { // need to filter null values
                values[key] = this.filterForm.value[key];
            }
        }
        this.onSearch.emit(values);
    }

    onEraseFilters() {
        this.filterForm.reset();
    }
}