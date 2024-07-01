var canvas = document.getElementById("mycanvas");
var surface = canvas.getContext("2d");
const FPS = 60;
const ALIENS_PER_ROW = 10;
const ALIEN_SIZE = 30;
const ROW_GAP = ALIEN_SIZE / 2;
const GUTTER = 30;
var missile = null; //null means nothing, empty, undefined.
var missileSound = new Audio('missileSound.mp3');
var alienDyingSound = new Audio('alienDyingSound.mp3');

var showInstructions = true;
var instructions = "SPACE to start"
var startingGame = false;
var showScore = true;
var score = 0;

var aliens = {
    rows: [createAlienRow(ROW_GAP), createAlienRow(ALIEN_SIZE + ROW_GAP)],
    delay: FPS * 1.5,
    ticks: 0,
    direction: 1,
}

var player = {
    top: canvas.height - 20,
    left: canvas.width / 2 - 15,
    width: 30,
    height: 12,
    moving: false,
    direction: 0,
    velocity: 3,
    img: createPlayerImage()
}

function alienWasHitByMissile() {

    for(var r = 0; r < aliens.rows.length; r++) {

        for(var c = 0; c < aliens.rows[r].length; c++) {

            var alien = aliens.rows[r][c];

            if(alien.state != 2 && missileHitAlien(alien)) {

                console.log("HIT!");
                alienDyingSound.play();
                alien.state = 2; //dead
                score++

                if(r === 0 && numOfAliensAliveInRow(r) === 0) {
                    score += 5;
                }

                if(r === 1 && numOfAliensAliveInRow(r) === 0) {
                    score += 5;
                }
                return true;

            }

        }

    }

    return false;

}

function clearScreen() {
    surface.clearRect(0,0,canvas.width, canvas.height);
}

function createAlien(top, left) {

    return {
        top: top,
        left: left,
        state: 0,
        width: ALIEN_SIZE,
        height: ALIEN_SIZE,
        hitzone: {
            left:4, top:6, right: 4, bottom:8
        },
        img: createAlienImage()
    }

}

function createAlienImage() {
    var alien = new Image();
    alien.src = './spritesheet_alien.png';
    return alien;
}

function createAlienRow(top) {
    var row = [];
    var leftover = canvas.width - (ALIENS_PER_ROW * ALIEN_SIZE);

    var left = GUTTER;

    while(row.length < ALIENS_PER_ROW) {
        row.push(createAlien(top, left));
        left += ALIEN_SIZE;
    }

    return row;
}

function createMissile() {

    missile = {
        top: player.top,
        left: player.left + (player.width / 2) - 1,
        width: 2,
        height: 6,
        velocity: 3
    }

}

function createPlayerImage() {
    var player = new Image();
    player.src = './sprite_player_short.png';
    return player;
}

function drawActors() {
    drawAliens();
    drawPlayer();
    drawMissile();
}

function drawAlien(alien) {

    var clipX = (alien.state * alien.width);
    var clipY = 0;
    var clipW = alien.width;
    var clipH = alien.height;

    // console.log(alien);

    surface.drawImage(
        alien.img, 
        clipX,
        clipY,
        clipW,
        clipH,
        alien.left, 
        alien.top,
        alien.width,
        alien.height
    );

}

function drawAliens() {

    for(var r = 0; r < aliens.rows.length; r++) {

        // console.log(`Num of aliens alive in row ${r}:` + numOfAliensAliveInRow(r));

        for(var c = 0; c < aliens.rows[r].length; c++) {

            drawAlien(aliens.rows[r][c]);

        }

    }

}

function drawMissile() {

    if(!missile)
        return;

    surface.beginPath();
    surface.fillStyle = "rgb(255,255,255)";
    surface.rect(missile.left, missile.top, missile.width, missile.height);
    surface.fill();
    surface.closePath();


}

function drawPlayer() {
    surface.drawImage(player.img, player.left, player.top);
}


function drawTargetRect(rect) {
    surface.beginPath();
    surface.strokeStyle = "red";
    surface.lineWidth = 1;
    surface.rect(rect.left, rect.top, rect.right-rect.left, rect.bottom-rect.top);
    surface.stroke();
    surface.closePath();
}

function drawText() {

    if(showInstructions) {
        surface.font = "24px Arial";
        var textWidth = surface.measureText(instructions).width;
        var left = (canvas.width - textWidth) / 2;
        var top = (4/5) * canvas.height;

        surface.fillStyle = 'rgba(255, 255, 255)';
        surface.fillText(instructions, left, top);
    }
}

function drawScore() {
        surface.font = "18px Arial";
        surface.fillStyle = 'rgba(255, 255, 255, 0.5)';
        surface.fillText(score, canvas.width / 40, 25);
}

function fireMissile() {

    if(missile == null) {

        createMissile();

        missileSound.play();

    }

}

function keyIsDown(event) {

    var controls = ['ArrowRight', 'ArrowLeft', 'Space'];

    if(controls.includes(event.code)) {
        event.preventDefault();
        if(event.code != 'Space')
            player.moving = true;
    }

    if(event.code == 'ArrowRight') {
        player.direction = 1;
    }

    if(event.code == 'ArrowLeft') {
        player.direction = -1;
    }

    if(event.code == 'Space') {
        if(!startingGame) {
            startingGame = true;
        }

        fireMissile();
    }

}

function keyIsUp(event) {

    var controls = ['ArrowRight', 'ArrowLeft'];

    if(controls.includes(event.code)) {
        player.moving = false;
    }

}


function missileHitAlien(alien) {

    if(missile == null) 
        return false;

    var hitRect = {
        left: alien.left + alien.hitzone.left,
        top: alien.top + alien.hitzone.top,
        right: alien.left + alien.width - alien.hitzone.right,
        bottom: alien.top + alien.height - alien.hitzone.bottom
    };

    var missileRect = {
        left: missile.left,
        top: missile.top,
        right: missile.left + missile.width,
        bottom: missile.top + missile.height
    };

    // drawTargetRect(hitRect);
    // drawTargetRect(missileRect);

    return (missileRect.left < hitRect.right) 
        && (missileRect.right > hitRect.left) 
        && (missileRect.top < hitRect.bottom) 
        && (missileRect.bottom > hitRect.top);

}


function numOfAliensAliveInRow(row) {

    var numAlive = 0;

    if(aliens.rows[row]) {
        for(var col = 0; col < aliens.rows[row].length; col++) {
            if(aliens.rows[row][col].state != 2)
                numAlive++;
        }
    }

    return numAlive;

}



function updateActors() {
    updateAliens();
    updatePlayer();
    updateMissile();
}


function updateAliens() {

    aliens.ticks++;

    if(aliens.ticks == aliens.delay) {
        aliens.ticks = 0;
        updateAlienStates();
    }

}

function updateAlienState(alien, shiftLeft, shiftDown) {

    //state of 2 == DEAD!
    if(alien.state != 2) {
        if(alien.state == 1) {
            alien.state = 0;
        } else {
            alien.state = 1;
        }
    }

    alien.left += shiftLeft;
    alien.top += shiftDown;

}

function updateAlienStates() {

    var firstInRow = aliens.rows[0][0];
    var lastInRow = aliens.rows[0][ ALIENS_PER_ROW - 1 ];

    var shiftLeft = (ALIEN_SIZE * aliens.direction);
    var shiftDown = 0;

    var tooFarLeft = (firstInRow.left + shiftLeft < GUTTER);
    var tooFarRight = ((lastInRow.left + shiftLeft + ALIEN_SIZE) > (canvas.width - GUTTER));

    if (tooFarLeft || tooFarRight) {
        shiftDown = ALIEN_SIZE;
        shiftLeft = 0;
        aliens.direction *= -1;
    } 

    for(var r = 0; r < aliens.rows.length; r++) {

        for(var c = 0; c < aliens.rows[r].length; c++) {

            updateAlienState(aliens.rows[r][c], shiftLeft, shiftDown);

        }

    }

}

function updatePlayer() {

    if(player.moving) {
        player.left += (player.direction * player.velocity);

        player.left = Math.max(0, player.left);
        player.left = Math.min(player.left, canvas.width-player.width);
    }


}

function updateMissile() {

    if(missile) {

        var alienHit = alienWasHitByMissile();

        if(alienHit || (missile.top + missile.height < 0)) {
            missile = null;
        } else {
            missile.top -= missile.velocity;
        }

    }

}

function updateScreen() {

    drawText();
    if (!startingGame) return; 
    clearScreen();
    drawScore();
    updateActors();
    drawActors();


}

//This is a little different than what you've seen
//in class, but you should understand the basics of
//what is going on here.

addEventListener("load", () => {
    drawActors();
    addEventListener("keydown", keyIsDown);
    addEventListener("keyup", keyIsUp);
    setInterval(updateScreen, 1000 / FPS);
});