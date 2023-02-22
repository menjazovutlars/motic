/* eslint-disable prefer-destructuring */
importScripts('https://unpkg.com/@tensorflow/tfjs@3.7.0/dist/tf.min.js');
importScripts('https://unpkg.com/@tensorflow-models/handpose@0.0.6/dist/handpose.js');
importScripts('fingerpose.js');

let GE;

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

function estimateHandGesture(predictions) {
  let handGesture = 'No gestures detected.';
  let gesture;
  if (predictions.length > 0) {
    const estimatedGestures = GE.estimate(predictions[0].landmarks, 8.5);
    if (estimatedGestures.gestures.length > 0) {
      gesture = estimatedGestures.gestures[0];
      handGesture = `Gesture ${gesture.name}: Confidence of ${gesture.confidence}`;
      console.log(`Gesture ${gesture.name}: Confidence of ${gesture.confidence}`);
      return setVolume(gesture.name);
    }
    console.log('No gestures detected.');
    console.log(setVolume(gesture.name));
  } else {
    console.log('No gestures detected.');
    return setVolume(gesture);
  }
  return setVolume(gesture);
}

async function captureHandGesture(bitmap, canvasId, sx, sy, handKeypoints) {
  const handposeModel = await handpose.load();
  const predictions = await handposeModel.estimateHands(bitmap);
  const volume = estimateHandGesture(predictions);

  self.postMessage([predictions, canvasId, sx, sy, volume, handKeypoints]);
}

self.addEventListener('message', (ev) => {
  const { type } = ev.data;
  const { input } = ev.data;
  const { canvasId } = ev.data;
  const { sx } = ev.data;
  const { sy } = ev.data;
  const { handKeypoints } = ev.data;
  defineHandGestures();
  switch (type) {
    case 'handpose':
      captureHandGesture(input, canvasId, sx, sy, handKeypoints);
      break;
    case 'posenet':
      captureHand(input);
      break;
    default:
      self.postMessage('Incorrect data');
      break;
  }
});
