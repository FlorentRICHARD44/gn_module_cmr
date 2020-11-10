import { Component, Input, OnInit} from "@angular/core";

/**
 * This component shows a mask above all screen to wait...
 */
@Component({
  selector: 'gn-cmr-mask',
  templateUrl: './mask.component.html',
  styleUrls: ['./mask.component.scss']
})
export class MaskComponent implements OnInit{
  @Input()
  text = "";

  constructor() {}

  ngOnInit() {
  }
}