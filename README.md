# Azzanna la zucca

Simulatore grafico per il gioco da scacchiera **Azzanna la zucca**.

## Regole del gioco
*Azzanna la zucca* è un gioco asimmetrico.

I maiali vincono quando riescono a ridurre il numero delle Zucche in gioco a 2 o meno. Le Zucche vincono se sopravvivono per almeno 20 turni.

Nel simulatore muovi i Maiali, con le frecce su tastiera o tramite swipe da tablet o smartphone.

Premi **r** sulla tastiera per attivare l'autoplay.

Le regole  complete del gioco sono qui:
<http://www.formikaio.it/blog/azzanna-la-zucca/>

## Demo online del simulatore
<http://www.whiletrue.it/azzanna-la-zucca/>


## Librerie utilizzate

- **Phaser**, motore grafico
- **Babel**, supporto sintassi ES2015
- **Webpack**, generatore la build e dev server: webpack-dev-server (localhost:8080)

## TODO
- pulisci i cicli for, sposta codice mossa pigs nel modulo
- sistema moveMyTile (riduci complessità)

- update babel, phaser.js & hammer.js
- recupera librerie con npm

### Tutorial
- Webpack: <https://github.com/petehunt/webpack-howto>
- Moduli ES2015 e deep injection: <http://davidvujic.blogspot.it/2015/02/is-the-es6-import-feature-an-anti-pattern.html>
