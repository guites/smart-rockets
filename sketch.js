var population;
var lifespan = 400;
var lifeP;
var count = 0;
var target;

var rx = 100;
var ry = 400;
var rw = 125;
var rh = 10;

function setup() {
  var sketchCanvas = createCanvas(400, 400);
  sketchCanvas.parent('sketch');
  population = new Population();
  lifeP = createP();
  target = createVector(width/2, 185);
}

function draw() {
  background(0);
  population.run();
  lifeP.html(count);
  count++;
  if (count == lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
  }
  fill(255);
  rect(rx, ry, rw, rh);
  ellipse(target.x, target.y, 16, 16);
}


function Population() {
  this.rockets = [];
  this.popsize = 100;
  this.matingPool = [];

  for (var i=0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function() {
    var maxfit = 0;
    var sumFitness = 0;
    for (var i= 0; i < this.popsize; i++){
      this.rockets[i].calcFitness();
      sumFitness += this.rockets[i].fitness;
      if (this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness;
      }
    }
    metrics.currentHighestFitness = maxfit;
    metrics.avgFitness = sumFitness / this.popsize;
    metrics.iteration++;
    metrics.numCrashed = 0;
    metrics.numCompleted = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness = this.rockets[i].fitness / maxfit;
    }
    this.matingPool = [];
    // TODO: alterar método de matingPool pra acceptReject baseado no fitness score
    // https://www.youtube.com/watch?v=816ayuhDo0E
    for (var i=0; i < this.popsize; i++) {
      var n = this.rockets[i].fitness * 100;
      for (var j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i]);
      }
    }
  }

  this.selection = function() {
    var newRockets = [];
    for (var i = 0; i < this.rockets.length; i++){
      var parentA = random(this.matingPool).dna;
      var parentB = random(this.matingPool).dna;
      var child = parentA.crossover(parentB);
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }

  this.run = function() {
    for (var i=0; i < this.popsize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }
}

function DNA(genes) {
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];
    for (var i=0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(0.1);
    }
  }
  this.crossover = function(partner) {
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++){
      if (i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }
  this.mutation = function() {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(0.1);
      }
    }
  }
}

function Rocket(dna) {
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false;
  // guarda a quantidade de frames passados caso atinja o alvo
  this.frames = 0;

  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.calcFitness = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);
    // TODO: analisar diferenã na fitness entre os foguetes, 
    // caso 1: alterações na distancia dos que não completaram e
    // caso 2: alterações na qtd de frame dos que completaram,
    // tem que achar uma forma e tornar essa diferença exponencial
    // https://www.youtube.com/watch?v=HzaLIO9dLbA&t=0s
    if (this.completed) {
      // caso tenha completado, adiciona um fator em função da quantidade de frames: quanto menos frames, melhor
      console.log(this.fitness);
      this.fitness += lifespan - this.frames;
      this.fitness *= 10;
      if (this.fitness > metrics.recordFitness) {
        metrics.recordFitness = this.fitness;
        console.log(metrics.recordFitness);
      }
      metrics.numCompleted++;
    }
    if (this.crashed) {
      this.crashed = this.crashed / 10;
      metrics.numCrashed++;
    }
  }

  this.update = function() {

    if (!this.completed && !this.crashed) {

    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
      this.completed = true;
      this.frames = count;
      if (this.frames < metrics.recordFrames) {
        metrics.recordFrames = this.frames;
        console.log(metrics.recordFrames);
      }
      this.pos = target.copy();
    }

    if (
      this.pos.x > rx
      && this.pos.x < rx + rw
      && this.pos.y > ry
      && this.pos.y < ry + rh
    ) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    this.applyForce(this.dna.genes[count]);

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    // limita a velocidade máxima
    //this.vel.limit(4);
    }


  }

  this.show = function() {
    push();
    noStroke();
    fill(255,100);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  }
}
