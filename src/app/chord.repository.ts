import {Injectable} from '@angular/core';
import {Chord} from './chord.model';

@Injectable()
export class ChordRepository {
  private chords: Chord[] = [];

  constructor() {
    this.generateChords();
  }

  public getChord(id: number): Chord {
    return this.chords.find((chord: Chord) => chord.id === id);
  }

  public getChords(): Chord[] {
    return this.chords;
  }

  public addChord(chordName: string) {
    const newChord: Chord = {
      id: this.generateID(),
      checked: false,
      name: chordName
    };
    this.chords.push(newChord);
  }

  public removeChord(id: number): void {
    this.chords.splice(this.chords.findIndex((chord: Chord) => chord.id === id), 1);
  }

  public removeChords(ids: number[]): void {
    ids.forEach((id: number) => this.removeChord(id));
  }

  private generateID(): number {
    let candidate = 100;
    while (this.getChord(candidate) != null) {
      candidate++;
    }
    return candidate;
  }

  private generateChords(): void {
    const notes: string[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

    notes.forEach((note: string) => this.generateColoredNotes(note)
      .forEach((note2: string) => this.addChord(note2)));
  }

  private generateColoredNotes(note: string): string[] {
    return [note, note + '7', note + 'm', note + 'm7'];
  }
}
