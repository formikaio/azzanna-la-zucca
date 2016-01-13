/*
INFO
- WEBPACK: https://github.com/petehunt/webpack-howto
- MODULI E DEEP INJECTION: http://davidvujic.blogspot.it/2015/02/is-the-es6-import-feature-an-anti-pattern.html

USO BABEL PER L'IMPORT DEI MODULI E LA SINTASSI ES6
USO WEBPACK PER GENERARE LA BUILD (TODO ANCHE LIBRERIE) E FARLO GIRARE: webpack-dev-server (localhost:8080)

TODO
- pulisci i cicli for, sposta codice mossa pigs nel modulo
- sistema moveMyTile (riduci complessità)

- configurazione esterna in JSON
- update babel, phaser.js & hammer.js
- graphicless mode
*/

import _ from "underscore";

import game_utils           from "./game_utils.js";
import robot_pigs_squad     from "./pigs/pigs_9.js";
import robot_pumpkins_squad from "./pumpkins/pumpkins_6.js";


var init = function () {
  // BOARD CONFIG
  var fieldArray = [];
  var tileRows   = 8;

  // GRAPHIC CONFIG
  var robotSpeed     = 200,   // ms TO WAIT X ms BEFORE MAKING A MOVE (ALSO, ANIMATION SPEED IS robotSpeed/3)
      tileSize       = 48,               // tile width, in pixels
      tileOffsetGrid = 16,
      tileOffsetY    = 280;

  // GRAPHIC OBJECTS AND VARS
  var tileSprites, tilePumpkins,          // the tile sprites group
      rKey,                               // KEYBOARD KEY TO RESTART
      animationQueue,                     // IN ORDER TO MOVE, WAIT FOR ANIMATION QUEUE TO EMPTY
      robotPaused = true,
      timerRobot = 0,
      round = 0,                          // THE GAME STOPS AFTER 20 ROUNDS
      gameEnded,
      score = 0, scoreText,
      scoreBest, scoreTextBest;
  var i, j;                               // LOOP VARS
  var animationSpeed = Math.round(robotSpeed / 3);

  // GAMEUTILS & ROBOT INIT
  game_utils.init({
    fieldArray: fieldArray,
    tileRows: tileRows
  });
  robot_pigs_squad.init(game_utils);
  robot_pumpkins_squad.init(game_utils);

  // STATS
  var pigInitialPositions = [];
  var winningPigInitialPositions = [];
  var winningPigRounds = [];
  var winningPigGames = 0;
  var losingPigGames  = 0;

  // GAME RULES
  var gameTotalRounds = 21;

  // creation of a new phaser game, with a proper width and height according to tile size
  var gameWidth  = 2*tileOffsetGrid + tileSize*tileRows;
  var gameHeight = 2*tileOffsetGrid + tileSize*tileRows + tileOffsetY;
  var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "", {preload:onPreload, create:onCreate, update:onUpdate});

  for (i = 0; i < tileRows*tileRows; i++) { winningPigInitialPositions[i] = 0; }

  var hammertime = new Hammer(document.body, { preventDefault:true, dragLockToAxis:true, swipe:false, transform:false });

  // THE GAME IS PRELOADING
  function onPreload () {
    game.load.image("tile",         "assets/tile.png");
    game.load.image("pig",          "assets/pig.png");
    game.load.image("pumpkin",      "assets/pumpkin.png");
    game.load.image("background",   "assets/background.png");
    game.load.image('resetButton',  'assets/tile_reset.png');
    game.load.image('infoButton',   'assets/tile_info.png');
  }

  // THE GAME HAS BEEN CREATED
  function onCreate () {
    // BACKGROUND
    game.stage.backgroundColor = 0xbbdefb;
    game.add.image(0,0,"background");

    // BUTTONS
    game.add.button(280, 33, 'resetButton', gameReset, this);
    game.add.button(362, 33, 'infoButton',  gameInfo, this);

    // SCORE BUTTON
    game.add.text(292, 114, "Pumpkins",{font:"20px Arial", fill:"blue"});
    scoreText = game.add.text(310, 140, ""+score, {font:"24px Arial", fill:"blue"});
    scoreText.x = 330 - scoreText.width / 2;

    // SCORE BEST LOCAL CACHE
    scoreBest = (window.localStorage.getItem('scoreBest')) ? JSON.parse(window.localStorage.getItem('scoreBest')) : 0;

    // SCORE BEST BUTTON
    game.add.text(302, 197, "Round",{font:"20px Arial",align:"center", fill:"red"});
    scoreTextBest = game.add.text(310, 223, ""+scoreBest, {font:"24px Arial",align:"center", fill:"red"});
    scoreTextBest.x = 330 - scoreTextBest.width / 2;

    //  Unless you specifically need to support multitouch I would recommend setting this to 1
    game.input.maxPointers = 1;
    //  automatically pause if the browser tab the game is in loses focus. You can disable that here:
    game.stage.disableVisibilityChange = true;
    //resize your window to see the stage resize too
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.scale.minWidth  = gameWidth  / 2;
    game.scale.minHeight = gameHeight / 2;
    game.scale.maxWidth  = gameWidth;
    game.scale.maxHeight = gameHeight;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically   = true;
    game.scale.setScreenSize(true);

    gameInitialize();
  }


  function gameInitialize () {
    // STOP THE PLAYER FOR MOVING
    animationQueue = 1;

    gameEnded = false;
    round = 0;
    pigInitialPositions = [];

    for (var i = 0; i < tileRows*tileRows; i++) fieldArray[i] = 0;

    // listeners for arrow keys
    var cursors = game.input.keyboard.createCursorKeys();
    cursors.up   .onDown.add(function () { moveMyTile(0); },this);
    cursors.down .onDown.add(function () { moveMyTile(1); },this);
    cursors.left .onDown.add(function () { moveMyTile(2); },this);
    cursors.right.onDown.add(function () { moveMyTile(3); },this);

    // listener for N key
    rKey = game.input.keyboard.addKey(Phaser.Keyboard.N);
    rKey.onUp.add(gameReset,this);

    // listener for R key (toggle robot)
    rKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
    rKey.onUp.add(changeRobot,this);

    // LISTENERS FOR TOUCH EVENTS
    hammertime.on("dragend", function(ev){
      switch (ev.gesture.direction) {
        case 'up':    moveMyTile(0); break;
        case 'down':  moveMyTile(1); break;
        case 'left':  moveMyTile(2); break;
        case 'right': moveMyTile(3); break;
      }
    });

    // sprite group declaration
    tileSprites  = game.add.group();
    tilePumpkins = game.add.group();

    // CREO GLI OSTACOLI (PER ORA SONO COME TILE PUMPKINS)
    let obstacles = [14, 16, 28, 35, 45, 49];
    obstacles.forEach(function(pos) {
      addObstacle(pos);
    });

    // ADD SOME PIGS AND PUMPKINS
    _.each(_.range(5), function () { addPig();     });
    _.each(_.range(3), function () { addPumpkin(); });

    setScore();

    // TO START THE GAME, LET THE PLAYER MOVE
    animationQueue--;
  }

  function onUpdate () {
    // ROBOT, PLAYS BY ITSELF IF YOU HIT THE "R" KEY
    if (!robotPaused && (game.time.now - timerRobot) > robotSpeed) {
      // RANDOM MOVE
      //var move = Math.round(Math.random()*4);
      // BEST MOVE
      var move = bestMove();
      // BUGFIX: SOMETIMES animationQueue GOES BELOW 0
      if (animationQueue < 0) animationQueue = 0;
      if (animationQueue === 0) moveMyTile(move);
      timerRobot = game.time.now;
    }
  }

  function changeRobot () {
    robotPaused = !robotPaused;
  }

  function gameReset () {
    tileSprites.destroy();
    tilePumpkins.destroy();
    setTimeout(gameInitialize, 400);
  }

  function gameInfo () {
    alert(`This is an asymmetrical game.
Pigs win by lowering the pumpkins number to 2 or less in '+gameTotalRounds+' rounds or less.
Pumpkins win if they survive to the last round!

You play the Pigs, with the arrow keys.
Press "r" on your keyboard to turn on autoplay.`);
  }

  function tweenOpaque (tile) {
    // creation of a new tween for the tile sprite
    animationQueue++;
    game.add.tween(tile)
      .to({alpha:1},animationSpeed)    // the tween will make the sprite opaque
      .start()
      .onComplete.add(function(){
        animationQueue--; // now I can move
      });
  }

  function addObstacle (pos) {
    // OBSTACLE VALUE IS 5
    fieldArray[pos] = 5;

    // creation of a new sprite with "tile" instance, that is "tile.png" we loaded before
    var tile = game.add.sprite(toCol(pos)*tileSize+tileOffsetGrid,toRow(pos)*tileSize+tileOffsetGrid+tileOffsetY,"tile");
    // creation of a custom property "pos" and assigning it the index of the newly added "2"
    tile.pos = pos;
    // at the beginning the tile is completely transparent
    tile.alpha=0;

    // adding tile sprites to the group
    tilePumpkins.add(tile);
    tweenOpaque(tile);
  }


  function addPig() {
    // CHOOSING THE BEST EMPTY TILE IN THE FIELD
    var randomValue = robot_pigs_squad.pigBirthplace();

    if (randomValue == -1) {
      return;
    }

    // PIGS VALUE IS 1
    fieldArray[randomValue] = 1;

    // LOG INITIAL POSITION
    pigInitialPositions.push(randomValue);

    // creation of a new sprite with "tile" instance, that is "tile.png" we loaded before
    var tile = game.add.sprite(toCol(randomValue)*tileSize+tileOffsetGrid,toRow(randomValue)*tileSize+tileOffsetGrid+tileOffsetY,"pig");
    // creation of a custom property "pos" and assigning it the index of the newly added "2"
    tile.pos = randomValue;
    // at the beginning the tile is completely transparent
    tile.alpha=0;

    // adding tile sprites to the group
    tileSprites.add(tile);
    tweenOpaque(tile);
  }


  function addPumpkin() {
    // CHOOSING THE BEST EMPTY TILE IN THE FIELD
    var randomValue = robot_pumpkins_squad.pumpkinBirthplace();

    if (randomValue == -1) {
      return;
    }

    // such empty tile now takes "3" value (ZUCCA)
    fieldArray[randomValue] = 3;

    // creation of a new sprite with "tile" instance, that is "tile.png" we loaded before
    var tile = game.add.sprite(toCol(randomValue)*tileSize+tileOffsetGrid,toRow(randomValue)*tileSize+tileOffsetGrid+tileOffsetY,"pumpkin");
    // creation of a custom property "pos" and assigning it the index of the newly added "2"
    tile.pos = randomValue;
    // at the beginning the tile is completely transparent
    tile.alpha=0;

    // adding tile sprites to the group
    tilePumpkins.add(tile);
    tweenOpaque(tile);
  }


  // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE ROW
  function toRow(n){
    return Math.floor(n/tileRows);
  }

  // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE COLUMN
  function toCol(n){
    return n%tileRows;
  }


  // FIND BEST MOVE (0-3)
  function bestMove () {

    // 0: up, 1: down, 2: left, 3: right
    var move_quality = [0, 0, 0, 0];

    var best_moves = [];
    var best_move_quality = -1;

    // TEST DIREZIONE 0
    tileSprites.sort("y",Phaser.Group.SORT_ASCENDING);
    tileSprites.forEach(function(item) {
      var row = toRow(item.pos);
      var col = toCol(item.pos);

      if (game_utils.is_pumpkin_around(item.pos)) {
        // QUESTO PIG MANGEREBBE IL PUMPKIN VICINO - NESSUN VALORE
      } else {
        if(row>0){
          for(i=row-1;i>=0;i--){
            if(fieldArray[i*tileRows+col] !== 0){
              break;
            }
          }
          if (game_utils.is_pumpkin_around((i+1)*tileRows+col)) {
            move_quality[0] ++;
          }
        }
      }
    });

    // TEST DIREZIONE 1
    tileSprites.sort("y",Phaser.Group.SORT_DESCENDING);
    tileSprites.forEach(function(item) {
      var row = toRow(item.pos);
      var col = toCol(item.pos);

      if (game_utils.is_pumpkin_around(item.pos)) {
        // QUESTO PIG MANGEREBBE IL PUMPKIN VICINO - NESSUN VALORE
      } else {
        if(row<(tileRows-1)){
          for(i=row+1;i<tileRows;i++){
            if(fieldArray[i*tileRows+col] !== 0){
              break;
            }
          }
          if (game_utils.is_pumpkin_around((i-1)*tileRows+col)) {
            move_quality[1] ++;
          }
        }
      }
    });

    // TEST DIREZIONE 2
    tileSprites.sort("x",Phaser.Group.SORT_ASCENDING);
    tileSprites.forEach(function(item) {
      var row = toRow(item.pos);
      var col = toCol(item.pos);

      if (game_utils.is_pumpkin_around(item.pos)) {
        // QUESTO PIG MANGEREBBE IL PUMPKIN VICINO - NESSUN VALORE
      } else {
        if(col>0){
          for(i=col-1;i>=0;i--){
            if(fieldArray[row*tileRows+i] !== 0){
              break;
            }
          }
          if (game_utils.is_pumpkin_around(row*tileRows+i+1)) {
            move_quality[2] ++;
          }
        }
      }
    });

    // TEST DIREZIONE 3
    tileSprites.sort("x",Phaser.Group.SORT_DESCENDING);
    tileSprites.forEach(function(item) {
      var row = toRow(item.pos);
      var col = toCol(item.pos);

      if (game_utils.is_pumpkin_around(item.pos)) {
        // QUESTO PIG MANGEREBBE IL PUMPKIN VICINO - NESSUN VALORE
      } else {
        if(col<(tileRows-1)){
          for(i=col+1;i<tileRows;i++){
            if(fieldArray[row*tileRows+i] !== 0){
              break;
            }
          }
          if (game_utils.is_pumpkin_around(row*tileRows+i-1)) {
            move_quality[3] ++;
          }
        }
      }
    });

    // SE SONO PIG v5 APPIATTISCO I PESI (QUELLI >1 DIVENTANO 1)
    // (PROVO A DARE MENO VALORE AGLI SPOSTAMENTI)
    /*
    if (robot_pigs_squad == 'v5') {
      _.each(move_quality, function(val, key) {
        if (val > 1) {
          move_quality[key] = 1;
        }
      });
    }
    */

    // GUARDO MEGLIO 1 PASSO AVANTI
    if (robot_pigs_squad.squadName() == 'v6' || robot_pigs_squad.squadName() == 'v7') {
      let f;
      f = game_utils.simulate_move(fieldArray, 0);
      move_quality[0] = game_utils.how_many_threatened_pumpkins(f);
      //game_utils.log_field(f);
//      console.log(game_utils.how_many_threatened_pumpkins(f));
      f = game_utils.simulate_move(fieldArray, 1);
      move_quality[1] = game_utils.how_many_threatened_pumpkins(f);

      f = game_utils.simulate_move(fieldArray, 2);
      move_quality[2] = game_utils.how_many_threatened_pumpkins(f);

      f = game_utils.simulate_move(fieldArray, 3);
      move_quality[3] = game_utils.how_many_threatened_pumpkins(f);
    }

//console.log("p", move_quality);
    // GUARDO MEGLIO 2 PASSI AVANTI (ESCLUSA MOSSA DELLE ZUCCHE)
    if (robot_pigs_squad.squadName() == 'v8' || robot_pigs_squad.squadName() == 'v9') {
      let f;
      f = game_utils.simulate_move(fieldArray, 0);
      move_quality[0] = 4*game_utils.how_many_threatened_pumpkins(f) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 0)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 1)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 2)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 3));
      //game_utils.log_field(f);
//      console.log(game_utils.how_many_threatened_pumpkins(f));
      f = game_utils.simulate_move(fieldArray, 1);
      move_quality[1] = 4*game_utils.how_many_threatened_pumpkins(f) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 0)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 1)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 2)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 3));

      f = game_utils.simulate_move(fieldArray, 2);
      move_quality[2] = 4*game_utils.how_many_threatened_pumpkins(f) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 0)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 1)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 2)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 3));

      f = game_utils.simulate_move(fieldArray, 3);
      move_quality[3] = 4*game_utils.how_many_threatened_pumpkins(f) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 0)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 1)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 2)) +
        game_utils.how_many_threatened_pumpkins(game_utils.simulate_move(f, 3));
    }
//console.log("d", move_quality);
    // SELEZIONI LE MOSSE MIGLIORI
    _.each(move_quality, function(val, key) {
      if (val > best_move_quality) {
        best_moves = [key];
        best_move_quality = val;
      } else if (val == best_move_quality) {
        best_moves.push(key);
      }
    });

    // SCELGO A CASO TRA LE MOSSE MIGLIORI
    return (best_moves.length > 0) ? _.sample(best_moves) : _.sample([0,1,2,3]);
  }


  function moveMyTile (where) {
    // CHECK IF IT'S CALLED TOO EARLY
    if (animationQueue>0){ /*checkDeath();*/ return; }

    animationQueue++;

    // 0: up, 1: down, 2: left, 3: right

    // sort a group ordering it by a property
    switch (where) {
      case 0: tileSprites.sort("y",Phaser.Group.SORT_ASCENDING);  break;
      case 1: tileSprites.sort("y",Phaser.Group.SORT_DESCENDING); break;
      case 2: tileSprites.sort("x",Phaser.Group.SORT_ASCENDING);  break;
      case 3: tileSprites.sort("x",Phaser.Group.SORT_DESCENDING); break;
    }

    tileSprites.forEach(function(item) {
      // getting row and column starting from a one-dimensional array
      var row = toRow(item.pos);
      var col = toCol(item.pos);

      // SE SONO NELLE VICINANZE DI UN PUMPKIN MANGIO, ALTRIMENTI MI MUOVO
      var edible_pumpkin_pos = -1;
      for(i=row-1; i <= (row+1); i++){
        for(j=col-1; j<= (col+1); j++){
          if (i >= 0 && i < tileRows
          &&  j >= 0 && j < tileRows
          && fieldArray[(i*tileRows + j)] == 3
          && edible_pumpkin_pos == -1) {
            edible_pumpkin_pos = (i*tileRows + j);
            //console.log("pumpkin vicino alla posizione", row, col);
          }
        }
      }

      if (edible_pumpkin_pos != -1) {
        // MANGIA PUMPKIN VICINO
        tilePumpkins.forEach(function(pumpkinItem) {
          if (typeof pumpkinItem != "undefined" && pumpkinItem.pos == edible_pumpkin_pos) {
            fieldArray[edible_pumpkin_pos] = 0;
            pumpkinItem.destroy();
          }
        });

      } else {
        if (where===0) {
          if(row>0){
            for(i=row-1;i>=0;i--){
              if(fieldArray[i*tileRows+col]!== 0){
                break;
              }
            }
            if(row!=i+1){
               moveTile(item,row*tileRows+col,(i+1)*tileRows+col);
            }
          }
        } else if (where==1) {
          if(row<(tileRows-1)){
            for(i=row+1;i<tileRows;i++){
              if(fieldArray[i*tileRows+col]!== 0){
                break;
              }
            }
            if(row!=i-1){
              moveTile(item,row*tileRows+col,(i-1)*tileRows+col);
            }
          }
        } else if (where==2) {
          // checking if we aren't already on the leftmost column (the tile can't move)
          if(col>0){
            // looping from column position back to the leftmost column
            for(i=col-1;i>=0;i--){
              // if we find a tile which is not empty, our search is about to end...
              if(fieldArray[row*tileRows+i]!== 0){
                break;
              }
            }
            // if we can actually move...
            if(col!=i+1){
               // moving the tile "item" from row*4+col to row*4+i+1
               moveTile(item,row*tileRows+col,row*tileRows+i+1);
            }
          }
        } else if (where==3) {
          if(col<(tileRows-1)){
            for(i=col+1;i<tileRows;i++){
              if(fieldArray[row*tileRows+i]!== 0){
                break;
              }
            }
            if(col!=i-1){
              moveTile(item,row*tileRows+col,row*tileRows+i-1);
            }
          }
        }
      }
    });

    // AD OGNI MOVIMENTO AGGIUNGO 1 PUMPKINS
    addPumpkin();

    round++;
    animationQueue--;	// LET THE PLAYER MOVE
    checkDeath();
  }


  function checkDeath () {
    if (gameEnded) {
      return;
    }

    var isEnded = false;
    var pigWon = false;

    if (round >= gameTotalRounds) {
      // PUMPKINS WON
      isEnded = true;
    } else if (score <=2) {
      // PIG WON
      isEnded = true;
      pigWon = true;
    }


    if (isEnded) {
      gameEnded = true;
      var frase = "The game is over: " + (pigWon ? "PIGS" : "PUMPKINS") + " won" +
        (pigWon ? " on round " + round : "")  + "!!";
      console.log(frase);
      if (robotPaused) alert(frase);

      if (pigWon) {
        winningPigGames++;
      } else {
        losingPigGames++;
      }

      // IF PIGS WON, STORE INITIAL POSITIONS FOR SOME STATS
      if (pigWon) {
        console.log(robot_pigs_squad.squadName() + " pigs against " + robot_pumpkins_squad.squadName() + " won " + winningPigGames + " times and lost " + losingPigGames + " times");

        winningPigRounds.push(round);

        // AVERAGE, UNDERSCORE IMPLEMENTATION
        var avgwinningPigRounds = _.reduce(winningPigRounds, function(memo, num) {
      		return memo + num;
      	}, 0) / winningPigRounds.length;
        console.log("On average Pigs win in " + Math.round(avgwinningPigRounds) + " rounds");

        //console.log("Pigs initial positions: " + pigInitialPositions);
        _.each(pigInitialPositions, function(item) {
          winningPigInitialPositions[item] += 1;
        });

        // PLOT BEST POSITIONS, USING SCALE 0-9
        //var maxPositionValue = Math.max.apply(null, winningPigInitialPositions);
        var u = '';
        for (i=0;i<tileRows;i++) {
          for (j=0;j<tileRows;j++) {
            //var val = Math.round(winningPigInitialPositions[i*tileRows+j] * 9 / maxPositionValue);
            //u += (val==0) ? "-" : winningPigInitialPositions[i*tileRows+j];
            u += winningPigInitialPositions[i*tileRows+j];
            u += " ";
          }
          if (i<(tileRows-1)) u += "\n";
        }
        console.log("Pigs historical best starting positions: \n" + u);

      }
      gameReset();
    }
  }


  // FUNCTION TO MOVE A TILE
  function moveTile (tile,from,to) {
    animationQueue++;

    // first, we update the array with new values
    fieldArray[to]=fieldArray[from];
    fieldArray[from]=0;

    tile.pos=to;
    // then we create a tween
    game.add.tween(tile)
      .to({x:tileSize*toCol(to)+tileOffsetGrid, y:tileSize*toRow(to)+tileOffsetGrid+tileOffsetY}, animationSpeed)
      .start()
      .onComplete.add(function(){
        setScore();
        animationQueue--;
      });
  }

  function setScore () {
    // SOTTRAGGO 6 OSTACOLI (INSERITI TRA I PUMPKINS TEMPORANEAMENTE)
     score = tilePumpkins.length - 6;

     scoreText.text = Math.max(score, 0);
     scoreText.x = 330 - scoreText.width / 2;

     // MOSTRO IL ROUND NELLO SPAZIO "BEST"
     scoreTextBest.text = round;
     scoreTextBest.x = 330 - scoreTextBest.width / 2;

     /*
     if (score > scoreBest) {
       scoreBest = score;
       scoreTextBest.text = scoreBest;
       scoreTextBest.x = 330 - scoreTextBest.width / 2;
       window.localStorage.setItem('scoreBest', JSON.stringify(scoreBest));
     }
     */
  }
};

window.onload = init;
