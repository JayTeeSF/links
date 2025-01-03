var centerAlignKey = "center";
var leftAlignKey = "left";
var alignmentState = centerAlignKey;
var everySideRowAry = [0];
var firstPreviousRowAry = [];
var firstRowAry = [1];
var displayState = false;
var greyColor = "grey";
var cyanColor = "cyan";
var defaultNumRows = 10;
var defaultSierpinskiRows = 31;
var oddTypeKey = "odd";
var evenTypeKey = "even";

function doPrint(direction=centerAlignKey, numRows=defaultNumRows) {
  var element = document.getElementById("numRowsToPrint");
  if (element !== null) {
    if (element.value == null || element.value == "") {
      element.value = numRows;
    }
    numRows = element.value
  } else {
    alert("Unable to find input field; printing 10 rows by default");
    numRows = numRows;
  }
  printTriangle(numRows, direction);
}

function alignCenter() {
  console.log("aligning center...")
  alignmentState = centerAlignKey;
}

function alignLeft() {
  console.log("aligning left...")
  alignmentState = leftAlignKey;
}

function align() {
  console.log("aligning to " + alignmentState);
  var x = document.getElementsByClassName("divblock");
  var i;
  for (i = 0; i < x.length; i++) {
    x[i].style["text-align"] = alignmentState;
  }
}

function squares(numberTypeKey=oddTypeKey) {
  alignLeft();
  if (false == displayState) {
    doPrint(leftAlignKey)
  }
  align();
  shadeSquares(numberTypeKey);
}

function sierpinskiTriangle(numberTypeKey=oddTypeKey) {
  alignCenter();
  if (false == displayState) {
    doPrint(centerAlignKey, defaultSierpinskiRows)
  }
  align();
  shadeSierpinski(numberTypeKey);
}

function shadeSquares(numberTypeKey=oddTypeKey) {
  // hopefully in order ?!
  var row = document.getElementsByClassName("divblock");
  var i;
  for (i = 0; i < x.length; i++) {
    var rowElements = row[i].getElementsByClassName("block");
    // ignore first & last column (starting from Row 2) i.e. if they == 1
    // second col is the ordinal-number: highlight it
    // sum rows for powers of 2
  }
}

function shadeSierpinski(numberTypeKey=oddTypeKey) {
  var x = document.getElementsByClassName("block");
  var i;
  for (i = 0; i < x.length; i++) {
    var value = parseInt(x[i].innerText);
    if (isOdd(value)) {
      if (numberTypeKey == oddTypeKey) {
        x[i].style.background = greyColor;
      } else {
        x[i].style.background = cyanColor;
      }
    } else {
      if (numberTypeKey == oddTypeKey) {
        x[i].style.background = cyanColor;
      } else {
        x[i].style.background = greyColor;
      }
    }
  }
}

// html calls triangle ...read this file from top to bottom
function printTriangle(numRowsToPrintAsString, direction) {
  numRowsToPrint = parseInt(numRowsToPrintAsString);
  clearTriangle();
  if (direction == leftAlignKey) {
    alignLeft();
  } else if (direction == centerAlignKey) {
    alignCenter();
  }
  //console.log("numRowsToPrint: " + numRowsToPrint);
  var row;
  var previousRow = {
    previousRowAry: firstPreviousRowAry
  };

  for (var i = 0; i < numRowsToPrint; i++) {
    previousRow.idx = i;
    row = rowAfter(previousRow.previousRowAry);
    print(row);
    previousRow.previousRowAry = row;
  }
  align();
  console.log("displaying triangle");
  displayState = true;
}

function rowAfter(previousRowAry) {
  var sortedPreviousRowAry = [...previousRowAry].sort()
  var isEqual = (JSON.stringify(sortedPreviousRowAry) === JSON.stringify(firstPreviousRowAry.sort()));

  if (isEqual) {
    return firstRowAry;
  }

  var result = [];
  var previousRowWithZeros = [...everySideRowAry, ...previousRowAry, ...everySideRowAry];

  //console.log("previousRowWithZeros: " + JSON.stringify(previousRowWithZeros));
  var consAry = eachCons(previousRowWithZeros, 2);

  //console.log("consAry: " + JSON.stringify(consAry));
  //console.log(JSON.stringify(previousRowWithZeros) + "--->");
  for (var i = 0; i < consAry.length; i++) {
    var pairs = consAry[i];
    var p1 = pairs[0];
    var p2 = pairs[1];
    var sum = parseInt(pairs[0]) + parseInt(pairs[1]);
    //console.log("pairs: " + JSON.stringify(pairs) + " (p1: " + p1 + ", p2: " + p2 + " => " + sum + ")");

    result.push(sum);
  }
  //console.log("<-- " + JSON.stringify(result));

  return result;
}

function clearTriangle() {
  //console.log("clearing...");
  var outputLocation = document.getElementById("triangle");
  outputLocation.innerHTML = "";
  console.log("cleared triangle");
  displayState = false;
}

function print(row) {
  var outputLocation = document.getElementById("triangle");

  //var printableRow = [...everySideRowAry, ...row, ...everySideRowAry];

  //console.log(JSON.stringify(printableRow));

  var printableRowString = '<span class="block">' + row.join('</span><span class="block">') + "</span>";

  outputLocation.innerHTML += '<div class="divblock">' + printableRowString + "</div> <br />";
}

function eachCons(a, n) {
  var r = []
  for (var i = 0; i < a.length - n + 1; i++) {
    r.push(range(a, i, n))
  }
  return r
}

function range(a, i, n) {
  var r = []
  for (var j = 0; j < n; j++) {
    r.push(a[i + j])
  }
  return r
}

function isEven(n) {
  return n % 2 == 0;
}

function isOdd(n) {
  return Math.abs(n % 2) == 1;
}
