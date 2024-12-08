import { atom } from "jotai";

export interface MidiInput {
  name: string;
  index: string;
}

export const loadedVideoAtom = atom<{ url: string; file: File | null }>({
  url: "",
  file: null,
});

export const midiFileAtom = atom("");

export const midiConnectionInfo = atom<MidiInput | null>(null);

export enum AppMode {
  Piano,
  Video,
}

export const modeAtom = atom(AppMode.Piano);

export const speedMultiAtom = atom(1);

export enum BlackKeyPos {
  /* C to C# and F to F# */
  SmallDistance,
  /* G to G# */
  MediumDistance,
  /* D to D# and a to A# */
  LongDistance,
  /* No black key */
  None,
}

export enum PianoKey {
  A0 = 21,
  Bb0 = 22,
  B0 = 23,
  C1 = 24,
  Db1 = 25,
  D1 = 26,
  Eb1 = 27,
  E1 = 28,
  F1 = 29,
  Gb1 = 30,
  G1 = 31,
  Ab1 = 32,
  A1 = 33,
  Bb1 = 34,
  B1 = 35,
  C2 = 36,
  Db2 = 37,
  D2 = 38,
  Eb2 = 39,
  E2 = 40,
  F2 = 41,
  Gb2 = 42,
  G2 = 43,
  Ab2 = 44,
  A2 = 45,
  Bb2 = 46,
  B2 = 47,
  C3 = 48,
  Db3 = 49,
  D3 = 50,
  Eb3 = 51,
  E3 = 52,
  F3 = 53,
  Gb3 = 54,
  G3 = 55,
  Ab3 = 56,
  A3 = 57,
  Bb3 = 58,
  B3 = 59,
  C4 = 60,
  Db4 = 61,
  D4 = 62,
  Eb4 = 63,
  E4 = 64,
  F4 = 65,
  Gb4 = 66,
  G4 = 67,
  Ab4 = 68,
  A4 = 69,
  Bb4 = 70,
  B4 = 71,
  C5 = 72,
  Db5 = 73,
  D5 = 74,
  Eb5 = 75,
  E5 = 76,
  F5 = 77,
  Gb5 = 78,
  G5 = 79,
  Ab5 = 80,
  A5 = 81,
  Bb5 = 82,
  B5 = 83,
  C6 = 84,
  Db6 = 85,
  D6 = 86,
  Eb6 = 87,
  E6 = 88,
  F6 = 89,
  Gb6 = 90,
  G6 = 91,
  Ab6 = 92,
  A6 = 93,
  Bb6 = 94,
  B6 = 95,
  C7 = 96,
  Db7 = 97,
  D7 = 98,
  Eb7 = 99,
  E7 = 100,
  F7 = 101,
  Gb7 = 102,
  G7 = 103,
  Ab7 = 104,
  A7 = 105,
  Bb7 = 106,
  B7 = 107,
  C8 = 108,
}

export function isBlackKey(note: number): boolean {
  switch (note) {
    case 22:
    case 25:
    case 27:
    case 30:
    case 32:
    case 34:
    case 37:
    case 39:
    case 42:
    case 44:
    case 46:
    case 49:
    case 51:
    case 54:
    case 56:
    case 58:
    case 61:
    case 63:
    case 66:
    case 68:
    case 70:
    case 73:
    case 75:
    case 78:
    case 80:
    case 82:
    case 85:
    case 87:
    case 90:
    case 92:
    case 94:
    case 97:
    case 99:
    case 102:
    case 104:
    case 106:
      return true;
    default:
      return false;
  }
}

export function getNoteName(note: number): string {
  switch (note) {
    case PianoKey.A0:
    case PianoKey.A1:
    case PianoKey.A2:
    case PianoKey.A3:
    case PianoKey.A4:
    case PianoKey.A5:
    case PianoKey.A6:
    case PianoKey.A7:
      return "A";
    case PianoKey.Bb0:
    case PianoKey.Bb1:
    case PianoKey.Bb2:
    case PianoKey.Bb3:
    case PianoKey.Bb4:
    case PianoKey.Bb5:
    case PianoKey.Bb6:
    case PianoKey.Bb7:
      return "Bb";
    case PianoKey.B0:
    case PianoKey.B1:
    case PianoKey.B2:
    case PianoKey.B3:
    case PianoKey.B4:
    case PianoKey.B5:
    case PianoKey.B6:
    case PianoKey.B7:
      return "B";
    case PianoKey.C1:
    case PianoKey.C2:
    case PianoKey.C3:
    case PianoKey.C4:
    case PianoKey.C5:
    case PianoKey.C6:
    case PianoKey.C7:
    case PianoKey.C8:
      return "C";
    case PianoKey.Db1:
    case PianoKey.Db2:
    case PianoKey.Db3:
    case PianoKey.Db4:
    case PianoKey.Db5:
    case PianoKey.Db6:
    case PianoKey.Db7:
      return "Db";
    case PianoKey.D1:
    case PianoKey.D2:
    case PianoKey.D3:
    case PianoKey.D4:
    case PianoKey.D5:
    case PianoKey.D6:
    case PianoKey.D7:
      return "D";
    case PianoKey.Eb1:
    case PianoKey.Eb2:
    case PianoKey.Eb3:
    case PianoKey.Eb4:
    case PianoKey.Eb5:
    case PianoKey.Eb6:
    case PianoKey.Eb7:
      return "Eb";
    case PianoKey.E1:
    case PianoKey.E2:
    case PianoKey.E3:
    case PianoKey.E4:
    case PianoKey.E5:
    case PianoKey.E6:
    case PianoKey.E7:
      return "E";
    case PianoKey.F1:
    case PianoKey.F2:
    case PianoKey.F3:
    case PianoKey.F4:
    case PianoKey.F5:
    case PianoKey.F6:
    case PianoKey.F7:
      return "F";
    case PianoKey.Gb1:
    case PianoKey.Gb2:
    case PianoKey.Gb3:
    case PianoKey.Gb4:
    case PianoKey.Gb5:
    case PianoKey.Gb6:
    case PianoKey.Gb7:
      return "Gb";
    case PianoKey.G1:
    case PianoKey.G2:
    case PianoKey.G3:
    case PianoKey.G4:
    case PianoKey.G5:
    case PianoKey.G6:
    case PianoKey.G7:
      return "G";
    case PianoKey.Ab1:
    case PianoKey.Ab2:
    case PianoKey.Ab3:
    case PianoKey.Ab4:
    case PianoKey.Ab5:
    case PianoKey.Ab6:
    case PianoKey.Ab7:
      return "Ab";
    default:
      return "";
  }
}
