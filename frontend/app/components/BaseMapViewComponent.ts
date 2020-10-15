import { HostListener, Injector } from '@angular/core';
import { Layer } from '@librairies/leaflet';
import { MapService } from "@geonature_common/map/map.service";
import { CmrInjector } from '../services/injector.service';

/**
 * This abstract base view is to be used by each view component using a map.
 * It contains generic methods to initialize map (size, resize, ...).
 */
export class BaseMapViewComponent {
    protected _mapService: MapService;
    public cardContentHeight: any;
    public styles = {
        default: {
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'blue',
          zIndex: 600
        },
        selected: {
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'red',
          zIndex: 660
        }
    };

    constructor(
    ) {
        this._mapService = CmrInjector.injector.get(MapService);
    }
    
    ngAfterViewInit() {
        setTimeout(() => this.calcCardContentHeight(), 300);
    }

    @HostListener("window:resize", ["$event"])
    onResize(event) {
      this.calcCardContentHeight();
    }
    
    calcCardContentHeightParent(minusHeight?) {
      const windowHeight = window.innerHeight;
      const tbH = document.getElementById("app-toolbar")
        ? document.getElementById("app-toolbar").offsetHeight
        : 0;
      const height = windowHeight - tbH - (minusHeight || 0);
      return height;
    }
    
    calcCardContentHeight() {
      let minusHeight = 10;
  
      this.cardContentHeight = this.calcCardContentHeightParent(minusHeight + 20)
  
      // resize map after resize container
      if (this._mapService.map) {
        setTimeout(() => {
          this._mapService.map.invalidateSize();
        }, 10);
      }
    }

    /**
     * Find a feature layer by its id.
     * @param id 
     */
    findFeatureLayer(id, object_type): Layer {
        const layers = this._mapService.map['_layers'];
        const layerKey = Object.keys(layers).find(key => {
          const feature = layers[key] && layers[key].feature;
          return feature && (feature['id'] === id || feature.properties['id'] === id) && (feature['object_type'] == object_type);
        });
        return layerKey && layers[layerKey];
    }

    getMapStyle(style_name = "default") {
        return this.styles[style_name] || this.styles['default'];
    }
}