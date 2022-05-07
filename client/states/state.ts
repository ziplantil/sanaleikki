import Options from '../../common/options'
import { ScoreTable, PlayerEnteredWords } from "../../common/game"
import { getCachedOptions, saveCachedOptions } from './options'
import GameMulti from './gamemulti'
import GameProxy from './gameproxy'
import GameSingle from './gamesingle'

export enum CurrentScreen {
  MainMenu,
  PlayerQueue,
  Round,
  RoundResults,
  FinalResults
}

export class GameState {
  settingsAvailable = true
  helpOpen = false
  settingsOpen = false
  screen: CurrentScreen = CurrentScreen.MainMenu
  wordListLoaded = false

  options: Options
  gameOptions: Options = new Options()

  proxy: GameProxy = null
  scores: ScoreTable = {}

  roundOver = false
  enteredWords: PlayerEnteredWords = null
  roundNumber = 0
  players: string[] = []
  isHost = false
  gamecode: string = null

  constructor() {
    this.options = { ...new Options(), ...getCachedOptions() }
  }
}

export enum GameStateActionType {
  WordListLoaded,

  OpenHelp,
  OpenSettings,
  CloseHelp,
  CloseSettings,

  UpdateOptions,

  StartGameSingleplayer,
  StartGameMultiplayer,
  StartRound,
  NextRound,
  RoundResults,
  EndRound,
  EndGame,

  MultiSetOptions,
  MultiSetPlayers,
  MultiSetScores,
  MultiSetGamecode,
  MultiIsNowTheHost,
  MultiGotCall,
  MultiRoundStarted,
  MultiGameEnded,
}

export interface GameStateAction {
  type: GameStateActionType
  payload?: any
}

export function wordListLoaded(): GameStateAction {
  return { type: GameStateActionType.WordListLoaded }
}

export function openHelp(): GameStateAction {
  return { type: GameStateActionType.OpenHelp }
}

export function openSettings(): GameStateAction {
  return { type: GameStateActionType.OpenSettings }
}

export function closeHelp(): GameStateAction{
  return { type: GameStateActionType.CloseHelp }
}

export function closeSettings(): GameStateAction {
  return { type: GameStateActionType.CloseSettings }
}

export function updateOptions(values: any): GameStateAction {
  return { type: GameStateActionType.UpdateOptions, payload: values }
}

export function startGameSingle(proxy: GameSingle): GameStateAction {
  return { type: GameStateActionType.StartGameSingleplayer, payload: proxy }
}

export function startGameMulti(proxy: GameMulti): GameStateAction {
  return { type: GameStateActionType.StartGameMultiplayer, payload: proxy }
}

export function startRound(callback: any): GameStateAction {
  return { type: GameStateActionType.StartRound, payload: callback }
}

export function nextRound(): GameStateAction {
  return { type: GameStateActionType.NextRound }
}

export function roundResults(words: PlayerEnteredWords, scores: ScoreTable): GameStateAction {
  return { type: GameStateActionType.RoundResults, payload: { words, scores } }
}

export function endRound(words: string[]): GameStateAction {
  return { type: GameStateActionType.EndRound, payload: words }
}

export function endGame(): GameStateAction {
  return { type: GameStateActionType.EndGame }
}

export function multiSetOptions(options: Options): GameStateAction {
  return { type: GameStateActionType.MultiSetOptions, payload: options }
}

export function multiSetPlayers(players: string[]): GameStateAction {
  return { type: GameStateActionType.MultiSetPlayers, payload: players }
}

export function multiSetScores(scores: ScoreTable): GameStateAction {
  return { type: GameStateActionType.MultiSetScores, payload: scores }
}

export function multiSetGamecode(gamecode: string): GameStateAction {
  return { type: GameStateActionType.MultiSetGamecode, payload: gamecode }
}

export function multiIsNowTheHost(): GameStateAction {
  return { type: GameStateActionType.MultiIsNowTheHost }
}

export function multiGotCall(): GameStateAction {
  return { type: GameStateActionType.MultiGotCall }
}

export function multiRoundStarted(roundNumber: number): GameStateAction {
  return { type: GameStateActionType.MultiRoundStarted, payload: roundNumber }
}

export function multiGameEnded(): GameStateAction {
  return { type: GameStateActionType.MultiGameEnded }
}

export function gameStateReducer(state: GameState,
                                 action: GameStateAction): GameState {
  switch (action.type) {
    case GameStateActionType.WordListLoaded:
      return { ...state, wordListLoaded: true }

    case GameStateActionType.OpenHelp:
      if (!state.helpOpen)
        return { ...state, helpOpen: true, settingsOpen: false }
      else
        return { ...state, helpOpen: false }

    case GameStateActionType.OpenSettings:
      if (!state.settingsOpen)
        return { ...state, settingsOpen: true, helpOpen: false }
      else
        return { ...state, settingsOpen: false }
    
    case GameStateActionType.CloseHelp:
      return { ...state, helpOpen: false }

    case GameStateActionType.CloseSettings:
      return { ...state, settingsOpen: false }

    case GameStateActionType.UpdateOptions:
    {
      const newOptions: Options = { ...state.options, ...action.payload }
      saveCachedOptions(newOptions)
      return {
        ...state,
        options: newOptions,
      }
    }
    
    case GameStateActionType.StartGameSingleplayer:
      return {
        ...state,
        screen: CurrentScreen.Round,
        settingsOpen: false,
        settingsAvailable: false,
        gameOptions: state.options,
        proxy: action.payload,
        isHost: true,
        scores: action.payload.initializeScores(),
        roundNumber: 1
      }

    case GameStateActionType.StartGameMultiplayer:
      return {
        ...state,
        screen: CurrentScreen.PlayerQueue,
        settingsOpen: false,
        settingsAvailable: false,
        proxy: action.payload,
        isHost: action.payload.isHost(),
        gameOptions: action.payload.isHost() ? state.options : state.gameOptions,
        roundNumber: 0
      }

    case GameStateActionType.StartRound:
      state.proxy.startRound(action.payload)
      return state

    case GameStateActionType.NextRound:
    {
      const endOfGame = state.roundNumber === state.gameOptions.rounds
      state.proxy.nextRound(state.roundNumber)
      const newRound = state.roundNumber + 1
      if (endOfGame)
        state.proxy.finalize()
      return {
        ...state,
        screen: endOfGame ? CurrentScreen.FinalResults : CurrentScreen.Round,
        roundNumber: newRound,
      }
    }
  
    case GameStateActionType.RoundResults:
      return {
        ...state,
        enteredWords: action.payload.words,
        scores: action.payload.scores,
      }

    case GameStateActionType.EndRound:
      state.proxy.endRound(action.payload)
      return {
        ...state,
        screen: CurrentScreen.RoundResults,
        enteredWords: null,
        roundOver: false,
      }

    case GameStateActionType.EndGame:
      if (state.proxy)
        state.proxy.finalize()
      return {
        ...state,
        screen: CurrentScreen.MainMenu,
        proxy: null,
        settingsOpen: false,
        settingsAvailable: true
      }

    case GameStateActionType.MultiSetOptions:
      return { ...state, gameOptions: action.payload }

    case GameStateActionType.MultiSetPlayers:
      if (state.roundNumber === 0)
        return {
          ...state, 
          players: action.payload,
          scores: Object.fromEntries(action.payload.map(player => [player, 0]))
        }
      else
        return { ...state, players: action.payload }

    case GameStateActionType.MultiSetScores:
      return { ...state, scores: action.payload }

    case GameStateActionType.MultiSetGamecode:
      return { ...state, gamecode: action.payload }

    case GameStateActionType.MultiIsNowTheHost:
      return { ...state, isHost: true }

    case GameStateActionType.MultiGotCall:
      return { ...state, roundOver: state.roundOver || state.screen === CurrentScreen.Round }

    case GameStateActionType.MultiRoundStarted:
      return {
        ...state,
        screen: CurrentScreen.Round,
        roundNumber: action.payload,
        settingsOpen: false,
        settingsAvailable: false
      }

    case GameStateActionType.MultiGameEnded:
      return {
        ...state,
        screen: CurrentScreen.FinalResults
      }
      
  }
}
