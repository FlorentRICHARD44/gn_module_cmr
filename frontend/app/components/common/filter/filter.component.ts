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
          this.filterForm.addControl(filter, new FormControl());
        }
    }

    onSearchClick($event) {
        this.onSearch.emit(this.filterForm.value);
    }

    onEraseFilters() {
        this.filterForm.reset();
    }
}