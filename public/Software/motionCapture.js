/* eslint-disable no-mixed-operators */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
import Camera from '../Hardware/camera.js';
// import webWorker from '../web-work.js';

export default class MotionCapture extends Camera {
  constructor(document, camera, posenet, handpose, tensorflow, fingerpose) {
    super(document, navigator);
    this.camera = camera;
    this.posenet = posenet;
    this.posenetEstimation = this.posenet.load({
      architecture: 'MobileNetV1', outputStride: 16, inputResolution: { width: 640, height: 480 }, multiplier: 0.5,
    });
    this.handpose = handpose;
    this.handposeModel = null;
    this.canvasLeft = this.document.getElementById('canvas-left');
    this.canvasRight = this.document.getElementById('canvas-right');
    this.contextL = this.canvasLeft.getContext('2d');
    this.contextR = this.canvasRight.getContext('2d');
    this.tensorflow = tensorflow;
    this.fingerpose = fingerpose;
    this.GE = null;
    this.webWorker = new Worker('web-work.js');
  }

  drawCircle(x, y, context, canvas) {
    // this.clearCanvas(context, canvas);
    const centerX = x;
    const centerY = y;
    const radius = 1.5;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'lightgreen';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'green';
    context.stroke();
  }

  drawRect(x, y, context) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'green';
    context.rect(x, y, 100, 100);
    context.stroke();
  }

  clearCanvas(context, canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  initWebWorker(data) {
    const webWorker = new Worker('web-work.js');
    webWorker.addEventListener('error', this.workerError);
    webWorker.postMessage(data);
    webWorker.onmessage = (e) => {
      const workerData = this.getPositions(e.data[5].x, e.data[5].y, e.data[4]);
      window.dispatchEvent(new CustomEvent('workerFinished', {
        detail: {
          workerData,
        },
      }));
      webWorker.terminate();
    };
  }

  workerError(err) {
    console.log(err.message, err.filename);
  }

  convertStreamToImage(sx, sy, canvasId, handKeypoints) {
    this.camera.camera.then((mediaStream) => {
      const videoTrack = mediaStream.getVideoTracks();
      console.log(videoTrack);
      const track = videoTrack[0];
      const imageCapture = new ImageCapture(track);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      imageCapture.grabFrame()
        .then((imageBitmap) => {
          createImageBitmap(imageBitmap, sx, sy, 100, 100, { resizeWidth: 500, resizeHeight: 500, resizeQuality: 'high' })
            .then((data) => {
              const imageHand = data;
              canvas.width = 640;
              canvas.height = 480;
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(imageHand, 0, 0);
              const imageData = context.getImageData(0, 0, 500, 500);
              this.initWebWorker({
                type: 'handpose', input: imageData, canvasId, sx, sy, handKeypoints,
              });
            });
        });
    });
  }

  captureMotion() {
    this.camera.video.onloadeddata = (event) => {
      this.tensorflow.ready().then(() => {
        this.interval && clearInterval(this.interval);
        this.interval = setInterval(() => {
          this.captureHand(this.camera.video);
        }, 100);
      });
    };
  }

  defineHandDirection(keypoints) {
    const kl = keypoints.leftHand;
    const kr = keypoints.rightHand;

    switch (keypoints.direction) {
      case 'left':
        if (keypoints.leftHand.x > (keypoints.leftElbow.x - keypoints.leftElbow.x * 0.1)
          && keypoints.leftHand.x < (keypoints.leftElbow.x + keypoints.leftElbow.x * 0.1)) {
          if (keypoints.leftHand.y < keypoints.leftElbow.y) {
            console.log('left up');

            const sx = keypoints.leftHand.x * this.canvasLeft.width - 50;
            const sy = keypoints.leftHand.y * this.canvasLeft.height - 75;

            this.convertStreamToImage(sx, sy, this.canvasLeft.id, kl);
          } else if (keypoints.leftHand.y > keypoints.leftElbow.y) {
            console.log('left down');

            const sx = keypoints.leftHand.x * this.canvasLeft.width - 50;
            const sy = keypoints.leftHand.y * this.canvasLeft.height - 25;

            this.convertStreamToImage(sx, sy, this.canvasLeft.id, kl);
          }
        } else if (keypoints.leftHand.x > keypoints.leftElbow.x
          && keypoints.leftHand.y < keypoints.leftElbow.y) {
          console.log('upper left');
          const sx = keypoints.leftHand.x * this.canvasLeft.width - 25;
          const sy = keypoints.leftHand.y * this.canvasLeft.height - 50;

          this.convertStreamToImage(sx, sy, this.canvasLeft.id, kl);
        } else if (keypoints.leftHand.x > keypoints.leftElbow.x
          && keypoints.leftHand.y > keypoints.leftElbow.y) {
          const sx = keypoints.leftHand.x * this.canvasLeft.width - 25;
          const sy = keypoints.leftHand.y * this.canvasLeft.height - 50;

          this.convertStreamToImage(sx, sy, this.canvasLeft.id, kl);
          console.log('lower left');
        }
        break;
      case 'right':
        if (keypoints.rightHand.x > (keypoints.rightElbow.x - keypoints.rightElbow.x * 0.1)
          && keypoints.rightHand.x < (keypoints.rightElbow.x + keypoints.rightElbow.x * 0.1)) {
          if (keypoints.rightHand.y < keypoints.rightElbow.y) {
            console.log('right up');

            const sx = keypoints.rightHand.x * this.canvasRight.width - 50;
            const sy = keypoints.rightHand.y * this.canvasRight.height - 75;
            this.convertStreamToImage(sx, sy, this.canvasRight.id, kr);
          } else if (keypoints.rightHand.y > keypoints.rightElbow.y) {
            console.log('right down');

            const sx = keypoints.rightHand.x * this.canvasRight.width - 50;
            const sy = keypoints.rightHand.y * this.canvasRight.height - 25;
            this.convertStreamToImage(sx, sy, this.canvasRight.id, kr);
          }
        } else if (keypoints.rightHand.x < keypoints.rightElbow.x
          && keypoints.rightHand.y < keypoints.rightElbow.y) {
          console.log('upper right');

          const sx = keypoints.rightHand.x * this.canvasRight.width - 75;
          const sy = keypoints.rightHand.y * this.canvasRight.height - 25;
          this.convertStreamToImage(sx, sy, this.canvasRight.id, kr);
        } else if (keypoints.rightHand.x < keypoints.rightElbow.x
            && keypoints.rightHand.y > keypoints.rightElbow.y) {
          console.log('lower right');

          const sx = keypoints.rightHand.x * this.canvasRight.width - 75;
          const sy = keypoints.rightHand.y * this.canvasRight.height - 50;
          this.convertStreamToImage(sx, sy, this.canvasRight.id, kr);
        }
        break;
      default:
        break;
    }
  }

  captureHand(img) {
    this.posenetEstimation.then((net) => net.estimateMultiplePoses(img, {
      imageScaleFactor: 0.8,
      flipHorizontal: false,
      maxDetections: 2,
      scoreThreshold: 0.8,
      nmsRadius: 40,
    })).then((poses) => {
      const poseArray = poses;
      poseArray.forEach((pose) => {
        if (pose.keypoints[9].score > 0.7) {
          const leftHand = pose.keypoints[9].position;
          const leftElbow = pose.keypoints[7].position;
          const direction = 'left';
          const left = { leftHand, leftElbow, direction };
          const leftHandX = this.canvasLeft.width * leftHand.x;
          const leftHandY = this.canvasLeft.height * leftHand.y;
          this.drawCircle(leftHandX, leftHandY, this.contextL, this.canvasLeft);
          this.defineHandDirection(left);
        }
        if (pose.keypoints[10].score > 0.7) {
          const rightHand = pose.keypoints[10].position;
          const rightElbow = pose.keypoints[8].position;
          const direction = 'right';
          const right = { rightHand, rightElbow, direction };
          const rightHandX = this.canvasRight.width * rightHand.x;
          const rightHandY = this.canvasRight.height * rightHand.y;
          this.drawCircle(rightHandX, rightHandY, this.contextR, this.canvasRight);
          this.defineHandDirection(right);
        }
      });
    });
  }
}
