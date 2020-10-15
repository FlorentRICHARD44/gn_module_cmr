import { HostListener } from '@angular/core';
import { MapService } from "@geonature_common/map/map.service";

/**
 * This abstract base view is to be used by each view component using a map.
 * It contains generic methods to initialize map (size, resize, ...).
 */
export class BaseMapViewComponent {
    
    public cardContentHeight: any;

    constructor(
        protected _mapService: MapService
    ) {}
    
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
}