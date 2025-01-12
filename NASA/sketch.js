let table;
let averageTemps = [];
let minTemp, maxTemp;
let hotColour, coldColour;
let vhc = 0;
let exactYear = 0;
let rot = 0;
let trot = 0;
let theta = [];
let thetaT = [];
let radius = [];
let delta = [];
let textRadius = [];
let stopDraw = 0;
let months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
let tempDegree = ["0°"];
let timePeriods = ["1880-1889", "1890-1899", "1900-1909", "1910-1919", "1920-1929", "1930-1939",
  "1940-1949", "1950-1959", "1960-1969", "1970-1979", "1980-1989",
  "1990-1999", "2000-2009", "2010-2019"];

function preload() {
  console.log("Loading data...");
  table = loadTable('Data/data.csv', 'csv', 'header');

  table.on('FileLoaded', function () {
    console.log("Data loaded successfully");
  });

  table.on('FileLoadError', function (error) {
    console.error("Error loading data:", error);
  });
}


function setup() {
  createCanvas(800, 600);

  // Wait for table to load before proceeding
  table.ready(function () {
    console.log("Table ready");

    // Parse data into averageTemps array
    let rows = table.rows;
    averageTemps = [];
    for (let i = 0; i < rows.length; i++) {
      averageTemps.push(parseFloat(rows[i].get('averageTemp'))
    }};

    // Find min and max temperatures
    minTemp = min(averageTemps);
    maxTemp = max(averageTemps);

    // Initialize colors
    hotColour = color(255, 0, 0);
    coldColour = color(0, 0, 255);

    // Calculate initial positions
    calculate();
  });
}

function draw() {
  background(220);

  // Draw temperature line plot
  drawTemperatureLinePlot();

  // Add labels and annotations
  addLabelsAndAnnotations();
}

function calculate() {
  let decade = floor(frameCount / 60); // Update every second
  rot += 0.01;

  radius = [];
  theta = [];
  for (let i = 0; i < averageTemps.length; i++) {
    let t = frameCount * 0.01 + i;
    radius.push(map(averageTemps[i], minTemp, maxTemp, 50, 200));
    theta.push(t);
  }
}

function drawTemperatureLinePlot() {
  beginShape();
  noStroke();
  fill(100, 50);
  for (let i = 0; i < averageTemps.length; i++) {
    let x = map(i, 0, averageTemps.length - 1, width * 0.2, width - width * 0.2);
    let y = height - map(averageTemps[i], minTemp, maxTemp, 0, height);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function addLabelsAndAnnotations() {
  // Add title
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text('Global Temperature Changes Since 1880', width / 2, 20);

  // Add axis labels
  stroke(0);
  line(width * 0.2, height, width * 0.2, 0);
  text('Year', width * 0.2 + 10, height + 15);

  line(10, height, 0, height - 5);
  text('Temperature Anomaly', -30, height + 10);
}
