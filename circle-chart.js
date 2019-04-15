const pickBtn = document.getElementById('pick-btn');
const pulseBtn = document.getElementById('pulse-btn');
const songNameDiv = document.getElementById('song-name');
const songDataDiv = document.getElementById('song-data');
const mainBg = document.getElementById('main-bg');
const backBtn = document.getElementById('back-btn');
const tutorialPanel = document.getElementById('tutorial-panel');
const tutorialBtn = document.getElementById('tutorial-btn');

mainBg.style.fontSize = window.outerWidth / 8.3 + 'px';

///////////////////////////////////////////////////
//  Methods
///////////////////////////////////////////////////

const getSongData = (circle) => circle.data;

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pulseOut = (circle, pulseSpeed) => {
  // moving from the center
  circle.distance += pulseSpeed;
  // slow down
  circle.velocity = circle.velocity / 1.4;
}

const pulseIn = (circle, pulseSpeed) => {
  // moving back to the position
  circle.distance -= pulseSpeed;
  // speed up
  if (circle.velocity < circle.staticVelocity)
    circle.velocity += (circle.staticVelocity - circle.velocity) / 50;
}

//TODO: remove
const generatePropertyElement = (prop, score) =>
  `<div class="song-prop">
    ${prop}
    <div class="progress" style="width:${score * 100}%"></div>
  </div>`;


///////////////////////////////////////////////////
//  Behaviours
///////////////////////////////////////////////////  

const danceability = (circle) => {
  if (circle.id === randCircle.id) return;
  console.log(danceabilityScale(randCircle.data.danceability))
  circle.distance += (25 * Math.sin(danceabilityScale(randCircle.data.danceability) * circle.radians)) / 10;
}

const loudness = (circle) => {
  if (circle.loudnessCounter == 0) {
    circle.r = circle.r * 1.5//loudnessScale(randCircle.data.loudness);
    circle.loudnessCounter = circle.loudnessCounter + 1;
  } else if (circle.loudnessCounter == 45) {
    circle.r = circle.oldRad;
    circle.loudnessCounter += 1;
  } else if (circle.loudnessCounter == 90) {
    circle.loudnessCounter = 0;
  } else {
    circle.loudnessCounter += 1;
  }
}

const valence = (circle) => {
  circle.color = colorScale(randCircle.data.valence)
}

const tempo = (circle) => {
  circle.tempo = tempoScale(randCircle.data.tempo)
}

///////////////////////////////////////////////////
//  Main code
///////////////////////////////////////////////////

let margin = { top: 0, right: 0, bottom: 0, left: 0 };
let width = 800 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;

let offset = 200;

const minDistance = 160;
const pulseDistanceLimit = 380;
const pulseExpandFactor = 20;
const pulseCollapsFactor = 50;

let circlesData = [];
let pulseDone = false;
let selectedCircleIndex = 0;

let isSpreaded = false;

const colorScale = d3.scaleLinear()
  .domain([0, 1])
  .range([d3.rgb("#116f32"), d3.rgb('#77d598')])
const loudnessScale = d3.scaleLinear()
  .domain([-11, 0])
  .range([1.1, 1.7]);
const tempoScale = d3.scaleLinear()
  .domain([60, 200])
  .range([2, 1]);
const danceabilityScale = d3.scaleQuantize()
  .domain([0, 1])
  .range([1, 3, 4, 5, 6]);
for (let i = 0; i < songs.length; i++) {
  let a = Math.random() * 2 * Math.PI;
  let r = ((width - offset) / 2) * Math.sqrt(Math.random());
  let cRadius = (Math.random() * 10) + 5;
  let staticVelocity = ((Math.random() * 0.014) + 0.016) * 1.5;

  const circle = {
    id: songs[i].id,
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: 7,//cRadius / 1.5,
    color: '#1DB954',
    opacity: 0.0,
    distance: (minDistance),  //(Math.floor(Math.random() * (i * 1.0)) + minDistance)
    oldDist: (minDistance),
    radians: Math.random() * Math.PI * 2,
    oldRad: 7,//cRadius / 1.5,
    velocity: staticVelocity,
    staticVelocity,
    data: songs[i],
    tempo: 1,
    loudnessCounter: 0,
    danceabilityCounter: 0,
    danceabilityBool: false
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
  .attr("distance", function (d) { return d.distance })
  .style("fill", function (d) { return d.color })
  .style("transition", function (d) { return d.tempo });


let selector = svg
  .append('circle')
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", 30)
  .style("stroke-width", 1)
  .style("stroke", 'white')
  .style("fill-opacity", 0);

let selectorLine = svg
  .append('line')
  .attr("x2", width)
  .attr("y2", height / 2)
  .style("stroke-width", 1)
  .style("stroke", 'white');

update();


d3.interval(update, 9);


function update() {
  circleAttributes
    .each(function (d) {
      valence(d);
      loudness(d);
      tempo(d);
      danceability(d);
      // go to center
      if (d.id === randCircle.id && d.distance >= 10) d.distance -= d.distance / 50;
      // pulse
      if (d.distance >= pulseDistanceLimit) pulseDone = true;
      if (d.id !== randCircle.id) {
        if (isSpreaded && !pulseDone) {
          d.velocity -= d.velocity / 90;
          // pulseOut(d, d.distance / pulseExpandFactor)
        }
        // if (pulseDone && d.distance !== d.oldDist) {
        //   // moving back to the position
        //   if ( !isSpreaded) pulseIn(d, (d.distance - d.oldDist) / pulseCollapsFactor);
        // } else{
        //   // moving from the center
        //   pulseOut(d, d.distance / pulseExpandFactor)
        // }
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
    })
    .attr('distance', d => Math.cos(5 * d.radians))
    .attr('r' , d => d.r)
    .style('fill', d => d.color)
    .style('transition', d=> 'r '+ d.tempo + 's, fill 1s ease-out');

  selectorLine
    .attr("x1", randCircle.x + (randCircle.r + 10) * Math.cos(0))
    .attr("y1", randCircle.y + (randCircle.r + 10) * Math.sin(0))
    .style('transition', 'x1 y1 ' + randCircle.tempo + 's');

  selector
    .attr("cx", randCircle.x)
    .attr("cy", randCircle.y)
    .attr("r", randCircle.r + 10)
    .style('transition', 'r ' + randCircle.tempo + 's');
}

pickBtn.addEventListener('click', (e) => {
  pickRandomCircle();
});

pulseBtn.addEventListener('click', (e) => {
  toggleSpread();
})

backBtn.addEventListener('click', (e) => {
  tutorialPanel.style.animation = '.3s ease-out 0s 1 slideOutFromRight';
  setTimeout(function(){
    tutorialPanel.style.visibility = 'hidden'
  }, 150);
})

tutorialBtn.addEventListener('click', (e) => {
  tutorialPanel.style.visibility = 'visible'
  tutorialPanel.style.animation = '.3s ease-out 0s 1 slideInFromLeft';
})
document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    e.preventDefault();
    pickRandomCircle();
  }
}

// TODO: spread to center as well 
function toggleSpread() {
  if (!isSpreaded) {
    // go to spread
    pulseDone = false;
    songDataDiv.style.right = '0%';
    songNameDiv.style.right = '0%'
  } else {
    // go to unspread
    songDataDiv.style.right = '10%';
    songNameDiv.style.right = '10%';
  }
  isSpreaded = !isSpreaded;
}

// TODO: should return a circle and not assign it, motherfucker
function pickRandomCircle() {
  if (selectedCircleIndex === circlesData.length - 1) {
    selectedCircleIndex = 0;
    circlesData = shuffle(circlesData);
  } else {
    selectedCircleIndex++;
  }
  randCircle = circlesData[selectedCircleIndex];
  if (!isSpreaded) pulseDone = false;
  dispaySongData(getSongData(randCircle));
}

function dispaySongData(data) {
  songNameDiv.innerText = `${data.artists} - ${data.name}`;
  songDataDiv.innerHTML = `
    ${generatePropertyElement('danceability', data.danceability)}
    ${generatePropertyElement('loudness', data.loudness)}
    ${generatePropertyElement('valence', data.valence)}
    ${generatePropertyElement('tempo', data.tempo)}
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
