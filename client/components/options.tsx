import React from "react";
import Window from './window';
import Difficulty from '../../common/difficulty';
import Options from '../../common/options';
import { formatDifficulty, formatMinutesSeconds } from '../util/optionformat';

const RadioButton = (props) => (
  <span className={props.option === props.value ? "radio-button active" : "radio-button"}
    onClick={() => props.update(props.value)}>
    {props.children}
  </span>
);

export interface OptionInfo {
  key: string,
  text: string,
  format: (value: any) => string;
};

export const optionList: OptionInfo[] = [
  { "key": "difficulty",
    "text": "Kirjainten vaikeustaso",
    "format": formatDifficulty},
  { "key": "roundTime",
    "text": "Miettimisaika",
    "format": formatMinutesSeconds },
  { "key": "rounds",
    "text": "Kierroksia",
    "format": (n: number) => '' + n },
  { "key": "minimumWordLength",
    "text": "Sanoissa vähintään",
    "format": (n: number) => `${n} kirjainta` },
]

const optionNames: {[key: string]: string} = Object.fromEntries(optionList.map(info => [info.key, info.text]))

const OptionsWindow = (props) => {
  return (
    <Window close={props.close}>
      <h1>Asetukset</h1>
      <table className="full-width settings">
        <tbody>
          <tr>
            <td>{optionNames["difficulty"]}</td>
            <td className="right">
              <RadioButton option={props.options.difficulty}
                update={value => props.setOptions({ ...props.options, difficulty: value })}
                value={Difficulty.Easy}>Helppo</RadioButton>
              <RadioButton option={props.options.difficulty}
                update={value => props.setOptions({ ...props.options, difficulty: value })}
                value={Difficulty.Medium}>Keskivaikea</RadioButton>
              <RadioButton option={props.options.difficulty}
                update={value => props.setOptions({ ...props.options, difficulty: value })}
                value={Difficulty.Hard}>Vaikea</RadioButton>
            </td>
          </tr>
          <tr>
            <td>{optionNames["roundTime"]}</td>
            <td className="right">
              <input type="number" className="monospace" value={(props.options.roundTime / 60) | 0}
                min="0" max="59" style={{ width: "3em" }}
                onChange={(e) => props.setOptions({ ...props.options,
                  roundTime: parseInt(e.target.value) * 60 + props.options.roundTime % 60})} />
              :
              <input type="number" className="monospace" value={(props.options.roundTime | 0) % 60}
                min="0" max="59" style={{ width: "3em" }}
                onChange={(e) => props.setOptions({ ...props.options,
                  roundTime: props.options.roundTime - (props.options.roundTime % 60) + parseInt(e.target.value) })} />
            </td>
          </tr>
          <tr>
            <td>{optionNames["rounds"]}</td>
            <td className="right">
              <input type="number" value={props.options.rounds} min="1" max="10" style={{ width: "5em" }}
                onChange={(e) => props.setOptions({ ...props.options, rounds: parseInt(e.target.value) })} />
            </td>
          </tr>
          <tr>
            <td>{optionNames["minimumWordLength"]}</td>
            <td className="right">
              <RadioButton option={props.options.minimumWordLength}
                update={value => props.setOptions({ ...props.options, minimumWordLength: value })}
                value={4}>4</RadioButton>
              <RadioButton option={props.options.minimumWordLength}
                update={value => props.setOptions({ ...props.options, minimumWordLength: value })}
                value={5}>5</RadioButton>
              <span>kirjainta</span>
            </td>
          </tr>
        </tbody>
      </table>
    </Window>
  )
};

export default OptionsWindow;
