//Create variables here
var database;

var dog, dog_img, happydog_img, saddog_img, foodS, foodstock;

var feed, addStock;
var fedTime, lastFed;
var foodObj;

var changeState, readState;

var namebox, namebutton, name;

var foodlimit = 35;

var bedroom, garden, washroom, livingroom;

var gameState, dogState = "normal";

function preload() {
  //load images here
  dog_img = loadImage("Dog.png");
  happydog_img = loadImage("Happy.png");
  bedroom = loadImage("Bed Room.png");
  garden = loadImage("Garden.png");
  washroom = loadImage("Wash Room.png");
  livingroom = loadImage("Living Room.png");
  saddog_img = loadImage("Lazy.png");
}

function setup() {
  createCanvas(500, 500);

  foodObj = new Food();

  feed = createButton("Feed");
  feed.position(700, 95);
  feed.mousePressed(feedDog);

  addStock = createButton("Add food");
  addStock.position(750, 95);
  addStock.mousePressed(addFood);

  dog = createSprite(250, 350);
  dog.addImage("normal", dog_img);
  dog.addImage("happy", happydog_img);
  dog.addImage("sad", saddog_img);
  dog.scale = 0.15;

  database = firebase.database();

  foodstock = database.ref("Food");
  foodstock.on("value", data => foodS = data.val());

  readState = database.ref("gameState");
  readState.on("value", data => gameState = data.val());

  //to have 20 bottles of milk at the start;
  database.ref("/").update({
    "Food": 20
  });

  fedTime = database.ref("feedTime");
  fedTime.on("value", data => lastFed = data.val());

  namebox = createInput("Unknown Dog");
  namebox.position(410, 50);

  namebutton = createButton("Name");
  namebutton.position(410, 75);
  namebutton.mousePressed(() => {
    name = namebox.value();
  });
}

function update(state) {
  database.ref("/").update({
    gameState: state
  })
}


function draw() {
  background(46, 139, 87);

  drawSprites();

  if (gameState !== "hungry") {
    feed.hide();
    addStock.hide();
    dog.visible = false;
  } else {
    feed.show();
    addStock.show();
    dog.visible = true;
  }

  dog.changeImage(dogState);

  //add styles here
  textSize(20);
  fill(255);
  textAlign(CENTER, CENTER);

  let currentTime = hour();

  if (currentTime == lastFed + 1) {
    update("playing");
    foodObj.garden();
    text(`Time until sleeping: 1hr`, 300, 50);
  } else if (currentTime == lastFed + 2) {
    update("sleeping");
    foodObj.bedroom();
    text(`Time until relaxing: 1hr`, 300, 50);
  } else if (currentTime == lastFed + 3) {
    update("relaxing");
    foodObj.livingroom();
    text(`Time until bathing: 1hr`, 300, 50);
  } else if (currentTime == lastFed + 4) {
    update("bathing");
    foodObj.washroom();
    text(`Time until hungry: 1hr`, 300, 50);
  } else if (gameState == "hungry") {
    dogState = "sad";
    update("hungry");
    foodObj.display();
  }

  text(`Food Remaining: ${foodS}`, 250, 100);

  text(name, 230, 465);

  text(`Dog state: ${dogState}`, 250, 150);

  if (lastFed == 0) {
    text(`Last Feed: 12 AM`, 350, 30);
  } else if (lastFed >= 12) {
    text(`Last Feed: ${lastFed % 12} PM`, 350, 30);
  } else {
    text(`Last Feed${lastFed} AM`, 350, 20);
  }

  if (foodS >= foodlimit) {
    text("Food Limit Reached!", 350, 150);
  }

}

function feedDog() {
  dog.changeImage("happy");
  dogState = "happy";

  writeStock();
  database.ref("/").update({
    "feedTime": hour()
  })
}

function addFood() {

  if (foodS < foodlimit) {
    foodS++;
    database.ref("/").update({
      "Food": foodS
    });
  }
}

function writeStock() {

  foodS--;
  database.ref("/").update({
    "Food": foodS
  });

  if (foodS < 0) {
    foodS = 0
  }
}