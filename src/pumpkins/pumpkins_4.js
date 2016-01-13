import _ from "underscore";
import pumpkins from "./pumpkins_base.js";

var myPumpkins = _.clone(pumpkins);

myPumpkins.privSquadName = 'v4';

myPumpkins.pumpkinBirthplace = function () {
    var self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) == -1) {
      return -1;
    }

    var level1 = []; // FREE SPOTS
    var level2 = []; // + NO PIG AROUND
    var level3 = []; // + NO PIG LOOKING
    var level4 = []; // + NO PUMPKIN AROUND
    var level_used = [];

    // GUARDO MEGLIO 1 PASSO AVANTI
    let min_threatened_pumpkins = 99999;
    let min_threat_pos = [];
    _.each(_.range(this.tileRows*this.tileRows), function(pos) {
      let f = _.clone(self.fieldArray);
      f[pos] = 3;
      let threatened_pumpkins =
        self.gu.how_many_threatened_pumpkins(self.gu.simulate_move(f, 0)) +
        self.gu.how_many_threatened_pumpkins(self.gu.simulate_move(f, 1)) +
        self.gu.how_many_threatened_pumpkins(self.gu.simulate_move(f, 2)) +
        self.gu.how_many_threatened_pumpkins(self.gu.simulate_move(f, 3));
      if (threatened_pumpkins < min_threatened_pumpkins) {
        min_threatened_pumpkins = threatened_pumpkins;
        min_threat_pos = [pos];
      } else if (threatened_pumpkins == min_threatened_pumpkins) {
        min_threat_pos.push(pos);
      }
    });

    // POPULATE GOOD AND BEST SPOTS
    _.each(_.range(this.tileRows*this.tileRows), function(pos) {
      if (self.fieldArray[pos]===0) {
        level1.push(pos);
        if (!self.gu.is_pig_around(pos)) {
          level2.push(pos);
          if (!self.gu.is_pig_looking(pos)) {
            level3.push(pos);
            if (_.contains(min_threat_pos, pos)) {
              level4.push(pos);
            }
          }
        }
      }
    });

    if (level4.length > 0) {
      level_used = level4;
    } else if (level3.length > 0) {
      level_used = level3;
    } else if (level2.length > 0) {
      level_used = level2;
    } else {
      level_used = level1;
    }

    // SELEZIONO UNA POSIZIONE CASUALE DAL LIVELLO PIU ALTO A DISPOSIZIONE
    return _.sample(level_used);
};

export default myPumpkins;
