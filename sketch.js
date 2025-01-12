/*
This template visualizes average temperature changes since 1880
https://data.giss.nasa.gov/gistemp/
*/

const HEADERTEXT = "Annual Global Temperature Fluctuation 1980 - 2019";
const TOPMARGIN = 52;

let font;
let averageTemps = [];
let minTemp, maxTemp;
let hotColour, coldColour;
let vhc = 0;
let exactYear = 0;
let rot = 0;
let theta = [];
let radius = [];
let delta = [];
let textRadius = [];
let stopDraw = 0;
let months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

let tempDegree = ["0°"];

let timePeriods = ["1980 - 1989", "1990 - 1999", "2000 - 2009", "2010 - 2019"];
let yearEighties = ["1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989"];
let yearNineties = ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999"];
let yearNoughties = ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"];
let yearTens = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];
let decadeSelection = yearEighties;

let a = 255;
let circleSize = 15;  // Increased circle size for better visibility
let gaussianRandom = 0;
let circleSpeed = 0.0025;
let decadeButton = 0;
let yearDial = 0;
let circleDistance = 0.25;
let angle = 0;  // Initialize angle

function preload() {
  font = loadFont('Assets/Oswald.ttf');

  // Ensure data is loaded correctly
  table = loadTable("Data/data.csv", "csv", "header", () => {
    console.log("Data loaded successfully.");
  }, (error) => {
    console.error("Error loading data:", error);
  });
}

function setup() {
  // Create canvas with a width and height based on the window size, and center it
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2); // Center the canvas

  textFont(font);

  // Initialize variables
  radius = 300;
  hotColour = color(255, 0, 0, a);
  coldColour = color(0, 0, 255, a);

  // Populate the averageTemps array
  for (let rowI = 0; rowI < 40; rowI++) {
    for (let colI = 0; colI < 12; colI++) {
      averageTemps.push(parseFloat(table.get(rowI, colI)));  // Convert to float
    }
  }

  // Calculate min and max temperatures
  minTemp = min(averageTemps);
  maxTemp = max(averageTemps);

  // Define stroke cap and text alignment
  strokeCap(SQUARE);
  textAlign(CENTER, CENTER);

  // UI elements (buttons, sliders, etc.)
  createButtons();

  calculate();
  draw();
}

function createButtons() {
  // Button to cycle through decades
  let decadeButtonElement = createButton('Next Decade');
  decadeButtonElement.position(20, 80);
  decadeButtonElement.mousePressed(() => {
    decadeButton = (decadeButton + 1) % 4;
    updateDecadeSelection();
    calculate();
  });

  // Slider to adjust the year within the selected decade
  let yearDialElement = createSlider(0, 9, 0, 1);
  yearDialElement.position(20, 120);
  yearDialElement.input(() => {
    yearDial = yearDialElement.value();
    exactYear = yearDial;
    calculate();
  });
}

function updateDecadeSelection() {
  // Cleaner and clearer structure for decade selection
  if (decadeButton === 0) decadeSelection = yearEighties;
  else if (decadeButton === 1) decadeSelection = yearNineties;
  else if (decadeButton === 2) decadeSelection = yearNoughties;
  else decadeSelection = yearTens;
}

function calculate() {
  let decade = decadeButton;
  let r = height * circleDistance;
  let textR = height * 0.25;
  radius = [];
  textRadius = [];
  theta = [];
  delta = [];

  // Populate radius and temperature data for circles
  for (let i = 0 + 120 * decade; i < 120 + 120 * decade; i++) {
    radius.push(averageTemps[i] * r);
    textRadius.push(textR + r * 0.6);
    theta.push(((2 * Math.PI) / 12) * i + 0.25 * (Math.random() - 0.5));
    delta.push(map(averageTemps[i], minTemp, maxTemp, 0, 1));
  }
}

function draw() {
  background(50);  // Dark gray background (RGB)

  push();
  translate(width / 2, height / 2);
  rotateX(angle);
  rotateY(angle);

  // Draw the temperature data as 3D points
  drawTemperatureData();

  pop();

  // Update rotation angle
  angle += 0.01;

  // Change text color to light blue
  fill(173, 216, 230);  // RGB for light blue
  textSize(36);
  noStroke();
  text(HEADERTEXT, width / 2, TOPMARGIN / 2);

  // Draw time periods with light blue color
  textSize(24);
  text(timePeriods[0], 140, 150);
  text(timePeriods[1], 140, 190);
  text(timePeriods[2], 140, 230);
  text(timePeriods[3], 140, 270);
  stroke(255);
  strokeWeight(3);
  line(40, 167 + 40 * decadeButton, 245, 167 + 40 * decadeButton);

  // Draw exact year with light yellow color
  fill(255, 255, 224);  // Light yellow
  stroke(255);
  textSize(50);
  strokeWeight(1);
  text(decadeSelection[exactYear], 1200, 800);

  // Add interactive controls for rotation
  orbitControl();
}

function drawTemperatureData() {
  for (let i = 0; i < radius.length; i++) {
    let latIndex = int(i / 12);
    let lonIndex = i % 12;
    let lat = map(latIndex, 0, 9, -90, 90);
    let lon = map(lonIndex, 0, 11, -180, 180);

    let temp = averageTemps[i];
    let x = radius[latIndex] * cos(radians(lat)) * cos(radians(lon));
    let y = radius[latIndex] * sin(radians(lat));
    let z = radius[latIndex] * cos(radians(lat)) * sin(radians(lon));

    // Change the color based on temperature
    let tempColor = lerpColor(coldColour, hotColour, delta[i]);

    push();
    translate(x, y, z);
    fill(tempColor);
    noStroke();
    sphere(circleSize);  // Increased circle size for better visibility
    pop();
  }
}
