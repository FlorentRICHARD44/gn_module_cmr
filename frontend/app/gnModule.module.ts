import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { MatDialogModule } from '@angular/material/dialog';
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { ModuleListComponent } from "./components/modules/list/module-list.component";
import { ModuleHomeComponent } from "./components/modules/home/module-home.component";
import { ModuleDisclaimerComponent } from "./components/modules/disclaimer/module-disclaimer.component";
import { SiteFormComponent } from "./components/sites/form/site-form.component";
import { SiteDetailsComponent } from "./components/sites/details/site-details.component";
import { BreadcrumbComponent } from './components/common/breadcrumb/breadcrumb.component';

// my module routing
const routes: Routes = [
  { path: "", component: ModuleListComponent },
  { path: "module/:module", component: ModuleHomeComponent },
  { path: "module/:module/site", component: SiteFormComponent },
  { path: "module/:module/site/:id_site", component: SiteDetailsComponent }
];

@NgModule({
  declarations: [BreadcrumbComponent,
    ModuleListComponent, ModuleHomeComponent, ModuleDisclaimerComponent,
    SiteFormComponent, SiteDetailsComponent
  ],
  imports: [GN2CommonModule, CommonModule, RouterModule.forChild(routes), MatDialogModule],
  entryComponents: [ModuleDisclaimerComponent],
  providers: [],
  bootstrap: []
})
export class GeonatureModule {}
