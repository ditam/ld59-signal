
import constants from './constants.js';
import utils from './utils.js';

let ctx;

const player = {
  x: 300,
  y: 120,
  score: 17,
  speed: 1,
  range: 50
};

window.isDebug = true;

if (window.isDebug) {
  console.log('=== loaded in debug mode ===');
}

const viewport = {
  // x and y are offsets from (0, 0)
  // TODO: guards against negatives
  x: 0,
  y: 0,
};

let mapObjects = [];

(function generateMapObjects() {
  for (let i=0; i<10; i++) {
    mapObjects.push({
      x: utils.getRandomInt(constants.MAP_WIDTH),
      y: utils.getRandomInt(constants.MAP_HEIGHT)
    });
  }
  console.log('map:', mapObjects);
})();

function scrollViewPort() {
  const maxOffsetX = constants.MAP_WIDTH - constants.VIEWPORT_WIDTH;
  const maxOffsetY = constants.MAP_HEIGHT - constants.VIEWPORT_HEIGHT;

  if (mouse.x < constants.SCROLL_AREA_WIDTH) {
    viewport.x = Math.max(0, viewport.x - constants.SCROLL_STEP_SIZE);
  }
  if (mouse.x > constants.VIEWPORT_WIDTH - constants.SCROLL_AREA_WIDTH) {
    viewport.x = Math.min(maxOffsetX, viewport.x + constants.SCROLL_STEP_SIZE);
  }
  if (mouse.y < constants.SCROLL_AREA_WIDTH) {
    viewport.y = Math.max(0, viewport.y - constants.SCROLL_STEP_SIZE);
  }
  if (mouse.y > constants.VIEWPORT_HEIGHT - constants.SCROLL_AREA_WIDTH) {
    viewport.y = Math.min(maxOffsetY, viewport.y + constants.SCROLL_STEP_SIZE);
  }
}

let debugLog, debugLog2;
let frameCount = 0;
const mouse = {
  x: 0,
  y: 0
};
function drawFrame(timestamp) {
  frameCount++;

  if (frameCount % constants.SCROLL_INTERVAL === 0) {
    scrollViewPort();
  }

  if (window.isDebug) {
    debugLog.text(JSON.stringify(player) + ', ' + JSON.stringify(viewport));
  }

  ctx.clearRect(0, 0, constants.VIEWPORT_WIDTH, constants.VIEWPORT_HEIGHT);

  // gridlines
  if (isDebug) {
    utils.drawDebugGrid(ctx, viewport);
  }

  // map objects
  ctx.save();
  ctx.fillStyle = 'black';
  mapObjects.forEach(o => {
    ctx.fillRect(o.x - viewport.x, o.y - viewport.y, 10, 10);
  });
  ctx.restore();

  // draw player
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgb(114, 218, 168)';
  ctx.arc(player.x - viewport.x, player.y - viewport.y, 25, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  requestAnimationFrame(drawFrame);
}

let songs, sounds;
$(document).ready(function() {
  console.log('Hello Signal!');
  //songs = [
  //  new Audio('bgMusic1.mp3')
  //];
  //sounds = [
  //  new Audio('error.mp3'),
  //];

  const canvas = document.getElementById('main-canvas');

  $(canvas).attr('height', constants.VIEWPORT_HEIGHT);
  $(canvas).attr('width', constants.VIEWPORT_WIDTH);

  debugLog = $('#debug-log');
  debugLog2 = $('#debug-log2');
  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  let printed = false;
  canvas.addEventListener('mousemove', event => {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;

    if (isDebug) {
      debugLog2.text('mouse:' + JSON.stringify(mouse));
    }
  });

  drawFrame();
});
