var _view;
require(["esri/Map", "esri/views/MapView", "esri/widgets/Search"], function (
  Map,
  MapView,
  Search
) {
  var map = new Map({
    basemap: "topo-vector",
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-113.93518, 51.18236], //Rocky View CA
    zoom: 13,
  });
  _view = view;
  // Add Search widget
  //1. Search By Intersection
  // Example: Find a simple street intersection (W Park Ave and Tennessee St, Redlands, CA)
  //  In this searchWidget, we can directly enter the:
  // firstRoad and second Road
  // with "and" in between and it will show you the intersection
  var searchByIntersection = new Search({
    view: view,
  });

  searchByIntersection.watch("activeSource", function (evt) {
    evt.placeholder = "search by Intersection";
  });

  view.ui.add(searchByIntersection, "top-right"); // Add to the map

  // Find address when a user click anywhere on the map
  view.on("click", function (evt) {
    view.popup.clear();
    if (searchByIntersection.activeSource) {
      var geocoder = searchByIntersection.activeSource.locator; // World geocode service
      var params = {
        location: evt.mapPoint,
      };
      geocoder.locationToAddress(params).then(
        function (response) {
          var address = response.address;
          showPopup(address, evt.mapPoint);
        },
        function (err) {
          showPopup("No address found.", evt.mapPoint);
        }
      );
    }
  });

  function showPopup(address, pt) {
    console.log(address, pt.longitude, pt.latitude);
    view.popup.open({
      title:
        +Math.round(pt.longitude * 100000) / 100000 +
        ", " +
        Math.round(pt.latitude * 100000) / 100000,
      content: address,
      // location: pt,
    });
  }
});
// https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm

// function SearchByIntersection(address) {
//   axios
//     .get(
//       "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&outFields=Addr_type&forStorage=false&SingleLine=W%20Park%20Ave%20and%20Tennessee%20St%2C%20Redlands%2C%20CA"
//     )
//     .then((response) => {
//       const users = response.data.data;
//       console.log(`GET list users`, users);
//     })
//     .catch((error) => console.error(error));
// }

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
};

function closeWidget() {
  document.getElementById("searchWidgetDiv").style.display = "none";
}

function toggetCustomSearchWidget() {
  document.getElementById("searchWidgetDiv").style.display = "block";
}
function search() {
  //HTMLCollection(2) [div.searchInputDiv, div.searchInputDiv]
  let inputElements = document
    .querySelector(".collapsible.active")
    .nextElementSibling.querySelectorAll("input");

  let query = "";
  for (let i = 0; i < inputElements.length; i++) {
    // console.log(inputElements[i].value);
    query += inputElements[i].value + " ";
  }
  console.log(query);

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
