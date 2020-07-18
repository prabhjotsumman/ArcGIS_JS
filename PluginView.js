require(["esri/Map", "esri/views/MapView", "esri/widgets/Search"], function (
  Map,
  MapView,
  Search,
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

    // Find address
    view.on("click", function (evt) {
      view.popup.clear();
      if (searchByIntersection.activeSource) {
        var geocoder = searchByIntersection.activeSource.locator; // World geocode service
        var params = {
          location: evt.mapPoint,
        };
        geocoder.locationToAddress(params).then(
          function (response) {
            // Show the address found
            var address = response.address;
            showPopup(address, evt.mapPoint);
          },
          function (err) {
            // Show no address found
            showPopup("No address found.", evt.mapPoint);
          }
        );
      }
    });
    //2. Search By Road Name
    var searchByRoadName = new Search({
      view: view,
    });

    searchByRoadName.watch("activeSource", function (evt) {
      evt.placeholder = "search by Road Name";
    });

    view.ui.add(searchByRoadName, "top-right"); // Add to the map

    function showPopup(address, pt) {
      view.popup.open({
        title:
          +Math.round(pt.longitude * 100000) / 100000 +
          ", " +
          Math.round(pt.latitude * 100000) / 100000,
        content: address,
        location: pt,
      });
    }
    
  });
