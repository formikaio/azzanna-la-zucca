import _ from 'underscore';

var pumpkins = {
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

  pumpkinBirthplace() {
    var self = this;

    console.log('PLEASE OVERRIDE THIS FUNCTION IN YOUR SQUAD');

    // CONTROLLO SPAZIO FINITO
    if (_.indexOf(this.fieldArray, 0) == -1) {
      return -1;
    }

    var level1 = []; // FREE SPOTS

    // POPULATE GOOD AND BEST SPOTS
    _.each(_.range(this.tileRows*this.tileRows), function(pos) {
      if (self.fieldArray[pos]===0) {
        level1.push(pos);
      }
    });

    // SELEZIONO UNA POSIZIONE CASUALE
    return _.sample(level1);
  }
};

export default pumpkins;
