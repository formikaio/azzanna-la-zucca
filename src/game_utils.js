import _ from "underscore";

let fieldArray;
let tileRows;
let i,j;

var game_utils = {
  init (obj) {
    fieldArray = obj.fieldArray;
    tileRows   = obj.tileRows;
  },

  getFieldArray() {
    return fieldArray;
  },

  getTileRows () {
    return tileRows;
  },


  // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE ROW
  toRow(n){
    return Math.floor(n/tileRows);
  },

  // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE COLUMN
  toCol (n){
    return n%tileRows;
  },

  // POSITIVO SE ESISTE ALMENO UN PIG IN VISTA SULLA STESSA RIGA O COLONNA
  is_pig_looking (pos) {
    var row = this.toRow(pos);
    var col = this.toCol(pos);

    // TODO CONTROLLA SE NON E' IMPEGNATO A MANGIARE UN ALTRO

    // LOOK UP
    if (row > 0) {
      for (i=row-1; i >= 0; i--) {
        if (fieldArray[(i*tileRows + col)] == 3 || fieldArray[(i*tileRows + col)] == 5) {
          break;
        } else if (fieldArray[(i*tileRows + col)] == 1) {
          return true;
        }
      }
    }

    // LOOK DOWN
    if (row < tileRows) {
      for (i=row+1; i < tileRows; i++) {
        if (fieldArray[(i*tileRows + col)] == 3 || fieldArray[(i*tileRows + col)] == 5) {
          break;
        } else if (fieldArray[(i*tileRows + col)] == 1) {
          return true;
        }
      }
    }

    // LOOK LEFT
    if (col > 0) {
      for (j=col-1; j >= 0; j--) {
        if (fieldArray[(row*tileRows + j)] == 3 || fieldArray[(row*tileRows + j)] == 5) {
          break;
        } else if (fieldArray[(row*tileRows + j)] == 1) {
          return true;
        }
      }
    }

    // LOOK RIGHT
    if (col < tileRows) {
      for (j=col+1; j < tileRows; j++) {
        if (fieldArray[(row*tileRows + j)] == 3 || fieldArray[(row*tileRows + j)] == 5) {
          break;
        } else if (fieldArray[(row*tileRows + j)] == 1) {
          return true;
        }
      }
    }

    // NO PIG IS LOOKING
    return false;
  },

  // POSITIVO SE ESISTE ALMENO UN DATO OGGETTO ATTORNO ALLA POSIZIONE DATA
  is_something_around (pos, object_number, f2 = undefined) {
    var row = this.toRow(pos);
    var col = this.toCol(pos);

    if (f2 === undefined) f2 = fieldArray;

    for(var i=row-1; i <= (row+1); i++){
      for(var j=col-1; j<= (col+1); j++){
        if (i >= 0 && i < tileRows
        &&  j >= 0 && j < tileRows
        && f2[(i*tileRows + j)] == object_number) {
          return true;
        }
      }
    }
    return false;
  },

  is_pig_around (pos, f2 = undefined) {
    return this.is_something_around (pos, 1, f2);
  },

  is_pumpkin_around (pos, f2 = undefined) {
    return this.is_something_around (pos, 3, f2);
  },

  pos_pumpkin_around (pos) {
    var row = this.toRow(pos);
    var col = this.toCol(pos);

    for(var i=row-1; i <= (row+1); i++){
      for(var j=col-1; j<= (col+1); j++){
        if (i >= 0 && i < tileRows
        &&  j >= 0 && j < tileRows
        && fieldArray[(i*tileRows + j)] == 3) {
          return (i*tileRows + j);
        }
      }
    }
    return false;
  },

  how_many_threatened_pumpkins (fieldArray) {
    var count = 0;

    for(var pos=0; pos < tileRows*tileRows; pos++){
      // TODO DEVE ESSERE UN PIG CHE NON MANGIA!
      if (fieldArray[pos] == 3 && this.is_pig_around(pos, fieldArray)) {
        count++;
      }
    }
    return count;
  },

  log_field (fieldArray) {
    var u = '';
    for (let i=0;i<tileRows;i++) {
      for (let j=0;j<tileRows;j++) {
        u += (fieldArray[i*tileRows+j]===0) ? "-" : fieldArray[i*tileRows+j];
      }
      if (i<(tileRows-1)) u += "\n";
    }
    console.log(u+"\n\n");
  },

  // 0: up, 1: down, 2: left, 3: right
  simulate_move (fieldArray, direction) {
    var f = _.clone(fieldArray);
    var n = this.getTileRows();

    if (direction === 0) { // UP
      for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
          let pos = i * n + j;
          if (f[pos]!==1) { continue; }
          let ppa = this.pos_pumpkin_around(pos);
          if (this.pos_pumpkin_around(pos) !== false) {
            // IL MAIALE MANGIA
            f[ppa] = 0;
          } else {
            // IL MAIALE SI MUOVE
            let k = i;
            do {
              if (f[((k-1) * n + j)] !== 0 || k === 0) break;
              k--;
            } while (true);
            f[pos] = 0;
            f[(k * n + j)] = 1;
          }
        }
      }
    } else if (direction == 1) { // DOWN
      for(let i = (n-1); i >= 0; i--){
        for(let j = (0); j < n; j++){
          let pos = i * n + j;
          if (f[pos]!==1) { continue; }
          let ppa = this.pos_pumpkin_around(pos);
          if (this.pos_pumpkin_around(pos) !== false) {
            // IL MAIALE MANGIA
            f[ppa] = 0;
          } else {
            // IL MAIALE SI MUOVE
            let k = i;
            do {
              if (f[((k+1) * n + j)] !== 0 || (k + 1) === n) break;
              k++;
            } while (true);
            f[pos] = 0;
            f[(k * n + j)] = 1;
          }
        }
      }
    } else if (direction == 2) { // LEFT
      for(let j = 0; j < n; j++){
        for(let i = 0; i < n; i++){
          let pos = i * n + j;
          if (f[pos]!==1) { continue; }
          let ppa = this.pos_pumpkin_around(pos);
          if (this.pos_pumpkin_around(pos) !== false) {
            // IL MAIALE MANGIA
            f[ppa] = 0;
          } else {
            // IL MAIALE SI MUOVE
            let k = j;
            do {
              if (f[(i * n + (k-1))] !== 0 || (k === 0)) break;
              k--;
            } while (true);
            f[pos] = 0;
            f[(i * n + k)] = 1;
          }
        }
      }
    } else if (direction == 3) { // RIGHT
      for(let j = (n-1); j >= 0; j--){
        for(let i = 0; i < n; i++){
          let pos = i * n + j;
          if (f[pos]!==1) { continue; }
          let ppa = this.pos_pumpkin_around(pos);
          if (this.pos_pumpkin_around(pos) !== false) {
            // IL MAIALE MANGIA
            f[ppa] = 0;
          } else {
            // IL MAIALE SI MUOVE
            let k = j;
            do {
              if (f[(i * n + (k+1))] !== 0 || (k + 1) === n) break;
              k++;
            } while (true);
            f[pos] = 0;
            f[(i * n + k)] = 1;
          }
        }
      }
    }
    return f;
  }
};

export default game_utils;
