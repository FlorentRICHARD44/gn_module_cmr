import { HostListener, Injector } from '@angular/core';
import { Layer } from '@librairies/leaflet';
import { MapService } from "@geonature_common/map/map.service";
import { CmrInjector } from '../services/injector.service';
import { ModuleConfig } from '../module.config';

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

    /**
     * Return the list style asked by style_name or default.
     * @param style_name 
     */
    getMapStyle(style_name = "default") {
        return this.styles[style_name] || this.styles['default'];
    }
    
    /**
     * Update the style of features on map according new status.
     * @param selected 
     */
    updateFeaturesStyle(mapFeatures, selected) {
        for (let ft of mapFeatures['features']) {
          var lyr = this.findFeatureLayer(ft.id, ft.object_type);
          if (selected.indexOf(ft.id) > -1) {
            lyr.setStyle(this.getMapStyle('selected'));
          } else {
            lyr.setStyle(this.getMapStyle());
          }
        }
    }
      
    /**
     * Build a popup to the feature.
     * @param layer 
     * @param url_base 
     */
    setPopup(layer, route, feature) {
        var url_base = ['#', ModuleConfig.MODULE_URL,'module',route.snapshot.params.module];
        var name_prop = "";
        if (feature.object_type == "sitegroup") {
            name_prop = "name";
            url_base = url_base.concat(['sitegroup', feature.id]);
        } else if (feature.object_type == "site") {
            name_prop = "name";
            if (feature.properties.id_sitegroup) {
                url_base = url_base.concat(['sitegroup', feature.properties.id_sitegroup]);
            }
            url_base = url_base.concat(['site', feature.id]);
        } else if (feature.object_type == "observation") {
            name_prop = "site_name";
            if (feature.properties.visit.site.sitegroup.id) {
                url_base = url_base.concat(['sitegroup', feature.properties.visit.site.sitegroup.id]);
            }
            url_base = url_base.concat(['site', feature.properties.visit.id_site]);
        }
        if (layer._popup) {
          return;
        }
        const url = url_base.join('/');
        const sPopup = `
        <div>
          <h5>  <a href=${url}>${layer['feature'].properties[name_prop]}</a></h5>
        </div>
        `;
        layer.bindPopup(sPopup).closePopup();
    }
}