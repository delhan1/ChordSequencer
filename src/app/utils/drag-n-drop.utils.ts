import { CdkDropList } from '@angular/cdk/drag-drop';

/**
 * Using functions from https://stackblitz.com/edit/angular-dyz1eb
 */
export class DragNDropUtils {

  public static indexOf(collection, node) {
    return Array.prototype.indexOf.call(collection, node);
  }

  /** Determines whether an event is a touch event. */
  public static isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return event.type.startsWith('touch');
  }

  public static isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
    const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
    return y >= top && y <= bottom && x >= left && x <= right;
  }

}
