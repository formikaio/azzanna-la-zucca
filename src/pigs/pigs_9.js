import _ from "underscore";
import pigs from "./pigs_base.js";

var mypigs = _.clone(pigs);

mypigs.privSquadName = 'v9';

mypigs.pigBirthplace = function () {
    var self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) === -1) {
      return -1;
    }

    // IMPROVEMENT: PUT PIGS IN DIFFERENT ROWS & COLS, FOR A BETTER COVERAGE OF THE BOARD
    let level1 = []; // POSTI LIBERI QUALSIASI
    let level2 = []; // EVITO STESSA RIGA E COLONNA
    let levelUsed = [];

    // POPULATE FREE AND BETTER BEST SPOTS
    _.each(_.range(this.tileRows * this.tileRows), function(pos) {
      if (self.fieldArray[pos] === 0) {
        level1.push(pos);
        if (!self.gu.is_pig_looking(pos)) {
          level2.push(pos);
        }
      }
    });

    if (level2.length > 0) {
      levelUsed = level2;
    } else {
      levelUsed = level1;
    }

    // SELEZIONO UNA POSIZIONE CASUALE DAL LIVELLO PIU ALTO A DISPOSIZIONE
    return _.sample(levelUsed);
};


mypigs.pigMoves = function () {
    let f;
    let moveQuality = [0, 0, 0, 0];
    f = this.gu.simulate_move(this.fieldArray, 0);
    moveQuality[0] = 4 * this.gu.how_many_threatened_pumpkins(f) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 0)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 1)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 2)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 3));
    // this.gu.log_field(f);
    //      console.log(this.gu.how_many_threatened_pumpkins(f));
    f = this.gu.simulate_move(this.fieldArray, 1);
    moveQuality[1] = 4 * this.gu.how_many_threatened_pumpkins(f) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 0)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 1)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 2)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 3));

    f = this.gu.simulate_move(this.fieldArray, 2);
    moveQuality[2] = 4 * this.gu.how_many_threatened_pumpkins(f) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 0)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 1)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 2)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 3));

    f = this.gu.simulate_move(this.fieldArray, 3);
    moveQuality[3] = 4 * this.gu.how_many_threatened_pumpkins(f) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 0)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 1)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 2)) +
      this.gu.how_many_threatened_pumpkins(this.gu.simulate_move(f, 3));
    return moveQuality;
};

export default mypigs;
