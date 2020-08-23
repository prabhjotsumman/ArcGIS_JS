define([
  "dojo",
  "esri/dijit/LocateButton",
  "esri/geometry/Extent",
  "esri/map",
  "dojo/domReady!",
  "esri/graphic",
  "esri/geometry/Point",
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
  Point,
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
      var container = _dojo.create("div");
      var button = _dojo.create("button");
      container.appendChild(button);

      var customWidget = getCustomWidgetHTML();
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
            content.style.maxHeight = content.scrollHeight + 5 + "px";
          }
        });
      }
      var searchBtn = document.getElementById("searchButton");

      searchBtn.addEventListener("click", function () {
        let inputElements = document.querySelector(".collapsible.active");
        let queryField = inputElements.id; //GetExtentByIntersection, GetExtentByLegal : get ID
        let inputs =
          (inputElements &&
            inputElements.nextElementSibling.querySelectorAll("input")) ||
          [];
        let query = "";
        for (let i = 0; i < inputs.length; i++) {
          query += inputs[i].value + " ";
        }
        console.log(query);

        if (query.length < 1) return;

        switch (queryField) {
          case "GetExtentByIntersection":
            let firstRoad = inputs[0].value;
            let secondRoad = inputs[1].value;
            GetExtentByIntersection(firstRoad, secondRoad);
            break;

          case "GetExtentByLegal":
            let legal = query.split(" ").join("-").toUpperCase();
            GetExtentByLegal(legal);
            break;

          case "GetExtentByMunAddress":
            let houseNum = inputs[0].value;
            let roadName = inputs[1].value;
            GetExtentByMunAddress(houseNum, roadName);
            break;

          case "GetExtentByOwner":
            let firstName = inputs[0].value;
            let lastName = inputs[1].value;
            GetExtentByOwner(firstName, lastName);
            break;

          case "GetExtentByRoll":
            let rollNo = inputs[0].value;
            GetExtentByRoll(rollNo);
            break;

          case "GetExtentRoadNames":
            let roadNames = query;
            GetExtentRoadNames(roadNames);
            break;

          default:
            break;
        }
      });
    }

    function zoomTo(extent) {
      var mymap = proxy.map.get();
      mymap.extent = extent;
      mymap.width = mymap.width - 1;
    }

    // function zoomToExtent(){
    //     console.log("zoomToExtent");
    // }

    this.show = function () {
      if (!initialized) {
        initialized = true;
        var uiConfig = initUI();
        displayPanel = proxy.layout.createTrailingPanel(uiConfig);
        onload();
        // zoomTo();
        // _dojo.connect(proxy.map.get(), "onExtentChange", zoomToExtent);
        selectChild();
      } else {
        selectChild();
      }
    };

    function isValidCoordinates(coordinates) {
      return !!coordinates.filter((x) => x !== undefined).length;
    }

    function GetExtentByIntersection(firstRoad, secondRoad) {
      //DEWITTSPOND PANORAMARD
      firstRoad = removeSpaces(firstRoad).toUpperCase();
      secondRoad = removeSpaces(secondRoad).toUpperCase();

      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentByIntersection xmlns="http://tempuri.org/"><firstRoad>${firstRoad}</firstRoad><secondRoad>${secondRoad}</secondRoad></GetExtentByIntersection></s:Body></s:Envelope>`;
      console.log("Req:", XMLRequestString);

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentByIntersection",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          var [xCoord, yCoord] = xmlParser(XMLString, "a:string").map((coord) =>
            parseFloat(coord)
          );
          console.log([xCoord, yCoord]);

          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            return;
          }

          var extent = new Extent(
            xCoord - 150,
            yCoord - 50,
            xCoord + 150,
            yCoord + 80,
            new SpatialReference({ wkid: 4326 })
          );
          console.log(extent);
          zoomTo(extent);
          let point = {
            x: xCoord,
            y: yCoord,
          };
          addSymbolDeffered(point);
        } else {
          console.log("err!");
        }
      };
    }
    function GetExtentByLegal(legal) {
      //NE-11-23-28
      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentByLegal xmlns="http://tempuri.org/"><legal>${legal}</legal></GetExtentByLegal></s:Body></s:Envelope>`;

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentByLegal",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          var [xCoord, yCoord] = xmlParser(XMLString, "a:double").map((coord) =>
            parseFloat(coord)
          );
          console.log([xCoord, yCoord]);
          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            return;
          }
          var extent = new Extent(
            xCoord - 1600,
            yCoord - 1600,
            xCoord + 1600,
            yCoord + 1600,
            new SpatialReference({ wkid: 4326 })
          );
          console.log(extent);
          zoomTo(extent);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }
    function GetExtentByMunAddress(houseNum, roadName) {
      // <houseNum>262075</houseNum>
      // <roadName>ROCKY VIEW POINT</roadName>
      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentByMunAddress xmlns="http://tempuri.org/"><houseNum>${houseNum}</houseNum><roadName>${roadName}</roadName></GetExtentByMunAddress></s:Body></s:Envelope>`;

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentByMunAddress",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          var parser = new DOMParser();
          xmlDoc = parser.parseFromString(XMLString, "text/xml");

          // var Address =xmlDoc.getElementsByTagName("a:Address")[0].childNodes[0].nodeValue;
          // var ID =xmlDoc.getElementsByTagName("a:ID")[0].childNodes[0].nodeValue;
          var xCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:decX")[0].childNodes[0].nodeValue
          );
          var yCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:decY")[0].childNodes[0].nodeValue
          );

          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            return;
          }

          var extent = new Extent(
            xCoord - 120,
            yCoord - 100,
            xCoord + 120,
            yCoord + 100,
            new SpatialReference({ wkid: 4326 })
          );
          zoomTo(extent);
          let point = {
            x: xCoord,
            y: yCoord,
          };
          addSymbolDeffered(point);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }
    function GetExtentByOwner(firstName, lastName) {
      firstName = removeSpaces(firstName).toUpperCase();
      lastName = removeSpaces(lastName).toUpperCase();

      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentByOwner xmlns="http://tempuri.org/"><Owner>${lastName},%${firstName}</Owner></GetExtentByOwner></s:Body></s:Envelope>`;
      console.log("Req:", XMLRequestString);

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentByOwner",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          var parser = new DOMParser();
          let xmlDoc = parser.parseFromString(XMLString, "text/xml");

          var xCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:DecX")[0].childNodes[0].nodeValue
          );
          var yCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:DecY")[0].childNodes[0].nodeValue
          );
          // xmlDoc.getElementsByTagName("a:Owner")[0].childNodes[0].nodeValue;
          // xmlDoc.getElementsByTagName("a:OwnershipType")[0].childNodes[0].nodeValue;
          // xmlDoc.getElementsByTagName("a:Roll")[0].childNodes[0].nodeValue;
          console.log([xCoord, yCoord]);
          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            return;
          }
          var extent = new Extent(
            xCoord - 150,
            yCoord - 50,
            xCoord + 150,
            yCoord + 80,
            new SpatialReference({ wkid: 4326 })
          );
          console.log(extent);
          zoomTo(extent);

          let point = {
            x: xCoord,
            y: yCoord,
          };
          addSymbolDeffered(point);
        } else {
          console.log("err!");
        }
      };
    }

    function GetExtentByRoll(rollNo) {
      //03223504
      rollNo = removeSpaces(rollNo);

      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentByRoll xmlns="http://tempuri.org/"><roll>${rollNo}</roll></GetExtentByRoll></s:Body></s:Envelope>`;

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentByRoll",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          var parser = new DOMParser();
          let xmlDoc = parser.parseFromString(XMLString, "text/xml");

          var xCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:DecX")[0].childNodes[0].nodeValue
          );
          var yCoord = parseFloat(
            xmlDoc.getElementsByTagName("a:DecY")[0].childNodes[0].nodeValue
          );

          console.log([xCoord, yCoord]);
          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            return;
          }
          var extent = new Extent(
            xCoord - 160,
            yCoord - 100,
            xCoord + 160,
            yCoord + 100,
            new SpatialReference({ wkid: 4326 })
          );
          console.log(extent);
          zoomTo(extent);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }

    function GetExtentRoadNames(roadName) {
      roadName = removeSpaces(roadName).toUpperCase();
      XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentRoadNames xmlns="http://tempuri.org/"><roadName>${roadName}</roadName></GetExtentRoadNames></s:Body></s:Envelope>`;

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentRoadNames",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let coordinates = xmlParser(XMLString, "a:double");
          let [
            xCoordLeft,
            yCoordLeft,
            xCoordRight,
            yCoordRight,
          ] = coordinates.map((coord) => parseFloat(coord));

          let mymap = proxy.map.get();
          let wkid = mymap.spatialReference.latestWkid;

          if (
            !isValidCoordinates([
              xCoordLeft,
              yCoordLeft,
              xCoordRight,
              yCoordRight,
            ])
          ) {
            console.log("The returned result is invalid.");
            return;
          }

          var extent = new Extent(
            xCoordLeft,
            yCoordLeft,
            xCoordRight,
            yCoordRight,
            new SpatialReference({ wkid })
          );
          console.log("Extent:", extent);
          console.log("Mymap:", mymap);
          zoomTo(extent);
        } else {
          console.log("err!"); // user not found
        }
      };
    }

    function addSymbolMarker(point) {
      var iconPath =
        "M256,0.122C148.624,0.122,61.046,87.7,61.046,195.076c0,42.589,13.496,83.079,38.992,116.971 l143.964,193.955C246.099,509,251.8,512,256,512c4.5,0,9.9-3.299,11.998-5.999c0.597-0.901,145.464-196.054,146.665-197.854 c0.3,0,0.3,0,0.3-0.298c23.395-32.993,35.99-71.984,35.99-112.773C450.954,87.701,363.376,0.122,256,0.122z M256,300.051 c-57.884,0-104.975-47.089-104.975-104.975S198.116,90.101,256,90.101s104.975,47.089,104.975,104.975S313.884,300.051,256,300.051z";

      var initColor = "#ff0000";
      var graphic = new Graphic(
        new Point(point),
        createSymbol(iconPath, initColor)
      );

      console.log("Graphic", graphic);
      map = proxy.map.get();
      map.graphics.add(graphic);

      function createSymbol(path, color) {
        var markerSymbol = new SimpleMarkerSymbol();
        markerSymbol.setPath(path);
        markerSymbol.setColor(new _dojo.Color(color));
        markerSymbol.setOutline(null);
        markerSymbol.size = 45;
        return markerSymbol;
      }
    }

    function addSymbolDeffered(point) {
      setTimeout(function () {
        proxy.map.get().width = proxy.map.get().width + 1;
        addSymbolMarker(point);
      }, 500);
    }

    function xmlParser(xmlString, tag) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, "text/xml");

      var nodes = xmlDoc.getElementsByTagName(tag);
      var coordinates = [];
      for (var i = 0; i < nodes.length; i++) {
        coordinates.push(nodes[i].childNodes[0].nodeValue);
      }
      return coordinates;
    }

    function getDataFromWCFService({ XMLRequestString, SOAPAction }) {
      var xhr = null;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest(); // Mozilla, Safari, ...
      } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP"); // IE 8 and older
      }
      var URL = getServiceSvcServerURL();
      xhr.open("POST", URL, true);
      xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
      xhr.setRequestHeader(
        "SOAPAction",
        "http://tempuri.org/ISearch/" + SOAPAction
      );
      xhr.send(XMLRequestString);
      return xhr;
    }

    function getServiceSvcServerURL() {
      //return "https://ams.mdrockyview.ab.ca/cwrks.Service/Search.svc";
      return "http://devrvc-cwrks01.mdrockyview.ab.ca/cwrks.Service/Search.svc";
    }

    function removeSpaces(string) {
      return string.replace(/\s/g, "");
    }

    function getCustomWidgetHTML() {
      return ` <div>
    <div id="viewDiv"></div>
    <div id="searchWidgetDiv" class="searchWidgetContainer card">
      <form onsubmit="return false;">
        <button class="collapsible" onclick="return false;" id="GetExtentByIntersection">Search By Intersection</button>
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
        <button class="collapsible" onclick="return false;" id="GetExtentRoadNames">Search By Road Name</button>
        <div class="content">
          <div class="searchInputDiv">
            <label for="RoadName">Type Road Name</label>
            <input class="input-field" type="text" id="RoadNames" name="RoadName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentByLegal">Search By Legal Desc</button>
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
        <button class="collapsible" onclick="return false;" id="GetExtentByMunAddress">Search By Municipal Address</button>
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
        <button class="collapsible" onclick="return false;" id="GetExtentByOwner">Search By Owner</button>
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
        <button class="collapsible" onclick="return false;" id="GetExtentByRoll">Search By Roll</button>
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
    }
  };
});
