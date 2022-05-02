import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { isValidPlayerName } from '../../common/game';
import { OptionInfo, optionList } from './options';

const MainMenu = (props) => {
  const [nick, setNick] = useState(Cookies.get("sanaleikkiNick") || "");
  const [gamecode, setGameCode] = useState("");

  useEffect(() => {
    Cookies.set("sanaleikkiNick", nick, { sameSite: 'strict' });
  }, [nick]);

  return (
    <>
      <h1>Tervetuloa Sanaleikkiin</h1>
      <p>Katso ohjeet ylävasemmasta nurkasta tai vaihda asetuksia yläoikeasta nurkasta.</p>

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

      <br />
      <div className="center">
        <button disabled={!props.canStartGameSingle}
          onClick={props.startGameSingle}>Aloita yksinpeli</button>
      </div>

      <br />
      <hr />
      <h2>Moninpeli</h2>

      <div className="center">
        <span>Nimimerkki:</span><span>&nbsp;</span>
        <input type="text" className="multiplayer-input" maxLength={32} value={nick} onChange={e => setNick(e.target.value)} />
      </div>

      <br />
      <div className="center">
        <button disabled={!isValidPlayerName(nick)}
          onClick={() => props.startGameMulti(nick)}>Aloita moninpeli</button>
      </div>

      <br />
      <div className="center">
        <span>Pelikoodi:</span><span>&nbsp;</span>
        <input type="text" className="multiplayer-input" maxLength={32} value={gamecode} onChange={e => setGameCode(e.target.value.replace(/[^0-9]/g, ''))} />
      </div>

      <br />
      <div className="center">
        <button disabled={!(isValidPlayerName(nick) && !!gamecode)}
          onClick={() => props.joinGameMulti(nick, gamecode)}>Liity moninpeliin</button>
      </div>

      <p>Nimimerkissä sallitaan merkit A-Z, Ä, Ö, 0-9, väliviiva, alaviiva ja välilyönti.</p>
    </>
  )
};

export default MainMenu;
