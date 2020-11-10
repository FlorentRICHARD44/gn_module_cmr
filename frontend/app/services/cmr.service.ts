import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { of } from '@librairies/rxjs';
import { mergeMap } from '@librairies/rxjs/operators';
import { AppConfig } from "@geonature_config/app.config";
import { ModuleConfig } from "../module.config";

/**
 * This service defines all calls to API.
 */
export interface SpecificService {
  initSitegroup: (form) => {},
  initSite: (form, sitegroup) => {},
  initVisit: (form, site) => {},
  initObservation: (form, formGroups, visit, individual) => {},
  initIndividual: (form) => {};
}

@Injectable({
  providedIn: "root"
})
export class CmrService {
  private _modules= {};
  private _specificModule;
  constructor(private _api: HttpClient) {}

  /**
   * Convert params in object as http params.
   * @param params
   */
  _paramsToHttpParams(params) {
    let httpParams = new HttpParams();
    for (let p of Object.keys(params)) {
      if (params[p]) {
        httpParams = httpParams.set(p, params[p]);
      }
    }
    return {params: httpParams};
  }

  getModuleUrl() {
    return ModuleConfig.MODULE_URL;
  }

  getExternalAssetsPath() {
    return AppConfig.URL_APPLICATION + '/external_assets/' + ModuleConfig.MODULE_CODE.toLowerCase();
  }

  /**
   * Get the service specific to each sub-module.
   * @param module 
   */
  getSpecificService(module):SpecificService {
    if (!this._specificModule) {
      this._specificModule = require('../../../config/cmr/' + module + '/specific.service.js');
    }
    return this._specificModule;
  }

  /* GENERIC QUERIES */
  deleteObject(type, id) {
    return this._api.delete<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/${type}/${id}`);
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
  getAllSitegroupsGeometriesByModuleFiltered(id_module, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sitegroups`, this._paramsToHttpParams(params));
  }

  getOneSiteGroupGeometry(id_sitegroup) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/geometries`);
  }

  saveSiteGroup(data) {
    return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup`, data);
  }

  checkSiteGroupContainsSite(id_sitegroup, geometry) {
    return this._api.post<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/containssite`, geometry);
  }

  exportSitegroupObservations(module_code, id_sitegroup, type) {
    let dt = new Date().toString();  // Add date of call to URL to ensure no cache used.
    window.open(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}/sitegroup/${id_sitegroup}/${type}?qt=${dt}`);
  }

  exportSitegroupMappingVisitIndividual(id_sitegroup, mapping_visit_individual_additional_field) {
    let dt = new Date().toString();  // Add date of call to URL to ensure no cache used.
    let params = ""
    if (mapping_visit_individual_additional_field) {
        params = "&additional_field=" + mapping_visit_individual_additional_field;
    }
    window.open(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/export/mapping_visit_individual?qt=${dt}${params}`);
  }

  /* SITE QUERIES */
  getAllSitesGeometriesByModule(id_module, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/sites`, this._paramsToHttpParams(params));
  }

  getAllSitesGeometriesBySiteGroup(id_sitegroup, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/sites`, this._paramsToHttpParams(params));
  }

  getOneSiteGeometry(id_site) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}/geometries`);
  }

  saveSite(data) {
    return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site`, data);
  }

  /* VISIT QUERIES */
  getAllVisitsBySite(id_site, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}/visits`, this._paramsToHttpParams(params));
  }

  getOneVisit(id_visit) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit/${id_visit}`);
  }

  saveVisit(data) {
    return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit`, data);
  }

  createVisitsInBatch(data) {
    return this._api.post<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visits`, data);
  }

  /* INDIVIDUAL QUERIES */
  getAllIndividualsByModule(id_module) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/individuals`);
  }

  getAllIndividualsGeometriesByModule(id_module, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${id_module}/individuals/filtered`, this._paramsToHttpParams(params));
  }

  getAllIndividualsGeometriesBySiteGroup(id_sitegroup, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/sitegroup/${id_sitegroup}/individuals`, this._paramsToHttpParams(params));
  }

  getAllIndividualsBySite(id_site, params) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/site/${id_site}/individuals`, this._paramsToHttpParams(params));
  }

  getOneIndividual(id_individual) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}`);
  }

  saveIndividual(data) {
    return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual`, data);
  }

  getFicheIndividual(module_code, id_individual, map_image) {
    let dt = new Date().toString();  // Add date of call to URL to ensure no cache used.
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    return this._api.post(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/module/${module_code}/ficheindividual/${id_individual}?qt=${dt}`, 
      {map: map_image}, 
      {responseType: 'arraybuffer',headers:httpHeaders} 
    ).subscribe(file => {
      let blob = new Blob([file] , {type: 'application/pdf'});
      let url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  getIndividualMediasZip(id_individual) {
    let dt = new Date().toString();  // Add date of call to URL to ensure no cache used.
    window.open(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}/export/medias?qt=${dt}`);
  }

  /* OBSERVATIONS QUERIES */
  getAllObservationsByVisit(id_visit) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/visit/${id_visit}/observations`);
  }

  getAllObservationsByIndividual(id_individual) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}/observations`);
  }

  getAllObservationsGeometriesByIndividual(id_individual) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/individual/${id_individual}/observations/geometries`);
  }

  getOneObservation(id_observation) {
    return this._api.get<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/observation/${id_observation}`);
  }

  saveObservation(data) {
    return this._api.put<any>(`${AppConfig.API_ENDPOINT}/${ModuleConfig.MODULE_URL}/observation`, data);
  }
}