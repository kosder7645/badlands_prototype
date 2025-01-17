const canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
const carSize = { length: 40, width: 25 };
let debugMode = true;

const maxSpeed = [4, -2];
const adhesion = 0.9;
const engineFriction = 0.01;

class player {
    constructor(x, y, color, rotation) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotaton = rotation;
        this.points = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ];
        this.force = 0;
        this.calculatePoints();
    }
    calculatePoints() {
        const cosA = Math.round(Math.cos((this.rotaton * Math.PI) / 180) * 100) / 100;
        const sinA = Math.round(Math.sin((this.rotaton * Math.PI) / 180) * 100) / 100;

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
    move(amount) {
        const cosA = Math.round(Math.cos((this.rotaton * Math.PI) / 180) * 100) / 100;
        const sinA = Math.round(Math.sin((this.rotaton * Math.PI) / 180) * 100) / 100;

        this.x = this.x + amount * sinA;
        this.y = this.y - amount * cosA;

        this.calculatePoints();
    }
    rotate(angle) {
        if (this.force != 0) {
            this.rotaton = (this.rotaton + angle) % 360;
        }

        this.calculatePoints();
    }
    addForce(addedForce) {
        this.force = this.force + addedForce;
        if (this.force > maxSpeed[0]) {
            this.force = maxSpeed[0];
        }
        if (this.force < maxSpeed[1]) {
            this.force = maxSpeed[1];
        }
    }
    calculateMove() {
        if (this.force > 0) {
            if (this.force - engineFriction < 0) {
                this.force = 0;
            } else {
                this.force = this.force - engineFriction;
            }
        }
        if (this.force < 0) {
            if (this.force + engineFriction > 0) {
                this.force = 0;
            } else {
                this.force = this.force + engineFriction;
            }
        }
        this.move(this.force);
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
        playerArray[0].addForce(0.2);
    }
    if (keysPressed['a']) {
        playerArray[0].rotate(-1);
    }
    if (keysPressed['d']) {
        playerArray[0].rotate(1);
    }
    if (keysPressed['s']) {
        playerArray[0].addForce(-0.1);
    }

    generateCanvas();
    setTimeout(gameTick, 5);

    playerArray.forEach((player) => {
        player.calculateMove();
    });
}

gameTick();
