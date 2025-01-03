// read this file from bottom to top

// trimmed-output:
// http://localhost:3000/planner/?top_one=on&top_one_txt=top+one+is+checked&quote_one_txt=Roses+are+red,+violets+are+blue&top_two_text=top+two+is+not+checked&quote_two_txt=++++++++++++++Ano+Ne+Mus&six_am_txt=six+am+txt+is+filled+in&six_am=on&six_am_todo_txt=six+am+todo+is+filled-in+and+checked&seven_am_txt=seven+am+txt+is+filled+in&seven_am_todo_txt=seven+am+todo+is+filled-in+but+NOT+checked&nine_am_txt=I+woke+up+and+then+I+did+other+stuff&tonight_one=tonight+one&tonight_two=and+by+the+way+tonight+I%27m+gonna+do+stuff+and+write+in+this+space+with+no+lines&gratitude_two=gratitude+two&dateLine=Sunday,+June+9

var gDateLine = document.getElementById("dateLine");
var gMainForm = document.getElementById("mainForm");
var urlParams = new URLSearchParams(window.location.search);
var gFormattedDate = null;

// intercept the normal submit button ...and instead trim-down the data before submitting it:
gMainForm.addEventListener("submit", function(e) {
  e.preventDefault();

  var elements = gMainForm.elements;
  var obj ={};
  for(var i = 0; i < elements.length; i++){
    var item = elements.item(i);
    if ((item.value) && (item.name)) {
      if (("on" != item.value) || (item.checked))  {
        obj[item.name] = item.value;
        //else: console.log("checkbox: " + item.name + " = " + item.value);
      }
    }
  }

  var queryString = Object.keys(obj).map(function(key) {
    return key + '=' + obj[key]
  }).join('&');
  queryString = queryString.replace(/\s/g, "+");

  //console.log("Qstring: " + queryString);
  window.location.href = "?" + queryString;
});


function formattedDate() {
  if (gFormattedDate) {
    return gFormattedDate;
  }

  var d = new Date();
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  gFormattedDate = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();

  return gFormattedDate;
}

function init() {
  var entries = urlParams.entries();
  var el;

  var x               = document.createElement("INPUT");

  x.setAttribute("type", "hidden");
  x.setAttribute("name", "dateLine");
  gMainForm.appendChild(x);

  for(pair of entries) {
    if ("dateLine" == pair[0]) {
      console.log("special-set " + pair[0] + " to " + pair[1]); 
      gFormattedDate = pair[1];
      document.getElementsByName(pair[0])[0].value = pair[1];
    } else {
      if (pair[1]) {
        console.log("set " + pair[0] + " to " + pair[1]); 
        el = document.getElementsByName(pair[0])[0];
        switch(pair[1]) {
          case "on":
            el.checked = true;
            break;
          default:
            el.value = pair[1];
        }
      }
    }
  }

  var fd              = formattedDate();
  x.setAttribute("value", fd);

  gDateLine.innerHTML = fd;
}

init();
