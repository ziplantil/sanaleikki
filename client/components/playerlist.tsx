import React from "react";
import { MAXIMUM_PLAYERS } from "../../common/game";
import { OptionInfo, optionList } from './options';

const PlayerList = (props) => {
  const players = [];

  for (let i = 0; i < MAXIMUM_PLAYERS; ++i) {
    const nick = props.players[i] || '\t';
    players.push(<tr key={`player${i}`}><td>{nick}</td></tr>)
  }

  return (
    <>
      {props.isHost && (
        <h3>
          Pelikoodi: {props.code}
        </h3>
      )}

      <h2>Asetukset</h2>
      <table>
        <tbody>
          {
            optionList.map((row: OptionInfo) => (
              <tr key={row.key}>
                <td>{row.text}</td>
                <td className="right">{row.format(props.options[row.key])}</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      <h2>Pelaajat</h2>
      <table className="player-list">
        <tbody>
          {players}
        </tbody>
      </table>

      <h2>Aloita</h2>
      <div className="center">
        {props.isHost ? (
          <button onClick={props.start} id="submit">
            Aloita peli
          </button>
        ) : (<h3>Odotetaan pelinjohtajaa...</h3>)}
      </div>
    </>
  )
}

export default PlayerList;
