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
        if (!fieldDef) return value;
        if ((fieldDef.type_widget == 'date' || fieldDef.type_column == 'date') && value) {
            if (value.month && value.day && value.year) {
                value = (new Date(value.month + '-' + value.day + '-' + value.year)).toLocaleDateString();
            } else {
                value = (new Date(value)).toLocaleDateString();
            }
        } else if (fieldDef.type_widget == "checkbox" || fieldDef.type_column == 'checkbox') {
            value = value === true ? "Oui" : "Non";
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
                } else if (formValues[def].length == 1) {
                    formValues[def] = formValues[def][0] == 'true' ? true : false;
                }
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
            }
        }
        return data;
    }
}