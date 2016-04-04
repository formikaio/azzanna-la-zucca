import _ from "underscore";

var pigs = {
  privSquadName: '--',
  gu: {},
  fieldArray: [],
  tileRows: 0,

  init(gameUtils) {
    this.gu = gameUtils;
    this.fieldArray = gameUtils.getFieldArray();
    this.tileRows = gameUtils.getTileRows();
  },

  squadName() {
    return this.privSquadName;
  },

  pigBirthplace() {
    console.log('PLEASE OVERRIDE THIS FUNCTION IN YOUR SQUAD');

    let self = this;

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) === -1) {
      return -1;
    }

    let level1 = []; // POSTI LIBERI QUALSIASI

    // POPULATE FREE SPOTS
    _.each(_.range(this.tileRows * this.tileRows), function(pos) {
      if (self.fieldArray[pos] === 0) {
        level1.push(pos);
      }
    });

    // SELEZIONO UNA POSIZIONE CASUALE TRA QUELLE LIBERE
    return _.sample(level1);
  },

  pigMoves() {
      console.log('PLEASE OVERRIDE THIS FUNCTION IN YOUR SQUAD');
      return [0, 0, 0, 0];
  },
};


export default pigs;
