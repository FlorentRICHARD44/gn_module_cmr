import { Component, OnInit} from '@angular/core';
import { CmrService } from './../../../services/cmr.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector : 'pnx-cmr-module-home',
    templateUrl: './module-home.component.html',
    styleUrls: ['./../../../../style.scss'],
    providers: [CmrService]
})
export class ModuleHomeComponent implements OnInit {
    public module: any = {};

    constructor(
        private _cmrService: CmrService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this._cmrService.getOneModule(params.module).subscribe(data => { this.module = data;});
        });
    }
}