import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { MatSlideToggleModule } from "@angular/material";
import { MatDialogModule } from '@angular/material/dialog';
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { ModuleListComponent } from "./components/modules/list/module-list.component";
import { ModuleHomeComponent } from "./components/modules/home/module-home.component";
import { ModuleDisclaimerComponent } from "./components/modules/disclaimer/module-disclaimer.component";
import { ModuleDatasetChoiceComponent } from "./components/modules/datasetchoice/module-datasetchoice.component";
import { SiteFormComponent } from "./components/sites/form/site-form.component";
import { SiteDetailsComponent } from "./components/sites/details/site-details.component";
import { VisitFormComponent } from "./components/visits/form/visit-form.component";
import { VisitDetailsComponent } from "./components/visits/details/visit-details.component";
import { IndividualFormObsComponent } from "./components/individuals/form-obs/individual-form-obs.component";
import { ObservationFormComponent } from "./components/observation/form/observation-form.component";
import { BreadcrumbComponent } from './components/common/breadcrumb/breadcrumb.component';

// my module routing
const routes: Routes = [
  { path: "", component: ModuleListComponent },
  { path: "module/:module/dataset/:id_dataset", component: ModuleHomeComponent },
  { path: "module/:module/dataset/:id_dataset/site", component: SiteFormComponent },
  { path: "module/:module/dataset/:id_dataset/site/:id_site", component: SiteDetailsComponent },
  { path: "module/:module/dataset/:id_dataset/site/:id_site/visit", component: VisitFormComponent },
  { path: "module/:module/dataset/:id_dataset/site/:id_site/visit/:id_visit", component: VisitDetailsComponent },
  { path: "module/:module/dataset/:id_dataset/site/:id_site/visit/:id_visit/individual/:id_individual/observation", component: ObservationFormComponent }
];

@NgModule({
  declarations: [BreadcrumbComponent,
    ModuleListComponent, ModuleHomeComponent, ModuleDisclaimerComponent, ModuleDatasetChoiceComponent,
    SiteFormComponent, SiteDetailsComponent,
    VisitFormComponent, VisitDetailsComponent,
    IndividualFormObsComponent,
    ObservationFormComponent
  ],
  imports: [GN2CommonModule, CommonModule, RouterModule.forChild(routes), MatDialogModule, MatSlideToggleModule],
  entryComponents: [ModuleDisclaimerComponent, ModuleDatasetChoiceComponent, IndividualFormObsComponent],
  providers: [],
  bootstrap: []
})
export class GeonatureModule {}
