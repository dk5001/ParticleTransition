let particles = [];
let startImg, endImg;
let startPositions = [];
let endPositions = [];
let transitionProgress = 0;
let isTransitioning = false;
let transitionDuration = 3000; // 3 seconds in milliseconds
let transitionStartTime = 0;

function preload() {
  // Load your reference images here
  startImg = loadImage('Nodes_1.png', 
    () => console.log('Start image loaded successfully'), 
    () => console.error('Failed to load start image')
  );
  endImg = loadImage('Nodes_2.png', 
    () => console.log('End image loaded successfully'), 
    () => console.error('Failed to load end image')
  );
}

function setup() {
  createCanvas(800, 600);
  
  // If we have reference images loaded, use them
  if (startImg && endImg) {
    // Sample positions from the reference images
    startPositions = sampleImagePositions(startImg, 2000, 100);   // control number of particles(switch second param)
    endPositions = sampleImagePositions(endImg, 2000, 100);
    
    // Match particles between start and end positions
    let matched = matchParticlePositions(startPositions, endPositions);
    startPositions = matched.start;
    endPositions = matched.end;
  } else {
    // For now, create sample positions manually
    // Replace this with actual image sampling once you have reference images
    createSamplePositions();
  }
  
  // Initialize particles
  initializeParticles();
}

function draw() {
  background(20);
  
  // Update transition progress
  if (isTransitioning) {
    let elapsed = millis() - transitionStartTime;
    transitionProgress = constrain(elapsed / transitionDuration, 0, 1);
    
    // Apply easing function for smoother animation
    let easedProgress = easeInOutCubic(transitionProgress);
    
    // Update particle positions
    for (let particle of particles) {
      particle.update(easedProgress);
    }
    
    // Stop transition when complete
    if (transitionProgress >= 1) {
      isTransitioning = false;
    }
  }
  
  // Draw particles
  for (let particle of particles) {
    particle.display();
  }
  
  // Draw UI instructions
  drawUI();
  
  // Draw image previews
  // Checkbox to toggle image previews (named "preview input")
  if (typeof showImagePreviews === 'undefined') {
    window.showImagePreviews = true;
    let previewInput = createCheckbox('Show Image Previews', true);
    previewInput.position(20, height - 40);
    previewInput.changed(() => {
      window.showImagePreviews = previewInput.checked();
    });
    window.imagePreviewCheckbox = previewInput;
  }
  if (window.showImagePreviews) {
    drawImagePreviews();
  }
}

function createSamplePositions() {
  // Sample start positions (spread out circle)
  for (let i = 0; i < 200; i++) {
    let angle = map(i, 0, 200, 0, TWO_PI * 3);
    let radius = random(50, 150);
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    startPositions.push(createVector(x, y));
  }
  
  // Sample end positions (heart shape as example)
  for (let i = 0; i < 200; i++) {
    let t = map(i, 0, 200, 0, TWO_PI);
    // Heart equation: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    let x = width/2 + 16 * pow(sin(t), 3) * 3;
    let y = height/2 - (13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)) * 3;
    endPositions.push(createVector(x, y));
  }
}

function initializeParticles() {
  for (let i = 0; i < startPositions.length; i++) {
    let particle = new Particle(
      startPositions[i].x,
      startPositions[i].y,
      endPositions[i].x,
      endPositions[i].y
    );
    particles.push(particle);
  }
}

class Particle {
  constructor(startX, startY, targetX, targetY) {
    this.startPos = createVector(startX, startY);
    this.targetPos = createVector(targetX, targetY);
    this.currentPos = createVector(startX, startY);
    this.size = random(7, 10);
    this.opacity = 255;
  }
  
  update(progress) {
    // Interpolate between start and target positions
    this.currentPos.x = lerp(this.startPos.x, this.targetPos.x, progress);
    this.currentPos.y = lerp(this.startPos.y, this.targetPos.y, progress);
  }
  
  display() {
    push();
    fill(255, 255, 255, this.opacity);
    noStroke();
    rectMode(CENTER);
    rect(this.currentPos.x, this.currentPos.y, this.size, this.size);
    pop();
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

function drawUI() {
  push();
  fill(255);
  textAlign(LEFT);
  text("Press SPACE to start transition", 20, 30);
  text("Press R to reset", 20, 50);
  text(`Progress: ${(transitionProgress * 100).toFixed(1)}%`, 20, 70);
  
  // Debug information
  text(`Images loaded: Start=${startImg ? 'Yes' : 'No'}, End=${endImg ? 'Yes' : 'No'}`, 20, 90);
  text(`Particles: ${particles.length}`, 20, 110);
  if (startImg && endImg) {
    text(`Start positions: ${startPositions.length}`, 20, 130);
    text(`End positions: ${endPositions.length}`, 20, 150);
  }
  pop();
}

function keyPressed() {
  if (key === ' ') {
    startTransition();
  } else if (key === 'r' || key === 'R') {
    resetParticles();
  }
}

function startTransition() {
  if (!isTransitioning) {
    isTransitioning = true;
    transitionStartTime = millis();
    transitionProgress = 0;
  }
}

function resetParticles() {
  transitionProgress = 0;
  isTransitioning = false;
  for (let particle of particles) {
    particle.currentPos.set(particle.startPos);
  }
}

// Image sampling functions for extracting particle positions
function sampleImagePositions(img, maxParticles = 500, threshold = 100) {
  let positions = [];
  
  // Ensure we have the image loaded
  if (!img) return positions;
  
  img.loadPixels();
  
  // Sample pixels at regular intervals to get particle positions
  let stepSize = max(1, floor(sqrt((img.width * img.height) / maxParticles)));
  
  for (let x = 0; x < img.width; x += stepSize) {
    for (let y = 0; y < img.height; y += stepSize) {
      let index = (x + y * img.width) * 4;
      
      // Get RGB values
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let alpha = img.pixels[index + 3];
      
      // Check specifically for WHITE pixels (bright areas)
      // White pixels have high RGB values (close to 255)
      let isWhite = r > 200 && g > 200 && b > 200 && alpha > 100;
      
      if (isWhite) {
        // Convert to relative positions (0-1 range) from the original image
        let relativeX = x / img.width;
        let relativeY = y / img.height;
        
        // Map relative positions to canvas coordinates
        let canvasX = relativeX * width;
        let canvasY = relativeY * height;
        
        positions.push(createVector(canvasX, canvasY));
      }
    }
  }
  
  return positions;
}

// Alternative: Sample based on edge detection
function sampleImageEdges(img, maxParticles = 500, edgeThreshold = 50) {
  let positions = [];
  
  if (!img) return positions;
  
  img.loadPixels();
  
  for (let x = 1; x < img.width - 1; x += 2) {
    for (let y = 1; y < img.height - 1; y += 2) {
      // Simple edge detection using difference between adjacent pixels
      let centerIndex = (x + y * img.width) * 4;
      let rightIndex = ((x + 1) + y * img.width) * 4;
      let bottomIndex = (x + (y + 1) * img.width) * 4;
      
      let centerBrightness = (img.pixels[centerIndex] + img.pixels[centerIndex + 1] + img.pixels[centerIndex + 2]) / 3;
      let rightBrightness = (img.pixels[rightIndex] + img.pixels[rightIndex + 1] + img.pixels[rightIndex + 2]) / 3;
      let bottomBrightness = (img.pixels[bottomIndex] + img.pixels[bottomIndex + 1] + img.pixels[bottomIndex + 2]) / 3;
      
      let edgeStrength = abs(centerBrightness - rightBrightness) + abs(centerBrightness - bottomBrightness);
      
      if (edgeStrength > edgeThreshold) {
        // Convert to relative positions (0-1 range) from the original image
        let relativeX = x / img.width;
        let relativeY = y / img.height;
        
        // Map relative positions to canvas coordinates
        let canvasX = relativeX * width;
        let canvasY = relativeY * height;
        
        positions.push(createVector(canvasX, canvasY));
        
        if (positions.length >= maxParticles) break;
      }
    }
    if (positions.length >= maxParticles) break;
  }
  
  return positions;
}

// Function to match particles between start and end positions
function matchParticlePositions(startPositions, endPositions) {
  // Simple approach: pair them sequentially
  // For more sophisticated matching, you could use nearest neighbor or optimal assignment
  
  let minLength = min(startPositions.length, endPositions.length);
  let pairedStart = startPositions.slice(0, minLength);
  let pairedEnd = endPositions.slice(0, minLength);
  
  return { start: pairedStart, end: pairedEnd };
}

// Advanced: Nearest neighbor matching (optional, for better visual results)
function nearestNeighborMatching(startPositions, endPositions) {
  let pairedStart = [];
  let pairedEnd = [];
  let usedEndIndices = new Set();
  
  for (let startPos of startPositions) {
    let minDist = Infinity;
    let bestEndIndex = -1;
    
    for (let i = 0; i < endPositions.length; i++) {
      if (usedEndIndices.has(i)) continue;
      
      let dist = p5.Vector.dist(startPos, endPositions[i]);
      if (dist < minDist) {
        minDist = dist;
        bestEndIndex = i;
      }
    }
    
    if (bestEndIndex !== -1) {
      pairedStart.push(startPos);
      pairedEnd.push(endPositions[bestEndIndex]);
      usedEndIndices.add(bestEndIndex);
    }
  }
  
  return { start: pairedStart, end: pairedEnd };
}

function drawImagePreviews() {
  // Preview size and position
  let previewSize = 100;
  let margin = 20;
  let startX = width - previewSize - margin;
  let startY = height - previewSize * 2 - margin * 2;
  
  push();
  
  // Draw background boxes
  fill(0, 0, 0, 150);
  noStroke();
  rect(startX - 5, startY - 5, previewSize + 10, previewSize + 10);
  rect(startX - 5, startY + previewSize + margin - 5, previewSize + 10, previewSize + 10);
  
  // Draw start image if loaded
  if (startImg) {
    image(startImg, startX, startY, previewSize, previewSize);
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("Start", startX + previewSize/2, startY - 8);
  } else {
    fill(100);
    rect(startX, startY, previewSize, previewSize);
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("Start\n(Not Loaded)", startX + previewSize/2, startY + previewSize/2);
  }
  
  // Draw end image if loaded
  if (endImg) {
    image(endImg, startX, startY + previewSize + margin, previewSize, previewSize);
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("End", startX + previewSize/2, startY + previewSize + margin - 8);
  } else {
    fill(100);
    rect(startX, startY + previewSize + margin, previewSize, previewSize);
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("End\n(Not Loaded)", startX + previewSize/2, startY + previewSize * 1.5 + margin);
  }
  
  pop();
}
