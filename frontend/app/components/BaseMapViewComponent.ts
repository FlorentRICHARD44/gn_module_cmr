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
    public mapFeatures = {};

    public styles = {
        default: {
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'blue'
        },
        sitegroup: {
          weight: 2,
          dashArray: [8,6],
          opacity: 0.6,
          fillOpacity: 0.4,
          color: 'blue'
        },
        site: {
          radius: 9,
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'blue'
        },
        observation: {
          radius: 9,
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'blue'
        },
        'sitegroup-selected': {
          weight: 2,
          dashArray: [8,6],
          opacity: 0.6,
          fillOpacity: 0.4,
          color: 'red'
        },
        'site-selected': {
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'red'
        },
        'observation-selected': {
          opacity: 0.7,
          fillOpacity: 0.5,
          color: 'red'
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
     * Initialize the feature with:
     * * add a popup (with name and hyperlink)
     */
    initFeatures(route, module) {
      for (let ft of this.mapFeatures['features']) {
        var lyr = this.findFeatureLayer(ft.id, ft['object_type']);
        this.setPopup(lyr, route, ft, module);
        lyr.setStyle(this.getMapStyle(ft['object_type']));
        let onLyrClickFct = this.onFeatureLayerClick(ft, ft['object_type']);
        lyr.off('click', onLyrClickFct);
        lyr.on('click', onLyrClickFct);
      }
    }
    /**
     * Called when click on a feature on the map.
     * @param feature 
     */
    onFeatureLayerClick(feature, object_type) {
      return (event) => {
        this.updateFeaturesStyle(this.mapFeatures, [feature.id], object_type);
        this.setSelected(feature.id);
      }
    }

    setSelected(id) {
        // Do nothing, to be overriden by children if specific behaviour needed.
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
    updateFeaturesStyle(mapFeatures, selected, object_type) {
        for (let ft of mapFeatures['features']) {
          var lyr = this.findFeatureLayer(ft.id, ft.object_type);
          if (ft.object_type == object_type && selected.indexOf(ft.id) > -1) {
            lyr.setStyle(this.getMapStyle(ft.object_type + '-selected'));
          } else {
            lyr.setStyle(this.getMapStyle(ft.object_type));
          }
        }
    }
      
    /**
     * Build a popup to the feature.
     * @param layer 
     * @param url_base 
     */
    setPopup(layer, route, feature, module) {
        var url_base = ['#', ModuleConfig.MODULE_URL,'module',route.snapshot.params.module];
        var object_type_label = module.forms[feature.object_type].label;
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
            if (feature.properties.visit.site.id_sitegroup) {
                url_base = url_base.concat(['sitegroup', feature.properties.visit.site.id_sitegroup]);
            }
            url_base = url_base.concat(['site', feature.properties.visit.id_site]);
        }
        if (layer._popup) {
          return;
        }
        const url = url_base.join('/');
        const sPopup = `
        <div class="map-popup">
          <p>${object_type_label}: <a href=${url}>${layer['feature'].properties[name_prop]}</a></p>
        </div>
        `;
        layer.bindPopup(sPopup).closePopup();
    }
}