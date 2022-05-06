import React, { useState, useEffect } from "react";
import TitleBar from './title';
import TopState, { GameState } from '../states/topstate';
import HelpWindow from './help';
import LeaderboardWindow from './leaderboard';
import OptionsWindow from './options';
import MainMenu from './mainmenu';
import Options from '../../common/options';
import PlayerList from './playerlist';
import GameMulti from '../states/gamemulti';
import GameProxy from '../states/gameproxy';
import GameSingle from '../states/gamesingle';
import { ScoreTable, PlayerEnteredWords } from "../../common/game";
import Round from './round';
import RoundResults from './roundresults';
import FinalResults from './finalresults';

let wordList = [];

const scrollToTop = () => window.scrollTo(0, 0)

const App = (props) => {
  const cachedOptions = window.localStorage.getItem('sanaleikkiOptions');
  let preOptions;
  if (cachedOptions) {
    try {
      preOptions = JSON.parse(cachedOptions) as Options;
    } catch (e) { }
  }

  const [topState, setTopState] : [TopState, (args: any) => void] = useState(new TopState());
  const [options, setOptions] : [Options, (args: any) => void] = useState(preOptions || new Options());
  const [gameOptions, setGameOptions] : [Options, (args: any) => void] = useState(new Options());
  const [proxy, setProxy] : [GameProxy, (args: any) => void] = useState(null);
  const [score, setScore] : [ScoreTable, (args: any) => void] = useState({});
  const [roundOver, setRoundOver] : [boolean, (args: any) => void] = useState(false);
  const [enteredWords, setEnteredWords] : [PlayerEnteredWords, (args: any) => void] = useState(null);
  const [roundNum, setRoundNum] : [number, (args: number) => void] = useState(0);
  const [players, setPlayers] : [string[], (args: string[]) => void] = useState([]);
  const [isHost, setIsHost] : [boolean, (args: any) => void] = useState(true);
  const [gamecode, setGamecode] : [string, (args: any) => void] = useState("");

  useEffect(() => {
    fetch('sanat.txt')
      .then(response => response.text())
      .then(text => {
        wordList = text.split(/\r?\n/).filter(word => word);
        setTopState({ ...topState, wordListLoaded: true });
      })
      .catch(() => alert('Sanalistaa ei voitu ladata. Yksinpeli pois käytöstä.'));
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", (e) => {
      switch (topState.state) {
      case GameState.PlayerQueue:
      case GameState.Round:
      case GameState.RoundResults:
        e.preventDefault();
      default:
        break;
      }
    })
  }, []);

  useEffect(() => {
    window.localStorage.setItem('sanaleikkiOptions', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    if (roundNum === 0) {
      setScore(Object.fromEntries(players.map(player => [player, 0])))
    }
  }, [players]);

  const openHelp = () => {
    if (!topState.helpOpen) {
      setTopState({ ...topState, helpOpen: true, settingsOpen: false })
    } else {
      setTopState({ ...topState, helpOpen: false })
    }
  }

  const openSettings = () => {
    if (!topState.settingsOpen) {
      setTopState({ ...topState, settingsOpen: true, helpOpen: false })
    } else {
      setTopState({ ...topState, settingsOpen: false })
    }
  }

  const closeHelp = () => setTopState({ ...topState, helpOpen: false })

  const closeSettings = () => setTopState({ ...topState, settingsOpen: false })

  const startGameSingle = () => {
    setGameOptions(options)
    const proxy = new GameSingle(options, wordList, {
      roundResults: (words, scores) => {
        setEnteredWords(words)
        setScore(scores)
      },
    })
    setIsHost(true)
    setProxy(proxy)
    setScore(proxy.initializeScores())
    setRoundNum(1)
    scrollToTop()
    setTopState({ ...topState, state: GameState.Round, settingsOpen: false, settingsAvailable: false })
  }

  const startGameMulti = (nick: string, code: string | null) => {
    const host = code === null;
    if (host) setGameOptions(options)
    const proxy = new GameMulti(host ? options : null, nick, code, {
      updateOptions: options => setGameOptions(options),
      updatePlayers: players => setPlayers(players),
      updateScores: scores => setScore(scores),
      shareCode: code => setGamecode(code),
      isNowTheHost: () => setIsHost(true),
      gotCall: () => setRoundOver(topState.state == GameState.Round),
      roundResults: (words, scores) => {
        setEnteredWords(words)
        setScore(scores)
      },
      roundStart: (roundNum: number) => {
        setRoundNum(roundNum)
        scrollToTop()
        setTopState({ ...topState, state: GameState.Round, settingsOpen: false, settingsAvailable: false })
      },
      gameError: (error: string) => {
        alert(error);
        endGame();
      },
      gameOver: () => {
        setTopState({ ...topState, state: GameState.FinalResults })
      }
    })
    setIsHost(host)
    setProxy(proxy)
    setRoundNum(0)
    scrollToTop()
    setTopState({ ...topState, state: GameState.PlayerQueue, settingsOpen: false, settingsAvailable: false })
  }

  const nextRound = () => {
    const round = roundNum
    const endOfGame = round === gameOptions.rounds
    setRoundNum(roundNum + 1)
    scrollToTop()
    proxy.nextRound(round)
    setTopState({ ...topState, state: endOfGame ? GameState.FinalResults : GameState.Round })
    if (endOfGame)
      proxy.finalize()
  }

  const startRound = callback => {
    proxy.startRound(callback);
  }

  const endRound = (words: string[]) => {
    setEnteredWords(null);
    scrollToTop()
    setTopState({ ...topState, state: GameState.RoundResults })
    setRoundOver(false)
    proxy.endRound(words)
  }

  const endGame = () => {
    if (proxy) proxy.finalize()
    scrollToTop()
    setTopState({ ...topState, state: GameState.MainMenu, settingsOpen: false, settingsAvailable: true })
    setProxy(null)
  }

  const getMainView = () => {
    switch (topState.state) {
      case GameState.MainMenu:
        return <MainMenu options={options}
                         canStartGameSingle={topState.wordListLoaded}
                         startGameSingle={startGameSingle}
                         startGameMulti={nick => startGameMulti(nick, null)}
                         joinGameMulti={startGameMulti}
                         openSettings={openSettings} />
      case GameState.PlayerQueue:
        return <PlayerList options={gameOptions}
                      players={players} 
                      isHost={isHost} 
                      code={gamecode}
                      start={nextRound} />
      case GameState.Round:
        return <Round options={gameOptions}
                      startRound={startRound}
                      roundNum={roundNum}
                      roundOver={roundOver}
                      endRound={endRound} />
      case GameState.RoundResults:
        const results = !enteredWords ? null : Object.keys(enteredWords).
          sort().
          map(player => ({ name: player, words: enteredWords[player], score: score[player] }));
        return <RoundResults results={results}
                             isHost={isHost}
                             nextRound={nextRound}
                             isFinalRound={roundNum === gameOptions.rounds} />
      case GameState.FinalResults:
        return <FinalResults score={score}
                             return={endGame} />
    };
    return <></>
  }

  return (
    <>
      <TitleBar state={topState} openHelp={openHelp} openSettings={openSettings} />
      {topState.helpOpen
        && <HelpWindow close={closeHelp} />}
      {topState.settingsOpen && (topState.settingsAvailable 
        ? <OptionsWindow options={options} setOptions={setOptions} close={closeSettings} />
        : <LeaderboardWindow score={score} close={closeSettings} />)}
      <main>
        {getMainView()}
      </main>
    </>
  )
};

export default App;
