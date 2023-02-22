import Camera from './Hardware/camera.js';
import MotionCapture from './Software/motionCapture.js';
import Note from './Software/note.js';

const camera = new Camera(document, navigator);
camera.streamVideo();
const motionCapture = new MotionCapture(document, camera, posenet, handpose, tf, fp);

const notes = [];

const noteRequest = new XMLHttpRequest();
noteRequest.addEventListener('loadend', (res) => {
  console.log(res.target.response);
  const data = JSON.parse(res.target.response);
  data.forEach((n) => {
    const note = new Note(n.x, n.y, n.name, n.path);
    notes.push(note);
  });
  motionCapture.captureMotion();
  console.log(notes);
});
noteRequest.open('GET', '/notes');
noteRequest.send();

window.addEventListener('workerFinished', (e) => {
  const data = e.detail.workerData;
  notes.forEach((n) => {
    n.hitDetection(data.x, data.y, data.v);
  });
});
