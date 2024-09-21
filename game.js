const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set fixed canvas size
canvas.width = 800;
canvas.height = 600;

// Global game variables
let gameSpeed = 2;
let gameOver = false;
let score = 0;

// Load images and get their dimensions
const cloudImage = new Image();
cloudImage.src = 'cloud.png';

const monkeyImage = new Image();
monkeyImage.src = 'monkey.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

let cloudWidth = 0;
let cloudHeight = 0;

cloudImage.onload = function() {
    cloudWidth = cloudImage.width;
    cloudHeight = cloudImage.height;
};

// References to the Game Over screen elements
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');

// Monkey class
class Monkey {
    constructor() {
        this.width = 80;
        this.height = 80;
        this.x = 100; // Position monkey at 100 pixels from the left
        this.y = canvas.height / 2 - this.height / 2; // Center vertically
        this.gravity = 0.14; // Reduced gravity by 30%
        this.lift = -9.1;    // Increased lift by 30%
        this.velocity = 0;
        this.image = monkeyImage;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.velocity += this.gravity;
        this.velocity *= 0.98; // Slight damping
        this.y += this.velocity;

        // Prevent the monkey from going off-screen
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    reset() {
        this.y = canvas.height / 2 - this.height / 2;
        this.velocity = 0;
    }
}

const monkey = new Monkey();

// Event listeners for controls
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !gameOver) {
        monkey.velocity += monkey.lift;
        jumpSound.play();
    }
});

canvas.addEventListener('mousedown', function() {
    if (!gameOver) {
        monkey.velocity += monkey.lift;
        jumpSound.play();
    } else {
        // Restart the game if game over and canvas is clicked
        restartGame();
    }
});

// CloudPair class with varying cloud sizes
class CloudPair {
    constructor() {
        this.x = canvas.width;
        this.speed = gameSpeed;

        // Ensure cloud dimensions are loaded
        if (cloudWidth === 0 || cloudHeight === 0) {
            cloudWidth = 90;
            cloudHeight = 50;
        }

        // Random scaling factor between 0.2 (20%) and 1.0 (100%)
        this.scaleFactor = Math.random() * 1.2 + 0.2; // Between 0.2 and 1.0

        // Adjusted cloud dimensions maintaining proportions
        this.cloudWidth = cloudWidth * this.scaleFactor;
        this.cloudHeight = cloudHeight * this.scaleFactor;

        // Set clouds at top and bottom edges
        this.topY = 0;
        this.bottomY = canvas.height - this.cloudHeight;
    }

    draw() {
        // Draw top cloud
        ctx.drawImage(
            cloudImage,
            this.x,
            this.topY,
            this.cloudWidth,
            this.cloudHeight
        );

        // Draw bottom cloud
        ctx.drawImage(
            cloudImage,
            this.x,
            this.bottomY,
            this.cloudWidth,
            this.cloudHeight
        );
    }

    update() {
        this.x -= this.speed;
    }
}

let obstacles = [];
let frameCount = 0;

// Background class
class Background {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = backgroundImage;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.image,
            this.x + this.width,
            this.y,
            this.width,
            this.height
        );
    }

    update() {
        this.x -= gameSpeed * 0.5;
        if (this.x <= -this.width) {
            this.x = 0;
        }
    }
}

const background = new Background();

// Sound effects in WAV format
const jumpSound = new Audio('jump.wav');
const collisionSound = new Audio('collision.wav');

// Main game loop
function gameLoop() {
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game speed based on score
    if (score >= 50 && score < 100) {
        gameSpeed = 3;
    } else if (score >= 100) {
        gameSpeed = 4;
    }

    // Update and draw background
    background.update();
    background.draw();

    // Update frame count
    frameCount++;

    // Add new obstacles at intervals
    if (frameCount % 120 === 0) {
        obstacles.push(new CloudPair());
    }

    // Update and draw obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();

        // Remove obstacles that are off-screen
        if (obstacle.x + obstacle.cloudWidth < 0) {
            obstacles.splice(index, 1);
        }
    });

    // Update and draw monkey
    monkey.update();
    monkey.draw();

    // Update score
    score += 0.05;

    // Draw score text
    ctx.fillStyle = '#000';        // Set to black for better visibility
    ctx.font = '30px Arial';       // Font size and family
    ctx.textAlign = 'left';        // Align the text to the left
    ctx.textBaseline = 'top';      // Align the text from the top
    ctx.fillText('Score: ' + Math.floor(score), 20, 10); // Adjusted y-coordinate to prevent cut-off

    // Check for collisions
    collisionDetected();
}

// Adjusted collisionDetected function with padding
function collisionDetected() {
    const padding = 75; // Padding to reduce sensitivity of collision detection

    obstacles.forEach((obstacle) => {
        // Check collision with the top cloud
        if (
            monkey.x + monkey.width - padding > obstacle.x &&
            monkey.x + padding < obstacle.x + obstacle.cloudWidth &&
            monkey.y + padding < obstacle.topY + obstacle.cloudHeight &&
            monkey.y + monkey.height - padding > obstacle.topY
        ) {
            collisionSound.play();
            gameOver = true;
            displayGameOver();
        }

        // Check collision with the bottom cloud
        if (
            monkey.x + monkey.width - padding > obstacle.x &&
            monkey.x + padding < obstacle.x + obstacle.cloudWidth &&
            monkey.y + monkey.height - padding > obstacle.bottomY &&
            monkey.y + padding < obstacle.bottomY + obstacle.cloudHeight
        ) {
            collisionSound.play();
            gameOver = true;
            displayGameOver();
        }
    });
}

// Function to display the Game Over screen
function displayGameOver() {
    // Display the game over screen
    finalScoreElement.textContent = Math.floor(score);
    gameOverScreen.style.display = 'flex';
}

// Restart the game
function restartGame() {
    // Hide the game over screen
    gameOverScreen.style.display = 'none';

    // Reset variables
    gameSpeed = 2;
    gameOver = false;
    score = 0;
    frameCount = 0;
    obstacles = [];

    // Reset monkey position
    monkey.reset();

    // Restart the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game after images have loaded
function startGame() {
    if (
        cloudImage.complete &&
        monkeyImage.complete &&
        backgroundImage.complete
    ) {
        gameLoop();
    } else {
        setTimeout(startGame, 100);
    }
}

startGame();
