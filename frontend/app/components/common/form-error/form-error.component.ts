import { Component, Input } from "@angular/core";
import { FormGroup } from '@angular/forms';

/**
 * This component creates an alert zone with error from a form.
 */
@Component({
  selector: 'gn-cmr-form-error',
  templateUrl: './form-error.component.html'
})
export class FormErrorComponent{
  @Input()
  public form: FormGroup;

  constructor() {}
}