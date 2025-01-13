/*
This template visualizes average temperature changes since 1880
https://data.giss.nasa.gov/gistemp/
*/

// Header Text for Display on the Canvas
const HEADERTEXT = "Annual Global Temperature Fluctuation 1980 - 2019";
const TOPMARGIN = 250;

// Global Variables Used Across the Visualizations
let font;
let table;
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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
let tempDegree = ["0°"];

// Time Periods Defined for Decade Selection
let timePeriods = ["1980 - 1989", "1990 - 1999", "2000 - 2009", "2010 - 2019"];
let yearEighties = [
  "1980",
  "1981",
  "1982",
  "1983",
  "1984",
  "1985",
  "1986",
  "1987",
  "1988",
  "1989",
];
let yearNineties = [
  "1990",
  "1991",
  "1992",
  "1993",
  "1994",
  "1995",
  "1996",
  "1997",
  "1998",
  "1999",
];
let yearNoughties = [
  "2000",
  "2001",
  "2002",
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
];
let yearTens = [
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
];
// Default to the 1980s Decade
let decadeSelection = yearEighties;

let a = 255;
// Size of the Circles Representing Temperature Data Points
let circleSize = 7;
let gaussianRandom = 0;
let circleSpeed = 0.0025;
// Keeps Track of Which Decade is Currently Selected
let decadeButton = 0;
// Slider Value for the Specific Year Within a Decade
let yearDial = 0;
// Distance from the Center for the Circles
let circleDistance = 0.4;
// Initialize Rotation Angle for Sphere
let angle = 0;

function preload() {
  // Load a Custom Font, with Fallback to Arial if it Fails
  font = loadFont(
    "Assets/Oswald.ttf",
    () => {
      console.log("Custom font loaded");
    },
    () => {
      console.log("Custom font loading failed, using default font");
      textFont("Arial");
    }
  );

  // Load the Temperature Data from a CSV File
  table = loadTable(
    "Data/data.csv",
    "csv",
    "header",
    () => {
      console.log("Data loaded successfully.");
      // Log the table array to check the data
      console.log(table.getArray());

      // Check the data for min and max temperatures after the table is loaded
      checkData();
    },
    (error) => {
      console.error("Error loading data:", error);
    }
  );
}

function checkData() {
  averageTemps = [];

  // Start from row 1 to row 40, and from column 1 to column 12 (ignoring the year column)
  for (let rowI = 0; rowI < 40; rowI++) {
    for (let colI = 1; colI < 13; colI++) {
      // Start from column 1 to avoid the year column
      // Convert the temperature data (string) to float
      let temp = parseFloat(table.get(rowI, colI));

      // If valid data, push it into the averageTemps array
      if (!isNaN(temp)) {
        averageTemps.push(temp);
      } else {
        // If invalid data, push a default value (0 or NaN)
        averageTemps.push(0);
      }
    }
  }

  // Log the min and max values of the temperature data
  minTemp = min(averageTemps);
  maxTemp = max(averageTemps);
  console.log("Min Temp:", minTemp);
  console.log("Max Temp:", maxTemp);

  // Calculate delta values for mapping the temperatures to a 0-1 range
  delta = averageTemps.map((temp) => map(temp, minTemp, maxTemp, 0, 1));
  console.log("Delta Values:", delta); // Check the range of delta values
}

// Setup Function Where the Main Canvas and Initial Parameters are Defined
function setup() {
  createCanvas(1000, 600, WEBGL);
  textFont(font);

  // Set Up Basic Visualization Parameters
  // Red Colour for Hot Temperature
  hotColour = color(255, 0, 0);
  // Blue Colour for Cold Temperatures
  coldColour = color(0, 0, 255);

  // Log to check the averageTemps after loading data
  console.log("Average Temps:", averageTemps);

  // Set Stroke Properties for Smoother Graphics
  strokeCap(SQUARE);
  // Align Text to the Center
  textAlign(CENTER, CENTER);

  // Create UI Elements (Buttons, Sliders, etc.)
  createButtons();

  // Perform the Initial Calculation of Temperature Data
  calculate();
  draw();
}

// Function to Create the User Interface Elements
function createButtons() {
  // Button to Cycle Through Decades
  let decadeButtonElement = createButton("Next Decade");
  decadeButtonElement.position(20, 80);
  decadeButtonElement.mousePressed(() => {
    // Cycle Through the Four Decades
    decadeButton = (decadeButton + 1) % 4;
    updateDecadeSelection();
    // Recalculate Data for the Selected Decade
    calculate();
  });

  // Slider to Adjust the Year Within the Selected Decade
  let yearDialElement = createSlider(0, 9, 0, 1);
  yearDialElement.position(20, 120);
  yearDialElement.input(() => {
    // Set the Selected Year
    yearDial = yearDialElement.value();
    exactYear = yearDial;
    // Recalculate for the New Year
    calculate();
  });
}

// Function to Update the Decade Selection Based on the Current Button Press
function updateDecadeSelection() {
  // Depending on the Button Press, Select the Corresponding Decade
  if (decadeButton === 0) decadeSelection = yearEighties;
  else if (decadeButton === 1) decadeSelection = yearNineties;
  else if (decadeButton === 2) decadeSelection = yearNoughties;
  else decadeSelection = yearTens;
}

// Function to Calculate the Visualization Data Based on the Selected Decade and Year
function calculate() {
  let decade = decadeButton;
  // Calculate the Radius for the Circles
  let r = height * circleDistance;
  // Text Radius for the Displayed Year
  let textR = height * 0.25;
  radius = [];
  textRadius = [];
  theta = [];
  delta = [];

  // Populate Radius and Temperature Data for Circles
  for (let i = 0 + 120 * decade; i < 120 + 120 * decade; i++) {
    // Scale the Temperature Data for Visualization
    radius.push(averageTemps[i] * r);
    // Adjust the Text Position Based on Radius
    textRadius.push(textR + r * 0.6);
    // Calculate Angle for Each Point
    theta.push(((2 * Math.PI) / 12) * i + 0.25 * (Math.random() - 0.5));
    // Map Temperature to a Value Between 0 and 1
    delta.push(map(averageTemps[i], minTemp, maxTemp, 0, 1));
  }
}

// Function to Draw the Visualization on the Canvas
function draw() {
  // Set Background with Some Transparency
  background(113, 28, 199, 100);

  // Begin drawing the 3D content
  push();
  // Move the origin to the center of the canvas
  translate(width / 45, height / 45);
  // Temporary
  // rotateX(angle);
  // rotateY(angle);

  // Draw the Wireframe Sphere
  drawWireframeSphere();

  // Draw the Temperature Data as 3D Points
  drawTemperatureData();

  // End the 3D Drawing Context
  pop();

  // Update Rotation Angle for the Globe Animation
  angle += 0.01;

  // Display the Header Text at the Top of the Screen
  textSize(36);
  fill(255);
  noStroke();
  text(HEADERTEXT, width / 30, -TOPMARGIN);
  // Sets Colour of the Text
  fill(0);

  // Display Time Periods for the Selected Decade
  fill(255);
  textSize(25);
  // Adjust Placement of Text
  text(timePeriods[0], -350, -150);
  text(timePeriods[1], -350, -120);
  text(timePeriods[2], -350, -90);
  text(timePeriods[3], -350, -60);

  // Draw Decade Line
  stroke(255);
  strokeWeight(3);
  line(-415, -132 + 30 * decadeButton, -285, -132 + 30 * decadeButton);

  // Draw Exact Year Text
  fill(255);
  stroke(255);
  textSize(50);
  strokeWeight(1);
  text(decadeSelection[exactYear], 300, 200);
  
  // orbitControl();
}

// Function to Draw the Wireframe Sphere for Temperature Data
function drawWireframeSphere() {
  
  push();
  translate(-10, 0, 0); 
   
  orbitControl();
  // Set the Wireframe Sphere's Radius
  noFill();
  stroke(255, 100);
  strokeWeight(0.8);
  sphere(200);
  
  pop();
}

// Function to Draw the Circles Representing Each Temperature Data Point
function drawTemperatureData() {
  orbitControl();
  for (let i = 0; i < delta.length; i++) {
    // Map the Temperature Data to a Colour (Blue for Cold, Red for Hot)
    let col = lerpColor(coldColour, hotColour, delta[i]);

    // Calculate the Position of Each Circle Using Polar Coordinates
    let x = radius[i] * cos(theta[i]);
    let y = radius[i] * sin(theta[i]);
    // Draw Each Circle Representing a Temperature
    push();
    translate(x, y);
    noStroke();
    fill(col);
    ellipse(0, 0, circleSize, circleSize);
    pop();
  }
}
