import React, { useState, useEffect } from "react";
import { MAXIMUM_WORDS } from "../../common/game";
import { isValidLetter } from "../../common/letter";
import VirtualKeyboard from "./keyboard";
import isMobileFn from "../util/mobile";

const isMobile = isMobileFn()

const WordEntry = (props) => {
  const [selected, setSelected] = useState([0, 0]);
  const [words, setWords] = useState([]);
  const [wordOk, setWordOk] = useState([...Array(MAXIMUM_WORDS).keys()].map(v => false));

  let rows = [];

  const isSelected = (i, j) => selected[0] == i && selected[1] == j;

  const isEndOfLine = i => selected[0] == i && selected[1] == props.letterCount;

  const forceTopLeft = (i, j) => {
    i = Math.min(i, words.length);
    j = Math.min(j, (words[i] || "").length);
    return [i, j];
  };

  const onClickTile = (i, j) => {
    [i, j] = forceTopLeft(i, j);
    setSelected([i, j]);
  }

  useEffect(() => {
    const [i, j] = selected;
    if (i < props.letterCount && j < MAXIMUM_WORDS)
      document.getElementById(`wordEntry_button_${i}_${j}`).scrollIntoView({inline: "nearest", block: "nearest"})
  }, selected);

  useEffect(() => {
    props.updateWords(wordOk.every(ok => ok), 
      wordOk.map((ok, index) => ok ? index : -1).
        filter(index => index >= 0).
        map(index => words[index] || '').filter(word => word));
  }, wordOk);

  const keyPress = (e) => {
    const letter = e.key.toUpperCase();
    const [i, j] = selected;
    const currentWord = words[i] || "";
    if (isValidLetter(letter) && j < props.letterCount) {
      let newWord = words[i] || "";
      if (wordOk[i])
        setWordOk([...wordOk.slice(0, i), false, ...wordOk.slice(i + 1)]);
      if (j === newWord.length)
        newWord = newWord + letter;
      else
        newWord = newWord.slice(0, j) + letter + newWord.slice(j + 1);
      setWords([...words.slice(0, i), newWord, ...words.slice(i + 1)]);
      setSelected([i, j + 1]);
    } else if (e.key === "Enter") {
      if (i < MAXIMUM_WORDS - 1 && currentWord) {
        if (i + 1 === words.length)
          setWords([...words, ...""]);
        setSelected([i + 1, 0]);
      } else if (i === MAXIMUM_WORDS - 1 && wordOk.slice(0, -1).every(x => x)) {
        props.focusSubmit();
      }
      setWordOk([...wordOk.slice(0, i), !!currentWord, ...wordOk.slice(i + 1)]);
    } else if (e.key === " ") {
      setWordOk([...wordOk.slice(0, i), !!currentWord, ...wordOk.slice(i + 1)]);
    } else if (e.key === "Backspace") {
      let newWord = words[i] || "";
      if (wordOk[i])
        setWordOk([...wordOk.slice(0, i), false, ...wordOk.slice(i + 1)]);
      newWord = newWord.slice(0, j - 1) + newWord.slice(j);
      setWords([...words.slice(0, i), newWord, ...words.slice(i + 1)]);
      if (j > 0)
        setSelected([i, j - 1]);
      else if (i > 0) {
        setSelected([i - 1, words[i - 1].length]);
      }
    } else if (e.key === "ArrowUp") {
      setSelected(forceTopLeft(Math.max(i - 1, 0), j));
      setWordOk([...wordOk.slice(0, i), !!currentWord, ...wordOk.slice(i + 1)]);
    } else if (e.key === "ArrowDown") {
      setSelected(forceTopLeft(Math.min(i + 1, MAXIMUM_WORDS - 1), j));
      setWordOk([...wordOk.slice(0, i), !!currentWord, ...wordOk.slice(i + 1)]);
    } else if (e.key === "Home") {
      setSelected([i, 0]);
    } else if (e.key === "End") {
      setSelected([i, currentWord.length]);
    } else if (e.key === "ArrowLeft") {
      if (j > 0)
        setSelected([i, j - 1]);
      else if (i > 0) {
        setSelected([i - 1, words[i - 1].length]);
      }
    } else if (e.key === "ArrowRight") {
      if (j < currentWord.length) {
        setSelected([i, j + 1]);
      } else if (i < words.length || (i === words.length && words[i])) {
        setSelected([i + 1, 0]);
      }
    } else {
      return;
    }
    e.preventDefault();
  }

  const makeRow = (i) => {
    let row = [];
    row.push(
      <div className={wordOk[i] ? "banner wordOk" : "banner"} key="rowStartOfLine"> </div>
    )
    for (let j = 0; j < props.letterCount; ++j)
      row.push(
        <div className={isSelected(i, j) ? "tile current" : "tile"} key={`wordEntry_col${j}`} id={`wordEntry_button_${i}_${j}`} onClick={() => onClickTile(i, j)}>
          {(words[i] || "")[j] || ""}
        </div>
      )
    row.push(
      <div className={isEndOfLine(i) ? "banner endOfLine" : "banner"} key="rowEndOfLine"> </div>
    )
    return (
      <div className="center" key={`wordEntry_row${i}`}>
        {row}
      </div>
    )
  }

  useEffect(() => {
    onClickTile(0, 0)
    document.getElementById("wordEntry").focus()
  }, []);

  for (let i = 0; i < MAXIMUM_WORDS; ++i)
    rows.push(makeRow(i));
  return (
    <>
      <div className="wordEntry" id="wordEntry" onKeyDown={keyPress} tabIndex={-1}>
        {rows}
      </div>
      {isMobile && <VirtualKeyboard onKey={keyPress} />}
    </>
  )
};

export default WordEntry;
