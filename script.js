/* eslint-disable prefer-destructuring */
let GE;
let interval;
let mute;
let hx;
let hy;
let dx;
let dy;
const streamOuput = {};
const motionSwitch = document.getElementById('motion-switch');
const video = document.querySelector('#camera-feed');
const cv = document.getElementById('cv1');
const ctx = cv.getContext('2d');
const bgVideo = document.getElementById('bg-video');
const text4 = document.getElementById('text4');
const gesture = document.getElementById('estimated-gesture');
const motionDiv = document.getElementById('motion-capture');
const muteButton = document.getElementById('mute-switch');
const flute = document.getElementById('img-flute');
const sax = document.getElementById('img-sax');
const key = document.getElementById('img-key');
const cello = document.getElementById('img-cello');

const sounds = [];
const c5 = createjs.Sound.registerSound('./assets/sounds/C5.wav', 'C5');
sounds.push(c5);
const e5 = createjs.Sound.registerSound('./assets/sounds/E5.wav', 'E5');
sounds.push(e5);
const g5 = createjs.Sound.registerSound('./assets/sounds/G5.wav', 'G5');
sounds.push(g5);
const h5 = createjs.Sound.registerSound('./assets/sounds/H5.wav', 'H5');
sounds.push(h5);
const f4 = createjs.Sound.registerSound('./assets/sounds/F4.wav', 'F4');
sounds.push(f4);
const a4 = createjs.Sound.registerSound('./assets/sounds/A4.wav', 'A4');
sounds.push(a4);

const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

function resizeCanvas(element) {
  const w = element.offsetWidth;
  const h = element.offsetHeight;
  cv.width = w;
  cv.height = h;
}

function defineHandGestures() {
  const openPalm = new fp.GestureDescription('open_palm');
  openPalm.addCurl(fp.Finger.Thump, fp.FingerCurl.NoCurl, 0.9);
  openPalm.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 0.9);
  openPalm.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 0.9);
  openPalm.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 0.9);
  openPalm.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 0.9);

  const halfOpenPalm = new fp.GestureDescription('half_open_palm');
  halfOpenPalm.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 0.7);
  halfOpenPalm.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 0.7);
  halfOpenPalm.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.7);
  halfOpenPalm.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.7);

  const fist = new fp.GestureDescription('fist');
  fist.addCurl(fp.Finger.Thump, fp.FingerCurl.HalfCurl, 0.9);
  fist.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 0.9);
  fist.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 0.9);
  fist.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 0.9);
  fist.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 0.9);

  GE = new fp.GestureEstimator([
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    openPalm,
    halfOpenPalm,
    fist,
  ]);
}

function setVolume(gesture) {
  switch (gesture) {
    case 'open_palm':
      return 0.25;
    case 'half_open_palm':
      return 0.5;
    case 'fist':
      return 0.75;
    default:
      return 0.5;
  }
}

function drawHand(predictions) {
//   ctx.clearRect(0, 0, cv.width, cv.height);
  const diffWidth = (video.offsetWidth - cv.width);
  const diffHeight = (video.offsetHeight - cv.height);
  const scaleX = video.offsetWidth / (streamOuput.width);
  const scaleY = video.offsetHeight / (streamOuput.height);
  dx = cv.width / 2;
  dy = cv.height / 2;
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;
      hx = landmarks[0][0] * scaleX - diffWidth;
      hy = landmarks[0][1] * scaleY - diffHeight;
      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i][0] * scaleX - diffWidth;
        const y = landmarks[i][1] * scaleY - diffHeight;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 3 * Math.PI);

        ctx.fillStyle = '#71C6E0';
        ctx.fill();
      }
      for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
        const finger = Object.keys(fingerJoints)[j];
        //  Loop through pairs of joints
        for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
          // Get pairs of joints
          const firstJointIndex = fingerJoints[finger][k];
          const secondJointIndex = fingerJoints[finger][k + 1];

          // Draw path
          ctx.beginPath();
          ctx.moveTo(
            landmarks[firstJointIndex][0] * scaleX - diffWidth,
            landmarks[firstJointIndex][1] * scaleY - diffHeight,
          );
          ctx.lineTo(
            landmarks[secondJointIndex][0] * scaleX - diffWidth,
            landmarks[secondJointIndex][1] * scaleY - diffHeight,
          );
          ctx.strokeStyle = '#71C6E0';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    });
  }
}

function estimateHandGesture(predictions) {
  let estimatedGesture;
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (predictions.length > 0) {
    drawHand(predictions);
    const estimatedGestures = GE.estimate(predictions[0].landmarks, 8.5);
    if (estimatedGestures.gestures.length > 0) {
      estimatedGesture = estimatedGestures.gestures[0];
      gesture.innerHTML = `<p>Geste ${estimatedGesture.name}: Confidence of ${estimatedGesture.confidence}</p>`;
      console.log(`Geste ${estimatedGesture.name}: Confidence of ${estimatedGesture.confidence}`);
      if (!mute) {
        hitDetection(dx, dy, hx, hy, setVolume(estimatedGesture.name));
        // playSound(setVolume(estimatedGesture.name), 2);
      }
    }
  } else {
    gesture.innerHTML = '<p>Keine Geste erkannt.</p>';
    console.log('Keine Geste erkannt.');
  }
}

async function captureHandGesture(stream) {
  const handposeModel = await handpose.load();
  const predictions = await handposeModel.estimateHands(stream);
  estimateHandGesture(predictions);
}

function captureMotion() {
  video.onloadeddata = (event) => {
    resizeCanvas(motionDiv);
    tf.ready().then(() => {
      console.log('Tensorflow ready.');
      interval && clearInterval(interval);
      interval = setInterval(() => {
        captureHandGesture(video);
      }, 2000);
    });
  };
}

function streamVideo() {
  if (navigator.mediaDevices.getUserMedia) {
    if (video.srcObject != null) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        stream.getTracks().forEach((track) => {
          clearInterval(interval);
          track.stop();
          video.srcObject = null;
        });
      });
    } else {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamOuput.height = stream.getVideoTracks()[0].getSettings().height;
          streamOuput.width = stream.getVideoTracks()[0].getSettings().width;
          video.srcObject = stream;
          captureMotion();
        })
        .catch((err0r) => {
          console.log('Something went wrong!');
        });
    }
  }
}

function hitDetection(dx, dy, handPositionX, handPositionY, v) {
  if (
    handPositionX >= 0
        && handPositionX <= dx
        && handPositionY >= 0
        && handPositionY <= dy
  ) {
    playSound(v, 1);
  } else if (
    handPositionX >= dx
      && handPositionX <= cv.width
      && handPositionY >= 0
      && handPositionY <= dy
  ) {
    playSound(v, 2);
  } else if (
    handPositionX >= 0
      && handPositionX <= dx
      && handPositionY >= dy
      && handPositionY <= cv.height
  ) {
    playSound(v, 3);
  } else if (
    handPositionX >= dx
      && handPositionX <= cv.width
      && handPositionY >= dy
      && handPositionY <= cv.height
  ) {
    playSound(v, 4);
  }
}

/* myFunction toggles between adding and removing the show class, which is used to hide and show the dropdown content */

function playSound(v, ac) {
  const props = new createjs.PlayPropsConfig()
    .set({ interrupt: this.createjs.Sound.INTERRUPT_NONE, volume: v });
  switch (ac) {
    case 1: {
      createjs.Sound.play(sounds[0].id, props);
      createjs.Sound.play(sounds[1].id, props);
      createjs.Sound.play(sounds[2].id, props);
      break;
    }
    case 2: {
      createjs.Sound.play(sounds[1].id, props);
      createjs.Sound.play(sounds[2].id, props);
      createjs.Sound.play(sounds[3].id, props);
      break;
    }
    case 3: {
      createjs.Sound.play(sounds[4].id, props);
      createjs.Sound.play(sounds[5].id, props);
      createjs.Sound.play(sounds[0].id, props);
      break;
    }
    case 4: {
      createjs.Sound.play(sounds[5].id, props);
      createjs.Sound.play(sounds[0].id, props);
      createjs.Sound.play(sounds[1].id, props);
      break;
    }
    default: {
      break;
    }
  }
  createjs.Sound.play(sounds[0].id, props);
  createjs.Sound.play(sounds[1].id, props);
  createjs.Sound.play(sounds[2].id, props);
}

window.addEventListener('resize', () => {
  resizeCanvas(motionDiv);
});

motionSwitch.addEventListener('mouseover', () => {
  switch (motionSwitch.style.transform) {
    case 'scaleX(-1)': {
      motionSwitch.style.transform = 'scale(-1.5)';
      break;
    }
    case 'scaleX(1)': {
      motionSwitch.style.transform = 'scale(1.5)';
      break;
    }
    default:
      break;
  }
});

motionSwitch.addEventListener('mouseout', () => {
  switch (motionSwitch.style.transform) {
    case 'scale(-1.5)': {
      motionSwitch.style.transform = 'scaleX(-1)';
      break;
    }
    case 'scale(1.5)': {
      motionSwitch.style.transform = 'scaleX(1)';
      break;
    }
    default:
      break;
  }
});

motionSwitch.addEventListener('click', () => {
  streamVideo();
  switch (motionSwitch.style.transform) {
    case 'scale(1.5)': {
      motionSwitch.style.transform = 'scaleX(-1)';
      break;
    }
    case 'scale(-1.5)': {
      motionSwitch.style.transform = 'scaleX(1)';
      break;
    }
    default:
      break;
  }
  video.style.display = video.style.display === 'block' ? 'none' : 'block';
  gesture.style.display = gesture.style.display === 'flex' ? 'none' : 'flex';
  cv.style.display = cv.style.display === 'flex' ? 'none' : 'flex';
  text4.style.marginLeft = text4.style.marginLeft === `${10}%` ? `${-120}px` : `${10}%`;
  bgVideo.style.display = bgVideo.style.display === '' ? 'none' : '';
  muteButton.style.display = muteButton.style.display === 'block' ? 'none' : 'block';
});

function muteSound() {
  mute = !mute;
  if (mute) {
    muteButton.src = 'assets/pictures/volume-mute-solid.svg';
  } else {
    muteButton.src = 'assets/pictures/volume-up-solid.svg';
  }
}

flute.addEventListener('mouseover', () => {
  const audio = new Audio(
    './assets/sounds/flute-d4.wav',
  );
  audio.play();
});

sax.addEventListener('mouseover', () => {
  const audio = new Audio(
    './assets/sounds/sax-d4.wav',
  );
  audio.play();
});

key.addEventListener('mouseover', () => {
  const audio = new Audio(
    './assets/sounds/key-fis4.wav',
  );
  audio.play();
});

cello.addEventListener('mouseover', () => {
  const audio = new Audio(
    './assets/sounds/cello-a4.wav',
  );
  audio.play();
});

motionSwitch.style.transform = 'scaleX(1)';
mute = false;
defineHandGestures();
