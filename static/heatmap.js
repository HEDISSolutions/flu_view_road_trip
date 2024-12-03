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
  const locations = [
    { name: "White Sands National Park", lat: 32.780361, lon: -106.171448, ACTIVITY_LEVEL_LABEL: "High" },
    { name: "Texas Capitol", lat: 32.757461, lon: -97.814528, ACTIVITY_LEVEL_LABEL: "Moderate" },
    { name: "The Galleria", lat: 29.760803, lon: -95.369506, ACTIVITY_LEVEL_LABEL: "Low" },
    { name: "Oak Alley Plantation", lat: 29.943925, lon: -90.696935, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "DisneyWorld", lat: 28.373067, lon: -81.552048, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "Universal Islands of Adventure", lat: 28.04191, lon: -82.41497, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "Busch Gardens Tampa Bay", lat: 28.036491, lon: -82.415076, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "Clearwater Beach", lat: 27.972326, lon: -82.814986, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "French Quarter", lat: 29.958443, lon: -90.064441, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "USS ALABAMA Battleship Memorial Park", lat: 31.899281, lon: -88.311241, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "National Naval Aviation Museum", lat: 30.4069, lon: -87.217567, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "Key West", lat: 24.55975, lon: -81.783699, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "Los Angeles", lat: 34.052235, lon: -118.243683, ACTIVITY_LEVEL_LABEL: "Unknown" },
    { name: "GRANDMA'S HOUSE", lat: 25.790653, lon: -80.130043, ACTIVITY_LEVEL_LABEL: "Unknown" },
  ];

  locations.forEach((location) => {
    const marker = L.marker([location.lat, location.lon]).addTo(myMap);
    marker.bindPopup(
      `<div>
        <strong>Site:</strong> ${location.name}<br>
        <strong>Activity Level:</strong> ${location.ACTIVITY_LEVEL_LABEL || "Unknown"}
      </div>`
    );
  });

  console.log("Scenic landmarks added successfully.");

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
      data.forEach(function (row) {
        let latitude = parseFloat(row["Latitude"]);
        let longitude = parseFloat(row["Longitude"]);
        let acuityLevel = parseFloat(row["ACUITY_LEVEL"]);
        let cityName = row["CBSA_NAME"];

        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(acuityLevel)) {
          heatArray.push([latitude, longitude, acuityLevel]);

          // Add interactive circle
          L.circle([latitude, longitude], {
            radius: 100,
            color: "blue",
            fillColor: "cyan",
            fillOpacity: 0.5,
          })
            .bindPopup(
              `<div>
                <strong>City:</strong> ${cityName || "Unknown"}<br>
                <strong>Acuity Level:</strong> ${acuityLevel}
              </div>`
            )
            .addTo(myMap);
        }
      });

      // Add heatmap layer
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
    })
    .catch(function (error) {
      console.error("Error loading heatmap data:", error);
    });
}

// Add dropdown event listener and load initial data
document.getElementById("weekSelector").addEventListener("change", function (event) {
  const selectedWeek = event.target.value;
  updateHeatmapAndInteractions(selectedWeek);
});

// Initial load
const initialWeek = document.getElementById("weekSelector").value;
updateHeatmapAndInteractions(initialWeek);

// Load scenic landmarks
updateScenicLandmarks();
