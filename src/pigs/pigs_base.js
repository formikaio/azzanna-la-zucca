import _ from "underscore";

var pigs = {
  privSquadName: '--',
  gu: {},
  fieldArray: [],
  tileRows: 0,

  init (game_utils) {
    this.gu = game_utils;
    this.fieldArray = game_utils.getFieldArray();
    this.tileRows   = game_utils.getTileRows();
  },

  squadName () {
    return this.privSquadName;
  },

  pigBirthplace () {
    console.log("PLEASE OVERRIDE THIS FUNCTION IN YOUR SQUAD");

    var self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) == -1) {
      return;
    }

    var level1 = []; // POSTI LIBERI QUALSIASI

    // POPULATE FREE SPOTS
    _.each(_.range(this.tileRows*this.tileRows), function(pos) {
      if (self.fieldArray[pos]===0) {
        level1.push(pos);
      }
    });

    // SELEZIONO UNA POSIZIONE CASUALE TRA QUELLE LIBERE
    return _.sample(level1);
  }
};

export default pigs;
