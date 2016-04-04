import _ from 'underscore';
import pigs from './pigs_base.js';

var mypigs = _.clone(pigs);

mypigs.privSquadName = 'v11';

mypigs.pigBirthplace = function () {
    var self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) === -1) {
      return -1;
    }

    let positions = [8, 27, 33, 36, 46, 48];

    let choice = -1;

    // POPULATE FREE AND BETTER BEST SPOTS
    _.each(positions, (pos) => {
      if (self.fieldArray[pos] === 0) {
        choice = pos;
      }
    });

    return choice;
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
