const AGAIN = "escape"; //"again"
const GOOD  = "brain"; //"good"
const BAD   = "shotgun-blast"; //"bad"

const GREEN_COLOR  = "green";
const RED_COLOR    = "red";
const YELLOW_COLOR = "yellow";

const greenDie = [
  GOOD, GOOD, GOOD,
  AGAIN, AGAIN,
  BAD
];

const yellowDie = [
  GOOD, GOOD,
  AGAIN, AGAIN,
  BAD, BAD
];

const redDie = [
  GOOD,
  AGAIN, AGAIN,
  BAD, BAD, BAD
];
//console.log("redDie: " + JSON.stringify(redDie));

const valueOfFace  = {};
valueOfFace[GOOD]  = 1;
valueOfFace[AGAIN] = 0;
valueOfFace[BAD]   = -1;

const totalGreenDie  =  6;
const totalYellowDie =  4;
const totalRedDie    =  3;

/* fill dice container:
 * g y r
 * g y r
 * g y r
 * g y
 * g
 * g
 */

const maxBadPerTurn = 3;
const diePerRoll    = 3;
const winningScore  = 13;

var winningPlayerIdx = null;
var isFinalRound     = false; // currentPlayerIdx comes-back around
var goodCount        = 0;
var againCount       = 0;
var badCount         = 0;

var diceContainer = [];
var reRollDice    = [];
var goodDice      = [];
var diceToRoll    = [];

const nextTurnButtonText = "Pass"
const grabDiceButtonText = "Grab Dice"
const rollButtonText     = "Roll"
var playerCountElement, gameStartButton, playerListElement, quitButton, nextTurnButton, currentStatsElement;
var playerCount;
var scores, players, currentPlayerIdx;
var playAreaElement, grabDiceButton, rollButton, instructionsElement;

var instructions;

function setupReferences() {
  currentStatsElement      = document.getElementById("currentStats");
  playerListElement        = document.getElementById("playerList");
  playerCountElement       = document.getElementById("numPlayers");
  gameStartButton          = document.getElementById("gameStartButton");
  nextTurnButton           = document.getElementById("nextTurnButton");
  nextTurnButton.innerText = nextTurnButtonText;
  quitButton               = document.getElementById("quitButton");
  rollButton               = document.getElementById("rollButton");
  rollButton.innerText     = rollButtonText;
  grabDiceButton           = document.getElementById("grabDiceButton");
  grabDiceButton.innerText = grabDiceButtonText;
  playAreaElement          = document.getElementById("playArea");
  instructionsElement      = document.getElementById("instructions");
}

function putAwayTheInstructions() {
  instructions = `<a href="#" onclick="showInstructions()">Show me the instructions again.</a>`;
  instructionsElement.innerHTML = instructions;
  show(instructionsElement);
}

function showInstructions() {
  setupReferences();
  instructions = `
To play you identify the number of Players, ${grabDiceButtonText} (i.e. ${diePerRoll}), ${rollButtonText} them, and then decide whether to ${nextTurnButtonText}. (Rinse & Repeat). <br />
<br />
The objective: <b>Accumulate ${winningScore} or more pts.</b><br />
The player with the most points (after the final round) wins.<br />
<br />
How?<br />
&nbsp;&nbsp;&nbsp;${rollButtonText} ${GOOD}s.<br />
&nbsp;&nbsp;&nbsp;Unfortunately, for every ${BAD} you ${rollButtonText}, your score decreases.<br />
&nbsp;&nbsp;&nbsp;${rollButtonText}ing ${maxBadPerTurn} or more ${BAD}s in a single turn, drops your total score back down to 0.<br />
&nbsp;&nbsp;&nbsp;${AGAIN}s don't affect your score. However, in the event that you decide to re-${rollButtonText}, you know (in advance) that you will be re-using those particular dice as part of the ${diePerRoll} dice when you ${grabDiceButtonText}.<br />
<br />
Although your score persists across turns, your accumulation of ${BAD}s, ${AGAIN}s, and ${GOOD}s reset at the start of each turn.<br />
To skip your turn or end it early (i.e. before you get too many ${BAD}s), click ${nextTurnButtonText} to start the next player's (next) turn (i.e. that could be your next turn in a 1-player game).<br />
<br />
<br />
How do I figure-out what to do?<br />
&nbsp;&nbsp;&nbsp;Well, there are 3 types of dice:<br />
&nbsp;&nbsp;&nbsp;${GREEN_COLOR}, ${RED_COLOR} and ${YELLOW_COLOR}.<br />
<br />
&nbsp;&nbsp;&nbsp;A ${GREEN_COLOR} die has 3 ${GOOD}s; 2 ${AGAIN}s; and 1 ${BAD}.<br />
&nbsp;&nbsp;&nbsp;A ${RED_COLOR} die has 1 ${GOOD}; 2 ${AGAIN}s; and 3 ${BAD}s.<br />
&nbsp;&nbsp;&nbsp;A ${YELLOW_COLOR} die has an equal number (2) of each.<br />
<br />
What's this Final Round business?<br />
&nbsp;&nbsp;&nbsp;The final round starts once a player accumulates ${winningScore} or more points and completes his/her turn.<br />
&nbsp;&nbsp;&nbsp;The game ends once the other player(s) have had one last turn with which to try and win.
<br />
<br />
<br />
<a href="#" onclick="putAwayTheInstructions()">Put away the instructions.</a>
`.trim()

  instructionsElement.innerHTML = instructions;
  show(instructionsElement);
}

function setupGame() {
  setupReferences();

  players = [];
  scores = [];

  setupPlayers();

  currentPlayerIdx = -1;
  nextTurn();
}

function quit(skipCleanup) {
  show(gameStartButton)
  remove(grabDiceButton)
  remove(rollButton)
  hide(nextTurnButton)
  hide(quitButton)
  clearLog();
  if (!skipCleanup) {
    cleanup()
  }
}

function cleanup() {
  isFinalRound = false;
  winningPlayerIdx = null;
  //console.log("Re-enabling playerCountElement...")
  playerCountElement.disabled = false;
  //clearPlayerList();
  //clearScore();
  appendLog("Game Over.");
}

function endGame() {
  quit(_skipCleanup = true);

  /* DEBUG:
  winningPlayerIdx = 0;
  scores[0] = 100;
  */

  var hasWinner = true;
  if ((!winningPlayerIdx) && (winningPlayerIdx !== 0)) {
    hasWinner = false;
    winningPlayerIdx = currentPlayerIdx;
  }

  var scorePer = {};
  for(var playerIdx=0; playerIdx < players.length; playerIdx++) {
    scorePer[playerIdx] = scores[playerIdx];
    if (scores[playerIdx] > scores[winningPlayerIdx]) {
      winningPlayerIdx = playerIdx;
    }
  }

  var keysSorted = Object.keys(scorePer).sort(function(a,b){return scorePer[a]-scorePer[b]}).reverse();
  if (hasWinner) {
    alert("has winner..");
    keysSorted = keysSorted.slice(1)
    appendLog(`...And the winner is: player ${players[winningPlayerIdx].number} with ${scores[winningPlayerIdx]} points`);
  }

  for(var kIdx=0; kIdx < keysSorted.length; kIdx++) {
    appendLog(`Player ${players[keysSorted[kIdx]].number} ended with ${scorePer[keysSorted[kIdx]]} points`)
  }
  cleanup()
}

function updateCurrentPlayer() {
  currentPlayerIdx += 1;
  if (currentPlayerIdx >= playerCount) {
    currentPlayerIdx = 0; // starting again...
  }
  updateScoreAndStats();
}

function updateScoreAndStats() {
  playerListElement.innerHTML = "";

  for (var pIdx=0; pIdx<playerCount; pIdx++) {
    player = players[pIdx];
    if (pIdx == currentPlayerIdx) {
      // highlight
      playerListElement.innerHTML += `<b>Player: ${player.number}</b> (${scores[pIdx]} pts)&nbsp;&nbsp;&nbsp;`
    } else {
      playerListElement.innerHTML += `Player: ${player.number} (${scores[pIdx]} pts)&nbsp;&nbsp;&nbsp;`
    }
  }
  updateStats();
}

function clearPlayerList() {
  playerListElement.innerHTML = "";
}

function clearLog() {
  playAreaElement.innerHTML = "";
}

function appendLog(message="") {
  console.log(message);
  playAreaElement.innerHTML += message + "<br />";
}

function nextTurn() {
  if ((!isFinalRound) && (winningPlayerIdx == currentPlayerIdx)) {
    isFinalRound = true; // once winningPlayer's turn ends
  }

  hide(gameStartButton);
  display(grabDiceButton);
  remove(rollButton);
  //console.log("**** SKIP TURN ****");
  //nextTurnButton.innerHTML = "skipTurn";
  show(nextTurnButton);
  clearLog();

  reRollDice.length = 0;
  diceToRoll.length = 0;
  goodDice.length   = 0;
  goodCount         = 0;
  againCount        = 0;
  badCount          = 0;

  updateCurrentPlayer();
  //appendLog("Current Player Idx: " + currentPlayerIdx);
  appendLog(`<b>Player ${players[currentPlayerIdx].number}</b>'s turn...`);

  fillDiceContainer();
  //appendLog("Dice Container has: " + JSON.stringify(diceContainer));

  //grabDice();
}

function howManyDie() {
  return diePerRoll - againCount;
}

function show(el) {
  el.style.visibility = 'visible';
}

function remove(el) {
  el.style.display = 'none';
}

function display(el) {
  el.style.display = 'inline';
}

function hide(el) {
  el.style.visibility = 'hidden';
}

function grabDice(_howManyDie, container) {
  if ((isFinalRound) && (winningPlayerIdx == currentPlayerIdx)) {
    endGame();
    return
  }
  _howManyDie || (_howManyDie = howManyDie());
  appendLog(`&nbsp;&nbsp;&nbsp; Preparing to grab ${_howManyDie} additional dice`);
  container  || (container = diceContainer);

  hide(nextTurnButton);
  remove(grabDiceButton);
  diceToRoll.length = 0; // is this necessary here?

  if (container.length < _howManyDie) {
    moveToContainer(goodDice, container)
  }
  // add existing re-roll die to diceToRoll...
  rrIdx = 0;
  while (reRollDice.length > 0) {
    diceToRoll.push(reRollDice[rrIdx]);
    reRollDice.splice(rrIdx,1) // remove it -- couldn't modify it when looping over it as for-loop
    againCount -= 1; // decrement it
    updateStats(); // display that...
  }

  // if we already have 3 reRollDice, then howManyDie should == 0
  for(var i=0; i<_howManyDie; i++) {
    // splice is destructive to container -- removing elements
    var choosen = container.splice(Math.floor(Math.random() * container.length) - 1, 1)[0];
    diceToRoll.push(choosen)
  }

  appendLog(`You grabbed: ${JSON.stringify(diceToRoll)}`);
  display(rollButton);
}

function clearScore() {
  currentStatsElement.innerHTML = "";
}

function updateStats() {
  currentStatsElement.innerHTML = `${GOOD}s: ${goodCount}; ${BAD}s: ${badCount}; ${AGAIN}s: ${againCount}`;
}

function roll() {
  remove(rollButton);
  var rolledFaces = [];
  for (var dtrIdx = 0; dtrIdx < diceToRoll.length; dtrIdx++) {
    var gotFace;
    var die = diceToRoll[dtrIdx];
    switch(die) {
      case GREEN_COLOR:
        var randVal = Math.floor(Math.random() * greenDie.length);
        var startSplice = randVal - 1;
        // Avoid splicing original die, as it is destructive
        var dieFaces = [...greenDie];
        gotFace = dieFaces.splice(startSplice, 1)[0];
        if (!gotFace) {
          console.error(`missing face from greenDie; randVal: ${randVal}`);
        }
        break;
      case RED_COLOR:
        var randVal = Math.floor(Math.random() * redDie.length);
        var startSplice = randVal - 1;
        // Avoid splicing original die, as it is destructive
        var dieFaces = [...redDie];
        gotFace = dieFaces.splice(startSplice, 1)[0];
        if (!gotFace) {
          console.error(`missing face from redDie; randVal: ${randVal}`);
        }
        break;
      default:
        var randVal = Math.floor(Math.random() * yellowDie.length);
        var startSplice = randVal - 1;
        // Avoid splicing original die, as it is destructive
        var dieFaces = [...yellowDie];
        gotFace = dieFaces.splice(startSplice, 1)[0];
        if (!gotFace) {
          console.error(`missing face from yellowDie; randVal: ${randVal}`);
        }
    }
    rolledFaces.push({die: die, face: gotFace});

    var valueToAdd = valueOfFace[gotFace];
    console.log(`*** add ${valueToAdd} for face: ${gotFace} ***`);
    scores[currentPlayerIdx] += valueToAdd;
    switch(gotFace) {
      case GOOD:
        goodCount  +=  1;
        goodDice.push(die)
        break;
      case BAD:
        badCount   +=  1;
        break;
      default:
        againCount +=  1;
        reRollDice.push(die)
        //appendLog("&nbsp;&nbsp;&nbsp; -> [system pushed " + die + " onto reRollDice: " + JSON.stringify(reRollDice) + "]");
    }
    updateScoreAndStats();
  }
  var msgs = [];
  for (var rfIdx=0; rfIdx < rolledFaces.length; rfIdx++) {
    obj = rolledFaces[rfIdx];
    var newMsg = `'${obj.face}' on ${obj.die}`
    if (0 == rfIdx) {
      newMsg = `You rolled ${newMsg}`
    }
    if (rfIdx == (rolledFaces.length - 1)) {
      newMsg = `and ${newMsg}`
    }
    msgs.push(newMsg);
  }
  appendLog(msgs.join(", "));

  if (badCount >= maxBadPerTurn) {
    scores[currentPlayerIdx] = 0;
    appendLog(`<p><b>You got greedy and wound-up collecting ${badCount} ${BAD}s, so your Total-score drops to 0<b><p>`);
    updateScoreAndStats();
    show(nextTurnButton);
    return;
  }

  if ((goodCount >= winningScore) && (!winningPlayerIdx)) {
    winningPlayerIdx = currentPlayerIdx;
    appendLog(`&nbsp;&nbsp;&nbsp;You're the first player (${currentPlayerIdx}) to reach the a winning score of: ${winningScore}`);
  }
  show(nextTurnButton);
  display(grabDiceButton);
}

function moveDieTo(dieToAdd=[], container=diceContainer) {
  for (var dieIdx=0; dieIdx<dieToAdd.length; dieIdx++) {
    var die = dieToAdd.pop();
    container.push(die)
  }
}

function fillDiceContainer(container=diceContainer) {
  for (var g=6; g>0; g--) {
    container.push(GREEN_COLOR)
    if (g > 2) {
      container.push(YELLOW_COLOR)
      if (g > 3) {
        container.push(RED_COLOR)
      }
    }
  }
}

function setupPlayers() {
  show(quitButton)
  playerCount                 = parseInt(playerCountElement.value || 1);
  playerCountElement.value    = playerCount;
  playerCountElement.disabled = true
  for(var idx                 = 0; idx<playerCount; idx++) {
    var player                = {
      scoreIdx: idx,
      number: idx + 1,
    };
    players.push(player);
    scores.push(0)
  }
}
showInstructions();
