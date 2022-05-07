import React, { useEffect, useReducer } from "react";
import TitleBar from './title';
import {
  GameState,
  gameStateReducer,
  CurrentScreen,
  wordListLoaded,
  openHelp,
  openSettings,
  closeHelp,
  closeSettings,
  updateOptions,
  startGameSingle,
  startGameMulti,
  startRound,
  nextRound,
  roundResults,
  endRound,
  endGame,
  multiSetOptions,
  multiSetPlayers,
  multiSetScores,
  multiSetGamecode,
  multiIsNowTheHost,
  multiGotCall,
  multiRoundStarted,
  multiGameEnded
} from '../states/state';
import HelpWindow from './help';
import LeaderboardWindow from './leaderboard';
import OptionsWindow from './options';
import MainMenu from './mainmenu';
import Options from '../../common/options';
import PlayerList from './playerlist';
import Round from './round';
import RoundResults from './roundresults';
import FinalResults from './finalresults';
import GameMulti from '../states/gamemulti';
import GameSingle from '../states/gamesingle';

let wordList = [];

const scrollToTop = () => window.scrollTo(0, 0)

const App = (props) => {
  const [state, perform] = useReducer(gameStateReducer, new GameState())

  const cachedOptions = window.localStorage.getItem('sanaleikkiOptions');
  let preOptions;
  if (cachedOptions) {
    try {
      preOptions = JSON.parse(cachedOptions) as Options;
    } catch (e) { }
  }

  useEffect(() => {
    fetch('sanat.txt')
      .then(response => response.text())
      .then(text => {
        wordList = text.split(/\r?\n/).filter(word => word);
        perform(wordListLoaded())
      })
      .catch(() => alert('Sanalistaa ei voitu ladata. Yksinpeli pois käytöstä.'));
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", (e) => {
      switch (state.screen) {
      case CurrentScreen.PlayerQueue:
      case CurrentScreen.Round:
      case CurrentScreen.RoundResults:
        e.preventDefault();
      default:
        break;
      }
    })
  }, []);

  const doOpenHelp = () => perform(openHelp())
  const doOpenSettings = () => perform(openSettings())
  const doCloseHelp = () => perform(closeHelp())
  const doCloseSettings = () => perform(closeSettings())
  const doUpdateOptions = options => perform(updateOptions(options))

  const doStartGameSingle = () => {
    const proxy = new GameSingle(state.options, wordList, {
      roundResults: (words, scores) => perform(roundResults(words, scores))
    })
    scrollToTop()
    perform(startGameSingle(proxy))
  }

  const doStartGameMulti = (nick: string, code: string | null) => {
    const host = code === null;
    const proxy = new GameMulti(host ? state.options : null, nick, code, {
      updateOptions: options => perform(multiSetOptions(options)),
      updatePlayers: players => perform(multiSetPlayers(players)),
      updateScores: scores => perform(multiSetScores(scores)),
      shareCode: code => perform(multiSetGamecode(code)),
      isNowTheHost: () => perform(multiIsNowTheHost()),
      gotCall: () => perform(multiGotCall()),
      roundResults: (words, scores) => perform(roundResults(words, scores)),
      roundStart: (roundNumber: number) => {
        perform(multiRoundStarted(roundNumber))
        scrollToTop()
      },
      gameError: (error: string) => {
        alert(error);
        doEndGame();
      },
      gameOver: () => perform(multiGameEnded())
    })
    scrollToTop()
    perform(startGameMulti(proxy))
  }

  const doNextRound = () => perform(nextRound())
  const doStartRound = callback => perform(startRound(callback))
  const doEndRound = (words: string[]) => {
    perform(endRound(words))
    scrollToTop()
  }
  const doEndGame = () => {
    perform(endGame())
    scrollToTop()
  }

  const getMainView = () => {
    switch (state.screen) {
      case CurrentScreen.MainMenu:
        return <MainMenu options={state.options}
                         canStartGameSingle={state.wordListLoaded}
                         startGameSingle={doStartGameSingle}
                         startGameMulti={nick => doStartGameMulti(nick, null)}
                         joinGameMulti={doStartGameMulti}
                         openSettings={doOpenSettings} />
      case CurrentScreen.PlayerQueue:
        return <PlayerList options={state.gameOptions}
                      players={state.players} 
                      isHost={state.isHost} 
                      code={state.gamecode}
                      start={doNextRound} />
      case CurrentScreen.Round:
        return <Round options={state.gameOptions}
                      startRound={doStartRound}
                      roundNum={state.roundNumber}
                      roundOver={state.roundOver}
                      endRound={doEndRound}
                      isMultiplayer={state.proxy.isMultiplayer()} />
      case CurrentScreen.RoundResults:
        const results = !state.enteredWords ? null : Object.keys(state.enteredWords).
          sort().
          map(player => ({ name: player, words: state.enteredWords[player], score: state.scores[player] }));
        return <RoundResults results={results}
                             isHost={state.isHost}
                             nextRound={doNextRound}
                             isFinalRound={state.roundNumber === state.gameOptions.rounds} />
      case CurrentScreen.FinalResults:
        return <FinalResults score={state.scores}
                             return={doEndGame} />
    };
  }

  return (
    <>
      <TitleBar state={state} openHelp={doOpenHelp} openSettings={doOpenSettings} />
      {state.helpOpen
        && <HelpWindow close={doCloseHelp} />}
      {state.settingsOpen && (state.settingsAvailable 
        ? <OptionsWindow options={state.options} setOptions={doUpdateOptions} close={doCloseSettings} />
        : <LeaderboardWindow score={state.scores} close={doCloseSettings} />)}
      <main>
        {getMainView()}
      </main>
    </>
  )
};

export default App;
