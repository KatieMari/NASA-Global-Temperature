const CANVAS_RATIO = 0.8;
const HEADERTEXT = "Global Temperature Anomalies";
const TOPMARGIN = 100;

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
let circleSize = 10;
let gaussianRandom = 1;
let circleSpeed = 0.0025;
let decadeButton = 0;
let yearDial = 0;
let circleDistance = 0.25;

function preload() {
  table = loadTable("Data/data.csv", "csv", "header", () => {
    console.log('CSV Loaded');
  }, (error) => {
    console.error('Error loading CSV:', error);
  });
}


function setup() {
  createCanvas(innerWidth * CANVAS_RATIO, innerHeight * CANVAS_RATIO, WEBGL);
  for (let rowI = 0; rowI < 40; rowI++) {
    for (let colI = 0; colI < 12; colI++) {
      averageTemps.push(table.get(rowI, colI));
    }
  }

  minTemp = min(averageTemps);
  maxTemp = max(averageTemps);

  hotColour = color(255, 0, 0, a);
  coldColour = color(0, 0, 255, a);

  strokeCap(SQUARE);
  textAlign(CENTER, CENTER);

  calculate();
}

function calculate() {
  let decade = decadeButton;
  r = height * circleDistance;
  textR = height * 0.25;
  radius = [];
  textRadius = [];
  theta = [];
  delta = [];
  for (let i = 0 + 120 * decade; i < 120 + 120 * decade; i++) {
    radius.push(averageTemps[i] * r);
    textRadius.push(textR + r * 0.6);
    theta.push(((2 * Math.PI) / 12) * i + 0.25 * (Math.random() - 0.5));
    thetaT.push(((2 * Math.PI) / 12) * i);
    delta.push(map(averageTemps[i], minTemp, maxTemp, 0, 1));
  }
}

function draw() {
  background(0, 15);

  // Set up lighting to make the globe look 3D
  pointLight(255, 255, 255, 0, 0, 500); // Light source
  ambientLight(100); // Ambient light for some soft shadows

  // Apply the text on top of the globe
  textSize(36);
  fill(255);
  noStroke();
  text(HEADERTEXT, 0, -height / 2 + TOPMARGIN / 2);

  fill(255);
  text(timePeriods[0], 140, 150);
  text(timePeriods[1], 140, 190);
  text(timePeriods[2], 140, 230);
  text(timePeriods[3], 140, 270);

  stroke(255);
  strokeWeight(3);
  line(40, 167 + 40 * decadeButton, 245, 167 + 40 * decadeButton);

  fill(255);
  stroke(255);
  textSize(50);
  strokeWeight(1);
  text(decadeSelection[exactYear], 1200, 800);

  orbitControl();

  // Outer ring (3D look)
  noFill();
  stroke(255);
  strokeWeight(1);
  sphere(r * 2.8);

  // Middle ring (3D look)
  stroke(255);
  strokeWeight(1);
  sphere(r);

  noStroke();

  let x, y;

  let rotInc = circleSpeed;

  strokeWeight(1);
  for (let i = 0; i < 120; i++) {
    let col = lerpColor(coldColour, hotColour, delta[i], a);
    fill(col);
    stroke(col);
    
    push();
    x = cos(theta[i] + rot) * radius[i];
    y = sin(theta[i] + rot) * radius[i];

    // Use sphere instead of circle to give it a 3D appearance
    push();
    translate(x, y, 0);
    sphere(circleSize);
    pop();

    tx = cos(thetaT[i] + rot) * textRadius[i];
    ty = sin(thetaT[i] + rot) * textRadius[i];

    stroke(0);
    strokeWeight(1);
    fill(225);

    text(months[i], tx, ty);
    textSize(20);
    text(tempDegree[i], tx / 2.8, ty / 2.8);

    pop();
  }

  rot += rotInc;
}
