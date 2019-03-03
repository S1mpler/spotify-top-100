

///////////////////////////////////////////////////
//  Main code
///////////////////////////////////////////////////

let margin = { top: 0, right: 0, bottom: 0, left: 0 };
let width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

let offset = 200;

const minDistance = 110;
const circlesData = [];

console.log(songs.length);


for (let i = 0; i < songs.length; i++) {
  let a = Math.random() * 2 * Math.PI;
  let r = ((width-offset) / 2) * Math.sqrt(Math.random());
  let cRadius =(Math.random() * 10) + 5;

  const circle = {
    id: songs[i].id,
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: cRadius / 1.5,
    distance: (Math.floor(Math.random() * (i * 0.5)) + minDistance),  
    radians: Math.random() * Math.PI * 2,
    velocity: (Math.random() * 0.014) + 0.01,
    data: songs[i]
  }

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
    .attr("cx", function (d) {

      //go to center
      if (d.id === randCircle.id && d.distance > 4) d.distance -= d.distance / 100;

      // go from center
      if (d.id !== randCircle.id && d.distance < d.oldDist) d.distance += (d.oldDist - d.distance) / 100;

      d.radians += d.velocity;
      d.x = width / 2 + Math.cos(d.radians) * d.distance;
      return d.x;
    })
    .attr("cy", function (d) {

      //go to center
      if (d.id === randCircle.id && d.distance > 4) d.distance -= d.distance / 100;

      //go from center
      if (d.id !== randCircle.id && d.distance < d.oldDist) d.distance += (d.oldDist - d.distance) / 100;

      d.radians += d.velocity;
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

const pickBtn = document.getElementById('pick-btn');
const pulseBtn = document.getElementById('pulse-btn');
const songNameDiv = document.getElementById('song-name');
const songDataDiv = document.getElementById('song-data');

let isPulsed = false;

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
  randCircle = circlesData[Math.floor(Math.random() * 99) + 0];
  randCircle.oldDist = randCircle.distance;
  dispaySongData(getSongData(randCircle));
}

function dispaySongData(data) {
  songNameDiv.innerText = `${data.artists} - ${data.name}`;
  // "id": "6DCZcSspjsKoFjzjrWoCd",
  // "name": "God's Plan",
  // "artists": "Drake",
  // "danceability": 0.754,
  // "energy": 0.449,
  // "key": 7,
  // "loudness": -9.211,
  // "mode": 1,
  // "speechiness": 0.109,
  // "acousticness": 0.0332,
  // "instrumentalness": 0.0000829,
  // "liveness": 0.552,
  // "valence": 0.357,
  // "tempo": 77.169,
  // "duration_ms": 198973,
  // "time_signature": 4
  songDataDiv.innerText = `
    danceability\t\t-\t${data.danceability}\n
    loudness\t-\t${data.loudness}\n
    valence\t-\t${data.valence}\n
    -\n
    energy\t\t-\t${data.energy}\n
    speechiness\t-\t${data.speechiness}\n
    acousticness\t-\t${data.acousticness}\n
    instrumentalness\t-\t${data.instrumentalness}\n
    liveness\t-\t${data.liveness}\n
    tempo\t-\t${data.tempo}\n
    duration\t-\t${data.duration_ms / (1000 * 60)}\n
  `;
}

function getSongData(circle) {
  return circle.data;
}