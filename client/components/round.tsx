import React, { useState, useEffect } from "react";
import RandomSource from "../../common/random";
import WordEntry from './wordentry';
import { formatMinutesSeconds } from '../util/optionformat';
import isMobileFn from "../util/mobile";

const isMobile = isMobileFn()

const Countdown = (props) => {
  const [time, setTime] = useState(Date.now());
  const remaining = Math.round((props.end - time) / 1000) | 0;
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);
  if (props.end <= time) {
    window.requestAnimationFrame(() => props.over());
    return null
  }
  return <p className={props.className}>{formatMinutesSeconds(remaining)}</p>
}

const Round = (props) => {
  const [letters, setLetters] = useState(null);
  const [letterOrder, setLetterOrder] = useState([]);
  const [submitOk, setSubmitOk] = useState(false);
  const [words, setWords] = useState([]);
  const [roundTimeout] = useState(Date.now() + props.options.roundTime * 1000);

  const doEndRound = () => {
    props.endRound(words)
  };

  const updateWords = (submitOk, newWords) => {
    setSubmitOk(submitOk);
    setWords(newWords);
  }

  useEffect(() => {
    props.startRound(letters => {
      const order = [...Array(letters.length + 1).keys()].slice(1)
      new RandomSource().shuffle(order)
      setLetterOrder(order);
      setLetters(letters)
    })
  }, []);

  useEffect(() => {
    if (props.roundOver) {
      doEndRound();
    }
  }, [props.roundOver]);

  const focusSubmit = () => {
    const submit = document.getElementById("submit");
    submit.focus();
    submit.scrollIntoView({inline: "nearest", block: "nearest"});
  }

  if (letters) {
    const letterTiles = [];
    for (let i = 0; i < letters.length; ++i) {
      letterTiles.push(
        <div className="tile" id={`d${letterOrder[i]}`} key={`letter${i}`}>
          {letters[i]}
        </div>
      );
    }
    return (
      <>
        <header>
          <span className="countdown">{props.roundNum}/{props.options.rounds}</span>
          <h3>Muodosta sanoja näistä kirjaimista:</h3>
          <Countdown className="countdown" end={roundTimeout} over={() => doEndRound()} />
        </header>
        <div className="center letters">
          {letterTiles}
        </div>
        <hr />
        <WordEntry letterCount={letters.length}
          updateWords={updateWords}
          focusSubmit={focusSubmit} />
        <hr />
        <div className="center">
          <button disabled={!submitOk} onClick={doEndRound} id="submit">STOP!</button>
        </div>
        {isMobile && (<div style={{ "height": "35vh" }}>
          <br />
        </div>)}
      </>
    )
  } else {
    return (
      <h1>Odotetaan kierroksen alkua...</h1>
    )
  }
};

export default Round;
