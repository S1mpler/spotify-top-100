

///////////////////////////////////////////////////
//  Main code
///////////////////////////////////////////////////

let margin = { top: 0, right: 0, bottom: 0, left: 0 };
let width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

let offset = 200;

const minDistance = 110;
const pulseDistanceLimit = 280;
const pulseExpandFactor = 20;
const pulseCollapsFactor = 50;


let circlesData = [];
let pulseDone = false;
let selectedCircleIndex = 0;

const pickBtn = document.getElementById('pick-btn');
const pulseBtn = document.getElementById('pulse-btn');
const songNameDiv = document.getElementById('song-name');
const songDataDiv = document.getElementById('song-data');

let isPulsed = false;

console.log(songs.length);

for (let i = 0; i < songs.length; i++) {
  let a = Math.random() * 2 * Math.PI;
  let r = ((width-offset) / 2) * Math.sqrt(Math.random());
  let cRadius =(Math.random() * 10) + 5;
  let staticVelocity = ((Math.random() * 0.014) + 0.016) * 2;

  const circle = {
    id: songs[i].id,
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: cRadius / 1.5,
    distance: (Math.floor(Math.random() * (i * 0.5)) + minDistance),  
    oldDist: (Math.floor(Math.random() * (i * 0.5)) + minDistance),  
    radians: Math.random() * Math.PI * 2,
    velocity: staticVelocity,
    staticVelocity,
    data: songs[i]
  }

  circlesData.push(circle);
}

// shuffle data
circlesData = shuffle(circlesData);
let randCircle;
pickRandomCircle(selectedCircleIndex);

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
    // .attr("x1", width/2 + 30 * Math.cos(315))
    // .attr("y1", height/2 + 30 * Math.sin(315))
    .attr("x2", width)
    .attr("y2", height / 2)
    .style("stroke-width", 1)
    .style("stroke", 'white');

update();
d3.interval(update, 10);

function update() {
  circleAttributes
    .each(function(d) {
      // go to center
      if (d.id === randCircle.id && d.distance >= 10) d.distance -= d.distance / 50;
      // pulse
      if (d.distance >= pulseDistanceLimit) pulseDone = true;
      if (d.id !== randCircle.id) {
        if (pulseDone && d.distance !== d.oldDist) {
          // moving back to the position
          d.distance -= (d.distance - d.oldDist) / pulseCollapsFactor;
          if (d.velocity < d.staticVelocity)
            d.velocity += (d.staticVelocity - d.velocity)/50;
        } else {
          // moving from the center
          d.distance += d.distance / pulseExpandFactor;
          d.velocity = d.velocity / 1.4;
          // d.r += 5;
        }
      }
      // go from center
      d.radians += d.velocity;
      if (d.radians > 360) d.radians -= 360;
    })
    .attr("cx", function (d) {
      d.x = width / 2 + Math.cos(d.radians) * d.distance;
      return d.x;
    })
    .attr("cy", function (d) {
      d.y = height / 2 + Math.sin(d.radians) * d.distance;
      return d.y;
    });

  selectorLine
    .attr("x1", randCircle.x + (randCircle.r + 10) * Math.cos(0))
    .attr("y1", randCircle.y + (randCircle.r + 10) * Math.sin(0))

  selector
    .attr("cx", randCircle.x)
    .attr("cy", randCircle.y)
    .attr("r", randCircle.r + 10);
}

pickBtn.addEventListener('click', (e) => {
  pickRandomCircle();
});

pulseBtn.addEventListener('click', (e) => {
  pulseCircles();
  isPulsed = !isPulsed;
})


document.body.onkeyup = function(e){
  if (e.keyCode == 32){
    e.preventDefault();
    pickRandomCircle();
  }
}

// TODO: work on it
function pulseCircles() {
  // circlesData.forEach(c => {
  //   if (c.id === randCircle.id) return;

  //   if (!isPulsed) c.distanceFactor = (c.distance - minDistance) * 2;
  //   c.distance += isPulsed ? -c.distanceFactor : c.distanceFactor;
  // })
}

function pickRandomCircle() {
  if (selectedCircleIndex === circlesData.length - 1) {
    selectedCircleIndex = 0;
    circlesData = shuffle(circlesData);
  } else {
    selectedCircleIndex++;
  }
  randCircle = circlesData[selectedCircleIndex];
  pulseDone = false;
  dispaySongData(getSongData(randCircle));
}

function dispaySongData(data) {
  songNameDiv.innerText = `${data.artists} - ${data.name}`;
  songDataDiv.innerText = `
    danceability\t\t-\t${data.danceability}\n
    loudness\t-\t${data.loudness}\n
    valence\t-\t${data.valence}\n
  `;
  // -\n
  // energy\t\t-\t${data.energy}\n
  // speechiness\t-\t${data.speechiness}\n
  // acousticness\t-\t${data.acousticness}\n
  // instrumentalness\t-\t${data.instrumentalness}\n
  // liveness\t-\t${data.liveness}\n
  // tempo\t-\t${data.tempo}\n
  // duration\t-\t${data.duration_ms / (1000 * 60)}\n
}

function getSongData(circle) {
  return circle.data;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}