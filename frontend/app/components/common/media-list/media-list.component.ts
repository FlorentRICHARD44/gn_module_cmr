import { Component, Input, OnInit } from "@angular/core";
import { MediaService } from '@geonature_common/service/media.service';

/**
 * This component shows a list of media:
 */
@Component({
  selector: 'gn-cmr-media-list',
  templateUrl: './media-list.component.html'
})
export class MediaListComponent implements OnInit{
  @Input()
  public medias: Array<any> = [];

  constructor(public ms: MediaService) {}

  ngOnInit() {}
}