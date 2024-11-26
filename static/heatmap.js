// File: heatmap.js

// Initialize map
let myMap = L.map("map", {
  center: [33.583690, -101.854950],
  zoom: 5.90,
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

// Function to add scenic landmarks
function updateScenicLandmarks() {
  const fileName = "./data/scenic_sites_itinerary.csv";
  console.log("Loading scenic landmarks from file:", fileName);

  d3.csv(fileName)
    .then(function (data) {
      if (!data || data.length === 0) {
        console.error("No data found in the CSV file:", fileName);
        return;
      }

      data.forEach(function (row) {
        const latitude = parseFloat(row["Latitude"]);
        const longitude = parseFloat(row["Longitude"]);
        const sight = row["SIGHTS"];
        const activityLevel = parseFloat(row["ACTIVITY_LEVEL"]);

        if (!isNaN(latitude) && !isNaN(longitude) && sight && !isNaN(activityLevel)) {
          // Determine diamond color and rotation
          if (!isNaN(latitude) && !isNaN(longitude) && sight && !isNaN(activityLevel)) {
            // Determine diamond color and rotation
            let color = "steelblue";
            let rotateTransform = "rotate(45deg)";
            let message = "";

            if (sight === "Los Angeles") {
              color = "green";
              rotateTransform = "rotate3d(0, 1, 0.5, 3.142rad)";
              message = `<h3>START HERE!</h3>`;
            } else if (sight === "Grandma's House") {
              color = "red";
              rotateTransform = "rotate3d(0, 1, 0.5, 3.142rad)";
              message = `<h3>GRANDMA'S HOUSE!</h3>`;
            } else {
              message = `<h3>${sight}</h3>`;
            }
          }

          // Create diamond marker using CSS-based SVG
          const diamondMarker = L.divIcon({
            className: "rotated-scaled-diamond",
            html: `<div style="
              width: calc(100px * cos(45deg));
              height: calc(100px * cos(45deg));
              margin: calc(100px / 4 * cos(45deg));
              transform: ${rotateTransform};
              transform-origin: center;
              background-color: ${color};
            "></div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
          });

          const marker = L.marker([latitude, longitude], { icon: diamondMarker });

          // Determine activity label and message
          const activityLabel = getActivityLevelLabel(activityLevel);
          const message =
            activityLevel <= 6
              ? "YES WE CAN!"
              : "We need to think of Grandma!";

          // Bind popup with dynamic content
          marker.bindPopup(
            `<div style="font-size: 16px; font-weight: bold; text-align: center;">
              <h3>${sight}</h3>
              <p><strong>Activity Level:</strong> ${activityLabel}</p>
              <p>${message}</p>
            </div>`,
            { autoPan: true }
          );

          marker.addTo(myMap);
        } else {
          console.warn(`Invalid data for row ${index + 1}:`, row);
        }
      });

      console.log("Scenic landmarks added successfully.");
    })
    .catch((error) => console.error("Error loading scenic landmarks data:", error));
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
            radius: 120,
            color: "blue",
            fillColor: "cyan",
            fillOpacity: 0.3,
          }).addTo(myMap);

          // Bind popup with formatted data
          circle.bindPopup(
            `<div style="font-size: 16px; line-height: 1.5;">
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
        radius: 22,
        blur: 30,
        maxZoom: 8,
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

// Load scenic landmarks
updateScenicLandmarks();
