import React from "react";

const VirtualKey = (props) => (
  <span className={"key " + (props.className || '')}
      onClick={() => props.onKey({key: props.quay, preventDefault: () => {}})}>
    {props.text || props.quay}
  </span>
)

const VirtualKeyboard = (props) => {
  return (
    <div className="keyboard">
      <div className="keyrow">
        <VirtualKey onKey={props.onKey} quay="Q" />
        <VirtualKey onKey={props.onKey} quay="W" />
        <VirtualKey onKey={props.onKey} quay="E" />
        <VirtualKey onKey={props.onKey} quay="R" />
        <VirtualKey onKey={props.onKey} quay="T" />
        <VirtualKey onKey={props.onKey} quay="Y" />
        <VirtualKey onKey={props.onKey} quay="U" />
        <VirtualKey onKey={props.onKey} quay="I" />
        <VirtualKey onKey={props.onKey} quay="O" />
        <VirtualKey onKey={props.onKey} quay="P" />
        <VirtualKey onKey={props.onKey} quay="Backspace" text="⌫" className="key-bksp" />
      </div>
      <div className="keyrow">
        <VirtualKey onKey={props.onKey} quay="A" />
        <VirtualKey onKey={props.onKey} quay="S" />
        <VirtualKey onKey={props.onKey} quay="D" />
        <VirtualKey onKey={props.onKey} quay="F" />
        <VirtualKey onKey={props.onKey} quay="G" />
        <VirtualKey onKey={props.onKey} quay="H" />
        <VirtualKey onKey={props.onKey} quay="J" />
        <VirtualKey onKey={props.onKey} quay="K" />
        <VirtualKey onKey={props.onKey} quay="L" />
        <VirtualKey onKey={props.onKey} quay="Ö" />
        <VirtualKey onKey={props.onKey} quay="Ä" />
      </div>
      <div className="keyrow">
        <VirtualKey onKey={props.onKey} quay="Z" />
        <VirtualKey onKey={props.onKey} quay="X" />
        <VirtualKey onKey={props.onKey} quay="C" />
        <VirtualKey onKey={props.onKey} quay="V" />
        <VirtualKey onKey={props.onKey} quay="B" />
        <VirtualKey onKey={props.onKey} quay="N" />
        <VirtualKey onKey={props.onKey} quay="M" />
        <VirtualKey onKey={props.onKey} quay="Enter" text="↵" className="key-enter" />
        <VirtualKey onKey={props.onKey} quay="Space" text="␣" />
      </div>
    </div>
  )  
}

export default VirtualKeyboard;
