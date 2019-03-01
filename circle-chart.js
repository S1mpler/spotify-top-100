

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
    id: i,
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: cRadius / 1.5,
    distance: (Math.floor(Math.random() * (i * 1.5)) + 120),  
    radians: Math.random() * Math.PI * 2,
    velocity: (Math.random() * 0.014) + 0.01
  }

  // if (i === 90) {
  //   circle.x = width / 2;
  //   circle.y = height / 2;
  //   circle.distance = 4;
  //   circle.velocity = 0.02;
  //   circle.r = 20;
  // }

  circlesData.push(circle);
}


let randCircle = circlesData[Math.floor(Math.random() * 99) + 0]
randCircle.oldDist = randCircle.distance;


// D3

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
    
let selectorLine = svg
  .append('line')
    .attr("x1", width/2 + 30 * Math.cos(315))
    .attr("y1", height/2 + 30 * Math.sin(315))
    .attr("x2", width - width / 7)
    .attr("y2", height - height/7)
    .style("stroke-width", 1)
    .style("stroke", 'white');

d3.interval(update, 10);

function update() {
  circleAttributes
    .attr("cx", function (d) {

      if (d.id === randCircle.id && d.distance > 4) d.distance -= d.distance / 100;

      d.radians += d.velocity;
      d.x = width / 2 + Math.cos(d.radians) * d.distance;
      return d.x;
    })
    .attr("cy", function (d) {

      if (d.id === randCircle.id && d.distance > 4) d.distance -= d.distance / 100;

      d.radians += d.velocity;
      d.y = height / 2 + Math.sin(d.radians) * d.distance;
      return d.y;
    });

  selectorLine
    .attr("x1", randCircle.x + (randCircle.r + 10) * Math.cos(315))
    .attr("y1", randCircle.y + (randCircle.r + 10) * Math.sin(315))

  selector
    .attr("cx", randCircle.x)
    .attr("cy", randCircle.y)
    .attr("r", randCircle.r + 10);
}

document.body.onkeyup = function(e){
  if (e.keyCode == 32){
    e.preventDefault();
    console.log('old', randCircle);
    randCircle = circlesData[Math.floor(Math.random() * 99) + 0];
    randCircle.oldDist = randCircle.distance;
    console.log('new', randCircle);
  }
}