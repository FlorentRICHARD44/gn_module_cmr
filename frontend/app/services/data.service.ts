import { Injectable } from "@angular/core";
import { FormService } from "@geonature_common/form/form.service";
import { Media } from "@geonature_common/form/media/media";
import { ModuleConfig } from "./../module.config";
import { CmrService } from "./cmr.service";

/**
 * Service with generic methods to handle data.
 */
@Injectable({
  providedIn: "root"
})
export class DataService {
  constructor(
    private _formService: FormService,
    private _cmrService: CmrService){}

  /**
   * Format the value as text according its definition.
   * @param value 
   * @param fieldDef 
   */
  formatProperty(value, fieldDef) {
    if (!fieldDef) return value;
    if ((fieldDef.type_widget == 'date' || fieldDef.type_column == 'date') && value) {
      if (value.month && value.day && value.year) {
        value = (new Date(value.month + '-' + value.day + '-' + value.year)).toLocaleDateString();
      } else {
        value = (new Date(value)).toLocaleDateString();
      }
    } else if (fieldDef.type_widget == "checkbox" || fieldDef.type_column == 'checkbox') {
      if (!Array.isArray(value)) {
        value = value === true ? "Oui" : "Non";
      }
    } else if (fieldDef.type_widget == "observers" && value) {
      var users = [];
      for (var i = 0; i < value.length; i++) {
        users.push(value[i].nom_complet);
      }
      return users.join(', ');
    }
    return value;
  }

  /**
   * Format the properties that need to be cleaned before saving to database (dates, ...)
   * @param formValues 
   * @param fieldDef 
   */
  formatPropertiesBeforeSave(formValues, fieldDef) {
    for (var def of Object.keys(fieldDef)) {
      if (fieldDef[def].type_widget == 'date' && formValues[def]) {
        formValues[def] = formValues[def].year + '-' + formValues[def].month + '-' + formValues[def].day;
      } else if (fieldDef[def].type_widget == 'checkbox') {
        if (formValues[def] == null || formValues[def].length == 0) {
          formValues[def] = false;
        }
      } else if (fieldDef[def].type_widget == 'html') {
        formValues[def] = undefined;
      }
    }
    return formValues;
  }

  /**
   * Format the data to be used for the edition (need to be compatible with editor format).
   * @param formValues 
   * @param fieldDef 
   */
  formatDataForBeforeEdition(formValues, fieldDef) {
    var data = formValues;
    for (var def of Object.keys(fieldDef)) {
      if (fieldDef[def].type_widget == 'date' && data[def]) {
        var date = new Date(data[def]);
        data[def] = {
          day: date.getDate(),
          month: date.getMonth() + 1, // JS Date() .getDate() return from 1 to 31 while .getMonth() return from 0 to 11
          year: date.getFullYear()
        };
      } else if (fieldDef[def].type_widget == 'observers' && data[def]) {
        var observers = [];
        for (var o of data[def]) {
          observers.push(o.id_role);
        }
        data[def] = observers;
      } else if (fieldDef[def].type_widget == 'medias') {
        if (data[def]) {
          for (var i = 0; i < data[def].length; i++) {
            data[def][i] = new Media(data[def][i]);
          }
        }
      }
    }
    return data;
  }

  /**
   * Build the fields definitions for the forms.
   * @param schema 
   */
  buildFormDefinitions(schema) {
    return Object.keys(schema)
      .sort((a, b) => { return a == 'medias' ? +1 : b == "medias" ? -1 : 0 })
      .filter((attribut_name) => schema[attribut_name].type_widget)
      .map((attribut_name) => {
        const elem = schema[attribut_name];
        if (elem["type_widget"] == "html") {
          elem["html"] = elem["html"].replace(/\{\{basepath\}\}/g, this._cmrService.getExternalAssetsPath());
        }
        elem["attribut_name"] = attribut_name;
        return elem;
      });
  }

  /**
   * This methods adds some validators to a form if defined in form configuration.
   * @param form the FormGroup
   * @param formDef the definition of the form (example: module.forms.site)
   */
  addFormValidatorsToForm(form, formDef) {
    if (formDef.date_validators) {
      let validators = [];
      for (let validator of formDef.date_validators) {
        let field1 = form.get(validator.split('<')[0]);
        let field2 = form.get(validator.split('<')[1]);
        if (field1 && field2) {
          validators.push(this._formService.dateValidator(field1, field2));
        }
      }
      form.setValidators(validators);
    }
  }
  
  /**
   * Build the pathes for the breadcrumbs according kind of object.
   * @param objectType 
   * @param module 
   * @param object 
   */
  buildBreadcrumbPath(objectType, module, object = undefined): Array<any> {
    var basePath = ['/', ModuleConfig.MODULE_URL, 'module', module.module_code]
    var path = [];
    path.push({
      "text": "Module: " + module.module_label, 
      "link": basePath
    });

    // Sitegroup => home / module: module name / sitegroup
    // Individual => home / module: module name / individual

    if (objectType == "site") {
      // Site => home / module: module name / site
      // Site => home / module: module name / sitegroup: sitegroup name / site
      if (object.id_sitegroup) {
        path.push({
          "text": module.forms.sitegroup.label + ": " + object.sitegroup.name,
          "link": basePath.concat(['sitegroup', object.id_sitegroup])
        });
      }
    } else if (objectType == "visit") {
      // home / module: module name / sitegroup: sitegroup name / site: site name / visit
      // home / module: module name / sitegroup: sitegroup name / visit
      let basePathLvl2 = [];
      if (object.site && object.site.sitegroup) {
        basePathLvl2 = ['sitegroup', object.site.sitegroup.id_sitegroup];
        path.push({
          "text": module.forms.sitegroup.label + ": " + object.site.sitegroup.name,
          "link": basePath.concat(basePathLvl2)
        });
      }
      path.push({
        "text": module.forms.site.label + ": " + object.site.name,
        "link": basePath.concat(basePathLvl2.concat(['site', object.site.id_site]))
      });
    } else if (objectType == "visit-individual") {
      // home / module: module name / individual: identifier / visit
      if (object.individual) {
        path.push({
          "text": module.forms.individual.label + ": " + object.individual.identifier,
          "link": basePath.concat(['individual', object.individual.id_individual])
        });
      }
    } else if (objectType == "observation") {
      // home / module: module name / sitegroup: sitegroup name / site: site name / visit / observation
      // home / module: module name / sitegroup: sitegroup name / visit / observation
      let basePathLvl2 = [];
        if (object.visit && object.visit.site) {
          if (object.visit.site.sitegroup) {
            basePathLvl2 = ['sitegroup', object.visit.site.sitegroup.id_sitegroup];
            path.push({
              "text": module.forms.sitegroup.label + ": " + object.visit.site.sitegroup.name,
              "link": basePath.concat(basePathLvl2)
            });
          }
          path.push({
            "text": module.forms.site.label + ": " + object.visit.site.name,
            "link": basePath.concat(basePathLvl2.concat(['site', object.visit.site.id_site]))
          });
          path.push({
            "text": module.forms.visit.label + ": " + this.formatProperty(object.visit.date, {type_widget: "date"}),
            "link":  basePath.concat(basePathLvl2.concat(['site', object.visit.site.id_site, 'visit', object.visit.id_visit]))
          });
        }
    }
    return path;
  }
}