const canvas = document.getElementById("pong-canvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddles
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 20;
const PADDLE_SPEED = 6;

// Ball
const BALL_SIZE = 14;
const BALL_SPEED = 5;

// Game state
let playerScore = 0;
let aiScore = 0;

const player = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

const ai = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  size: BALL_SIZE,
  vx: BALL_SPEED * (Math.random() < 0.5 ? 1 : -1),
  vy: BALL_SPEED * (Math.random() * 2 - 1)
};

function resetBall(direction = 1) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.vx = BALL_SPEED * direction;
  ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color = "#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = "#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 4;
  for (let i = 0; i < HEIGHT; i += 30) {
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, i);
    ctx.lineTo(WIDTH / 2, i + 16);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawNet();

  // Paddles
  drawRect(player.x, player.y, player.width, player.height, "#0ff");
  drawRect(ai.x, ai.y, ai.width, ai.height, "#f00");

  // Ball
  drawCircle(ball.x, ball.y, ball.size / 2, "#fff");
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function update() {
  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision
  if (ball.y - ball.size / 2 < 0) {
    ball.y = ball.size / 2;
    ball.vy = -ball.vy;
  }
  if (ball.y + ball.size / 2 > HEIGHT) {
    ball.y = HEIGHT - ball.size / 2;
    ball.vy = -ball.vy;
  }

  // Paddle collision
  // Player
  if (
    ball.x - ball.size / 2 < player.x + player.width &&
    ball.y + ball.size / 2 > player.y &&
    ball.y - ball.size / 2 < player.y + player.height
  ) {
    ball.x = player.x + player.width + ball.size / 2;
    ball.vx = -ball.vx * 1.05;
    // Add effect based on hit location
    ball.vy += ((ball.y - (player.y + player.height / 2)) / (player.height / 2)) * 2;
  }

  // AI
  if (
    ball.x + ball.size / 2 > ai.x &&
    ball.y + ball.size / 2 > ai.y &&
    ball.y - ball.size / 2 < ai.y + ai.height
  ) {
    ball.x = ai.x - ball.size / 2;
    ball.vx = -ball.vx * 1.05;
    ball.vy += ((ball.y - (ai.y + ai.height / 2)) / (ai.height / 2)) * 2;
  }

  // Score check
  if (ball.x < 0) {
    aiScore++;
    updateScore();
    resetBall(1);
  }
  if (ball.x > WIDTH) {
    playerScore++;
    updateScore();
    resetBall(-1);
  }

  // AI movement (simple tracking)
  let aiCenter = ai.y + ai.height / 2;
  if (aiCenter < ball.y - 10) ai.y += ai.speed;
  else if (aiCenter > ball.y + 10) ai.y -= ai.speed;
  ai.y = clamp(ai.y, 0, HEIGHT - ai.height);
}

function updateScore() {
  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("ai-score").textContent = aiScore;
}

// Player paddle follows mouse
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = clamp(mouseY - player.height / 2, 0, HEIGHT - player.height);
});

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initial scoreboard
updateScore();
gameLoop();
