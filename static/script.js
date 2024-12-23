'use strict';


const csvUrl = 'data/filtered_route_to_grandmas.csv';
;  // Adjust if necessary based on your project's directory structure

// Initialize the map on the "map" div
const myMap = L.map('map', {
    center: [33.0, -90.0], // Center coordinates on the Southern USA
    zoom: 6,  // Initial zoom level
});

// Add a base layer of tiles from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Function to convert activity levels to a numeric intensity for heatmap visualization
function parseActivityLevel(activityLevel) {
    const levels = {
        "Minimal": 0.2,
        "Low": 0.4,
        "Moderate": 0.6,
        "High": 0.8,
        "Very High": 1.0,
    };
    return levels[activityLevel] || 0.1; // Default intensity for unknown or unspecified levels
}

// Fetch the CSV data using d3.csv if you have d3 loaded, or use another method if d3 is not included
d3.csv(csvUrl).then(data => {
    const heatmapData = [];

    // Define coordinates for each state to use in the heatmap
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

    // Process each row in the CSV to prepare the data for the heatmap
    data.forEach(row => {
        const state = row.State;
        const activityLevel = row["Activity Level"];
        const coordinates = stateCoordinates[state];

        if (coordinates) {
            const intensity = parseActivityLevel(activityLevel);
            heatmapData.push([...coordinates, intensity]);  // Append the data point [lat, lng, intensity] to the array
        }
    });

    // Create and add the heatmap layer to the map
    L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
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





//****************





//Added real-time filtering function
function fetchAndFilterData(stateFilter, dateFilter, strainFilter) {
    d3.csv(csvUrl).then(data => {
        let filteredData = data;
        
        if (stateFilter) {
            filteredData = filteredData.filter(row => row.State === stateFilter);
        }
        
        if (dateFilter) {
            filteredData = filteredData.filter(row => new Date(row.Date) <= new Date(dateFilter));
        }
        
        if (strainFilter) {
            filteredData = filteredData.filter(row => row.Strain === strainFilter);
        }
        
        updateHeatmap(filteredData);
    }).catch(error => {
        console.error("Error loading CSV:", error);
    });
}

//Added function to update heatmap
function updateHeatmap(data) {
    const heatmapData = [];
    
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
    
    data.forEach(row => {
        const state = row.State;
        const activityLevel = row["Activity Level"];
        const coordinates = stateCoordinates[state];
        
        if (coordinates) {
            const intensity = parseActivityLevel(activityLevel);
            heatmapData.push([...coordinates, intensity]);  // Append the data point [lat, lng, intensity] to the array
        }
    });
    
    L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
            0.2: "yellow",
            0.4: "orange",
            0.6: "red",
            0.8: "blue",
            1.0: "purple",
        },
    }).addTo(myMap);
}

//Added event listener for applying filters
document.getElementById('apply-filters').addEventListener('click', () => {
    const stateFilter = document.getElementById('state-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const strainFilter = document.getElementById('strain-filter').value;
    
    fetchAndFilterData(stateFilter, dateFilter, strainFilter);
});

//Added export to CSV function
function exportToCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(e => Object.values(e).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_data.csv");
    document.body.appendChild(link);
    link.click();
}

//Added event listener for exporting data
document.getElementById('export-csv').addEventListener('click', () => {
    d3.csv(csvUrl).then(data => {
        const stateFilter = document.getElementById('state-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const strainFilter = document.getElementById('strain-filter').value;
        
        let filteredData = data;
        
        if (stateFilter) {
            filteredData = filteredData.filter(row => row.State === stateFilter);
        }
        
        if (dateFilter) {
            filteredData = filteredData.filter(row => new Date(row.Date) <= new Date(dateFilter));
        }
        
        if (strainFilter) {
            filteredData = filteredData.filter(row => row.Strain === strainFilter);
        }
        
        exportToCSV(filteredData);
    }).catch(error => {
        console.error("Error loading CSV:", error);
    });
});