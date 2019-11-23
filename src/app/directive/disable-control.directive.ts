import {NgControl} from '@angular/forms';
import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[appDisableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor( private ngControl: NgControl ) {
  }

}
