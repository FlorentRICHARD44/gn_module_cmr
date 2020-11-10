import { Component, OnInit} from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { Router, ActivatedRoute } from '@angular/router';
import { ModuleDisclaimerComponent } from "./../disclaimer/module-disclaimer.component";
import { Module } from '../../../class/module';
import { CmrService } from './../../../services/cmr.service';

/**
 * This component is the Home page of the CMR module.
 * It list all CMR sub-modules (if user has Read right on it).
 */
@Component({
  selector : 'pnx-cmr-modules',
  templateUrl: './module-list.component.html',
  styleUrls: ['./../../../../style.scss', './module-list.component.scss']
})
export class ModuleListComponent implements OnInit {
  public modules: Array<Module> = [];
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

  /**
   * Called when user selects a module.
   * Show a disclaimer popup if activated in configuration.
   * @param module_code 
   */
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
              this.openModule(module);
            }
          });
        } else {
          this.openModule(module);
        }
      }
    }
  }

  openModule(module) {
    this.router.navigate(['module',module.module_code],{relativeTo: this.route});
  }
}