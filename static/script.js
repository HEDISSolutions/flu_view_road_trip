// Define the relative path to the filtered data file
let url = "data/filtered_route_to_grandmas.csv";

// Initialize the map
let myMap = L.map("map", {
    center: [33.0, -90.0], // Centered over the Southern USA
    zoom: 6
});

// Add a tile layer (OpenStreetMap)
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
street.addTo(myMap);

// Use D3.js to load the CSV file and create the heatmap
d3.csv(url).then(data => {
    let locations = []; // List to store heatmap data

    // Iterate through the CSV data
    data.forEach(row => {
        // Ensure the coordinates exist and parse them as floats
        let latitude = parseFloat(row.Latitude);
        let longitude = parseFloat(row.Longitude);
        let activityLevel = parseInt(row["ACTIVITY LEVEL"]); // Parse ACTIVITY LEVEL as an integer

        // Add valid coordinates and intensity to the locations array
        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(activityLevel)) {
            locations.push([latitude, longitude, activityLevel]); // Intensity is based on ACTIVITY LEVEL
        }
    });

    // Log the extracted locations (for debugging)
    console.log(locations);

    // Add a heat layer to the map
    L.heatLayer(locations, {
        radius: 25, // Radius of each point
        blur: 15,   // Smoothing
        maxZoom: 10 // Maximum zoom for intensity
    }).addTo(myMap);
}).catch(error => {
    console.error("Error loading or processing the CSV file:", error);
});

