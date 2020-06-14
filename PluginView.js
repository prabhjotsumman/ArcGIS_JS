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
      center: [-0.12652, 51.51005], //london
      zoom: 13,
    });

    // Add Search widget
    //1. Search By Intersection
    var searchByIntersection = new Search({
      view: view,
    });

    searchByIntersection.watch("activeSource", function (evt) {
      evt.placeholder = "search by Intersection";
    });

    view.ui.add(searchByIntersection, "top-right"); // Add to the map

    // Find address
    view.on("click", function (evt) {
      searchByIntersection.clear();
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

    // Find address
    view.on("click", function (evt) {
      searchByRoadName.clear();
      view.popup.clear();
      if (searchByRoadName.activeSource) {
        var geocoder = searchByRoadName.activeSource.locator; // World geocode service
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
    //3. Search By Legal Desc
    var searchByLegalDesc = new Search({
      view: view,
    });

    searchByLegalDesc.watch("activeSource", function (evt) {
      evt.placeholder = "search by Legal Desc";
    });

    view.ui.add(searchByLegalDesc, "top-right"); // Add to the map
    // Find address
    view.on("click", function (evt) {
      searchByLegalDesc.clear();
      view.popup.clear();
      if (searchByLegalDesc.activeSource) {
        var geocoder = searchByLegalDesc.activeSource.locator; // World geocode service
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
    //4. Search By Municipal Address
    var searchByMuncipalAddress = new Search({
      view: view,
    });

    searchByMuncipalAddress.watch("activeSource", function (evt) {
      evt.placeholder = "search by Municipal Address";
    });

    view.ui.add(searchByMuncipalAddress, "top-right"); // Add to the map
    // Find address
    view.on("click", function (evt) {
      searchByMuncipalAddress.clear();
      view.popup.clear();
      if (searchByMuncipalAddress.activeSource) {
        var geocoder = searchByMuncipalAddress.activeSource.locator; // World geocode service
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
    //5. Search By Owner
    var searchByOwner = new Search({
      view: view,
    });

    searchByOwner.watch("activeSource", function (evt) {
      evt.placeholder = "search by Owner";
    });

    view.ui.add(searchByOwner, "top-right"); // Add to the map
    // Find address
    view.on("click", function (evt) {
      searchByOwner.clear();
      view.popup.clear();
      if (searchByOwner.activeSource) {
        var geocoder = searchByOwner.activeSource.locator; // World geocode service
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
    //6. Search By Roll
    var searchByRoll = new Search({
      view: view,
    });

    searchByRoll.watch("activeSource", function (evt) {
      evt.placeholder = "search by Roll";
    });

    view.ui.add(searchByRoll, "top-right"); // Add to the map
    // Find address
    view.on("click", function (evt) {
      searchByRoll.clear();
      view.popup.clear();
      if (searchByRoll.activeSource) {
        var geocoder = searchByRoll.activeSource.locator; // World geocode service
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
