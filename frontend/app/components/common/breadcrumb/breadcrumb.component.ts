import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
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
    }

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _cmrService: CmrService) {}
    
    ngOnInit() {
        this.homePath = this._cmrService.getModuleUrl();
    }

    ngAfterViewInit() {
        if (this._paths.length > 0) {
            this._paths[0].link = ['/', this.homePath].concat(this._paths[0].link);
        }
        for (var i=1; i< this._paths.length; i++) {
            this._paths[i].link = ['/', this.homePath].concat(this._paths[i-1].link).concat(this._paths[i]);
        }
    }
}