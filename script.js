const canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
const carSize = { length: 40, width: 25 };
let debugMode = true;

const maxSpeed = [4, -2];
const terrainAdhesion = 0.1; // 0 - lód, 1 - pełna przyczepność
const engineFriction = 0.02;
const brakingForce = 0.1;
const acceleration = 0.2;
const turnSpeed = 3;

class player {
    constructor(x, y, color, rotation) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotation = rotation;
        this.points = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ];
        this.speed = 0;
        const cosA = Math.round(Math.cos((this.rotation * Math.PI) / 180) * 100) / 100;
        const sinA = Math.round(Math.sin((this.rotation * Math.PI) / 180) * 100) / 100;     
        this.frontVector = { x: sinA, y: -cosA };
        this.adhesion = terrainAdhesion
        this.calculatePoints();
    }
    calculatePoints() {
        const cosA = Math.round(Math.cos((this.rotation * Math.PI) / 180) * 100) / 100;
        const sinA = Math.round(Math.sin((this.rotation * Math.PI) / 180) * 100) / 100;

        const w2 = carSize.width / 2;
        const h2 = carSize.length / 2;

        const pointsPre = [
            { x: -w2, y: -h2 },
            { x: w2, y: -h2 },
            { x: w2, y: h2 },
            { x: -w2, y: h2 }
        ];

        this.points = pointsPre.map((p) => ({
            x: this.x + p.x * cosA - p.y * sinA,
            y: this.y + p.x * sinA + p.y * cosA
        }));
    }
    move() {
        this.x += this.speed * this.frontVector.x;
        this.y += this.speed * this.frontVector.y;
        this.speed *= 1 - engineFriction; // naturalne zwalnianie
        this.calculatePoints();
    }
    
    accelerate() {
        this.speed += acceleration;
        if (this.speed > maxSpeed[0]) this.speed = maxSpeed[0];
    }
    
    brake() {
        this.speed -= brakingForce;
        if (this.speed < maxSpeed[1]) this.speed = maxSpeed[1];
    }
    
    rotate(angle) {
        if (Math.abs(this.speed) > 0.2) {
            let turnEffect = (1 - this.adhesion) * (this.speed / maxSpeed[0]);
            this.rotation += angle * (1 - turnEffect);
        }           
        const cosA = Math.round(Math.cos((this.rotation * Math.PI) / 180) * 100) / 100;
        const sinA = Math.round(Math.sin((this.rotation * Math.PI) / 180) * 100) / 100;     
        this.frontVector = { x: sinA, y: -cosA };
    }
}

let playerArray = [];
playerArray.push(new player(100, 100, 'red', 90));
playerArray.push(new player(150, 150, 'blue', 45));

function generateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (debugMode) {
        playerArray.forEach((player) => {
            ctx.beginPath();
            ctx.moveTo(player.points[0].x, player.points[0].y);
            ctx.lineTo(player.points[1].x, player.points[1].y);
            ctx.lineTo(player.points[2].x, player.points[2].y);
            ctx.lineTo(player.points[3].x, player.points[3].y);
            ctx.lineTo(player.points[0].x, player.points[0].y);
            ctx.strokeStyle = player.color;
            ctx.stroke();
            ctx.closePath();
        });
    }
}

generateCanvas();

const keysPressed = {};

document.addEventListener('keydown', function (event) {
    keysPressed[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', function (event) {
    delete keysPressed[event.key.toLowerCase()];
});

function gameTick() {
    if (keysPressed['w']) {
        playerArray[0].accelerate();
    }
    if (keysPressed['a']) {
        playerArray[0].rotate(-1);
    }
    if (keysPressed['d']) {
        playerArray[0].rotate(1);
    }
    if (keysPressed['s']) {
        playerArray[0].brake();
    }

    generateCanvas();
    setTimeout(gameTick, 5);

    playerArray.forEach((player) => {
        player.move();
    });
}

gameTick();
