import { NgModule, Injector } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { MatSlideToggleModule } from "@angular/material";
import { MatDialogModule } from '@angular/material/dialog';
import { ChartsModule } from "ng2-charts";
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { ModuleListComponent } from "./components/modules/list/module-list.component";
import { ModuleHomeComponent } from "./components/modules/home/module-home.component";
import { ModuleDisclaimerComponent } from "./components/modules/disclaimer/module-disclaimer.component";
import { ModuleFormComponent } from "./components/modules/form/module-form.component";
import { SiteGroupFormComponent } from "./components/sitegroups/form/sitegroups-form.component";
import { SiteGroupDetailsComponent } from "./components/sitegroups/details/sitegroups-details.component";
import { SiteFormComponent } from "./components/sites/form/site-form.component";
import { SiteDetailsComponent } from "./components/sites/details/site-details.component";
import { VisitFormComponent } from "./components/visits/form/visit-form.component";
import { VisitDetailsComponent } from "./components/visits/details/visit-details.component";
import { IndividualFormObsComponent } from "./components/individuals/form-obs/individual-form-obs.component";
import { IndividualDetailsComponent } from "./components/individuals/details/individual-details.component";
import { IndividualFormComponent } from "./components/individuals/form/individual-form.component";
import { ObservationFormComponent } from "./components/observation/form/observation-form.component";
import { ObservationDetailsComponent } from "./components/observation/details/observation-details.component";
import { BreadcrumbComponent } from './components/common/breadcrumb/breadcrumb.component';
import { GraphComponent } from './components/common/graph/graph.component';
import { FilterComponent } from './components/common/filter/filter.component';
import { MaskComponent } from './components/common/mask/mask.component';
import { CmrInjector } from "./services/injector.service";
import { SitegroupBatchVisitComponent } from "./components/sitegroups/batchvisit/sitegroup-batchvisit.component";
import { MediaListComponent } from "./components/common/media-list/media-list.component";

// my module routing
const routes: Routes = [
  { path: "", component: ModuleListComponent },
  { path: "module/:module/module", component: ModuleFormComponent },
  { path: "module/:module", component: ModuleHomeComponent },

  { path: "module/:module/sitegroup", component: SiteGroupFormComponent },
  { path: "module/:module/sitegroup/:id_sitegroup", component: SiteGroupDetailsComponent },

  /* 2 ways to access site (with and without site group) */
  { path: "module/:module/site", component: SiteFormComponent },
  { path: "module/:module/sitegroup/:id_sitegroup/site", component: SiteFormComponent },
  { path: "module/:module/site/:id_site", component: SiteDetailsComponent },
  { path: "module/:module/sitegroup/:id_sitegroup/site/:id_site", component: SiteDetailsComponent },

  /* 2 ways to access site (with and without site group) */
  { path: "module/:module/site/:id_site/visit", component: VisitFormComponent },
  { path: "module/:module/sitegroup/:id_sitegroup/site/:id_site/visit", component: VisitFormComponent },
  { path: "module/:module/site/:id_site/visit/:id_visit", component: VisitDetailsComponent },
  { path: "module/:module/sitegroup/:id_sitegroup/site/:id_site/visit/:id_visit", component: VisitDetailsComponent },

  /* 2 ways to access site (with and without site group) */
  { path: "module/:module/site/:id_site/visit/:id_visit/individual/:id_individual/observation", component: ObservationFormComponent },
  { path: "module/:module/sitegroup/:id_sitegroup/site/:id_site/visit/:id_visit/individual/:id_individual/observation", component: ObservationFormComponent },
  { path: "module/:module/site/:id_site/visit/:id_visit/observation/:id_observation", component: ObservationDetailsComponent},
  { path: "module/:module/sitegroup/:id_sitegroup/site/:id_site/visit/:id_visit/observation/:id_observation", component: ObservationDetailsComponent},

  { path: "module/:module/individual/:id_individual", component: IndividualDetailsComponent },
  { path: "module/:module/individual", component: IndividualFormComponent}
];

@NgModule({
  declarations: [BreadcrumbComponent, GraphComponent, MediaListComponent, FilterComponent, MaskComponent,
    ModuleListComponent, ModuleHomeComponent, ModuleDisclaimerComponent, ModuleFormComponent,
    SiteGroupFormComponent, SiteGroupDetailsComponent, SitegroupBatchVisitComponent,
    SiteFormComponent, SiteDetailsComponent,
    VisitFormComponent, VisitDetailsComponent,
    IndividualFormObsComponent, IndividualFormComponent, IndividualDetailsComponent,
    ObservationFormComponent, ObservationDetailsComponent
  ],
  imports: [GN2CommonModule, CommonModule, RouterModule.forChild(routes), MatDialogModule, MatSlideToggleModule, ChartsModule],
  entryComponents: [ModuleDisclaimerComponent, IndividualFormObsComponent, SitegroupBatchVisitComponent],
  providers: [],
  bootstrap: []
})
export class GeonatureModule {
  constructor(injector: Injector) {
    CmrInjector.injector = injector;
  }
}
