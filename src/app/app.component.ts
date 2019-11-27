import { Component, ViewChild } from '@angular/core';
import { Chord } from './chord.model';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ChordRepository } from './chord.repository';
import { CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonUtils } from './utils/common.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(CdkDropListGroup, {static: false}) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, {static: false}) placeholder: CdkDropList;

  private _MIN_SELECTED: number = 1;
  private _MAX_SELECTED: number = 16;

  private timeout;
  private playedChord: Chord;
  private playedChordIndex: number = 0;

  public chords: Chord[];
  public chordsSequence: Chord[] = [];
  public chordNameControl: FormControl;
  public barsControl: FormControl;
  public selectChordsControl: FormControl;
  public chordSliderPosition: number = 0;
  public chordsSelected: number = 0;

  constructor(private chordRepository: ChordRepository) {
    this.chords = [...this.chordRepository.getChords()]; // backup
    this.chordNameControl = new FormControl(['']);
    this.barsControl = new FormControl(4);
    this.selectChordsControl = new FormControl(null, [Validators.min(this._MIN_SELECTED),
      (control: AbstractControl) => {
        return Validators.max(this.chords.length - 1)(control);
      }]);
  }

  get MIN_SELECTED(): number {
    return this._MIN_SELECTED;
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

  public check(chord: Chord): void {
    chord.checked = !chord.checked;
    this.chordsSelected += chord.checked ? 1 : -1;
  }

  public toggleAll(checked: boolean): void {
    this.chords.forEach((chord: Chord) => chord.checked = checked);
    this.chordsSelected = checked ? this.chords.length : 0;
  }

  public onStopTyping() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.findChord();
      this.chordsSelected = this.chords.filter((chord: Chord) => chord.checked).length;
      this.selectChordsControl.updateValueAndValidity();
    }, 500);
  }

  public randomlySelect(): void {
    let randomIdx = 0;
    let chordChecked = false;
    const select = this.selectChordsControl.value > this.chords.length / 2;

    this.toggleAll(select);

    while (this.chordsSelected !== this.selectChordsControl.value) {
      randomIdx = CommonUtils.generateRandomInteger(0, this.chords.length - 1);

      chordChecked = select ? this.chords[randomIdx].checked : !this.chords[randomIdx].checked;
      if (chordChecked) {
        this.chords[randomIdx].checked = !select;
        select ? this.chordsSelected-- : this.chordsSelected++;
      }
    }
  }

  public addChordToSequence(chord: Chord): void {
    this.chordsSequence.push({name: chord.name, playing: chord.playing});
  }

  public addChordsToSequence(): void {
    this.chords.forEach((chord: Chord) => {
      if (chord.checked) {
        this.addChordToSequence(chord);
      }
    });
  }

  public removeChordFromSequence(event: Event, chordIndex: number): void {
    event.stopPropagation();
    this.chordsSequence.splice(chordIndex, 1);
    if (this.playedChordIndex === chordIndex) {
      if (this.playedChordIndex !== 0 && this.playedChordIndex === this.chordsSequence.length) {
        this.playedChordIndex--;
      }
      this.playedChord = this.chordsSequence[this.playedChordIndex];
      this.playedChord.playing = true;
    } else if (this.playedChordIndex > chordIndex) {
      this.playedChordIndex--;
    }
  }

  public shuffleSequence(): void {
    this.chordsSequence.sort(() => Math.random() - .5);
    if (this.playedChord) {
      this.playedChord.playing = false;
      this.playedChord = this.chordsSequence[this.playedChordIndex];
      this.playedChord.playing = true;
    }
  }

  public addChord(): void {
    this.chordRepository.addChord(this.chordNameControl.value);
    this.chordNameControl.reset();
    this.initChords();
  }

  public removeChord(id: number, checked: boolean): void {
    this.chordRepository.removeChord(id);
    if (checked) {
      this.chordsSelected--;
    }
    this.initChords();
  }

  public removeChords(): void {
    this.chordRepository.removeChords(this.chords
      .filter((chord: Chord) => chord.checked)
      .map((chord: Chord) => {
        this.chordsSelected--;
        return chord.id;
      }));
    this.initChords();
  }

  private initChords(): void {
    this.chords = [...this.chordRepository.getChords()];
  }

  private findChord(): void {
    this.chords = this.chordRepository.getChords().filter((chord: Chord) =>
      chord.name.toLowerCase().includes(this.chordNameControl.value.toString().toLowerCase()));
  }
}
