import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, forkJoin } from '@librairies/rxjs';
import { mergeMap, concatMap } from '@librairies/rxjs/operators';
import { AppConfig } from "@geonature_config/app.config";
import { ModuleConfig } from "../module.config";


@Injectable({
    providedIn: "root"
})
export class CmrService {
    private _modules= {};
    constructor(private _api: HttpClient) {}

    getModuleUrl() {
        return ModuleConfig.MODULE_URL;
    }

    getExternalAssetsPath() {
        return AppConfig.URL_APPLICATION + '/external_assets/' + ModuleConfig.MODULE_CODE.toLowerCase();
    }

    /* MODULE QUERIES */
    getAllModules() {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/modules`);
    }

    saveModule(module_code, data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}`, data);
    }

    loadOneModule(module_code) {
        if (this._modules[module_code]) {
            return of(true);
        } else {
            return this.reloadModuleFromApi(module_code);
        }
    }

    reloadModuleFromApi(module_code) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}`)
                .pipe(
                    mergeMap((data) => {
                        this._modules[module_code] = data;
                        return of(true);
                    }));
    }

    getModule(module_code) {
        return this._modules[module_code];
    }

    /* SITEGROUP QUERIES */
    getAllSitegroupsByModule(id_module) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sitegroups`);
    }
    
    getAllSitegroupsGeometriesByModule(id_module) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sitegroups/geometries`);
    }

    getOneSiteGroup(id_sitegroup) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}`);
    }

    getOneSiteGroupGeometries(id_sitegroup) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/geometries`);
    }

    saveSiteGroup(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup`, data);
    }

    /* SITE QUERIES */
    getAllSitesByModule(id_module) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sites`);
    }

    getAllSitesBySiteGroup(id_sitegroup) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/sites`);
    }

    getOneSite(id_site) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}`);
    }

    saveSite(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site`, data);
    }

    /* VISIT QUERIES */
    getAllVisitsBySite(id_site) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}/visits`);
    }

    getOneVisit(id_visit) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit/${id_visit}`);
    }

    saveVisit(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit`, data);
    }

    /* INDIVIDUAL QUERIES */
    getAllIndividualsByModule(id_module) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/individuals`);
    }

    getAllIndividualsBySiteGroup(id_sitegroup) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/individuals`);
    }
    
    getAllIndividualsBySite(id_site) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}/individuals`);
    }
    
    getOneIndividual(id_individual) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}`);
    }

    saveIndividual(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual`, data);
    }

    /* OBSERVATIONS QUERIES */
    getAllObservationsByVisit(id_visit) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit/${id_visit}/observations`);
    }

    getAllObservationsByIndividual(id_individual) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}/observations`);
    }
    
    getOneObservation(id_observation) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/observation/${id_observation}`);
    }

    saveObservation(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/observation`, data);
    }
}