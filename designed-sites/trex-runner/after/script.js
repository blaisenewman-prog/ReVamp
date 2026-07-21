(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const stage = document.getElementById("gameStage");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const jumpButton = document.getElementById("jumpButton");
  const duckButton = document.getElementById("duckButton");
  const soundButton = document.getElementById("soundButton");
  const themeButton = document.getElementById("themeButton");

  const scoreValue = document.getElementById("scoreValue");
  const bestValue = document.getElementById("bestValue");
  const speedValue = document.getElementById("speedValue");
  const finalScore = document.getElementById("finalScore");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const boardBest = document.getElementById("boardBest");
  const boardLatest = document.getElementById("boardLatest");
  const boardRuns = document.getElementById("boardRuns");
  const soundState = document.getElementById("soundState");
  const themeState = document.getElementById("themeState");

  const store = {
    get(key, fallback = 0) {
      try { return Number(localStorage.getItem(key)) || fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { /* local storage is optional */ }
    }
  };

  const state = {
    running: false,
    gameOver: false,
    score: 0,
    best: store.get("trexBest"),
    latest: store.get("trexLatest"),
    runs: store.get("trexRuns"),
    speed: 430,
    spawnTimer: 0,
    nextSpawn: 1.15,
    groundOffset: 0,
    lastTime: 0,
    sound: false,
    night: false,
    obstacles: [],
    particles: []
  };

  const dino = {
    x: 118,
    y: 0,
    width: 56,
    height: 66,
    velocityY: 0,
    grounded: true,
    ducking: false
  };

  function colours() {
    return state.night
      ? { sky: "#191c16", ink: "#f2f0e8", muted: "#565b4f", acid: "#d7ff63", rust: "#ff7955" }
      : { sky: "#fbfaf5", ink: "#11130f", muted: "#c8c8bc", acid: "#b6de3f", rust: "#e9633c" };
  }

  function resizeCanvas() {
    const width = Math.max(640, Math.floor(stage.clientWidth));
    const height = window.innerWidth < 540 ? 360 : 440;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    canvas.logicalWidth = width;
    canvas.logicalHeight = height;
    dino.y = groundY() - dino.height;
    draw();
  }

  function groundY() { return canvas.logicalHeight - 72; }
  function pad(value, size = 5) { return String(Math.max(0, Math.floor(value))).padStart(size, "0"); }

  function updateBoard() {
    scoreValue.textContent = pad(state.score);
    bestValue.textContent = pad(state.best);
    speedValue.textContent = `${(state.speed / 430).toFixed(1)}×`;
    boardBest.textContent = pad(state.best);
    boardLatest.textContent = pad(state.latest);
    boardRuns.textContent = pad(state.runs, 3);
  }

  function reset() {
    state.score = 0;
    state.speed = 430;
    state.spawnTimer = 0;
    state.nextSpawn = 1.15;
    state.groundOffset = 0;
    state.obstacles = [];
    state.particles = [];
    state.gameOver = false;
    dino.width = 56;
    dino.height = 66;
    dino.velocityY = 0;
    dino.grounded = true;
    dino.ducking = false;
    dino.y = groundY() - dino.height;
    updateBoard();
  }

  function start() {
    reset();
    state.running = true;
    startOverlay.hidden = true;
    gameOverOverlay.hidden = true;
    state.lastTime = performance.now();
    beep(480, .045);
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    state.gameOver = true;
    state.latest = Math.floor(state.score);
    state.runs += 1;
    if (state.latest > state.best) state.best = state.latest;
    store.set("trexLatest", state.latest);
    store.set("trexRuns", state.runs);
    store.set("trexBest", state.best);
    finalScore.textContent = pad(state.latest);
    gameOverMessage.textContent = state.latest === state.best && state.latest > 0
      ? "New personal best. That one is yours to beat."
      : state.latest > 250
        ? "Good pace. The course was only getting faster."
        : "Timing is everything. Take another run.";
    updateBoard();
    gameOverOverlay.hidden = false;
    beep(145, .12);
  }

  function jump() {
    if (!state.running) {
      start();
      return;
    }
    if (!dino.grounded) return;
    dino.ducking = false;
    dino.height = 66;
    dino.velocityY = -900;
    dino.grounded = false;
    beep(620, .035);
  }

  function setDuck(active) {
    if (!state.running || !dino.grounded) return;
    dino.ducking = active;
    dino.height = active ? 42 : 66;
    dino.width = active ? 72 : 56;
    dino.y = groundY() - dino.height;
  }

  function spawnObstacle() {
    const birdChance = state.score > 170 && Math.random() > .68;
    if (birdChance) {
      state.obstacles.push({ type: "bird", x: canvas.logicalWidth + 40, y: groundY() - 85, width: 54, height: 26, flap: 0 });
      return;
    }
    const tall = Math.random() > .58;
    state.obstacles.push({ type: "cactus", x: canvas.logicalWidth + 40, y: groundY() - (tall ? 66 : 48), width: tall ? 32 : 42, height: tall ? 66 : 48 });
  }

  function collide(a, b) {
    const insetX = 9;
    const insetY = 7;
    return a.x + insetX < b.x + b.width &&
      a.x + a.width - insetX > b.x &&
      a.y + insetY < b.y + b.height &&
      a.y + a.height - insetY > b.y;
  }

  function update(delta) {
    state.score += delta * (state.speed / 18);
    state.speed = Math.min(920, 430 + state.score * .64);
    state.groundOffset = (state.groundOffset + state.speed * delta) % 38;
    state.spawnTimer += delta;

    if (state.spawnTimer >= state.nextSpawn) {
      spawnObstacle();
      state.spawnTimer = 0;
      const pace = Math.max(.56, 1.2 - state.speed / 1250);
      state.nextSpawn = pace + Math.random() * .72;
    }

    dino.velocityY += 2350 * delta;
    dino.y += dino.velocityY * delta;
    if (dino.y >= groundY() - dino.height) {
      dino.y = groundY() - dino.height;
      dino.velocityY = 0;
      dino.grounded = true;
    }

    for (const obstacle of state.obstacles) {
      obstacle.x -= state.speed * delta;
      if (obstacle.type === "bird") obstacle.flap += delta * 11;
      if (collide(dino, obstacle)) {
        endGame();
        return;
      }
    }
    state.obstacles = state.obstacles.filter((item) => item.x + item.width > -30);
    updateBoard();
  }

  function drawDino(c) {
    ctx.save();
    ctx.translate(dino.x, dino.y);
    ctx.fillStyle = c.ink;

    if (dino.ducking) {
      ctx.fillRect(0, 12, 48, 26);
      ctx.fillRect(42, 4, 26, 25);
      ctx.fillRect(10, 34, 10, 8);
      ctx.fillRect(42, 34, 12, 8);
      ctx.fillStyle = c.acid;
      ctx.fillRect(57, 10, 5, 5);
    } else {
      ctx.fillRect(8, 18, 32, 38);
      ctx.fillRect(29, 0, 27, 29);
      ctx.fillRect(0, 38, 17, 10);
      ctx.fillRect(16, 54, 10, 12);
      ctx.fillRect(35, 54, 10, 12);
      ctx.fillStyle = c.acid;
      ctx.fillRect(45, 7, 5, 5);
      ctx.fillStyle = c.sky;
      ctx.fillRect(48, 21, 8, 5);
    }
    ctx.restore();
  }

  function drawObstacle(obstacle, c) {
    ctx.save();
    ctx.translate(obstacle.x, obstacle.y);
    ctx.fillStyle = obstacle.type === "bird" ? c.rust : c.ink;
    if (obstacle.type === "bird") {
      ctx.fillRect(10, 8, 31, 12);
      ctx.fillRect(37, 3, 13, 13);
      const wingY = Math.sin(obstacle.flap) > 0 ? 0 : 13;
      ctx.fillRect(10, wingY, 19, 8);
      ctx.fillStyle = c.sky;
      ctx.fillRect(44, 6, 3, 3);
    } else {
      ctx.fillRect(obstacle.width / 2 - 6, 0, 12, obstacle.height);
      ctx.fillRect(3, obstacle.height * .34, 10, 9);
      ctx.fillRect(3, obstacle.height * .34, 7, 24);
      ctx.fillRect(obstacle.width - 13, obstacle.height * .48, 10, 9);
      ctx.fillRect(obstacle.width - 10, obstacle.height * .2, 7, obstacle.height * .35);
    }
    ctx.restore();
  }

  function drawCloud(x, y, c) {
    ctx.fillStyle = c.muted;
    ctx.globalAlpha = .32;
    ctx.fillRect(x, y + 8, 62, 7);
    ctx.fillRect(x + 12, y, 31, 9);
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!canvas.logicalWidth) return;
    const c = colours();
    ctx.clearRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);
    ctx.fillStyle = c.sky;
    ctx.fillRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);

    drawCloud(canvas.logicalWidth * .22 - (state.groundOffset * .08), 80, c);
    drawCloud(canvas.logicalWidth * .67 - (state.groundOffset * .15), 132, c);

    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY());
    ctx.lineTo(canvas.logicalWidth, groundY());
    ctx.stroke();

    ctx.fillStyle = c.muted;
    for (let x = -state.groundOffset; x < canvas.logicalWidth; x += 38) {
      ctx.fillRect(x, groundY() + 16 + ((x / 38) % 2 ? 8 : 0), 17, 3);
    }

    drawDino(c);
    state.obstacles.forEach((obstacle) => drawObstacle(obstacle, c));
  }

  function loop(time) {
    if (!state.running) {
      draw();
      return;
    }
    const delta = Math.min(.032, (time - state.lastTime) / 1000 || 0);
    state.lastTime = time;
    update(delta);
    draw();
    if (state.running) requestAnimationFrame(loop);
  }

  let audioContext;
  function beep(frequency, duration) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "square";
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch { /* sound remains optional */ }
  }

  function toggleSound() {
    state.sound = !state.sound;
    soundButton.setAttribute("aria-pressed", String(state.sound));
    soundButton.setAttribute("aria-label", state.sound ? "Turn sound off" : "Turn sound on");
    soundState.textContent = state.sound ? "ON" : "OFF";
    beep(560, .04);
  }

  function toggleTheme() {
    state.night = !state.night;
    document.body.classList.toggle("night", state.night);
    themeButton.setAttribute("aria-pressed", String(state.night));
    themeButton.setAttribute("aria-label", state.night ? "Switch to day mode" : "Switch to night mode");
    themeState.textContent = state.night ? "NIGHT" : "DAY";
    draw();
  }

  function handleKeyDown(event) {
    if (["Space", "ArrowUp"].includes(event.code)) {
      event.preventDefault();
      jump();
    }
    if (event.code === "ArrowDown") {
      event.preventDefault();
      setDuck(true);
    }
    if (event.code === "KeyR" && (state.gameOver || !state.running)) start();
  }

  function handleKeyUp(event) {
    if (event.code === "ArrowDown") setDuck(false);
  }

  startButton.addEventListener("click", start);
  restartButton.addEventListener("click", start);
  jumpButton.addEventListener("pointerdown", (event) => { event.preventDefault(); jump(); });
  duckButton.addEventListener("pointerdown", (event) => { event.preventDefault(); setDuck(true); });
  duckButton.addEventListener("pointerup", () => setDuck(false));
  duckButton.addEventListener("pointercancel", () => setDuck(false));
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    jump();
  });
  soundButton.addEventListener("click", toggleSound);
  themeButton.addEventListener("click", toggleTheme);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", resizeCanvas);

  updateBoard();
  resizeCanvas();
})();
