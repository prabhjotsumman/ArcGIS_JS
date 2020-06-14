// https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm

function SearchByIntersection(address){
    axios
      .get(
        "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&outFields=Addr_type&forStorage=false&SingleLine=W%20Park%20Ave%20and%20Tennessee%20St%2C%20Redlands%2C%20CA"
      )
      .then((response) => {
        const users = response.data.data;
        console.log(`GET list users`, users);
      })
      .catch((error) => console.error(error));
}

