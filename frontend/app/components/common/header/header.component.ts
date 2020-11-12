import { Component, Input } from "@angular/core";

/**
 * This component creates the header with breadcrumb and title.
 */
@Component({
  selector: 'gn-cmr-header',
  templateUrl: './header.component.html',
  styleUrls: ['./../../../../style.scss']
})
export class HeaderComponent{
  @Input()
  public path;
  @Input()
  public currentPage = "";

  constructor() {}
}