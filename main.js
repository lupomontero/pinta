// https://github.com/cubiq/add-to-homescreen
addToHomescreen({
  modal: true,
  mandatory: true,
  lifespan: 0,
  displayPace: 1,
  maxDisplayCount: 0
});

var body = document.getElementsByTagName('body')[0];

function getVieportSize() {
  var docEl = document.documentElement;
  return {
    width: window.innerWidth || docEl.clientWidth || body.clientWidth,
    height: window.innerHeight|| docEl.clientHeight|| body.clientHeight
  };
}

function copyTouch(touch) {
  return {
    identifier: touch.identifier,
    pageX: touch.pageX,
    pageY: touch.pageY
  };
}

var canvas = document.createElement('canvas');
var viewportSize = getVieportSize();
canvas.width = viewportSize.width;
canvas.height = viewportSize.height - 40;
body.appendChild(canvas);

var ctx = canvas.getContext('2d');
ctx.canvas.style.width = '100%';

var palette = document.getElementById('palette');
var clearBtn = document.getElementById('clear');
var ongoingTouches = [];
var currColour = 'black';
var lineWidth = 8;

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

function handleCanvasTouchStart(e) {
  e.preventDefault();
  var touches = e.changedTouches;
  var i, touch;

  for (i = 0; i < touches.length; i++) {
    touch = touches[i];
    ongoingTouches.push(copyTouch(touch));
    ctx.beginPath();
    // a circle at the start
    ctx.arc(touch.pageX, touch.pageY, lineWidth / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = currColour;
    ctx.fill();
  }
}

function handleCanvasTouchMove(e) {
  e.preventDefault();
  var touches = e.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = currColour;
      ctx.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
    }
  }
}

function handleCanvasTouchEnd(e) {
  e.preventDefault();
  var touches = e.changedTouches;
  var i, idx, touch;

  for (i = 0; i < touches.length; i++) {
    idx = ongoingTouchIndexById(touches[i].identifier);
    touch = touches[i];

    if (idx >= 0) {
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = currColour;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touch.pageX, touch.pageY);
      // a circle at the start
      ctx.arc(touch.pageX, touch.pageY, 2, 0,2 * Math.PI, false);
      ctx.fill();
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
  }
}

function handleCanvasTouchCancel(e) {
  e.preventDefault();
  var touches = e.changedTouches;
  
  for (var i = 0; i < touches.length; i++) {
    ongoingTouches.splice(i, 1);  // remove it; we're done
  }
}

// Set current colour and mark colour as active.
function handlePaletteClick(e) {
  e.preventDefault();
  var target = e.target;
  currColour = target.style.backgroundColor;
  var i, len, links = document.getElementsByClassName('colour');
  for (i = 0, len = links.length; i < len; i++) {
    links[i].innerHTML = '';
  }
  target.innerHTML = '·';
}

// Clear the drawing by reloading the page.
function handleClearBtnClick(e) {
  e.preventDefault();
  window.location.reload();
}


// Hook up event listeners
canvas.addEventListener('touchstart', handleCanvasTouchStart, false);
canvas.addEventListener('touchend', handleCanvasTouchEnd, false);
canvas.addEventListener('touchcancel', handleCanvasTouchCancel, false);
canvas.addEventListener('touchleave', handleCanvasTouchEnd, false);
canvas.addEventListener('touchmove', handleCanvasTouchMove, false);
palette.addEventListener('click', handlePaletteClick, false);
clearBtn.addEventListener('click', handleClearBtnClick, false);


// appCacheNanny stuff
appCacheNanny.set('loaderPath', 'vendor/appcache-loader.html');
appCacheNanny.start({ checkInterval: 60 * 1000 });
appCacheNanny.on('updateready', function () {
  var answer = confirm('Pinta has been updated! Refresh to load new version?');
  if (answer) {
    window.location.reload();
  }
});

