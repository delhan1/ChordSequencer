import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Chord} from './chord.model';
import {FormControl} from '@angular/forms';
import {ChordRepository} from './chord.repository';
import {CdkDrag, CdkDragDrop, CdkDragMove, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
import {Observable, Subject} from 'rxjs';
import {ViewportRuler} from '@angular/cdk/overlay';
import {Howl} from 'howler';

declare var chordPlayer: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(CdkDropListGroup, {static: false}) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, {static: false}) placeholder: CdkDropList;

  private timeout;
  private playing: Subject<boolean> = new Subject<boolean>();
  private stopped: Subject<boolean> = new Subject<boolean>();
  private playingBool: boolean = false;
  private pausedBool: boolean = true;
  private audio: Howl;
  private playedChord: Chord;
  private playedChordIndex: number = 0;

  public chords: Chord[];
  public chordsSequence: Chord[] = [];
  public chordNameControl: FormControl;
  public barsControl: FormControl;
  public chordSliderPosition: number = 0;
  public bpm: number = 60; // Beats Per Minute

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;

  constructor(private chordRepository: ChordRepository, private viewportRuler: ViewportRuler) {
    this.chordNameControl = new FormControl(['']);
    this.barsControl = new FormControl(4);
    this.chords = [...this.chordRepository.getChords()]; // backup
    this.target = null;
    this.source = null;
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  public onSliderChange(position: number) {
    this.chordSliderPosition = (position * (4 / this.barsControl.value)) % 100;
    this.playedChord = this.chordsSequence[this.playedChordIndex];
    if (this.playedChord) {
      this.playedChord.playing = true;

      if (position !== 0 && (this.chordSliderPosition === 0)) {
        this.playedChord.playing = false;
        this.playedChordIndex++;
        if (this.playedChordIndex === this.chordsSequence.length) {
          this.playedChordIndex = 0;
        }
        this.playedChord = this.chordsSequence[this.playedChordIndex];
        this.playedChord.playing = true;
      }
    }

  }

  public onStop(): void {
    if (this.playedChord) {
      this.playedChord.playing = false;
      this.playedChordIndex = 0;
      this.playedChord = this.chordsSequence[this.playedChordIndex];
      this.playedChord.playing = true;
    }
  }

  public drop(event: CdkDragDrop<Chord[]>) {
    moveItemInArray(this.chordsSequence, event.previousIndex, event.currentIndex);
  }

  public check(chord: Chord): void {
    chord.checked = !chord.checked;
  }

  public onStopTyping() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.findChord(), 500);
  }

  public addChordToSequence(event: Event, chord: Chord): void {
    event.stopPropagation();
    this.chordsSequence.push(Object.assign({}, chord));
  }

  public removeChordFromSequence(event: Event, chordIndex: number): void {
    event.stopPropagation();
    this.chordsSequence.splice(chordIndex, 1);
  }

  public addChord(): void {
    this.chordRepository.addChord(this.chordNameControl.value);
    this.chordNameControl.reset();
    this.initChords();
  }

  public removeChord(id: number): void {
    this.chordRepository.removeChord(id);
    this.initChords();
  }

  private initChords(): void {
    this.chords = [...this.chordRepository.getChords()];
  }

  private findChord(): void {
    this.chords = this.chordRepository.getChords().filter((chord: Chord) =>
      chord.name.toLowerCase().includes(this.chordNameControl.value.toString().toLowerCase()));
  }

  private setIntervalObservable(callback, time) {
    return new Observable((observer) => {
      const timeId = setInterval(() => callback(), time);
      // Teardown logic here
      return () => {
        clearInterval(timeId);
      };
    });
  }

  dragMoved(e: CdkDragMove) {
    const point = this.getPointerPositionOnPage(e.event);
    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped() {
    if (!this.target) {
      return;
    }

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex) {
      moveItemInArray(this.chordsSequence, this.sourceIndex, this.targetIndex);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder) {
      return true;
    }

    if (drop != this.activeContainer) {
      return false;
    }

    const phElement = this.placeholder.element.nativeElement;
    const sourceElement = drag.dropContainer.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  };

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top
    };
  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}
