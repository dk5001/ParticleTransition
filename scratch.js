// Customizable rectangle settings
let rectSize = 20; // Size of each rectangle (width and height)
let numRects = 100; // Number of rectangles to draw
let canvasWidth = 800;
let canvasHeight = 600;
let rectangles = []; // Array to store rectangle positions

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  generateRandomPositions();
}

function generateRandomPositions() {
  rectangles = [];
  for (let i = 0; i < numRects; i++) {
    let x = random(0, canvasWidth - rectSize);
    let y = random(0, canvasHeight - rectSize);
    rectangles.push({x: x, y: y});
  }
}

function draw() {
  // Black background
  background(0);
  
  // White rectangles
  fill(255);
  noStroke();
  
  // Draw randomly positioned rectangles
  for (let i = 0; i < rectangles.length; i++) {
    rect(rectangles[i].x, rectangles[i].y, rectSize, rectSize);
  }
}

// Interactive controls to customize rectangle size and count
function keyPressed() {
  if (key === '+' || key === '=') {
    rectSize += 2;
    rectSize = constrain(rectSize, 2, 100);
  } else if (key === '-') {
    rectSize -= 2;
    rectSize = constrain(rectSize, 2, 100);
  } else if (key === 'ArrowUp' || keyCode === UP_ARROW) {
    numRects += 10;
    numRects = constrain(numRects, 10, 500);
    generateRandomPositions(); // Regenerate positions with new count
  } else if (key === 'ArrowDown' || keyCode === DOWN_ARROW) {
    numRects -= 10;
    numRects = constrain(numRects, 10, 500);
    generateRandomPositions(); // Regenerate positions with new count
  } else if (key === 'r' || key === 'R') {
    generateRandomPositions(); // Regenerate random positions
  }
}

// Mouse controls for fine-tuning
function mouseWheel(event) {
  rectSize -= event.delta / 10;
  rectSize = constrain(rectSize, 2, 100);
  return false; // Prevent page scrolling
}