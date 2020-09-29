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

    getDatasetInfo(id_dataset) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/meta/dataset/${id_dataset}`);
    }

    /* MODULE QUERIES */
    getAllModules() {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/modules`);
    }

    loadOneModule(module_code) {
        if (this._modules[module_code]) {
            return of(true);
        } else {
            return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}`)
                .pipe(
                    mergeMap((data) => {
                        this._modules[module_code] = data;
                        return of(true);
                    }));
        }
    }

    getModule(module_code) {
        return this._modules[module_code];
    }

    /* SITE QUERIES */
    getAllSitesByModule(id_module, id_dataset) {
        if (id_dataset == 'none') {
            return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sites`);
        } else {
            return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/dataset/${id_dataset}/sites`);
        }
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
    getAllIndividualsByModule(id_module, id_dataset) {
        if (id_dataset == 'none') {
            return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/individuals`);
        } else {
            return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/dataset/${id_dataset}/individuals`);
        }
    }
    
    getOneIndividual(id_individual) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}`);
    }

    saveIndividual(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual`, data);
    }
}