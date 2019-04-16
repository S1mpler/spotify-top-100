const pickBtn = document.getElementById('pick-btn');
const spreadBtn = document.getElementById('pulse-btn');
const songNameDiv = document.getElementById('song-name');
const songDataDiv = document.getElementById('song-data');
const mainBg = document.getElementById('main-bg');
const backBtn = document.getElementById('back-btn');
const tutorialPanel = document.getElementById('tutorial-panel');
const tutorialBtn = document.getElementById('tutorial-btn');

const danceRange = document.getElementById('dance-range');
const loudRange = document.getElementById('loud-range');
const valRange = document.getElementById('val-range');
const tempoRange = document.getElementById('tempo-range');

const filters = {
  danceability: 0,
  loudness: 0,
  valence: 0,
  tempo: 0,
}

let filteredSongs = [];

mainBg.style.fontSize = window.outerWidth / 8.3 + 'px';

///////////////////////////////////////////////////
//  Methods
///////////////////////////////////////////////////

const getSongData = (circle) => { return circle ? circle.data : null};

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
    <div class="progress" style="width:${score}%"></div>
  </div>`;


const maxOutRange = 900;

///////////////////////////////////////////////////
//  Behaviours
///////////////////////////////////////////////////  

const danceability = (circle) => {
  if (randCircle && circle.id === randCircle.id) return;
  if (randCircle) circle.distance += (25 * Math.sin(danceabilityScale(randCircle.data.danceability) * circle.radians)) / 10;
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
  if (randCircle) circle.color = colorScale(randCircle.data.valence)
}

const tempo = (circle) => {
  if (randCircle) circle.tempo = tempoScale(randCircle.data.tempo)
}

const filter = (circle) => {
  if (filters.danceability > 0 && danceabilityScoreScale(circle.data.danceability) < filters.danceability) {
    if (circle.distance < maxOutRange) circle.distance += (maxOutRange - circle.distance) / 20;
    return false;
  } 
  if (filters.valence > 0 && valenceScoreScale(circle.data.valence) < filters.valence) {
    if (circle.distance < maxOutRange) circle.distance += (maxOutRange - circle.distance) / 20;
    return false;
  }
  if (filters.loudness > 0 && loudnessScoreScale(circle.data.loudness) < filters.loudness) {
    if (circle.distance < maxOutRange) circle.distance += (maxOutRange - circle.distance) / 20;
    return false;
  }
  if (filters.tempo > 0 && tempoScoreScale(circle.data.tempo) < filters.tempo) {
    if (circle.distance < maxOutRange) circle.distance += (maxOutRange - circle.distance) / 20;
    return false;
  }
  return true;
}

///////////////////////////////////////////////////
//  Main code
///////////////////////////////////////////////////

let margin = { top: 0, right: 0, bottom: 0, left: 0 };
let width = 800 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;

let offset = 200;

const minDistance = 160;
const pulseDistanceLimit = 360;
const pulseExpandFactor = 20;
const pulseCollapsFactor = 50;

let circlesData = [];
let pulseDone = false;
let selectedCircleIndex = 0;

let spreadMode = false;
let isSpreaded = false;

let coords = null;

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
  .range([1, 3, 5, 7, 9]);

for (let i = 0; i < songs.length; i++) {
  let a = Math.random() * 2 * Math.PI;
  let r = ((width - offset) / 2) * Math.sqrt(Math.random());
  // let cRadius = (Math.random() * 10) + 5;
  let staticVelocity = ((Math.random() * 0.014) + 0.016) * 1.5;

  const circle = {
    index: i,
    id: songs[i].id,
    x: ((width) / 2) + r * Math.cos(a),
    y: ((height) / 2) + r * Math.sin(a),
    r: 7,//cRadius / 1.5,
    color: '#1DB954',
    opacity: 0.0,
    distance: (minDistance),  //(Math.floor(Math.random() * (i * 1.0)) + minDistance)
    oldDist: ((Math.floor(Math.random() * (i * 0.9)) + minDistance)),
    radians: Math.random() * Math.PI * 2,
    oldRad: 7,
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

const valenceScoreScale = d3.scaleLinear()
  .domain([0, d3.max(circlesData.map(cd => cd.data.valence))])
  .range([1, 100])
const loudnessScoreScale = d3.scaleLinear()
  .domain([-11, d3.max(circlesData.map(cd => cd.data.loudness))])
  .range([1, 100]);
const tempoScoreScale = d3.scaleLinear()
  .domain([60, d3.max(circlesData.map(cd => cd.data.tempo))])
  .range([1, 100]);
const danceabilityScoreScale = d3.scaleLinear()
  .domain([0, d3.max(circlesData.map(cd => cd.data.danceability))])
  .range([1, 100]);

// shuffle data
circlesData = shuffle(circlesData);
let randCircle;
pickRandomCircle(selectedCircleIndex);

// D3
let svg = d3.select('.chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g');

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

// let selectorLine = svg
//   .append('line')
//   .attr("x2", width)
//   .attr("y2", height / 2)
//   .style("stroke-width", 1)
//   .style("stroke", 'white');

update();


d3.interval(update, 9);


function update() {

  circleAttributes
    .each(function (d) {
      let matchedFilter = filter(d);
      if (matchedFilter) filteredSongs.push(d);
      if (randCircle && randCircle.id === d.id && !matchedFilter) pickRandomCircle();
      // go to center
      if (randCircle && d.id === randCircle.id && d.distance >= 10) d.distance -= d.distance / 50;

      // pulse
      if (d.distance >= pulseDistanceLimit) pulseDone = true;
      if (randCircle && d.id !== randCircle.id) {
        if (isSpreaded && !pulseDone) {
          d.velocity -= d.velocity / 90;
          pulseOut(d, d.distance / pulseExpandFactor)
        }
        if (pulseDone && d.distance !== d.oldDist) {
          // moving back to the position
          if ( !isSpreaded) pulseIn(d, (d.distance - d.oldDist) / pulseCollapsFactor);
        } else{
          // moving from the center
          pulseOut(d, d.distance / pulseExpandFactor)
        }
      }

      if (spreadMode) {
        d.r = 5;
        if (Math.abs(d.distance) > 50 + d.index * d.r / 2 && Math.abs(d.distance) < pulseDistanceLimit)
          d.distance -= (d.distance - d.index * (d.r / 2) - 50) / 15;

        d.radians += d.velocity / 5;
        if (d.radians > 360) d.radians -= 360;
      } else {
        valence(d);
        loudness(d);
        tempo(d);
        danceability(d);

        // go from center
        d.radians += d.velocity;
        if (d.radians > 360) d.radians -= 360;
      }
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

  if (randCircle)
    selector
      .attr("cx", randCircle.x)
      .attr("cy", randCircle.y)
      .attr("r", randCircle.r + 10)
      .style('transition', 'r ' + randCircle.tempo + 's');  

  // selectorLine
  //   .attr("x1", randCircle.x + (randCircle.r + 10 + loudnessScale(randCircle.loudness)) * Math.cos(0))
  //   .attr("y1", randCircle.y + (randCircle.r + 10 + loudnessScale(randCircle.loudness)) * Math.sin(0))
  //   .style('transition', 'x1 y1 ' + randCircle.tempo + 's ease');
}

function toggleSpread() {
  spreadMode = !spreadMode;
  if (coords) coords = null;
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

function pickRandomCircle() {
  filteredSongs = [...new Set(filteredSongs)];
  let array = filteredSongs.length > 0 ? filteredSongs : circlesData;

  if (spreadMode) toggleSpread();
  if (selectedCircleIndex === array.length - 1) {
    selectedCircleIndex = 0;
    array = shuffle(array);
  } else {
    selectedCircleIndex++;
  }
  randCircle = array[selectedCircleIndex];
  if (!isSpreaded) pulseDone = false;
  dispaySongData(getSongData(randCircle));
}

function dispaySongData(data) {
  if (!data) return;
  songNameDiv.innerText = `${data.artists} - ${data.name}`;
  songDataDiv.innerHTML = `
    ${generatePropertyElement('danceability', danceabilityScoreScale(data.danceability))}
    ${generatePropertyElement('loudness', loudnessScoreScale(data.loudness))}
    ${generatePropertyElement('valence', valenceScoreScale(data.valence))}
    ${generatePropertyElement('tempo', tempoScoreScale(data.tempo))}
  `;
}

pickBtn.addEventListener('click', (e) => {
  pickRandomCircle();
});

spreadBtn.addEventListener('click', (e) => {
  toggleSpread();
})

backBtn.addEventListener('click', (e) => {
  tutorialPanel.style.animation = '.3s ease-out 0s 1 slideOutFromRight';
  setTimeout(function(){
    tutorialPanel.style.visibility = 'hidden'
  }, 150);
})

danceRange.addEventListener('input', (e) => {
  filters.danceability = e.target.valueAsNumber;
  
})

loudRange.addEventListener('input', (e) => {  
  filters.loudness = e.target.valueAsNumber;
})

valRange.addEventListener('input', (e) => {
  filters.valence = e.target.valueAsNumber;
})

tempoRange.addEventListener('input', (e) => {
  filters.tempo = e.target.valueAsNumber;
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