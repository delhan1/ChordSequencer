import {Injectable} from '@angular/core';
import {Drum} from '../model/drum.model';
import {Howl} from 'howler';

@Injectable()
export class DrumRepository {
  private audioPath = '../assets/audio/';
  private hats: Drum[] = [];

  constructor() {
    this.initHats();
  }

  private initHats(): void {
    for (let i = 0; i < 9; i++) {
      this.addDrum(this.hats, `Close hat (${i + 1})`, this.audioPath + 'hats/', `close-hat(${i + 1}).wav`);
    }
    for (let i = 0; i < 7; i++) {
      this.addDrum(this.hats, `Open hat (${i + 1})`, this.audioPath + 'hats/', `open-hat(${i + 1}).wav`);
    }
    for (let i = 0; i < 4; i++) {
      this.addDrum(this.hats, `Pedal hat (${i + 1})`, this.audioPath + 'hats/', `pedal-hat(${i + 1}).wav`);
    }
  }

  private addDrum(array: Drum[], drumName: string, filePath: string, fileName: string): void {
    array.push({
      name: drumName,
      sound: new Howl({
        src: filePath + fileName,
        preload: true,
      })
    });
  }

  public getHats(): Drum[] {
    return this.hats;
  }
}
