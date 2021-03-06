define(["dojo", "esri/dijit/LocateButton"], function (_dojo, LocateButton) {
  return function (proxy, cfg) {
    var initialized = false,
      displayPanel;

    function initUI() {
      var config = { label: cfg.title, title: cfg.title };
      console.log("initUI: n", container);
      var container = _dojo.create("div");
      var button = _dojo.create("button");
      container.appendChild(button);

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

      container.innerHTML = customWidget;

      var locateButton = new LocateButton({ map: proxy.map.get() }, button);
      locateButton.startup();

      config.content = container;
      return config;
    }

    function selectChild() {
      proxy.layout.toggleRegion({ region: "trailing", expanded: true });
      proxy.layout.selectChild(displayPanel);
    }

    this.init = function () {
      var dfd = proxy.utility.deferred();
      dfd.resolve();
      return dfd;
    };

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

    function onload() {
      var coll = document.getElementsByClassName("collapsible");
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

    this.show = function () {
      if (!initialized) {
        //We will create the UI here before showing it
        initialized = true;
        var uiConfig = initUI();
        displayPanel = proxy.layout.createTrailingPanel(uiConfig);
        onload();
        selectChild();
      } else {
        //The UI is already created so just show it
        selectChild();
      }
    };
  };
});
