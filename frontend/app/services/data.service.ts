import { Injectable } from "@angular/core";

/**
 * Service with generic methods to handle data.
 */
@Injectable({
    providedIn: "root"
})
export class DataService {
    /**
     * Format the value as text according its definition.
     * @param value 
     * @param fieldDef 
     */
    formatProperty(value, fieldDef) {
        if (fieldDef.type_widget == 'date' && value) {
            if (value.month && value.day && value.year) {
                value = (new Date(value.month + '-' + value.day + '-' + value.year)).toLocaleDateString();
            } else {
                value = (new Date(value)).toLocaleDateString();
            }
        } else if (fieldDef.type_widget == "checkbox") {
            value = value === true ? "Oui" : "Non";
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
                } else if (formValues[def].length == 1) {
                    formValues[def] = formValues[def][0] == 'true' ? true : false;
                }
            }
        }
        return formValues;
    }
}