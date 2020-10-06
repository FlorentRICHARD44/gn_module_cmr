import { Component, HostListener, OnInit} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from "@geonature_common/map/map.service";
import { Module } from '../../../class/module';
import { CmrService } from './../../../services/cmr.service';
import { DataService } from './../../../services/data.service';

/**
 * This component is the form page of a CMR Sub-module.
 */
@Component({
    selector : 'pnx-cmr-module-form',
    templateUrl: './module-form.component.html',
    styleUrls: ['./../../../../style.scss']
})
export class ModuleFormComponent implements OnInit {
    public module: Module = new Module();
    public fields: any = {};
    public moduleForm: FormGroup;
    public moduleFormDefinitions: Array<any> = [];
    public cardContentHeight: any;
    public bEdit = false;

    constructor(
        private _cmrService: CmrService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _mapService: MapService,
        private _dataService: DataService,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.moduleForm =  this._formBuilder.group({});
        var data = this._cmrService.getModule(this._route.snapshot.paramMap.get('module'));
        if (!data) { // if module not yet defined, reload the page to ensure module data is loaded
          this._cmrService.loadOneModule(this._route.snapshot.paramMap.get('module')).subscribe(() => {
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._router.navigate(['.'],{relativeTo: this._route});
          });
        } else {
          this.module = data;
          var schema = data.forms.module.fields;
          this.moduleFormDefinitions = this._dataService.buildFormDefinitions(schema);
          var editId = this._route.snapshot.paramMap.get('edit');
          if (editId) {
            this.bEdit = true;
          }
        }
    }
     
    ngAfterViewInit() {
        var formattedValues = this._dataService.formatDataForBeforeEdition(this.module, this.module.forms.module.fields);
        this.moduleForm.patchValue(formattedValues);
        setTimeout(() => this.calcCardContentHeight(), 300);
    }
    @HostListener("window:resize", ["$event"])
    onResize(event) {
      this.calcCardContentHeight();
    }
    calcCardContentHeightParent(minusHeight?) {
      const windowHeight = window.innerHeight;
      const tbH = document.getElementById("app-toolbar")
        ? document.getElementById("app-toolbar").offsetHeight
        : 0;
      const height = windowHeight - tbH - (minusHeight || 0);
      return height;
    }
    calcCardContentHeight() {
      let minusHeight = 10;
  
      this.cardContentHeight = this.calcCardContentHeightParent(minusHeight + 20)
  
      // resize map after resize container
      if (this._mapService.map) {
        setTimeout(() => {
          this._mapService.map.invalidateSize();
        }, 10);
      }
    }

    onSubmit() {
        var formData = this._dataService.formatPropertiesBeforeSave(this.moduleForm.value, this.module.forms.module.fields);
        this._cmrService.saveModule(this._route.snapshot.paramMap.get('module'), formData).subscribe(result => {
            this._cmrService.reloadModuleFromApi(this._route.snapshot.paramMap.get('module')).subscribe(() => 
                this._router.navigate(['..'],{relativeTo: this._route})
            );
        });
    }
}