// https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm

function SearchByIntersection(address) {
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
};

function closeWidget() {
  console.log("closing...");
}
function search(e) {
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
  ex("HEYSA");
}
