import React from "react";

const TitleBar = (props) => (
  <header>
    <nav title="Ohje" onClick={props.openHelp}>?</nav>
    <h1>Sanaleikki</h1>
    <nav title={!props.state.settingsAvailable ? 'Pisteet' : 'Asetukset'} onClick={props.openSettings}>
      {!props.state.settingsAvailable ? '≡' : '⚙'}
    </nav>
  </header>
);

export default TitleBar;
