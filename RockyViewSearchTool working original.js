define([
  "dojo",
  "esri/dijit/LocateButton",
  "esri/geometry/Extent",
  "esri/map",
  "dojo/domReady!",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/tasks/GeometryService",
  "esri/tasks/ProjectParameters",
  "esri/SpatialReference",
], function (
  _dojo,
  LocateButton,
  Extent,
  Map,
  dom,
  Graphic,
  SimpleMarkerSymbol,
  GeometryService,
  ProjectParameters,
  SpatialReference
) {
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
    <div id="searchWidgetDiv" class="searchWidgetContainer card">
      <form onsubmit="return false;">
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
            <label for="RoadName">Type Road Name</label>
            <input class="input-field" type="text" id="RoadName" name="RoadName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Legal Desc</button>
        <div class="content">
          <div class="descInputDiv">
            <label for="Quarter">Quarter</label>
            <input class="input-field desc-field" type="text" id="Quarter" name="Quarter" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="Section">Section</label>
            <input class="input-field desc-field" type="text" id="Section" name="Section" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="TWP">TWP</label>
            <input class="input-field desc-field" type="text" id="TWP" name="TWP" placeholder="">
          </div>
          <div class="descInputDiv">
            <label for="Rge">Rge</label>
            <input class="input-field desc-field" type="text" id="Rge" name="Rge" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Municipal Address</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="House">House No.</label>
            <input class="input-field" type="text" id="House" name="House" placeholder="">
          </div>
          <div class="searchInputDiv">
            <label for="RoadName">Road Name</label>
            <input class="input-field" type="text" id="RoadName" name="RoadName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Owner</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="firstName">First Name</label>
            <input class="input-field" type="text" id="firstName" name="firstName" placeholder="">
          </div>
          <div class="searchInputDiv">
            <label for="secondName">Last Name</label>
            <input class="input-field" type="text" id="secondName" name="secondName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;">Search By Roll</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="rollNo">Type Roll Number</label>
            <input class="input-field" type="text" id="rollNo" name="rollNo" placeholder="">
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

      //map.zoomToFullExtent();
      var mymap = proxy.map.get();
      var geometry = proxy.geometry;
      console.log("proxy v:", proxy);
      console.log("mymap v:", mymap);
      //console.log("geometry v:",geometry);
      //geometry.project(-23620.374,5674364.204);
      //geometry.getCenter();
      //console.log("Utils:",Utils);

      //console.log("GeometryService:",GeometryService);
      //console.log("graphicsUtils:",graphicsUtils.getGeometries ());[]
      //console.log("MapView:",MapView);

      //console.log("map layers:",mymap.layers.all);
      //proxy.map.zoomToGeometry(-23620.374,5674364.204,-22881.483,5674389.829);
      //proxy.map.zoomToGeometry(-23620.374,5674364.204);
      //console.log("esriConfig :",esriConfig);
      config.content = container;
      return config;
    }

    function selectChild() {
      proxy.layout.toggleRegion({ region: "trailing", expanded: true });
      proxy.layout.selectChild(displayPanel);
    }

    this.init = function () {
      var dfd = proxy.utility.deferred();
      proxy.layout.addCssFile("custom", "css/styles.css");
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
      var searchBtn = document.getElementById("searchButton");

      searchBtn.addEventListener("click", function () {
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
      });
    }

    function zoomTo() {
      console.log("--------------");
      var mymap = proxy.map.get();
      var extent = new Extent(
        -23620.374,
        5674364.204,
        -22881.483,
        5674389.829,
        new SpatialReference({ wkid: 4326 })
      );
      //mymap.zoomToGeometry(extent);
      mymap.extent = extent;
      console.log("EX", extent);
    }

    
    this.show = function () {
      if (!initialized) {
        //We will create the UI here before showing it
        initialized = true;
        var uiConfig = initUI();
        displayPanel = proxy.layout.createTrailingPanel(uiConfig);
        onload();
        zoomTo();
        selectChild();
      } else {
        //The UI is already created so just show it
        selectChild();
      }
    };
  };
});
