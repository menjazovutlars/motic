export default class GetHands {
  constructor(handVolume) {
    this.isHandDetected = false;
    this.handPositions = [];
    this.handVolume = handVolume;
  }

  handDetection() {
    this.isHandDetected = true;
    // we check if we can detect a hand
    // maybe even check how many hands
    // if we can, than isHandDetected will be set to true
    return this.isHandDetected;
  }

  getHandPositions(xPos, yPos) {
    // will be called when isHandDetected = true
    // get the data from the camera to get the x and y position of each hand
    // positions are saved to handPositions as array in an array; example: [[x: 50, y: 200], ....]
    this.handPositions.push([xPos, yPos]);
    return this.handPositions;
  }
}
