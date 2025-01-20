/*
This template visualizes average temperature changes since 1880
https://data.giss.nasa.gov/gistemp/
*/

// Header Text for Display on the Canvas
const HEADERTEXT = "Annual Global Temperature Fluctuation 1980 - 2019";
const TOPMARGIN = 250;

// Global Variables Used Across the Visualizations
let slider;
// Font used for Text Display
let font;
// Holds the Loaded CSV Data
let table;
// Stores all temperature data for processing
let averageTemps = [];
// Minimum and maximum temperature values
let minTemp, maxTemp;
// Colours for visualizing hot and cold temperatures
let hotColour, coldColour;
// Selected year for visualization
let exactYear = 0;
// Angles for positioning temperature data points
let theta = [];
// Distances of data points from the center
let radius = [];
// Normalized temperature values for mapping to colours
let delta = [];
// Distances for placing text labels
let textRadius = [];
// Month Lables for Display
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Placeholder for temperature degree label
let tempDegree = ["0°"];

// Time Periods Defined for Decade Selection
let timePeriods = ["1980 - 1989", "1990 - 1999", "2000 - 2009", "2010 - 2019"];
// Arrays representing years in each decade
let yearEighties = ["1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989"];
let yearNineties = ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999"];
let yearNoughties = ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"];
let yearTens = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];
// Default to the 1980s Decade
let decadeSelection = yearEighties;

// Opacity value for certain elements
let a = 255;
// Size of the spheres representing temperature data points
let circleSize = 10;
// Placeholder for randomness in visuals
let gaussianRandom = 0;
// Keeps Track of Which Decade is Currently Selected
let decadeButton = 0;
// Slider Value for the Specific Year Within a Decade
let yearDial = 0;
// Slider element for year selection
let yearDialElement;
// Distance factor for positioning temperature data points
let circleDistance = 0.4;
// Rotation angle for the sphere visualization
let angle = 0;

/**
 * Preloads the necessary assets before the sketch starts.
 * - Loads a custom font with a fallback to Arial.
 * - Loads the temperature data from a CSV file and processes it for visualization.
 */
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
    "Data/data.csv", "csv", "header",
    () => {
      console.log("Data loaded successfully.");
      // Log data array for debugging
      console.log(table.getArray());
      // Check the data for min and max temperatures after the table is loaded
      checkData();
    },
    (error) => {
      console.error("Error loading data:", error);
    }
  );
}

/**
 * Processes the loaded temperature data.
 * - Extracts valid temperature values and stores them in the `averageTemps` array.
 * - Calculates the minimum and maximum temperature values.
 * - Normalizes the temperature values to a 0-1 range for visualization.
 */
function checkData() {
  // Reset the array to store valid temperature values
  averageTemps = [];
  // Start from row 1 to row 40, and from column 1 to column 12 (ignoring the year column)
  for (let rowI = 0; rowI < 40; rowI++) {
    for (let colI = 1; colI < 13; colI++) {
      // Convert temperature to float
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

/**
 * Sets up the canvas, UI elements, and initial visualization parameters.
 * - Creates a 3D canvas.
 * - Sets up the decade selection and year selection slider.
 * - Defines basic visual properties (colors, fonts).
 */
function setup() {
  // Create a 3D canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Set the font for text display
  textFont(font);
  // Create the slider for selecting years within a decade
  yearDialElement = createSlider(0, 9, 0, 1);
  yearDialElement.position(46, 120);
  // Slider width
  yearDialElement.style('width', '150px');
  // Change cursor on hover
  yearDialElement.style('cursor', 'pointer');
  // Add an event listener to update data on slider change
  yearDialElement.input(() => {
    // Update yearDial based on slider
    yearDial = yearDialElement.value();
    // Sync the exactYear with the slider value
    exactYear = yearDial;
    // Recalculate data based on new yearDial value
    calculate();
    // Force the canvas to redraw with updated data
    redraw();
  });
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
  // Draw the visuals
  draw();
}

/**
 * Creates the buttons for UI interaction.
 * - Adds a button to switch between decades.
 */
function createButtons() {
  // Button to Cycle Through Decades
  let decadeButtonElement = createButton("Next Decade");
  decadeButtonElement.position(40, 50);
  decadeButtonElement.class("immersive-btn");
  decadeButtonElement.mousePressed(() => {
    // Cycle Through the Four Decades
    decadeButton = (decadeButton + 1) % 4;
    // Update the selected decade
    updateDecadeSelection();
    // Recalculate Data for the Selected Decade
    calculate();
  });
}

/**
 * Updates the currently selected decade based on the button press.
 * - Adjusts the yearDial to the start of the new decade.
 * - Recalculates visualization data for the selected decade.
 */
function updateDecadeSelection() {
  // Depending on the Button Press, Select the Corresponding Decade
  if (decadeButton === 0) {
    decadeSelection = yearEighties;
  } else if (decadeButton === 1) {
    decadeSelection = yearNineties;
  } else if (decadeButton === 2) {
    decadeSelection = yearNoughties;
  } else {
    decadeSelection = yearTens;
  }
  // Reset the Year Dial (Slider) to the Beginning (0)
  yearDial = 0;
  // Set the slider value to 0
  yearDialElement.value(yearDial);
  // Recalculate Data for the Selected Decade
  calculate();
}

/**
 * Calculates visualization data based on the selected decade and year.
 * - Computes positions and colors for temperature data points.
 */
function calculate() {
  let decade = decadeButton;
  // Circle radius for data points
  let r = height * circleDistance;
  // Text placement radius
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

/**
 * Draws the visualization on the canvas.
 * - Renders the wireframe sphere, temperature data points, and UI elements.
 */
function draw() {
  // Dark grey background
  background(54, 69, 79);
  // Display the Header Text at the Top of the Screen
  textSize(36);
  fill(255);
  noStroke();
  // Draw header
  text(HEADERTEXT, width / 30, -400);
  // Sets Colour of the Text
  fill(0)
  // Begin drawing the 3D content
  push();
  // Adjust for center alignment
  translate(width / 45, height / 45);
  // Draw the 3D sphere
  drawWireframeSphere();
  // Plot temperature data
  drawTemperatureData();
  // End the 3D Drawing Context
  pop();
  // Update Rotation Angle for the Globe Animation
  angle += 0.01;
  // Display Time Periods for the Selected Decade
  fill(255);
  textSize(25);
  // Adjust Placement of Text
  text(timePeriods[0], -450, -225);
  text(timePeriods[1], -450, -195);
  text(timePeriods[2], -450, -165);
  text(timePeriods[3], -450, -135);
  // Draw Decade Line
  stroke(255);
  strokeWeight(3);
  line(-515, -206 + 30 * decadeButton, -385, -206 + 30 * decadeButton);
  // Draw Exact Year Text
  fill(255);
  stroke(255);
  textSize(50);
  strokeWeight(1);
  text(decadeSelection[exactYear], 500, 300);
}

/**
 * Draws the wireframe sphere that serves as the base of the visualization.
 * - Displays month labels around the sphere.
 */
function drawWireframeSphere() {
  push();
  // Rotate the sphere and align it with the data points
  rotateY(angle);
  translate(-10, 0, 0);
  // Set the Wireframe Sphere's Radius
  noFill();
  stroke(255, 100);
  strokeWeight(0.5);
  // Creates the base sphere with a radius of 200
  sphere(310);
  // Draw the month labels around the sphere
  for (let i = 0; i < months.length; i++) {
    // Calculate the position for the month label
    // Radius for the month text (outside the sphere)
    let textRadius = 250;
    // Divide the circle into 12 equal parts for each month
    let x = textRadius * cos((TWO_PI / months.length) * i);
    // Calculate y-coordinate based on the angle
    let y = textRadius * sin((TWO_PI / months.length) * i);
    push();
    // Move to the calculated position for the month label
    translate(x, y, 0);
    // Rotate the text to ensure it remains readable regardless of sphere rotation
    rotateY(-angle);
    // Set the text color to white
    fill(255);
    // Set the font size for the month labels
    textSize(16);
    // Draw the current month's label at the calculated position
    text(months[i], 0, 0); // Draw the month text
    pop();
  }
  // Restore the coordinate system to avoid affecting other elements
  pop();
}

/**
 * Draws the spheres representing temperature data points.
 * - Uses polar coordinates to position spheres.
 * - Maps temperature values to color and 3D positions.
 */
function drawTemperatureData() {
  for (let i = 0; i < delta.length; i++) {
    // Map the Temperature Data to a Colour (Blue for Cold, Red for Hot)
    // Interpolate color based on temperature
    let col = lerpColor(coldColour, hotColour, delta[i]);
    // Calculate the Position of Each Sphere Using Polar Coordinates
    // X-coordinate based on the angle and radius
    let x = radius[i] * cos(theta[i]);
    // Y-coordinate based on the angle and radius
    let y = radius[i] * sin(theta[i]);
    // Map temperature to a range on the z-axis for 3D depth
    let z = map(delta[i], 0, 1, -100, 100);
    // Draw Each Sphere Representing a Temperature Data Point
    push();
    // Rotate the visualization to create a dynamic effect
    rotateY(angle);
    // Move to the calculated position in 3D space
    translate(x, y, z);
    // Set the fill color based on the temperature
    fill(col);
    // Draw the sphere with a predefined size
    sphere(circleSize);
    // Restore the coordinate system after drawing the sphere
    pop();
  }
}