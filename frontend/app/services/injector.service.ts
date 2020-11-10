import { Injectable, Injector } from "@angular/core";

/**
 * Injector to be used in Inheritance parent constructors.
 */
@Injectable({
  providedIn: "root"
})
export class CmrInjector {
  private static _injector: Injector;

  static set injector(injector: Injector) {
    this._injector = injector;
  }

  static get injector(): Injector {
    return this._injector;
  }
}