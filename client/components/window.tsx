import React from "react";

const Window = (props) => {
  return (
    <div className={"window " + (props.className || "")}>
      <nav className="button float-right" title="Sulje" onClick={props.close}>×</nav>
      {props.children}
    </div>
  )
};

export default Window;
