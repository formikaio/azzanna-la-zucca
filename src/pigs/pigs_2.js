import _ from "underscore";
import pigs from "./pigs_base.js";

var mypigs = _.clone(pigs);

mypigs.privSquadName = 'v2';

mypigs.pigBirthplace = function () {
    var self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) == -1) {
      return;
    }

    // IMPROVEMENT: PUT PIGS IN DIFFERENT ROWS & COLS, FOR A BETTER COVERAGE OF THE BOARD
    var level1 = []; // POSTI LIBERI QUALSIASI
    var level2 = []; // EVITO STESSA RIGA E COLONNA
    var level_used = [];

    // POPULATE FREE AND BETTER BEST SPOTS
    _.each(_.range(this.tileRows*this.tileRows), function(pos) {
      if (self.fieldArray[pos]===0) {
        level1.push(pos);
        if (!self.gu.is_pig_looking(pos)) {
          level2.push(pos);
        }
      }
    });

    if (level2.length > 0) {
      level_used = level2;
    } else {
      level_used = level1;
    }

    // SELEZIONO UNA POSIZIONE CASUALE DAL LIVELLO PIU ALTO A DISPOSIZIONE
    return _.sample(level_used);
};

mypigs.pigMoves = function () {
    let moveQuality = [0, 0, 0, 0];

/*
var game_utils = this.game_utils;
var tileSprites = {}; // TODO FIX IT PLEASE

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
*/
    return moveQuality;
};

export default mypigs;
