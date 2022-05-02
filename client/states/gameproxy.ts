export default interface GameProxy {
  nextRound: (round: number) => void;
  startRound: (callback: (letters: string[]) => void) => void;
  endRound: (words: string[]) => void;
  finalize: () => void;
  isHost: () => boolean;
}
