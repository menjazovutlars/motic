/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
export default class GetNotesFromDatabase {
  constructor(object) {
    this.handPosX;
    this.handPosY;
    this.handVolume;
    this.givenNote;
    this.database;
    this.object = object;
  }

  databaseQuery() {
    console.log('databaseQuery here');
    // query to our note database
    // returns name of the note fitting to our x and y Position
  }
}
