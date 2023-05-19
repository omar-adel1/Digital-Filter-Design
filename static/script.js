// Initialize the canvas and context
const canvas = document.getElementById('zplane-canvas');
const ctx = canvas.getContext('2d');

// Define the z-plane parameters
canvas.width = 500;
canvas.height = 500;
const planeWidth = canvas.width;
const planeHeight = canvas.height;
const centerX = planeWidth / 2;
const centerY = planeHeight / 2;
const radius = planeWidth / 2;

// Define arrays for storing zeros and poles
let zeros = [];
let poles = [];

// Variables to keep track of the dragged zero or pole
let draggingPoint = false;
let draggedPointIndex = -1;

// Variable to store the current mode (zeros or poles)
let currentMode = 'zeros';

// Function to draw the z-plane
function drawZPlane() {
    ctx.clearRect(0, 0, planeWidth, planeHeight);
  
    // Save the current stroke and fill styles
    const savedStrokeStyle = ctx.strokeStyle;
    const savedFillStyle = ctx.fillStyle;
  
    // Draw the x-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(planeWidth, centerY);
    ctx.strokeStyle = savedStrokeStyle; // Restore the original stroke style
    ctx.stroke();
  
    // Draw the y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, planeHeight);
    ctx.strokeStyle = savedStrokeStyle; // Restore the original stroke style
    ctx.stroke();
  
    // Draw the unit circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = savedStrokeStyle; // Restore the original stroke style
    ctx.stroke();
  
    // Draw the zeros
    ctx.fillStyle = '#00f'; // Blue color for zeros
    zeros.forEach((zero, index) => {
      ctx.beginPath();
      ctx.arc(zero.x, zero.y, 5, 0, 2 * Math.PI);
      ctx.fill();
  
      if (draggingPoint && currentMode === 'zeros' && index === draggedPointIndex) {
        // Draw a larger circle for the dragged zero
        ctx.beginPath();
        ctx.arc(zero.x, zero.y, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = savedStrokeStyle; // Restore the original stroke style
        ctx.stroke();
      }
    });
  
    // Draw the poles
    ctx.strokeStyle = '#f00'; // Red color for poles
    ctx.lineWidth = 2.5;
    poles.forEach((pole, index) => {
      ctx.beginPath();
      ctx.moveTo(pole.x - 6, pole.y - 6);
      ctx.lineTo(pole.x + 6, pole.y + 6);
      ctx.moveTo(pole.x + 6, pole.y - 6);
      ctx.lineTo(pole.x - 6, pole.y + 6);
      ctx.stroke();
    });
  
    // Restore the original fill style
    ctx.fillStyle = savedFillStyle;
  }
  

// Function to add a zero or pole at the clicked position
function addZeroOrPole(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    if (x >= 0 && x <= planeWidth && y >= 0 && y <= planeHeight) {
      const point = { x, y };
  
      if (currentMode === 'zeros') {
        zeros.push(point);
  
        if (document.getElementById('add-conjugate').checked) {
          // Add conjugate in the reflected part
          const conjugate = { x, y: planeHeight - y };
          zeros.push(conjugate);
        }
      } else {
        poles.push(point);
  
        if (document.getElementById('add-conjugate').checked) {
          // Add conjugate in the reflected part
          const conjugate = { x, y: planeHeight - y };
          poles.push(conjugate);
        }
      }
  
      drawZPlane();
    }
  }
  
  

// Function to start dragging a zero or pole
function startDraggingPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let points = currentMode === 'zeros' ? zeros : poles;

  points.forEach((point, index) => {
    if (Math.hypot(point.x - x, point.y - y) <= 5) {
      draggingPoint = true;
      draggedPointIndex = index;
      canvas.addEventListener('mousemove', dragPoint);
      canvas.addEventListener('mouseup', stopDraggingPoint);
    }
  });
}

// Function to drag the zero or pole
function dragPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    let points = currentMode === 'zeros' ? zeros : poles;
  
    // Update the original point
    points[draggedPointIndex] = { x, y };
  
    // Update the reflected point
    const reflectionY = planeHeight - y;
    const reflectedIndex = (currentMode === 'zeros' ? draggedPointIndex + 1 : draggedPointIndex - 1);
    points[reflectedIndex] = { x, y: reflectionY };
  
    drawZPlane();
  }
  

// Function to stop dragging the zero or pole
function stopDraggingPoint() {
  draggingPoint = false;
  draggedPointIndex = -1;
  canvas.removeEventListener('mousemove', dragPoint);
  canvas.removeEventListener('mouseup', stopDraggingPoint);
}

// Function to delete a zero or pole at the clicked position
function deleteZeroOrPole(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const clickRadius = 10; // Radius of the area around the clicked position to detect zeros or poles

  const filteredZeros = zeros.filter(
    (zero) => Math.hypot(zero.x - x, zero.y - y) > clickRadius
  );
  const filteredPoles = poles.filter(
    (pole) => Math.hypot(pole.x - x, pole.y - y) > clickRadius
  );

  if (filteredZeros.length !== zeros.length || filteredPoles.length !== poles.length) {
    zeros = filteredZeros;
    poles = filteredPoles;
    drawZPlane();
  }
}

// Function to clear all zeros or poles
function clearZeros() {
  zeros = [];
  drawZPlane();
}

function clearPoles() {
  poles = [];
  drawZPlane();
}

// Function to clear all zeros and poles
function clearAll() {
  zeros = [];
  poles = [];
  drawZPlane();
}

// Function to switch the mode to zeros
function switchToZeros() {
  currentMode = 'zeros';
}

// Function to switch the mode to poles
function switchToPoles() {
  currentMode = 'poles';
}

// Attach event listeners
canvas.addEventListener('mousedown', startDraggingPoint);
canvas.addEventListener('mouseup', stopDraggingPoint);
canvas.addEventListener('click', addZeroOrPole);
canvas.addEventListener('contextmenu', deleteZeroOrPole);
document.getElementById('clear-zeros').addEventListener('click', clearZeros);
document.getElementById('clear-poles').addEventListener('click', clearPoles);
document.getElementById('clear-all').addEventListener('click', clearAll);
document.getElementById('draw-zeros').addEventListener('click', switchToZeros);
document.getElementById('draw-poles').addEventListener('click', switchToPoles);

// Initial draw
drawZPlane();
