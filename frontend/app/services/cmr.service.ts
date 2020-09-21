import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "@geonature_config/app.config";
import { ModuleConfig } from "../module.config";


@Injectable({
    providedIn: "root"
})
export class CmrService {
    constructor(private _api: HttpClient) {}

    getExternalAssetsPath() {
        return AppConfig.URL_APPLICATION + '/external_assets/' + ModuleConfig.MODULE_CODE.toLowerCase();
    }

    getConfigData(module_code) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/config/${module_code}`);
    }

    getAllModules() {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/modules`);
    }

    getOneModule(module_code) {
        return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}`);
    }
}