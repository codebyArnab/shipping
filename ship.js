// Initialize map
const map = L.map('map').setView([20.0, 0.0], 2);  // Center the map on the world

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

let startPoint = null;
let endPoint = null;

// Define the grid size (increased to 100x100 for smoother lines)
const gridRows = 100;
const gridCols = 100;

// Define the world map's lat-lon boundaries (from -180 to 180 longitude and -90 to 90 latitude)
const latMin = -90;
const latMax = 90;
const lonMin = -180;
const lonMax = 180;

// Function to convert lat-lon to grid coordinates
function latLonToGrid(lat, lon) {
  const x = Math.floor(((lon - lonMin) / (lonMax - lonMin)) * (gridCols - 1));
  const y = Math.floor(((latMax - lat) / (latMax - latMin)) * (gridRows - 1));
  return [y, x];  // Return [row, col] as grid coordinates
}

// Event listener to get start and end points by clicking on the map
map.on('click', function (e) {
  if (!startPoint) {
    startPoint = e.latlng;
    L.marker(startPoint).addTo(map).bindPopup("Start").openPopup();
  } else if (!endPoint) {
    endPoint = e.latlng;
    L.marker(endPoint).addTo(map).bindPopup("Destination").openPopup();
  }
});

// Function to clear existing markers and routes
function clearMap() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
}

// Function to find the optimal route
function findRoute() {
  if (!startPoint || !endPoint) {
    alert("Please select both start and destination points on the map.");
    return;
  }

  clearMap();
  
  // Convert lat-lon to grid coordinates
  const startCoordinates = latLonToGrid(startPoint.lat, startPoint.lng);
  const endCoordinates = latLonToGrid(endPoint.lat, endPoint.lng);

  // Example grid for testing purposes
  const grid = createGrid(gridRows, gridCols);

  // Use A* algorithm (replace with your implementation)
  const path = astar(grid, startCoordinates, endCoordinates);

  if (path && path.length > 0) {
    document.getElementById("route-output").textContent = "Optimal route found!";
    
    const latLngs = path.map(coord => {
      // Convert grid coordinates back to lat-lon for display
      const lat = latMax - (coord[0] / (gridRows - 1)) * (latMax - latMin);
      const lon = lonMin + (coord[1] / (gridCols - 1)) * (lonMax - lonMin);
      return [lat, lon];
    });
    
    const polyline = L.polyline(latLngs, { color: 'blue', dashArray: '5,5' }).addTo(map);
    
    map.fitBounds(polyline.getBounds());
  } else {
    document.getElementById("route-output").textContent = "No route found. Try different points.";
  }
}

// Function to create a basic grid
function createGrid(rows, cols) {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push([]);
    for (let j = 0; j < cols; j++) {
      grid[i].push(0);  // 0 represents an empty cell
    }
  }
  return grid;
}

// Example A* function for pathfinding
function astar(grid, start, goal) {
  let openList = [];
  let cameFrom = {};
  let gScore = {};
  let fScore = {};

  gScore[start] = 0;
  fScore[start] = heuristic(start, goal);

  openList.push({ node: start, fScore: fScore[start] });

  while (openList.length > 0) {
    openList.sort((a, b) => a.fScore - b.fScore);
    const current = openList.shift().node;

    if (current[0] === goal[0] && current[1] === goal[1]) {
      let path = [];
      let temp = current;
      while (temp in cameFrom) {
        path.push(temp);
        temp = cameFrom[temp];
      }
      path.push(start);
      return path.reverse();
    }

    for (let [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const neighbor = [current[0] + dx, current[1] + dy];
      
      if (neighbor[0] >= 0 && neighbor[1] >= 0 && neighbor[0] < grid.length && neighbor[1] < grid[0].length) {
        const tentativeGScore = gScore[current] + 1;
        
        if (!(neighbor in gScore) || tentativeGScore < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeGScore;
          fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, goal);
          openList.push({ node: neighbor, fScore: fScore[neighbor] });
        }
      }
    }
  }

  return null;
}

function heuristic(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

// Event listener for the "Find Optimal Route" button
document.getElementById("find-route").addEventListener("click", findRoute);
