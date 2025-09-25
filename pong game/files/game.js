// All code runs after DOM is loaded because of 'defer' in the script tag

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const homepage = document.getElementById('homepage');
const gameContainer = document.getElementById('game-container');
const backBtn = document.getElementById('back-btn');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');

let animationId = null;

// Game constants
const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const PLAYER_X = 28;
const AI_X = 800 - PLAYER_X - PADDLE_WIDTH; // canvas width hardcoded here for AI_X

// Game state variables
let playerY, aiY, ball, playerScore, aiScore;
let difficulty = 'medium';
let aiDifficulty = {
    easy:   { aiSpeed: 0.04, ballSpeed: 4 },
    medium: { aiSpeed: 0.08, ballSpeed: 6 },
    hard:   { aiSpeed: 0.16, ballSpeed: 8 }
};
let currentSettings = aiDifficulty['medium'];
let isGameRunning = false;

// Helper functions
function drawRect(x, y, w, h, color="#fff") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color="#fff") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawText(text, x, y, size=48, color="#fff") {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = 400; // canvas.width / 2
    ball.y = 250; // canvas.height / 2
    let speed = currentSettings.ballSpeed;
    ball.vx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = (speed - 2) * (Math.random() * 2 - 1);
}

function updateAI() {
    const target = ball.y - PADDLE_HEIGHT / 2;
    aiY += (target - aiY) * currentSettings.aiSpeed;
    aiY = Math.max(0, Math.min(500 - PADDLE_HEIGHT, aiY)); // clamp to canvas height
}

function paddleCollision(paddleX, paddleY) {
    return (
        ball.x + ball.radius > paddleX &&
        ball.x - ball.radius < paddleX + PADDLE_WIDTH &&
        ball.y + ball.radius > paddleY &&
        ball.y - ball.radius < paddleY + PADDLE_HEIGHT
    );
}

function update() {
    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom wall collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > 500) { // canvas.height
        ball.y = 500 - ball.radius;
        ball.vy *= -1;
    }

    // Paddle collision (player)
    if (paddleCollision(PLAYER_X, playerY)) {
        ball.x = PLAYER_X + PADDLE_WIDTH + ball.radius;
        ball.vx *= -1.1;
        const collidePoint = (ball.y - (playerY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ball.vy = currentSettings.ballSpeed * collidePoint;
    }

    // Paddle collision (AI)
    if (paddleCollision(AI_X, aiY)) {
        ball.x = AI_X - ball.radius;
        ball.vx *= -1.1;
        const collidePoint = (ball.y - (aiY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ball.vy = currentSettings.ballSpeed * collidePoint;
    }

    // Left/right wall (score)
    if (ball.x - ball.radius < 0) {
        aiScore++;
        resetBall();
    }
    if (ball.x + ball.radius > 800) { // canvas.width
        playerScore++;
        resetBall();
    }

    // AI movement
    updateAI();
}

function render() {
    // Clear canvas
    drawRect(0, 0, 800, 500, "#111");

    // Draw net
    for(let y=0; y<500; y+=36) {
        drawRect(400 - 2, y, 4, 24, "#555");
    }

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, "#fff");

    // Draw scores
    drawText(playerScore, 800/4, 60, 48, "#fff");
    drawText(aiScore, 3*800/4, 60, 48, "#fff");
}

function gameLoop() {
    if (!isGameRunning) return;
    update();
    render();
    animationId = requestAnimationFrame(gameLoop);
}

function initGame() {
    playerY = (500 - PADDLE_HEIGHT) / 2;
    aiY = (500 - PADDLE_HEIGHT) / 2;
    ball = {
        x: 400,
        y: 250,
        vx: currentSettings.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        vy: (currentSettings.ballSpeed - 2) * (Math.random() * 2 - 1),
        radius: 12
    };
    playerScore = 0;
    aiScore = 0;
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(500 - PADDLE_HEIGHT, playerY));
});

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    currentSettings = aiDifficulty[difficulty];
    homepage.style.display = 'none';
    gameContainer.style.display = 'flex';
    isGameRunning = true;
    initGame();
    gameLoop();
}

function goHome() {
    isGameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    homepage.style.display = 'flex';
    gameContainer.style.display = 'none';
}

// Attach event listeners for buttons
easyBtn.addEventListener('click', () => startGame('easy'));
mediumBtn.addEventListener('click', () => startGame('medium'));
hardBtn.addEventListener('click', () => startGame('hard'));
backBtn.addEventListener('click', goHome);