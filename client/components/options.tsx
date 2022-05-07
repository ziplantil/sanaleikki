import React from "react";
import Window from './window';
import Difficulty from '../../common/difficulty';
import { DiceType } from '../../common/dice'
import Options from '../../common/options';
import { formatBoolean, formatDifficulty, formatMinutesSeconds, formatDiceType } from '../util/optionformat';

const RadioButton = (props) => (
  <span className={props.option === props.value ? "radio-button active" : "radio-button"}
    onClick={() => props.update(props.value)}>
    {props.format ? props.format(props.value) : props.children}
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
  { "key": "penalties",
    "text": "Miinuspisteet",
    "format": formatBoolean },
  { "key": "diceType",
    "text": "Nopat",
    "format": formatDiceType },
]

const optionNames: {[key: string]: string} = Object.fromEntries(optionList.map(info => [info.key, info.text]))

const OptionsWindow = (props) => {
  return (
    <Window close={props.close}>
      <h1>Asetukset</h1>
      <div className="full-width settings">
        <div className="optionrow">
          <span>{optionNames["difficulty"]}</span>
          <span className="radiobuttonrow">
            <RadioButton option={props.options.difficulty}
              update={value => props.setOptions({ ...props.options, difficulty: value })}
              value={Difficulty.Easy} format={formatDifficulty}></RadioButton>
            <RadioButton option={props.options.difficulty}
              update={value => props.setOptions({ ...props.options, difficulty: value })}
              value={Difficulty.Medium} format={formatDifficulty}></RadioButton>
            <RadioButton option={props.options.difficulty}
              update={value => props.setOptions({ ...props.options, difficulty: value })}
              value={Difficulty.Hard} format={formatDifficulty}></RadioButton>
          </span>
        </div>
        <div className="optionrow">
          <span>{optionNames["roundTime"]}</span>
          <span>
            <input type="number" className="monospace" value={(props.options.roundTime / 60) | 0}
              min="0" max="59" style={{ width: "3em" }}
              onChange={(e) => props.setOptions({ ...props.options,
                roundTime: parseInt(e.target.value) * 60 + props.options.roundTime % 60})} />
            :
            <input type="number" className="monospace" value={(props.options.roundTime | 0) % 60}
              min="0" max="59" style={{ width: "3em" }}
              onChange={(e) => props.setOptions({ ...props.options,
                roundTime: props.options.roundTime - (props.options.roundTime % 60) + parseInt(e.target.value) })} />
          </span>
        </div>
        <div className="optionrow">
          <span>{optionNames["rounds"]}</span>
          <span>
            <input type="number" value={props.options.rounds} min="1" max="10" style={{ width: "5em" }}
              onChange={(e) => props.setOptions({ ...props.options, rounds: parseInt(e.target.value) })} />
          </span>
        </div>
        <div className="optionrow">
          <span>{optionNames["minimumWordLength"]}</span>
          <span className="radiobuttonrow">
            <RadioButton option={props.options.minimumWordLength}
              update={value => props.setOptions({ ...props.options, minimumWordLength: value })}
              value={4}>4</RadioButton>
            <RadioButton option={props.options.minimumWordLength}
              update={value => props.setOptions({ ...props.options, minimumWordLength: value })}
              value={5}>5</RadioButton>
            <span>kirjainta</span>
          </span>
        </div>
        <div className="optionrow">
          <span>{optionNames["penalties"]}</span>
          <span className="radiobuttonrow">
            <RadioButton option={props.options.penalties}
              update={value => props.setOptions({ ...props.options, penalties: value })}
              value={true} format={formatBoolean}></RadioButton>
            <RadioButton option={props.options.penalties}
              update={value => props.setOptions({ ...props.options, penalties: value })}
              value={false} format={formatBoolean}></RadioButton>
          </span>
        </div>
        <div className="optionrow">
          <span>{optionNames["diceType"]}</span>
          <span className="radiobuttonrow">
            <RadioButton option={props.options.diceType}
              update={value => props.setOptions({ ...props.options, diceType: value })}
              value={DiceType.Classic} format={formatDiceType}></RadioButton>
            <RadioButton option={props.options.diceType}
              update={value => props.setOptions({ ...props.options, diceType: value })}
              value={DiceType.Modern} format={formatDiceType}></RadioButton>
          </span>
        </div>
      </div>
    </Window>
  )
};

export default OptionsWindow;
