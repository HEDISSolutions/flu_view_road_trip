// File: heatmap.js

// Initialize map
let myMap = L.map("map", {
  center: [33.0, -90.0],
  zoom: 6,
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

// Store heatmap layer for dynamic updates
let heatLayer;

// Function to determine activity level labels
function getActivityLevelLabel(activityLevel) {
  if (activityLevel <= 3) return "Minimal";
  else if (activityLevel <= 5) return "Low";
  else if (activityLevel <= 7) return "Moderate";
  else if (activityLevel <= 10) return "High";
  else return "Very High";
}

// Function to update the heatmap and interactions
function updateHeatmapAndInteractions(selectedWeek) {
  const weekToFileMap = {
    "2024-03-09": "./data/week_10.csv",
    "2024-03-16": "./data/week_11.csv",
    "2024-03-23": "./data/week_12.csv",
    "2024-03-30": "./data/week_13.csv",
    "2024-04-06": "./data/week_14.csv",
    "2024-04-13": "./data/week_15.csv",
    "2024-04-20": "./data/week_16.csv",
    "2024-04-27": "./data/week_17.csv",
    "2024-05-04": "./data/week_18.csv",
  };

  const fileName = weekToFileMap[selectedWeek];
  if (!fileName) {
    console.error("Invalid week selected or file mapping not found:", selectedWeek);
    return;
  }

  console.log("Loading heatmap file:", fileName);

  d3.csv(fileName)
    .then(function (data) {
      if (!data || data.length === 0) {
        console.error("No data found in the CSV file:", fileName);
        return;
      }

      let heatArray = [];

      // Remove previous heatmap and circle layers
      myMap.eachLayer(function (layer) {
        if (layer instanceof L.Circle || layer === heatLayer) {
          myMap.removeLayer(layer);
        }
      });

      // Process data
      data.forEach(function (row, index) {
        let latitude = parseFloat(row["Latitude"]);
        let longitude = parseFloat(row["Longitude"]);
        let acuityLevel = parseFloat(row["ACUITY_LEVEL"]);
        let cityName = row["CBSA_NAME"];

        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(acuityLevel) && cityName) {
          heatArray.push([latitude, longitude, acuityLevel]);

          // Add interactive circle
          let circle = L.circle([latitude, longitude], {
            radius: 120, // Larger radius for better interaction
            color: "blue",
            fillColor: "cyan",
            fillOpacity: 0.3,
          }).addTo(myMap);

          // Bind popup with formatted data
          circle.bindPopup(
            `<div style="font-size: 14px; line-height: 1.5;">
              <h3 style="margin: 0;">${cityName.toLocaleString()}</h3>
              <p><strong>Acuity Level:</strong> ${acuityLevel.toLocaleString()}</p>
              <p><strong>Activity Level:</strong> ${getActivityLevelLabel(acuityLevel)}</p>
              </div>`,
            { autoPan: true }
          );
        }
      });

      // Add enhanced heatmap layer
      if (heatLayer) {
        myMap.removeLayer(heatLayer);
      }

      heatLayer = L.heatLayer(heatArray, {
        radius: 22, // Bigger radius for stronger heatmap impact
        blur: 30, // Increased blur for smoother transitions
        maxZoom: 8, // Reduce max zoom to prevent overly dense visualization
        gradient: {
          0.3: "blue",
          0.5: "cyan",
          0.7: "lime",
          0.9: "yellow",
          1.0: "red",
        },
      }).addTo(myMap);

      console.log("Heatmap updated with enhanced blur and radius.");
    })
    .catch(function (error) {
      console.error("Error loading heatmap data:", error);
    });
}

// Event listener for dropdown menu
document.getElementById("weekSelector").addEventListener("change", function (event) {
  const selectedWeek = event.target.value;
  updateHeatmapAndInteractions(selectedWeek);
});

// Initial load
const initialWeek = document.getElementById("weekSelector").value;
updateHeatmapAndInteractions(initialWeek);
