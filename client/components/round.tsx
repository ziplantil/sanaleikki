import React, { useState, useEffect } from "react";
import RandomSource from "../../common/random";
import WordEntry from './wordentry';
import { formatMinutesSeconds } from '../util/optionformat';
import isMobileFn from "../util/mobile";

const isMobile = isMobileFn()

const Countdown = (props) => {
  const [time, setTime] = useState(Date.now());
  const remaining = Math.ceil((props.end - time) / 1000) | 0;
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);
  if (props.end <= time) {
    window.requestAnimationFrame(() => props.over());
    return null
  }
  if (props.seconds) {
    return <p className={props.className}>{remaining}</p>
  }
  return <p className={props.className}>{formatMinutesSeconds(remaining)}</p>
}

const Round = (props) => {
  const [letters, setLetters] = useState(null);
  const [letterOrder, setLetterOrder] = useState([]);
  const [submitOk, setSubmitOk] = useState(false);
  const [words, setWords] = useState([]);
  const [roundTimeout, setRoundTimeout] = useState(Date.now() + 3000);
  const [showSeconds, setShowSeconds] = useState(true);

  const doEndRound = () => {
    props.endRound(words)
  };

  const updateWords = (submitOk, newWords) => {
    setSubmitOk(submitOk);
    setWords(newWords);
  }

  useEffect(() => {
    const title = document.title
    props.startRound(letters => {
      const order = [...Array(letters.length + 1).keys()].slice(1)
      new RandomSource().shuffle(order)
      setRoundTimeout(Date.now() + props.options.roundTime * 1000)
      setLetterOrder(order)
      setLetters(letters)
      document.title = `(${props.roundNum}/${props.options.rounds}) ${title}`
    })
    return () => { document.title = title }
  }, [])

  useEffect(() => {
    if (props.roundOver) {
      doEndRound();
    }
  }, [props.roundOver])

  useEffect(() => {
    if (!letters && props.isMultiplayer && document.hidden !== false) {
      const title = document.title
      let toggle = false
      let counter = 6
      const interval = setInterval(() => {
        if (!counter) {
          document.title = title
          clearInterval(interval)
        } else {
          --counter
          document.title = (toggle ? "[!!]" : "----") + " " + title
          toggle = !toggle
        }
      }, 400)
    }
  }, [letters])

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
        <div id="focusNoOutside" onBlur={() => document.getElementById("focusNoOutside").focus()}>
          <WordEntry letterCount={letters.length}
            updateWords={updateWords}
            focusSubmit={focusSubmit} />
          <hr />
          <div className="center">
            <button disabled={!submitOk} onClick={doEndRound} id="submit">STOP!</button>
          </div>
        </div>
        {isMobile && (<div style={{ "height": "35vh" }}>
          <br />
        </div>)}
      </>
    )
  } else if (props.isMultiplayer) {
    return (
      <>
        <h1>Odotetaan kierroksen alkua...</h1>
        {showSeconds && <Countdown className="seconds" seconds={true}
                         end={roundTimeout} over={() => setShowSeconds(false)} />}
      </>
    )
  } else {
    return <></>
  }
};

export default Round;
