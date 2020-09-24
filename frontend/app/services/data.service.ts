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
            value = (new Date(value.month + '-' + value.day + '-' + value.year)).toLocaleDateString();
        }
        return value;
    }
}