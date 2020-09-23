
import { leafletDrawOption } from "@geonature_common/map/leaflet-draw.options";

import { Injectable } from "@angular/core";


@Injectable({
    providedIn: "root"
})
export class CmrMapService {
    constructor() {}

    getLeafletDrawOptionReadOnly() {
        leafletDrawOption.draw.circle = false;
        leafletDrawOption.draw.rectangle = false;
        leafletDrawOption.draw.marker = false;
        leafletDrawOption.draw.polyline = false;
        leafletDrawOption.draw.polygon = false;
        leafletDrawOption.edit.remove = false;
        return leafletDrawOption;
    }
    /*
    geometryTypes: an array containing 0 or more values:
        * "Point": add marker draw option
        * "LineString": add line draw option
        * "Polygon": add polygon draw option
        * if array is empty, the 3 options are available
    */
    getLeafletDrawOptionDrawAll(geometryTypes) {
        leafletDrawOption.draw.circle = false;
        leafletDrawOption.draw.rectangle = false;
        leafletDrawOption.draw.marker = (!geometryTypes || geometryTypes.indexOf('Point') > -1);
        leafletDrawOption.draw.polyline = (!geometryTypes || geometryTypes.indexOf('LineString') > -1);
        leafletDrawOption.draw.polygon = (!geometryTypes || geometryTypes.indexOf('Polygon') > -1);
        leafletDrawOption.edit.remove = false;
        return leafletDrawOption;
    }
    getLeafletDrawOptionDrawPolygon() {
        leafletDrawOption.draw.circle = false;
        leafletDrawOption.draw.rectangle = false;
        leafletDrawOption.draw.marker = false;
        leafletDrawOption.draw.polyline = false;
        leafletDrawOption.draw.polygon = true;
        leafletDrawOption.edit.remove = false;
        return leafletDrawOption;
    }
}