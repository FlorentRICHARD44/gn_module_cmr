import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { MatDialogModule } from '@angular/material/dialog';
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { ModuleListComponent } from "./components/modules/list/module-list.component";
import { ModuleHomeComponent } from "./components/modules/home/module-home.component";
import { ModuleDisclaimerComponent } from "./components/modules/disclaimer/module-disclaimer.component";
import { SiteFormComponent } from "./components/sites/form/site-form.component";
import { BreadcrumbComponent } from './components/common/breadcrumb/breadcrumb.component';
import { CmrService } from "./services/cmr.service";

// my module routing
const routes: Routes = [
  { path: "", component: ModuleListComponent },
  { path: "module/:module", component: ModuleHomeComponent },
  { path: "module/:module/site", component: SiteFormComponent }
];

@NgModule({
  declarations: [BreadcrumbComponent,
    ModuleListComponent, ModuleHomeComponent, ModuleDisclaimerComponent,
    SiteFormComponent
  ],
  imports: [GN2CommonModule, CommonModule, RouterModule.forChild(routes), MatDialogModule],
  entryComponents: [ModuleDisclaimerComponent],
  providers: [],
  bootstrap: []
})
export class GeonatureModule {}
