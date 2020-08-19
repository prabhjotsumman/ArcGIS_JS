var _view;
var _esriSearchWidget;
var _showPopup;
require(["dojo"], function (_dojo) {
  console.log("in here");
  return function (proxy, cfg) {
    this.init = function () {
      var dfd = proxy.utility.deferred();
      dfd.resolve();
      return dfd;
    };

    function initUI() {
      console.log("initUI:", container);
      var config = { label: cfg.title, title: cfg.title };

      var container = _dojo.create("div");
      var button = _dojo.create("button");

      var customWidget = ` <div>
    <div id="viewDiv"></div>
    <div id="openSearchWidgetDiv" onclick="toggetCustomSearchWidget()"><i class="search-icon fa fa-search"></i></div>
    <div id="searchWidgetDiv" class="searchWidgetContainer card">
      <div id="boxTitle" class="box-title">Rocky View
        <div class="btn-close" onclick="closeWidget();"></div>
      </div>
      <form onsubmit="search(); return false;">
        <button class="collapsible" onclick="return false;">Search By Intersection</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstRoad">First Road</label>
            <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="searchInputDiv">
            <label for="secondRoad">Second Road</label>
            <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Road Name</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstRoad">Type Road Name</label>
            <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Legal Desc</button>
        <div class="content">
          <div class="descInputDiv">
            <label for="firstRoad">Quarter</label>
            <input class="input-field desc-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="secondRoad">Section</label>
            <input class="input-field desc-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="firstRoad">TWP</label>
            <input class="input-field desc-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="secondRoad">Rge</label>
            <input class="input-field desc-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Municipal Address</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstRoad">House No.</label>
            <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="searchInputDiv">
            <label for="secondRoad">Road Name</label>
            <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Owner</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstRoad">First Name</label>
            <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="searchInputDiv">
            <label for="secondRoad">Second Name</label>
            <input class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Roll</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstRoad">Type Roll Number</label>
            <input class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
        </div>
        <div class="search-btn-div">
          <button class="btn-search" id="searchButton" role="submit" type="submit">Search</button>
        </div>
      </form>
    </div>
  </div>`;

      container.appendChild(button);
      container.innerHTML = customWidget;
      config.content = container;
      return config;
    }

    function selectChild() {
      proxy.layout.toggleRegion({ region: "trailing", expanded: true });
      proxy.layout.selectChild(displayPanel);
    }

    this.show = function () {
      console.log("show");
      if (!initialized) {
        //We will create the UI here before showing it
        initialized = true;
        var uiConfig = initUI();
        displayPanel = proxy.layout.createTrailingPanel(uiConfig);
        selectChild();
      } else {
        //The UI is already created so just show it
        selectChild();
      }
    };
  };
});

let coll = document.getElementsByClassName("collapsible");

function collapseAll() {
  let options = document.querySelectorAll(".collapsible.active");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("active");
    let content = options[i].nextElementSibling;
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
