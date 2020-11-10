import { Injectable } from "@angular/core";
import { leafletDrawOption } from "@geonature_common/map/leaflet-draw.options";

/**
 * This service contains some generic methods for map (options for map tool)
 */
@Injectable({
  providedIn: "root"
})
export class CmrMapService {
  constructor() {}

  getLeafletDrawOptionReadOnly() {
    leafletDrawOption.draw.circle = false;
    leafletDrawOption.draw.circlemarker = false;
    leafletDrawOption.draw.rectangle = false;
    leafletDrawOption.draw.marker = false;
    leafletDrawOption.draw.polyline = false;
    leafletDrawOption.draw.polygon = false;
    leafletDrawOption.edit.remove = false;
    return leafletDrawOption;
  }

  getLeafletDrawOptionDrawAll(geometryTypes) {
    leafletDrawOption.draw.circle = false;
    leafletDrawOption.draw.circlemarker = false;
    leafletDrawOption.draw.rectangle = false;
    leafletDrawOption.draw.marker = (!geometryTypes || geometryTypes.indexOf('Point') > -1);
    leafletDrawOption.draw.polyline = (!geometryTypes || geometryTypes.indexOf('LineString') > -1);
    leafletDrawOption.draw.polygon = (!geometryTypes || geometryTypes.indexOf('Polygon') > -1);
    leafletDrawOption.edit.remove = false;
    return leafletDrawOption;
  }

  getLeafletDrawOptionDrawPolygon() {
    leafletDrawOption.draw.circle = false;
    leafletDrawOption.draw.circlemarker = false;
    leafletDrawOption.draw.rectangle = false;
    leafletDrawOption.draw.marker = false;
    leafletDrawOption.draw.polyline = false;
    leafletDrawOption.draw.polygon = true;
    leafletDrawOption.edit.remove = false;
    return leafletDrawOption;
  }
}