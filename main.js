
import constants from './constants.js';
import utils from './utils.js';

let ctx;

const player = {
  x: 530,
  y: 610,
  score: 17,
  speed: constants.INITIAL_SPEED,
  range: constants.INITIAL_RANGE
};

window.isDebug = location && location.hostname==='localhost';

if (window.isDebug) {
  console.log('=== loaded in debug mode ===');
}

const viewport = {
  // x and y are offsets from (0, 0)
  x: 400,
  y: 300,
};

// sanity checks for initial setup
console.assert(player.x < constants.MAP_WIDTH, 'Invalid player x0');
console.assert(player.y < constants.MAP_HEIGHT, 'Invalid player y0');
console.assert(viewport.x + constants.VIEWPORT_WIDTH <= constants.MAP_WIDTH, 'Invalid viewport x0 ' + viewport.x);
console.assert(viewport.y + constants.VIEWPORT_HEIGHT <= constants.MAP_HEIGHT, 'Invalid viewport y0 ' + viewport.y);

let mapObjects = [];

(function generateMapObjects() {
  for (let i=0; i<10; i++) {
    mapObjects.push({
      id: utils.getNewID(),
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

let debugLog, debugLog2, debugLog3;
let frameCount = 0;
const mouse = {
  // NB: Values inside viewport!
  // (init with non-0 so that scroll is not triggered)
  x: constants.VIEWPORT_WIDTH / 2,
  y: constants.VIEWPORT_HEIGHT / 2
};

function drawFrame(timestamp) {
  const t0 = performance.now();
  frameCount++;

  // log debug stuff to DOM
  if (window.isDebug) {
    debugLog.text(JSON.stringify(player) + ', ' + JSON.stringify(viewport));
  }

  // adjust viewport if necessary
  scrollViewPort();

  // clear canvas
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

  // apply player movement
  if (player.target) {
    // move player towards target
    let t = player.target;
    const dist = utils.dist(player, t);

    if (dist < player.speed * 3) {
      // snap to target to avoid wiggling
      // (allowing for bigger overshoot with bigger speeds)
      player.x = t.x;
      player.y = t.y;
      delete player.target;
    } else {
      // move towards target
      // dX/dY is the unit vector pointing at target
      const dX = (t.x - player.x) / dist;
      const dY = (t.y - player.y) / dist;
      player.x += dX * player.speed;
      player.y += dY * player.speed;
    }
  }

  if (player.target) {
    // NB: separate check, target might have been removed above
    // draw target marker
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 70, 70, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(player.x - viewport.x, player.y - viewport.y);
    ctx.lineTo(player.target.x - viewport.x, player.target.y - viewport.y);
    ctx.stroke();
    ctx.restore();
  }

  // draw player
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgb(114, 218, 168)';
  ctx.arc(player.x - viewport.x, player.y - viewport.y, 25, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // draw range indicator
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.arc(player.x - viewport.x, player.y - viewport.y, player.range, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // update UI if needed
  updateCommsList();

  // perf check
  const t1 = performance.now();
  debugLog3.text((t1-t0).toFixed(1) + ' ms per frame');

  // queue next frame
  requestAnimationFrame(drawFrame);
}

let idsInRange_old = [];
function updateCommsList() {
  const objectsInRange = mapObjects.filter(o => {
    return utils.dist(player, o) < player.range;
  });

  const idsInRange = objectsInRange.map(o => o.id).sort();

  if (!utils.arraysEqual(idsInRange_old, idsInRange)) {
    console.log('-- new comms list:', objectsInRange);
    // TODO: generate list in DOM
  }

  idsInRange_old = idsInRange;
}

let commsList;
let songs, sounds;
$(document).ready(function() {
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
  debugLog3 = $('#debug-log3');

  commsList = $('#comms-list');
  $('#comms-button').on('click', () => {
    commsList.toggle();
  });


  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  canvas.addEventListener('mousemove', event => {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;

    if (isDebug) {
      debugLog2.text('mouse:' + JSON.stringify(mouse));
    }
  });

  // custom right-click behaviour
  document.addEventListener('contextmenu', function(e) {
    if (e.target === canvas) {
      // this is to be nice so that you can still use it outside the game canvas
      e.preventDefault();
      const target = {
        x: viewport.x + e.offsetX,
        y: viewport.y + e.offsetY
      };
      if (utils.dist(player, target) > constants.MIN_TARGET_DIST) {
        console.log('set new target:', target);
        player.target = target;
      }
    }
  }, false);

  drawFrame();
});
