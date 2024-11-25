// File: heatmap.js

// Initialize map
let myMap = L.map("map", {
  center: [33.0, -90.0],
  zoom: 7,
});

// Base map layers
let streetView = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(myMap);

let satelliteView = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
  attribution: "© Google Maps",
});

let topoView = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "Map data: © OpenTopoMap contributors",
});

// Add layer controls
L.control
  .layers(
    {
      "Street View": streetView,
      "Satellite View": satelliteView,
      "Topographical View": topoView,
    },
    null,
    { position: "topright" }
  )
  .addTo(myMap);

let heatLayer; // To store the heatmap layer

// Function to update heatmap and bind city information
function updateHeatmapAndInteractions(selectedWeek) {
  const fileName = `./data/week_${selectedWeek.replace(/\//g, "-")}.csv`;
  console.log("Loading heatmap file:", fileName);

  d3.csv(fileName).then(function (data) {
    let heatArray = [];

    // Remove previous heatmap circles
    myMap.eachLayer(function (layer) {
      if (layer instanceof L.Circle) {
        myMap.removeLayer(layer);
      }
    });

    data.forEach(function (row) {
      let latitude = parseFloat(row["Latitude"]);
      let longitude = parseFloat(row["Longitude"]);
      let acuityLevel = parseFloat(row["ACUITY_LEVEL"]);
      let cityName = row["CBSA_NAME"];

      if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(acuityLevel) && cityName) {
        heatArray.push([latitude, longitude, acuityLevel]);

        // Add circle for heatmap hover interaction
        let circle = L.circle([latitude, longitude], {
          radius: 50,
          fillOpacity: 0,
        }).addTo(myMap);

        circle.bindPopup(
          `<h1>${cityName.toLocaleString()}</h1><p>ACUITY_LEVEL: ${acuityLevel.toLocaleString()}</p><p>Week: ${selectedWeek}</p>`
        );
      }
    });

    // Update heatmap layer
    if (heatLayer) {
      myMap.removeLayer(heatLayer);
    }

    heatLayer = L.heatLayer(heatArray, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        1.0: "red",
      },
    }).addTo(myMap);

    console.log("Heatmap updated.");
  });
}

// Function to update scenic site markers
function updateScenicMarkers() {
  const fileName = "./data/scenic_sites_itinerary.csv";
  console.log("Loading scenic sites from file:", fileName);

  d3.csv(fileName)
    .then(function (data) {
      if (!data || data.length === 0) {
        console.error("No data found in the CSV file.");
        return;
      }

      data.forEach(function (row, index) {
        console.log(`Processing row ${index + 1}:`, row);

        let sight = row["SIGHTS"];
        let latitude = parseFloat(row["Latitude"]);
        let longitude = parseFloat(row["Longitude"]);
        let start = row["Start"];
        let finish = row["Finish"];

        if (!sight) {
          console.warn(`Missing 'SIGHTS' in row ${index + 1}`);
          return;
        }

        if (isNaN(latitude) || isNaN(longitude)) {
          console.warn(`Invalid coordinates in row ${index + 1}`);
          return;
        }

        let markerOptions = { draggable: false };

        if (sight === "Los Angeles") {
          markerOptions.icon = L.icon({
            iconUrl: "./static/green-marker.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
          });
        } else if (sight === "Miami Beach") {
          markerOptions.icon = L.icon({
            iconUrl: "./static/red-marker.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
          });
        }

        let marker = L.marker([latitude, longitude], markerOptions).addTo(myMap);

        let popupContent = `<h1>${sight.toLocaleString()}</h1>`;
        if (sight === "Los Angeles") {
          popupContent += `<p>Start: ${start ? start.toLocaleString() : "N/A"}</p>`;
        } else if (sight === "Miami Beach") {
          popupContent += `<p>Finish: ${finish ? finish.toLocaleString() : "N/A"}</p>`;
        }

        marker.bindPopup(popupContent);
      });

      console.log("Scenic site markers added successfully.");
    })
    .catch((error) => {
      console.error("Error loading scenic sites:", error);
    });
}

// Initial load
const initialWeek = document.getElementById("weekSelector").value;
updateHeatmapAndInteractions(initialWeek);
updateScenicMarkers();

// Event listener for dropdown change
document.getElementById("weekSelector").addEventListener("change", function (event) {
  const selectedWeek = event.target.value;
  updateHeatmapAndInteractions(selectedWeek);
});
