/* eslint-disable no-restricted-globals */
class Camera {
  constructor(document, navigator) {
    this.document = document;
    this.navigator = navigator;
    this.camera = this.navigator.mediaDevices.getUserMedia({ video: true });
    this.video = document.querySelector('#videoElement');
    this.video.width = 1;
    this.video.height = 1;
    this.navigator = navigator;
  }

  getPositions(x, y, v) {
    // here comes the motion detection
    const json = { x, y, v };
    return json;
  }

  streamVideo() {
    if (this.navigator.mediaDevices.getUserMedia) {
      this.stream = this.navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.video.srcObject = stream;
        })
        .catch((err0r) => {
          console.log('Something went wrong!');
        });
    }
  }
}

export default Camera;
