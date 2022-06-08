# Sanaleikki

JavaScript-selainpelitoteutus Milton & Bradleyn _Sanaleikki_-pelistä vuodelta
1990.

Projekti on vielä tekeillä. Yksinpeli toimii ja moninpeli jotenkuten.

# Asennus

`npm install` asentaa kaiken tarpeellisen, jonka jälkeen `npm run run` kääntää
ja käynnistää palvelimen, mutta sitä ennen tarvitset kaksi asiaa:

* `.env`-tiedoston tai ympäristömuuttujan, jossa pitää olla:
  * portti (`PORT`)
  * jokin merkkijono, jonka pitää pysyä salaisena (`JWT_SECRET`) ja
    joka voi olla esimerkiksi satunnaisesti luotu.
* Sanalistan, joka laitetaan public-kansioon nimellä `sanat.txt`.
  Tekijänoikeussyistä tämän mukana ei tule valmista sanalistaa. Sanalistan
  muodon on oltava sellainen, että joka rivillä on vain sana, kuten esimerkiksi

```
eläin
kana
koira
```

Sanojen pitäisi täyttää samat ehdot kuin pelin ohjeessakin:
* ei erisnimiä
* ei lyhenteitä (paitsi _luomu_-tyyppiset jotka voi ääntää sellaisenaan)
* ei erikoismerkkejä
* vain perusmuodossa olevia sanoja
  * nominit: yksikön nominatiivi (_koira_, _sana_...)
  * verbit: ensimmäinen infinitiivimuoto (_olla_, _tehdä_)
  * adverbit kelpaavat, jos niillä ei ole "perusmuotoa"
