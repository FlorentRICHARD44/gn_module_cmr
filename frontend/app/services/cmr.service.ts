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
    getAllSitesByModule(id_module) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sites`);
    }

    getOneSite(id_site) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}`);
    }

    saveSite(data) {
        return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site`, data);
    }
}