export default class Note {
  constructor(x, y, name, audio) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.sound = new Audio(audio);
    this.upperBoundary = 0.0415;
    this.lowerBoundary = 0.0415;
    this.leftBoundary = 0.245;
    this.rightBoundary = 0.245;
  }

  info() {
    console.log(this.x);
    console.log(this.y);
    console.log(this.name);
    console.log(this.sound.volume);
  }

  playSound(v) {
    this.sound.volume = v;
    this.sound.play();
    console.log(`${this.name} played with a volume of ${this.sound.volume}`);
  }

  hitDetection(handPositionX, handPositionY, volume) {
    if (
      handPositionX >= this.x - this.leftBoundary
      && handPositionX <= this.x + this.rightBoundary
        && handPositionY >= this.y - this.upperBoundary
        && handPositionY <= this.y + this.lowerBoundary
    ) {
      this.playSound(volume);
    }
  }
}
