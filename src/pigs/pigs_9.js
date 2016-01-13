import _ from "underscore";
import pigs from "./pigs_base.js";

var mypigs = _.clone(pigs);

mypigs.privSquadName = 'v9';

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

export default mypigs;
