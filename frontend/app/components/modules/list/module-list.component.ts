import { Component, OnInit} from '@angular/core';
import { CmrService } from './../../../services/cmr.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ModuleDisclaimerComponent } from "./../disclaimer/module-disclaimer.component";
import { ModuleDatasetChoiceComponent } from "./../datasetchoice/module-datasetchoice.component";

/**
 * This component is the Home page of the CMR module.
 * It list all CMR sub-modules.
 */
@Component({
    selector : 'pnx-cmr-modules',
    templateUrl: './module-list.component.html',
    styleUrls: ['./../../../../style.scss', './module-list.component.scss']
})
export class ModuleListComponent implements OnInit {
    public modules: Array<any> = [];
    public externalAssetsPath;

    constructor(
        private _cmrService: CmrService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.externalAssetsPath = this._cmrService.getExternalAssetsPath();
        this._cmrService.getAllModules().subscribe(data => { this.modules = data;});
    }

    onModuleClick(module_code) {
        for (let module of this.modules) {
            if (module.module_code == module_code) {
                if (module.config.disclaimer && module.config.disclaimer_text) {
                    const dialogConfig = new MatDialogConfig();
                    dialogConfig.data = {message: module.config.disclaimer_text.join('\r\n')};
                    dialogConfig.maxHeight = window.innerHeight - 20 + "px";
                    dialogConfig.position = { top: "30px" };
                    var dialogRef = this.dialog.open(ModuleDisclaimerComponent, dialogConfig);
                    dialogRef.afterClosed().subscribe((result) => { 
                        if (result) {
                            this.datasetChoice(module);
                        }
                    });
                } else {
                    this.datasetChoice(module);
                }
            }
        }
    }

    datasetChoice(module) {
        if (module.config.use_dataset_filter) {
            const dialogConfig = new MatDialogConfig();
                    dialogConfig.data = {};
                    dialogConfig.maxHeight = window.innerHeight - 20 + "px";
                    dialogConfig.position = { top: "30px" };
                    var dialogRef = this.dialog.open(ModuleDatasetChoiceComponent, dialogConfig);
                    dialogRef.afterClosed().subscribe((result) => {
                        if (result) {
                            this.openModule(module, result);
                        }
                    });
        } else {
            this.openModule(module, "none");
        }
    }

    openModule(module, id_dataset) {
        this.router.navigate(['module',module.module_code, 'dataset', id_dataset],{relativeTo: this.route});
    }

}