import React from "react";
import Window from './window';

export const Leaderboard = (props) => {
  if (!Object.keys(props.score).length) {
    return <h1>Peli ei käynnissä</h1>
  } else if (Object.keys(props.score).length === 1) {
    return <h1>Pisteet: {props.score[Object.keys(props.score)[0]]}</h1>
  } else {
    const points = Object.keys(props.score).
      map(player => [player, props.score[player]]).
      sort((a, b) => b[1] - a[1])
    const rows = points.map((row, index) => (
      <tr key={`scoreRow${index}`}>
        <td>{(!index || points[index - 1][1] !== row[1]) ? `${index + 1}.` : ' '}</td>
        <td>{row[0]}</td>
        <td>{row[1]}</td>
      </tr>)
    )
    return (
      <>
        <h1>Pisteet</h1>
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
      </>
    )
  }
};

const LeaderboardWindow = (props) => {
  return (
    <Window close={props.close}>
      <Leaderboard score={props.score} />
    </Window>
  )
};

export default LeaderboardWindow;
