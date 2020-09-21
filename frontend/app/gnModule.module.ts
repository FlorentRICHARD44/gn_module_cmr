import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { MatDialogModule } from '@angular/material/dialog';
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { ModuleListComponent } from "./components/modules/list/module-list.component";
import { ModuleHomeComponent } from "./components/modules/home/module-home.component";
import { ModuleDisclaimerComponent } from "./components/modules/disclaimer/module-disclaimer.component";

// my module routing
const routes: Routes = [
  { path: "", component: ModuleListComponent },
  { path: "module/:module", component: ModuleHomeComponent },
];

@NgModule({
  declarations: [ModuleListComponent, ModuleHomeComponent, ModuleDisclaimerComponent],
  imports: [GN2CommonModule, CommonModule, RouterModule.forChild(routes), MatDialogModule],
  entryComponents: [ModuleDisclaimerComponent],
  providers: [],
  bootstrap: []
})
export class GeonatureModule {}
