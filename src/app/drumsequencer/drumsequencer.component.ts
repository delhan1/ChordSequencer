import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {Howl} from 'howler';
import {Drum} from './model/drum.model';
import {MatSliderChange} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Component({
  selector: 'app-drumsequencer',
  templateUrl: './drumsequencer.component.html',
  styleUrls: ['./drumsequencer.component.scss']
})
export class DrumsequencerComponent implements OnInit {
  private NUMBER_OF_COLUMNS: number = 16;
  private PERCENTAGE_PER_COLUMN: number = 100 / this.NUMBER_OF_COLUMNS;
  private MOVES_PER_COLUMN: number = 10;
  private PERCENTAGE_PER_MOVE: number = this.PERCENTAGE_PER_COLUMN / this.MOVES_PER_COLUMN;
  private columnPlaying: number = 0;
  private playing: Subject<boolean> = new Subject<boolean>();
  private playingBool: boolean = false;

  @Output('sliderPosition')
  public sliderPosition$: EventEmitter<number> = new EventEmitter<number>();
  @Output('stop')
  public stopped$: EventEmitter<boolean> = new EventEmitter<boolean>();

  public sliderPosition: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public sliderMoves: number = 0; // integer
  public bpm: number = 60; // Beats Per Minute
  public bpmMin: number = 1;
  public bpmMax: number = 250;
  public drumNames = ['kick', 'hat', 'snare', 'snap'];
  public drumSet: Drum[] = [];

  constructor() {
    this.initDrumSet();
  }

  ngOnInit() {
    this.sliderPosition.subscribe(() => this.sliderPosition$.emit(this.sliderPosition.value));
  }

  private initDrumSet(): void {
    this.drumNames.forEach((drumName: string) => this.drumSet.push({
      name: drumName,
      sound: new Howl({
        src: [`../assets/audio/${drumName}.wav`],
        preload: true,
      }),
      // use map, otherwise fill will create referenced objects
      columns: new Array(this.NUMBER_OF_COLUMNS).fill(null).map(() => ({value: false})),
    }));
  }

  private playSequence() {
    const interval$ = this.setIntervalObservable(() =>
      this.computeSliderPosition(), 60000 / this.bpm / 40)
      .pipe(takeUntil(this.playing))
      .subscribe(() => console.log('interval'));
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

  private computeSliderPosition() {
    if (this.sliderMoves % this.MOVES_PER_COLUMN === 0) {
      this.playColumn();
      this.columnPlaying++;
      if (this.columnPlaying === this.NUMBER_OF_COLUMNS) {
        this.columnPlaying = 0;
      }
    }

    this.sliderPosition.next(this.sliderPosition.value + this.PERCENTAGE_PER_MOVE);
    this.sliderMoves = this.sliderPosition.value / this.PERCENTAGE_PER_MOVE;

    if (this.sliderPosition.value === 100) {
      this.sliderPosition.next(0);
    }
  }

  private playColumn(): void {
    this.drumSet.forEach((drum: Drum) => {
      if (drum.columns[this.columnPlaying].value) {
        this.playDrum(drum);
      }
    });
  }

  public toggleCell(drum: Drum, column: boolean): void {
    if (!column) {
      this.playDrum(drum);
    }
  }

  public playDrum(drum: Drum): void {
    drum.sound.play();
  }

  public onPlay(): void {
    this.playingBool = true;
    this.playing.next(true);
    this.playSequence();
  }

  public onPause(): void {
    this.playingBool = false;
    this.playing.next(false);
  }

  public onStop(): void {
    this.playingBool = false;
    this.playing.next(false);
    this.sliderPosition.next(0);
    this.columnPlaying = 0;
    this.stopped$.next(true);
  }

  public onSliderMove(event: MatSliderChange) {
    this.bpm = event.value;
  }

  public onSliderChange(event: MatSliderChange) {
    if (this.playingBool) {
      this.onPause();
      this.onPlay();
    }
  }
}
