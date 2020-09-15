define([
  "dojo",
  "esri/dijit/LocateButton",
  "esri/geometry/Extent",
  "esri/graphic",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/SpatialReference",
], function (
  _dojo,
  LocateButton,
  Extent,
  Graphic,
  Point,
  SimpleMarkerSymbol,
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
      proxy.layout.addCssFile("custom", "css/autocomplete.css");
      dfd.resolve();
      return dfd;
    };

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

    function onload() {
      var coll = document.getElementsByClassName("collapsible");
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

      let inputElements = document.querySelectorAll(".input-field");

      for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].oninput = function (e) {
          autoCompleteSuggestion(e.target);
        };
      }
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
        initiateAutoComplete();
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
      firstRoad = removeSpaces(firstRoad).toUpperCase() || '';
      secondRoad = removeSpaces(secondRoad).toUpperCase() || '';

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
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';
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
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';
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
      if (!houseNum.length) houseNum = "";
      if (!roadName.length) roadName = "";

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
          let xCoord, yCoord;

          if (xmlDoc.getElementsByTagName("a:decX").length) {
            xCoord = parseFloat(
              xmlDoc.getElementsByTagName("a:decX")[0].childNodes[0].nodeValue
            );
          }
          if (xmlDoc.getElementsByTagName("a:decY").length) {
            yCoord = parseFloat(
              xmlDoc.getElementsByTagName("a:decY")[0].childNodes[0].nodeValue
            );
          }

          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';

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
      firstName = removeSpaces(firstName).toUpperCase() || "";
      lastName = removeSpaces(lastName).toUpperCase() || "";

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
          let xCoord, yCoord;

          if (xmlDoc.getElementsByTagName("a:DecX").length) {
            xCoord = parseFloat(
              xmlDoc.getElementsByTagName("a:DecX")[0].childNodes[0].nodeValue
            );
          }

          if (xmlDoc.getElementsByTagName("a:DecY").length) {
            yCoord = parseFloat(
              xmlDoc.getElementsByTagName("a:DecY")[0].childNodes[0].nodeValue
            );
          }
          // xmlDoc.getElementsByTagName("a:Owner")[0].childNodes[0].nodeValue;
          // xmlDoc.getElementsByTagName("a:OwnershipType")[0].childNodes[0].nodeValue;
          // xmlDoc.getElementsByTagName("a:Roll")[0].childNodes[0].nodeValue;
          console.log([xCoord, yCoord]);
          if (!isValidCoordinates([xCoord, yCoord])) {
            console.log("The returned result is invalid.");
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';
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
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';
          var extent = new Extent(
            xCoord - 160,
            yCoord - 100,
            xCoord + 160,
            yCoord + 100,
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
            document.getElementById("alertDialog").style.display = 'block';
            return;
          }
          document.getElementById("alertDialog").style.display = 'none';

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
          let point = {
            x: (xCoordLeft + xCoordRight)/2,
            y: (yCoordLeft + yCoordRight)/2,
          };
          // addSymbolDeffered(point);
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

    function initiateAutoComplete() {
      let Quarter = ["NE", "NW", "SE", "SW"];
      let TWP = ["21", "22", "23", "24", "25", "26", "27", "28"];
      let Rge = ["25", "26", "27", "28", "29", "1", "2", "3", "4", "5"];
      let Section = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35",
        "36",
      ]; //eslint-disabled-line

      autocomplete(document.getElementById("Quarter"), Quarter);
      autocomplete(document.getElementById("TWP"), TWP);
      autocomplete(document.getElementById("Rge"), Rge);
      autocomplete(document.getElementById("Section"), Section);
    }

    function getCustomWidgetHTML() {
      return `<div>
    <div id="viewDiv"></div>
    <div id="searchWidgetDiv" class="searchWidgetContainer card">
      <form onsubmit="return false;" autocomplete="off">
        <button class="collapsible" onclick="return false;" id="GetExtentByIntersection">Search By Intersection</button>
        <div class="content">
          <div class="searchInputDiv autocomplete autocomplete">
            <label for="firstRoad">First Road</label>
            <input data-searchbox="GetExtentByIntersection" class="input-field" type="text" id="firstRoad" name="firstRoad" placeholder="">
          </div>
          <div class="searchInputDiv autocomplete">
            <label for="secondRoad">Second Road</label>
            <input data-searchbox="GetExtentByIntersection" class="input-field" type="text" id="secondRoad" name="secondRoad" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentRoadNames">Search By Road Name</button>
        <div class="content">
          <div class="searchInputDiv autocomplete">
            <label for="RoadName">Type Road Name</label>
            <input data-searchbox="GetExtentRoadNames" class="input-field" type="text" id="RoadNames" name="RoadName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentByLegal">Search By Legal Desc</button>
        <div class="content">
          <div class="descInputDiv autocomplete">
            <label for="Quarter">Quarter</label>
            <input data-searchbox="GetExtentByLegal" class="input-field desc-field" type="text" id="Quarter" name="Quarter" placeholder="">
          </div>
          <div class="descInputDiv autocomplete">
            <label for="Section">Section</label>
            <input data-searchbox="GetExtentByLegal" class="input-field desc-field" type="text" id="Section" name="Section" placeholder="">
          </div>
          <div class="descInputDiv autocomplete">
            <label for="TWP">TWP</label>
            <input data-searchbox="GetExtentByLegal" class="input-field desc-field" type="text" id="TWP" name="TWP" placeholder="">
          </div>
          <div class="descInputDiv autocomplete">
            <label for="Rge">Rge</label>
            <input data-searchbox="GetExtentByLegal" class="input-field desc-field" type="text" id="Rge" name="Rge" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentByMunAddress">Search By Municipal
          Address</button>
        <div class="content">
          <div class="searchInputDiv autocomplete">
            <label for="houseNum">House No.</label>
            <input data-searchbox="GetExtentByMunAddress" class="input-field" type="text" id="houseNum" name="House" placeholder="">
          </div>
          <div class="searchInputDiv autocomplete">
            <label for="RoadName">Road Name</label>
            <input data-searchbox="GetExtentByMunAddress" class="input-field" type="text" id="RoadName" name="RoadName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentByOwner">Search By Owner</button>
        <div class="content">
          <div class="searchInputDiv autocomplete">
            <label for="firstName">First Name</label>
            <input data-searchbox="GetExtentByOwner" class="input-field" type="text" id="firstName" name="firstName" placeholder="">
          </div>
          <div class="searchInputDiv autocomplete">
            <label for="secondName">Last Name</label>
            <input data-searchbox="GetExtentByOwner" class="input-field" type="text" id="secondName" name="secondName" placeholder="">
          </div>
        </div>
        <button class="collapsible" onclick="return false;" id="GetExtentByRoll">Search By Roll</button>
        <div class="content">
          <div class="searchInputDiv autocomplete">
            <label for="rollNo">Type Roll Number</label>
            <input data-searchbox="GetExtentByRoll" class="input-field" type="text" id="rollNo" name="rollNo" placeholder="">
          </div>
        </div>
        <div class="search-btn-div">
          <button class="btn-search" id="searchButton" role="submit" type="submit">Search</button>
        </div>
      </form>
      <div class="alert" id="alertDialog">
        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
        <strong>Alert!</strong> No result by your input.
      </div>
    </div>
  </div>`;
    }

    function autoCompleteSuggestion(inputElement) {
      let inp = inputElement;
      let searchBox = inputElement.dataset.searchbox;
      let query = inputElement.value;
      let val = 0;

      switch (searchBox) {
        case "GetExtentByIntersection":
          let road = inp.id; //firstRoad or secondRoad
          val = inp.value;
          GetExtentByIntersection_autoComplete(inp, road, val);
          break;

        case "GetExtentByLegal":
          //handled in initialization, case written for completeness
          GetExtentByLegal_autoComplete();
          break;

        case "GetExtentByMunAddress":
          if (inp.id === "houseNum") return;
          let roadName = inp.value;
          GetExtentByMunAddress_autoComplete(inp, roadName);
          break;

        case "GetExtentByOwner":
          let name = inp.id;
          val = inp.value;
          GetExtentByOwner_autoComplete(inp, name, val);
          break;

        case "GetExtentByRoll":
          let rollNo = inp.value;
          GetExtentByRoll_autoComplete(inp, rollNo);
          break;

        case "GetExtentRoadNames":
          let roadNames = query;
          GetExtentRoadNames_autoComplete(inp, roadNames);
          break;

        default:
          break;
      }
    }

    function GetExtentByIntersection_autoComplete(inp, road, val) {
      val = removeSpaces(val) || "";
      let XMLRequestString = "";
      let XMLRequest = "";

      switch (road) {
        case "firstRoad":
          XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetFirstRoad xmlns="http://tempuri.org/"><roadName>${val}</roadName></GetFirstRoad></s:Body></s:Envelope>`;

          XMLRequest = getDataFromWCFService({
            XMLRequestString,
            SOAPAction: "GetFirstRoad",
          });
          break;

        case "secondRoad":
          let firstRoadName = document.getElementById("firstRoad").value;
          firstRoadName = removeSpaces(firstRoadName) || "";
          XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetSecondRoad xmlns="http://tempuri.org/"><roadName>${firstRoadName}</roadName><secondRoadName>${val}</secondRoadName></GetSecondRoad></s:Body></s:Envelope>`;

          XMLRequest = getDataFromWCFService({
            XMLRequestString,
            SOAPAction: "GetSecondRoad",
          });
          break;

        default:
          break;
      }

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let suggestions = xmlParser(XMLString, "a:string");

          if (suggestions.length > 30) suggestions.length = 30;
          autocomplete(inp, suggestions);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }
    function GetExtentByLegal_autoComplete() {
      //written for completeness, already handled in initilization because of static values
    }

    function GetExtentByMunAddress_autoComplete(inp, roadName) {
      roadName = removeSpaces(roadName);

      let XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRoadNameForMunAddress xmlns="http://tempuri.org/"><roadName>${roadName}</roadName></GetRoadNameForMunAddress></s:Body></s:Envelope>`;

      let XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetRoadNameForMunAddress",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let suggestions = xmlParser(XMLString, "a:string");

          if (suggestions.length > 15) suggestions.length = 15;
          autocomplete(inp, suggestions);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }

    function GetExtentByOwner_autoComplete(inp, name, val) {
      val = removeSpaces(val);
      let XMLRequestString = "";
      let XMLRequest = "";

      switch (name) {
        case "firstName":
          XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetOwerName xmlns="http://tempuri.org/"><name>${val}</name><firstOrNot>true</firstOrNot></GetOwerName></s:Body></s:Envelope>`;

          XMLRequest = getDataFromWCFService({
            XMLRequestString,
            SOAPAction: "GetOwerName",
          });
          break;

        case "lastName":
          XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetOwerName xmlns="http://tempuri.org/"><name>${val}</name><firstOrNot>false</firstOrNot></GetOwerName></s:Body></s:Envelope>`;

          XMLRequest = getDataFromWCFService({
            XMLRequestString,
            SOAPAction: "GetOwerName",
          });
          break;

        default:
          break;
      }

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let suggestions = xmlParser(XMLString, "a:string");

          if (suggestions.length > 15) suggestions.length = 15;
          autocomplete(inp, suggestions);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }

    function GetExtentByRoll_autoComplete(inp, rollNo) {
      let XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRoll xmlns="http://tempuri.org/"><roll>${rollNo}</roll></GetRoll></s:Body></s:Envelope>`;

      //03223504
      rollNo = removeSpaces(rollNo);

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetRoll",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let suggestions = xmlParser(XMLString, "a:string");

          if (suggestions.length > 15) suggestions.length = 15;
          autocomplete(inp, suggestions);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
    }

    function GetExtentRoadNames_autoComplete(inp, roadNames) {
      let XMLRequestString = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRoadNameForRoadnet xmlns="http://tempuri.org/"><roadName>${roadNames}</roadName></GetRoadNameForRoadnet></s:Body></s:Envelope>`;

      //ANDREW HEIGHT SPL
      roadNames = removeSpaces(roadNames);

      var XMLRequest = getDataFromWCFService({
        XMLRequestString,
        SOAPAction: "GetRoadNameForRoadnet",
      });

      XMLRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          console.log("DATA:", this.response);
          let XMLString = this.response;
          let suggestions = xmlParser(XMLString, "a:string");

          if (suggestions.length > 15) suggestions.length = 15;
          autocomplete(inp, suggestions);
        } else {
          console.log("err!", this.response); // user not found
        }
      };
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
        console.log("arr suggest", arr);
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
            b.innerHTML =
              "<strong>" + arr[i].substr(0, val.length) + "</strong>";
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
  };
});
