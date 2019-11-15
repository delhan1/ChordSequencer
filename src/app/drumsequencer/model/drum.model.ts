export interface Drum {
  name?: string;
  sound?: Howl;
}

export interface DrumSet {
  name?: string;
  drums?: Drum[];
}
