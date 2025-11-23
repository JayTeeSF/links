const speedDash = document.querySelector(".speedDash");
const scoreDash = document.querySelector(".scoreDash");
const lifeDash = document.querySelector(".lifeDash");

const container = document.getElementById("container");
const btnStart = document.querySelector(".btnStart");

btnStart.addEventListener('click', startGame);
// By default it adds: tap, doubletap, press, horizontal pan and swipe
var hammertime = new Hammer(container);
hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });

document.addEventListener('keydown', pressKeyOn);
document.addEventListener('keyup', pressKeyOff);

//Game Variables
let animationGame;
let gamePlay = false;
let player;

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
}

hammertime.on('pan', function(ev) {
  const left = 2;
  const right = 4;
  const up = 8;
  const down = 16;
  /*
  ev.deltaX > 0 ? ArrowRight
  ev.deltaX < 0 ? ArrowLeft
  ev.deltaY > 0 ? ArrowDown
  //reversed like screen:
  ev.deltaY < 0 ? ArrowUp

  ev.direction == 2 // left
  ev.direction == 4 // right

  ev.direction == 8 // up
  ev.direction == 16 // down
  */

  console.log(ev);
  if (ev.direction == up) {
    console.log(keys);
    keys.ArrowUp = true;
    keys.ArrowDown = false;
  }
  if (ev.direction == down) {
    console.log(keys);
    keys.ArrowDown = true;
    keys.ArrowUp = false;
  }
  if (ev.direction == left) {
    //player.ele.x -= (player.speed / 4);
    console.log(keys);
    keys.ArrowLeft = true;
    keys.ArrowRight = false;
  }
  if (ev.direction == right) {
    //player.ele.x += (player.speed / 4);
    console.log(keys);
    keys.ArrowRight = true;
    keys.ArrowLeft = false;
  }
});

/*
//press the brakes!
hammertime.on('press', function(ev) {
  //ArrowDown: true
  ev.preventDefault();
  console.log(ev + " => " + keys);
  player.speed = player.speed > 0 ? (player.speed - 0.2) : 0
});

//tap to increase speed
hammertime.on('tap', function(ev) {
  //ArrowDown: true
  event.preventDefault();
  console.log(ev + " => " + keys);
  keys.ArrowDown = true;
});
*/

function startGame() {
  console.log(gamePlay);
  let div = createPlayerCar();
  gamePlay = true;
  animationGame = requestAnimationFrame(playGame);
  player = {
    ele: div,
    speed: 10,
    lives: 3,
    gameScore: 0,
    carstoPass: 10,
    score: 0,
    roadwidth: 250
  }
  startBoard();
}

function startBoard() {
  for (let x = 0; x < 13; x++) {
    let div = document.createElement('div');
    div.setAttribute('class', 'road');
    div.style.top = (x * 50) + 'px';
    div.style.width = player.roadwidth + 'px';
    container.appendChild(div);
  }
}


function createPlayerCar() {
  btnStart.style.display = 'none';
  let div = document.createElement('div');
  div.setAttribute('class', 'playerCar');
  div.x = 250;
  div.y = 500;
  container.appendChild(div);
  return div;
}

function pressKeyOn(event) {
  event.preventDefault();
  console.log(keys);
  keys[event.key] = true;
}

function pressKeyOff() {
  event.preventDefault();
  console.log(keys);
  keys[event.key] = false;
}

function updateDash() {
  // console.log(player);
  scoreDash.innerHTML = player.score;
  lifeDash.innerHTML = player.lives;
  speedDash.innerHTML = player.speed;
}

function playGame() {
  if (gamePlay) {
    updateDash();
    // detect movement
    if (keys.ArrowUp) {
      player.ele.y -= 1;
      player.speed = player.speed < 20 ? (player.speed + 0.05) : 20
    }


    if (keys.ArrowDown) {
      player.ele.y += 1;
      player.speed = player.speed > 0 ? (player.speed - 0.2) : 0

    }


    if (keys.ArrowLeft) {
      player.ele.x -= (player.speed / 4);
    }

    if (keys.ArrowRight) {
      player.ele.x += (player.speed / 4);
    }

    // move car
    player.ele.style.top = player.ele.y + 'px';
    player.ele.style.left = player.ele.x + 'px';
  }

  animationGame = requestAnimationFrame(playGame);
}
