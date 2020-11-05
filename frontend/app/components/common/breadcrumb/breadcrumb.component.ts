import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { ModuleConfig } from "../../../module.config";
import { CmrService } from './../../../services/cmr.service';

/**
 * This component set breadcrumbs in the view. The breadcrumbs are composed of:
 * - home : already set by default
 * - path : all parent pathes of this view except the home. it is an array with objects {"text": "name of the path", "link": the link for routerLink }
 * - currentPath: the name of the current page. it is not a link.
 */
@Component({
    selector: 'gn-cmr-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit{
    public homePath;
    private _paths: Array<any> = [];
    @Input()
    public currentPage;
    @Input()
    set path(value: Array<any>) {
        var values = value;
        this._paths = values;
        if (this.homePath) {
            this.updatePaths();
        }
    }

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _cmrService: CmrService) {}
    
    ngOnInit() {
        this.homePath = this._cmrService.getModuleUrl();
    }

    ngAfterViewInit() {
        //this.updatePaths();
    }
    updatePaths() {
/*        for (var i=0; i< this._paths.length; i++) {
            this._paths[i].link = ['/', this.homePath].concat(this._paths[i].link);
        }*/
    }

    static buildPath(objectType, module, object = undefined): Array<any> {
        var basePath = ['/', ModuleConfig.MODULE_URL, 'module', module.module_code]
        var path = [];
        path.push({
            "text": "Module: " + module.module_label, 
            "link": basePath
        });

        // Sitegroup => home / module: module name / sitegroup
        // Individual => home / module: module name / individual
 
        if (objectType == "site") {
            // Site => home / module: module name / site
            // Site => home / module: module name / sitegroup: sitegroup name / site
            if (object.id_sitegroup) {
                path.push({
                    "text": module.forms.sitegroup.label + ": " + object.sitegroup.name,
                    "link": basePath.concat(['sitegroup', object.id_sitegroup])
                });
            }
        } else if (objectType == "visit") {
            // home / module: module name / sitegroup: sitegroup name / site: site name / visit
            // home / module: module name / sitegroup: sitegroup name / visit
            let basePathLvl2 = [];
            if (object.site && object.site.sitegroup) {
                basePathLvl2 = ['sitegroup', object.site.sitegroup.id_sitegroup];
                path.push({
                    "text": module.forms.sitegroup.label + ": " + object.site.sitegroup.name,
                    "link": basePath.concat(basePathLvl2)
                });
            }
            path.push({
                "text": module.forms.site.label + ": " + object.site.name,
                "link": basePath.concat(basePathLvl2.concat(['site', object.site.id_site]))
            });
        } else if (objectType == "visit-individual") {
            // home / module: module name / individual: identifier / visit
            if (object.individual) {
                path.push({
                    "text": module.forms.individual.label + ": " + object.individual.identifier,
                    "link": basePath.concat(['individual', object.individual.id_individual])
                });
            }
        } else if (objectType == "observation") {
            // home / module: module name / sitegroup: sitegroup name / site: site name / visit / observation
            // home / module: module name / sitegroup: sitegroup name / visit / observation
            let basePathLvl2 = [];
            if (object.visit && object.visit.site) {
                if (object.visit.site.sitegroup) {
                    basePathLvl2 = ['sitegroup', object.visit.site.sitegroup.id_sitegroup];
                    path.push({
                        "text": module.forms.sitegroup.label + ": " + object.visit.site.sitegroup.name,
                        "link": basePath.concat(basePathLvl2)
                    });
                }
                path.push({
                    "text": module.forms.site.label + ": " + object.visit.site.name,
                    "link": basePath.concat(basePathLvl2.concat(['site', object.visit.site.id_site]))
                });
                path.push({
                    "text": module.forms.visit.label,
                    "link":  basePath.concat(basePathLvl2.concat(['site', object.visit.site.id_site, 'visit', object.visit.id_visit]))
                });
            }
        }
        return path;
    }
}