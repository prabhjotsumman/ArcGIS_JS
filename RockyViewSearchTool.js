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
            content.style.maxHeight = content.scrollHeight + "px";
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
            GetExtentByOwner();
            break;

          case "GetExtentByRoll":
            GetExtentByRoll();
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
    }

    this.show = function () {
      if (!initialized) {
        initialized = true;
        var uiConfig = initUI();
        displayPanel = proxy.layout.createTrailingPanel(uiConfig);
        onload();
        // zoomTo();
        selectChild();
      } else {
        selectChild();
      }
    };

    function GetExtentByIntersection(firstRoad, secondRoad) {
      firstRoad = removeSpaces(firstRoad).toUpperCase();
      secondRoad = removeSpaces(secondRoad).toUpperCase();

      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
          <s:Body>
            <GetExtentByIntersection xmlns="http://tempuri.org/">
              <firstRoad>${firstRoad}</firstRoad>
              <secondRoad>${secondRoad}</secondRoad>
            </GetExtentByIntersection>
          </s:Body>
        </s:Envelope>;`;

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
          var extent = new Extent(
            xCoord - 100,
            yCoord - 100,
            xCoord + 100,
            yCoord + 100,
            new SpatialReference({ wkid: 4326 })
          );
          console.log(extent);
          zoomTo(extent);
        } else {
          console.log("err!", this.response);
        }
      };
    }
    function GetExtentByLegal(legal) {
      //NE-11-23-28
      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
          <s:Body>
            <GetExtentByLegal xmlns="http://tempuri.org/">
              <legal>${legal}</legal>
            </GetExtentByLegal>
          </s:Body>
        </s:Envelope>`;

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
          var extent = new Extent(
            xCoord - 100,
            yCoord - 100,
            xCoord + 100,
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
    function GetExtentByMunAddress(houseNum, roadName) {
      // <houseNum>262075</houseNum>
      // <roadName>ROCKY VIEW POINT</roadName>
      var XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
          <s:Body>
            <GetExtentByMunAddress xmlns="http://tempuri.org/">
              <houseNum>${houseNum}</houseNum>
              <roadName>${roadName}</roadName>
            </GetExtentByMunAddress>
          </s:Body>
        </s:Envelope>;`;

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

          // <a:spGetXYCoordByMunicipalAddress_Result>
          //   <a:Address>262075 ROCKY VIEW POINT</a:Address>
          //   <a:ID>147729</a:ID>
          //   <a:decX>4186.05010000</a:decX>
          //   <a:decY>5675612.05520000</a:decY>
          // </a:spGetXYCoordByMunicipalAddress_Result>;

          var extent = new Extent(
            xCoord - 100,
            yCoord - 100,
            xCoord + 100,
            yCoord + 100,
            new SpatialReference({ wkid: 4326 })
          );
          zoomTo(extent);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }
    function GetExtentByOwner() {}

    function GetExtentByRoll() {}

    function GetExtentRoadNames(roadName) {
      roadName = removeSpaces(roadName).toUpperCase();
      XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetExtentRoadNames xmlns="http://tempuri.org/"><roadName>${roadName}</roadName></GetExtentRoadNames></s:Body></s:Envelope>`;

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetExtentRoadNames",
      });

      var extenttest = new Extent(
        -22116.465,
        5658724.99,
        -21845.465,
        5658726.99,
        new SpatialReference({ wkid: 4326 })
      );
      console.log("Extent:", extenttest);

      zoomTo(extenttest);

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = XMLResponse.response;
          let coordinates = xmlParser(XMLString, "a:double");
          let [
            xCoordLeft,
            yCoordLeft,
            xCoordRight,
            yCoordRight,
          ] = coordinates.map((coord) => parseFloat(coord));
          console.log("Got response back,", coordinates);
          console.log(
            "Got response back::,",
            xCoordLeft,
            yCoordLeft,
            xCoordRight,
            yCoordRight
          );
          var extent = new Extent(
            xCoordLeft,
            yCoordLeft,
            xCoordRight,
            yCoordRight,
            new SpatialReference({ wkid: 4326 })
          );
          console.log("Extent:", extent);
          zoomTo(extent);
        } else {
          console.log("err!"); // user not found
        }
      };
    }

    function addSymbolMarker() {
      var iconPath =
        "M24.0,2.199C11.9595,2.199,2.199,11.9595,2.199,24.0c0.0,12.0405,9.7605,21.801,21.801,21.801c12.0405,0.0,21.801-9.7605,21.801-21.801C45.801,11.9595,36.0405,2.199,24.0,2.199zM31.0935,11.0625c1.401,0.0,2.532,2.2245,2.532,4.968S32.4915,21.0,31.0935,21.0c-1.398,0.0-2.532-2.2245-2.532-4.968S29.697,11.0625,31.0935,11.0625zM16.656,11.0625c1.398,0.0,2.532,2.2245,2.532,4.968S18.0555,21.0,16.656,21.0s-2.532-2.2245-2.532-4.968S15.258,11.0625,16.656,11.0625zM24.0315,39.0c-4.3095,0.0-8.3445-2.6355-11.8185-7.2165c3.5955,2.346,7.5315,3.654,11.661,3.654c4.3845,0.0,8.5515-1.47,12.3225-4.101C32.649,36.198,28.485,39.0,24.0315,39.0z";

      var initColor = "#ce641d";
      let point = { x: -22116.465, y: 5658724.99 };
      var graphic = new Graphic(
        new Point(point),
        createSymbol(iconPath, initColor)
      );
      var map = proxy.map.get();
      map.graphics.add(graphic);

      function createSymbol(path, color) {
        var markerSymbol = new SimpleMarkerSymbol();
        markerSymbol.setPath(path);
        markerSymbol.setColor(new dojo.Color(color));
        markerSymbol.setOutline(null);
        return markerSymbol;
      }
    }

    function xmlParser(xmlString, tag) {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, "text/xml");

      var nodes = xmlDoc.getElementsByTagName(tag);
      var coordinates = [];
      for (var i = 0; i < nodes.length; i++) {
        values.push(nodes[i].childNodes[0].nodeValue);
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
            <input class="input-field" type="text" id="RoadName" name="RoadName" placeholder="">
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
