

///////////////////////////////////////////////////
//  Main code
///////////////////////////////////////////////////

let margin = { top: 0, right: 0, bottom: 0, left: 0 };
let width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

let offset = 200;

const circlesData = [];

/*


double a = random() * 2 * PI
double r = R * sqrt(random())

// If you need it in Cartesian coordinates
double x = r * cos(a)
double y = r * sin(a)


*/

for (let i = 0; i < 100; i++) {
  let a = Math.random() * 2 * Math.PI;
  let r = ((width-offset) / 2) * Math.sqrt(Math.random());
  let cRadius =(Math.random() * 10) + 5;

  const circle = {
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: cRadius / 1.5,
    distance: (Math.floor(Math.random() * (i * 1.5)) + 120),  
    radians: Math.random() * Math.PI * 2,
    velocity: (Math.random() * 0.014) + 0.01
  }

  if (i === 90) {
    circle.x = width / 2;
    circle.y = height / 2;
    circle.distance = 4;
    circle.velocity = 0.02;
    circle.r = 20;
  }

  circlesData.push(circle);
}

let svg = d3.select('.chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      // .attr('transform', `translate(${margin.left}, ${margin.top})`)

let circles = svg.selectAll('circle')
  .data(circlesData)
  .enter()
  .append("circle");

let circleAttributes = circles
  .attr("cx", function (d) { return d.x; })
  .attr("cy", function (d) { return d.y; })
  .attr("r", function (d) { return d.r; })
  .style("fill", '#1DB954');

let selector = svg
  .append('circle')
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", 30)
    .style("stroke-width", 1)
    .style("stroke", 'white')
    .style("fill-opacity", 0);

// const randCircle = circlesData[Math.floor(Math.random() * 99) + 0]

d3.interval(update, 10);

function update() {
  circleAttributes
  .attr("cx", function (d) {
    d.radians += d.velocity;
    d.x = width / 2 + Math.cos(d.radians) * d.distance;
    return d.x;
  })
  .attr("cy", function (d) {
    d.radians += d.velocity;
    d.y = height / 2 + Math.sin(d.radians) * d.distance;
    return d.y;
  })
  .attr("r", function (d) { 
    d.r = d.r;
    return d.r; 
  });

  if (randCircle) {
    selector
    .attr("cx", randCircle.x)
    .attr("cy", randCircle.y)
    .attr("r", randCircle.r + 10);
  }
}

function distance(params) {
// var a = x1 - x2;
// var b = y1 - y2;
// var c = Math.sqrt( a*a + b*b );
}