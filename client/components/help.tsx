import React from "react";
import Window from './window';

const HelpWindow = (props) => {

  return (
    <Window close={props.close} className="help">
      <h1>Ohje</h1>
      <p>Sanaleikkikierroksen aikana sinulle näytetään lista kirjaimia (esimerkki):</p>
      <div className="center letters">
        <div className="tile" id="d1">A</div>
        <div className="tile" id="d2">A</div>
        <div className="tile" id="d3">I</div>
        <div className="tile" id="d4">I</div>
        <div className="tile" id="d5">U</div>
        <div className="tile" id="d6">K</div>
        <div className="tile" id="d7">M</div>
        <div className="tile" id="d8">T</div>
        <div className="tile" id="d9">P</div>
      </div>
      <p>
        Tehtävänäsi on muodostaa näistä kirjaimista sanoja. Sanoissa tulee
        olla tietty määrä kirjaimia (vähintään 4 tai 5). Joka sanassa voi
        käyttää kutakin kirjainta vain kerran; jos esimerkiksi listassa on
        kaksi A:ta, sanassa saa olla korkeintaan vain kaksi A:ta.
      </p>
      <p>
        Sanojen tulee olla suomen kielen yleiskielisiä sanoja, jotka ovat
        perusmuodossa (yksikön nominatiivi nomineille ja ensimmäinen
        infinitiivi eli «sanakirjamuoto» verbeille). Erisnimiä tai lyhenteitä
        (paitsi <i>luomu</i>-tyyppisiä lyhenteitä jotka voi ääntää
        sellaisenaan) ei hyväksytä. Yhdyssanat hyväksytään vain jos ne
        löytyvät sanakirjasta.
      </p>
      <p>
        Kun olet syöttänyt sanan, paina askelpalautinta (Enter) tai välilyöntiä.
        Sana ei kuulu sanoihisi ennen kuin sen vasemmalla puolella näkyy
        vihreä valo. Kun olet saanut keksittyä kymmenen sanaa, paina STOP!-
        nappia lopettaaksesi miettimisajan.
      </p>
      <h2>Pisteet</h2>
      <p>
        Jokaisesta oikeasta sanasta saa pisteitä niin, että nelikirjaimisesta
        sanasta saa yhden pisteen, viisikirjaimista kaksi pistettä, ja niin
        edelleen. Jos jollakulla muulla pelaajalla on sama sana, kukaan ei
        saa siitä pisteitä. Sanoista, joita ei voi muodostaa kirjaimista
        tai jotka eivät ole sanakirjassa saa asetuksista riippuen miinuspisteen.
      </p>
    </Window>
  )
};

export default HelpWindow;
