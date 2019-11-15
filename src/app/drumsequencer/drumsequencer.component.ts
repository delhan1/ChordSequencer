import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Drum, DrumSet} from './model/drum.model';
import {MatSliderChange} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormArray, FormBuilder, FormControl} from '@angular/forms';
import {DrumRepository} from './repository/drum.repository';

@Component({
  selector: 'app-drumsequencer',
  templateUrl: './drumsequencer.component.html',
  styleUrls: ['./drumsequencer.component.scss']
})
export class DrumsequencerComponent implements OnInit {
  private _NUMBER_OF_COLUMNS: number = 16;
  private _NUMBER_OF_NAME_COLUMNS: number = 3;
  private PERCENTAGE_PER_COLUMN: number = 100 / this._NUMBER_OF_COLUMNS;
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
  public drumNames: string[] = ['kick', 'hat', 'snare', 'snap'];
  public drumSet: DrumSet[] = [];
  public hats: Drum[];
  public formArray: FormArray;
  public columns: {value: boolean}[][] = [];

  constructor(private fb: FormBuilder, private repository: DrumRepository) {
    this.initDrumSet();
    this.initForm();
    this.initColumns();
  }


  get NUMBER_OF_COLUMNS(): number {
    return this._NUMBER_OF_COLUMNS;
  }

  get NUMBER_OF_NAME_COLUMNS(): number {
    return this._NUMBER_OF_NAME_COLUMNS;
  }

  ngOnInit() {
    this.sliderPosition.subscribe(() => this.sliderPosition$.emit(this.sliderPosition.value));
  }

  private initDrumSet(): void {
    this.drumSet.push({
      name: 'Hats',
      drums: this.repository.getHats(),
    }, {
      name: 'Kicks',
      drums: this.repository.getKicks(),
    }, {
      name: 'Flams',
      drums: this.repository.getFlams(),
    }, {
      name: 'Rims',
      drums: this.repository.getRims(),
    }, {
      name: 'Snares',
      drums: this.repository.getSnares(),
    }, {
      name: 'Percussions',
      drums: this.repository.getPercussions(),
    });
  }

  private initForm(): void {
    this.formArray = new FormArray([
      new FormControl(this.drumSet[0].drums[0]),
      new FormControl(this.drumSet[0].drums[1]),
      new FormControl(this.drumSet[0].drums[2]),
      new FormControl(this.drumSet[0].drums[3]),
    ]);
  }

  private initColumns(): void { // use map, otherwise fill will create referenced objects
    this.columns.push(new Array(this._NUMBER_OF_COLUMNS).fill(null).map(() => ({value: false})));
    this.columns.push(new Array(this._NUMBER_OF_COLUMNS).fill(null).map(() => ({value: false})));
    this.columns.push(new Array(this._NUMBER_OF_COLUMNS).fill(null).map(() => ({value: false})));
    this.columns.push(new Array(this._NUMBER_OF_COLUMNS).fill(null).map(() => ({value: false})));
  }

  private playSequence() {
    this.setIntervalObservable(() =>
      this.computeSliderPosition(), 60000 / this.bpm / 40)
      .pipe(takeUntil(this.playing))
      .subscribe(() => console.log('interval'));
  }

  private setIntervalObservable(callback, time) {
    return new Observable(() => {
      const timeId = setInterval(() => callback(), time);
      return () => {
        clearInterval(timeId);
      };
    });
  }

  private computeSliderPosition() {
    if (this.sliderMoves % this.MOVES_PER_COLUMN === 0) {
      this.playColumn();
      this.columnPlaying++;
      if (this.columnPlaying === this._NUMBER_OF_COLUMNS) {
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
    this.columns.forEach((columns: ({value: boolean})[], index: number) => {
      if (columns[this.columnPlaying].value) {
        this.playDrum(this.getDrum(index));
      }
    });
  }

  public getDrum(index: number): Drum {
    return this.formArray.at(index).value;
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

  public onSliderChange() {
    if (this.playingBool) {
      this.onPause();
      this.onPlay();
    }
  }
}
