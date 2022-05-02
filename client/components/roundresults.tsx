import React from "react";
import { MAXIMUM_WORDS, EnteredWord, WordStatus } from "../../common/game";

const RoundResultCard = (props) => {
  const rows = [];

  const classFor = (status: WordStatus): string => {
    switch (status) {
    case WordStatus.OK:
      return "round-card-word-ok";
    case WordStatus.DUPLICATE:
    case WordStatus.SELF_DUPLICATE:
      return "round-card-word-duplicate";
    case WordStatus.WRONG_LENGTH:
      return "round-card-word-wronglength";
    case WordStatus.WRONG_LETTERS:
      return "round-card-word-wrongletters";
    case WordStatus.NOT_IN_WORDLIST:
      return "round-card-word-unknown";
    }
  }

  let roundSum = 0;
  for (let i = 0; i < MAXIMUM_WORDS; ++i) {
    const word: EnteredWord = props.result.words[i];
    if (word) {
      rows.push(<tr key={`tablerow${i}`}>
        <td className={"round-card-monospace round-card-center " + classFor(word.status)}>{word.word}</td>
        <td className={"round-card-monospace round-card-right " +
          ["round-card-word-penalty", "", "round-card-word-ok"][1 + Math.sign(word.points)]}
          >{word.points}</td>
      </tr>)
      roundSum += word.points
    } else if (!i) {
      rows.push(<tr key={`tablerow${i}`}><td colSpan={2} className="round-card-header round-card-center">(ei sanoja)</td></tr>)
    } else {
      rows.push(<tr key={`tablerow${i}`}><td></td><td></td></tr>)
    }
  }
  return (
    <div className={props.single ? "round-card single" : "round-card"}>
      <table>
        {!props.single && 
          <thead>
            <tr><td colSpan={2} className="round-card-player-name round-card-center">{props.player}</td></tr>
            <tr><td colSpan={2}><hr /></td></tr>
          </thead>}
        <tbody>
          {rows}
          <tr><td colSpan={2}><hr /></td></tr>
          <tr>
            <td className="round-card-header">Kierrospisteet</td>
            <td className={"round-card-monospace round-card-right " +
              ["round-card-word-penalty", "", "round-card-word-ok"][1 + Math.sign(roundSum)]}
              >{roundSum}</td>
          </tr>
          <tr>
            <td className="round-card-header">Yhteispisteet</td>
            <td className="round-card-right round-card-monospace">{props.result.score}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const RoundResults = (props) => {
  if (!props.results) {
    return <h1>Odotetaan muita pelaajia...</h1>
  }

  const cards = [];

  for (const result of props.results) {
    cards.push(
      <RoundResultCard
        key={`playerCard_${result.name}`}
        player={result.name}
        single={props.results.length === 1}
        result={result}
      />
    );
  }

  return (
    <>
      <div id="round-results">
        {cards}
      </div>
      <hr />
      <div className="center">
        {props.isHost ? (
          <button onClick={props.nextRound} id="submit">
            {props.isFinalRound ? "Lopputuloksiin" : "Seuraava kierros"}
          </button>
        ) : (<h3>Odotetaan pelinjohtajaa...</h3>)}
      </div>
    </>
  )
}

export default RoundResults;
