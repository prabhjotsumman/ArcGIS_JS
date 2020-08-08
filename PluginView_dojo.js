require(["dojo"], function (_dojo) {
  console.log("in here");
  return function (proxy, cfg) {
    this.init = function () {
      var dfd = proxy.utility.deferred();
      proxy.layout.addCssFile("custom", "css/styles.css");
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