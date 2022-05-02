export enum GameState {
  MainMenu,
  PlayerQueue,
  Round,
  RoundResults,
  FinalResults
}

export default class TopState {
  settingsAvailable = true;
  helpOpen = false;
  settingsOpen = false;
  state: GameState = GameState.MainMenu;
  wordListLoaded = false;
}
