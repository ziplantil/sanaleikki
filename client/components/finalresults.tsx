import React from "react";
import { Leaderboard } from './leaderboard';

const FinalResults = (props) => {
  return (
    <>
      <Leaderboard score={props.score} />
      <hr />
      <div className="center">
        <button onClick={props.return} id="submit">Takaisin</button>
      </div>
    </>
  );
}

export default FinalResults;
