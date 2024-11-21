'use strict';

// Set the path to the CSV file (relative to the project root)
const csvUrl = '../data/Path_to_Grandmas.csv';


// Initialize the map
const myMap = L.map("map", {
    center: [33.0, -90.0], // Centered on the Southern USA
    zoom: 6,
});

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Function to map activity levels to intensity
function parseActivityLevel(activityLevel) {
    const levels = {
        "Minimal": 0.2,
        "Low": 0.4,
        "Moderate": 0.6,
        "High": 0.8,
        "Very High": 1.0,
    };
    return levels[activityLevel] || 0.1; // Default intensity for unknown levels
}

// Fetch and process the CSV file
d3.csv(csvUrl).then(data => {
    const heatmapData = []; // Array to store heatmap points

    // State coordinates 
    const stateCoordinates = {
        "Alabama": [32.3182, -86.9023],
        "Mississippi": [32.3547, -89.3985],
        "Louisiana": [30.9843, -91.9623],
        "Florida": [27.9944, -81.7603],
        "Texas": [31.9686, -99.9018],
        "New Mexico": [34.5199, -105.8701],
        "Arizona": [34.0489, -111.0937],
        "California": [36.7783, -119.4179],
    };

    // Process each row in the CSV data
    data.forEach(row => {
        const state = row.State; // Extract state name
        const activityLevel = row["Activity Level"]; // Extract activity level
        const coordinates = stateCoordinates[state]; // Get coordinates for the state

        if (coordinates) {
            const intensity = parseActivityLevel(activityLevel); // Map activity level to intensity
            heatmapData.push([...coordinates, intensity]); // Add point to heatmap data
        }
    });

    // Add the heatmap layer to the map
    L.heatLayer(heatmapData, {
        radius: 25,     // Radius of heatmap points
        blur: 15,       // Smoothing of the heatmap
        maxZoom: 10,    // Maximum zoom level for the heatmap
        gradient: {     // Gradient for intensity levels
            0.2: "yellow",
            0.4: "orange",
            0.6: "red",
            0.8: "blue",
            1.0: "purple",
        },
    }).addTo(myMap);
}).catch(error => {
    console.error("Error loading CSV:", error);
});
