// var _view;
// var _esriSearchWidget;
// var _showPopup;
// require(["dojo"], function (_dojo) {
//   console.log("in here");
//   return function (proxy, cfg) {
//     this.init = function () {
//       var dfd = proxy.utility.deferred();
//       dfd.resolve();
//       return dfd;
//     };

//     function initUI() {
//       console.log("initUI:", container);
//       var config = { label: cfg.title, title: cfg.title };

//       var container = _dojo.create("div");
//       var button = _dojo.create("button");

//       var customWidget = ` <div>
//     <div id="viewDiv"></div>
//     <div id="openSearchWidgetDiv" onclick="toggetCustomSearchWidget()"><i class="search-icon fa fa-search"></i></div>
//     <div id="searchWidgetDiv" class="searchWidgetContainer card">
//       <div id="boxTitle" class="box-title">Rocky View
//         <div class="btn-close" onclick="closeWidget();"></div>
//       </div>
//       <form onsubmit="search(); return false;">
//         <button class="collapsible" onclick="return false;">Search By Intersection</button>
//         <div class="content">
//           <div class="searchInputDiv">
//             <label for="firstRoad">First Road</label>
//             <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//           <div class="searchInputDiv">
//             <label for="secondRoad">Second Road</label>
//             <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
//           </div>
//         </div>
//         <button class="collapsible" onclick="return false;">Search By Road Name</button>
//         <div class="content">
//           <div class="searchInputDiv">
//             <label for="firstRoad">Type Road Name</label>
//             <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//         </div>
//         <button class="collapsible" onclick="return false;">Search By Legal Desc</button>
//         <div class="content">
//           <div class="descInputDiv">
//             <label for="firstRoad">Quarter</label>
//             <input class="input-field desc-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//           <div class="descInputDiv">
//             <label for="secondRoad">Section</label>
//             <input class="input-field desc-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
//           </div>
//           <div class="descInputDiv">
//             <label for="firstRoad">TWP</label>
//             <input class="input-field desc-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//           <div class="descInputDiv">
//             <label for="secondRoad">Rge</label>
//             <input class="input-field desc-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
//           </div>
//         </div>
//         <button class="collapsible" onclick="return false;">Search By Municipal Address</button>
//         <div class="content">
//           <div class="searchInputDiv">
//             <label for="firstRoad">House No.</label>
//             <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//           <div class="searchInputDiv">
//             <label for="secondRoad">Road Name</label>
//             <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
//           </div>
//         </div>
//         <button class="collapsible" onclick="return false;">Search By Owner</button>
//         <div class="content">
//           <div class="searchInputDiv">
//             <label for="firstRoad">First Name</label>
//             <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//           <div class="searchInputDiv">
//             <label for="secondRoad">Second Name</label>
//             <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
//           </div>
//         </div>
//         <button class="collapsible" onclick="return false;">Search By Roll</button>
//         <div class="content">
//           <div class="searchInputDiv">
//             <label for="firstRoad">Type Roll Number</label>
//             <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
//           </div>
//         </div>
//         <div class="search-btn-div">
//           <button class="btn-search" id="searchButton" role="submit" type="submit">Search</button>
//         </div>
//       </form>
//     </div>
//   </div>`;

//       container.appendChild(button);
//       container.innerHTML = customWidget;
//       config.content = container;
//       return config;
//     }

//     function selectChild() {
//       proxy.layout.toggleRegion({ region: "trailing", expanded: true });
//       proxy.layout.selectChild(displayPanel);
//     }

//     this.show = function () {
//       console.log("show");
//       if (!initialized) {
//         //We will create the UI here before showing it
//         initialized = true;
//         var uiConfig = initUI();
//         displayPanel = proxy.layout.createTrailingPanel(uiConfig);
//         selectChild();
//       } else {
//         //The UI is already created so just show it
//         selectChild();
//       }
//     };
//   };
// });

let coll = document.getElementsByClassName("collapsible");

function collapseAll() {
  let options = document.querySelectorAll(".collapsible.active");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("active");
    let content = options[i].nextElementSibling;
    content.style.overflow = "hidden";
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    }
  }
}

window.onload = () => {
  for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      collapseAll();

      let classList = this.classList;
      let content = this.nextElementSibling;

      classList.toggle("active");
      if ("activeElement" in document) document.activeElement.blur();

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
  dragElement(document.getElementById("searchWidgetDiv"));

  let inputElements = document.querySelectorAll(".input-field");

  for (let i = 0; i < inputElements.length; i++) {
    inputElements[i].onclick = function (e) {
      this.focus();
    };

    inputElements[i].oninput = function(e) {
      console.log(e.target.dataset.box);
      console.log(e.target.value);
    }
  }
};

function closeWidget() {
  document.getElementById("searchWidgetDiv").style.display = "none";
}

function toggetCustomSearchWidget() {
  document.getElementById("searchWidgetDiv").style.display = "block";
}
function search() {
  //HTMLCollection(2) [div.searchInputDiv, div.searchInputDiv]
  let inputElements = document.querySelector(".collapsible.active");

  console.log(inputElements.id);

  let inputs =
    (inputElements &&
      inputElements.nextElementSibling.querySelectorAll("input")) ||
    [];

  let query = "";
  for (let i = 0; i < inputs.length; i++) {
    // console.log(inputs[i].value);
    query += inputs[i].value + " ";
  }
  console.log(query);
  // searchQueryInEsriWidget(query);
}

function searchQueryInEsriWidget(query) {
  if (query.length) {
    _esriSearchWidget.focus();
    _esriSearchWidget.searchTerm = query;
    _esriSearchWidget.suggest();
    _esriSearchWidget.search();
  }
}

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id)) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id).onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    inp.parentElement.parentElement.style.overflow = "unset";
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    x.parentElement.parentElement.style.overflow = "hidden";
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

/*An array containing all the country names in the world:*/
var countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antigua & Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia & Herzegovina",
  "Botswana",
  "Brazil",
  "British Virgin Islands",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Cayman Islands",
  "Central Arfrican Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Cote D Ivoire",
  "Croatia",
  "Cuba",
  "Curacao",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Falkland Islands",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Polynesia",
  "French West Indies",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macau",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauro",
  "Nepal",
  "Netherlands",
  "Netherlands Antilles",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Reunion",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Pierre & Miquelon",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "St Kitts & Nevis",
  "St Lucia",
  "St Vincent",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor L'Este",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks & Caicos",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States of America",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Virgin Islands (US)",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("firstRoad"), countries);
autocomplete(document.getElementById("secondRoad"), countries);
autocomplete(document.getElementById("RoadNames"), countries);
autocomplete(document.getElementById("Quarter"), countries);
autocomplete(document.getElementById("Section"), countries);
autocomplete(document.getElementById("TWP"), countries);
autocomplete(document.getElementById("Rge"), countries);
autocomplete(document.getElementById("House"), countries);
autocomplete(document.getElementById("RoadName"), countries);
autocomplete(document.getElementById("firstName"), countries);
autocomplete(document.getElementById("secondName"), countries);
autocomplete(document.getElementById("rollNo"), countries);