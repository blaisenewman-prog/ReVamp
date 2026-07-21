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
  const soundState = document.getElementById("soundState");
  const themeState = document.getElementById("themeState");

  const store = {
    get(key) {
      try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { /* optional */ }
    }
  };

  const state = {
    running: false,
    gameOver: false,
    score: 0,
    best: store.get("trexBestV2"),
    speed: 420,
    spawnTimer: 0,
    nextSpawn: 1.25,
    groundOffset: 0,
    animationTime: 0,
    lastTime: 0,
    sound: false,
    night: false,
    obstacles: []
  };

  const dino = {
    x: 92,
    y: 0,
    width: 86,
    height: 72,
    velocityY: 0,
    grounded: true,
    ducking: false
  };

  function colours() {
    return state.night
      ? { sky: "#191c16", ink: "#f3f1e9", muted: "#51564b", accent: "#ff7955", eye: "#d7ff63" }
      : { sky: "#fbfaf5", ink: "#171914", muted: "#c7c7bb", accent: "#d85f3c", eye: "#d7ff63" };
  }

  function groundY() {
    return canvas.logicalHeight - 62;
  }

  function pad(value, size = 5) {
    return String(Math.max(0, Math.floor(value))).padStart(size, "0");
  }

  function resizeCanvas() {
    const width = Math.max(620, Math.floor(stage.clientWidth));
    const height = window.innerWidth < 540 ? 340 : 400;
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

  function updateScore() {
    scoreValue.textContent = pad(state.score);
    bestValue.textContent = pad(state.best);
    speedValue.textContent = `${(state.speed / 420).toFixed(1)}×`;
  }

  function reset() {
    state.score = 0;
    state.speed = 420;
    state.spawnTimer = 0;
    state.nextSpawn = 1.25;
    state.groundOffset = 0;
    state.animationTime = 0;
    state.obstacles = [];
    state.gameOver = false;
    dino.width = 86;
    dino.height = 72;
    dino.velocityY = 0;
    dino.grounded = true;
    dino.ducking = false;
    dino.y = groundY() - dino.height;
    updateScore();
  }

  function start() {
    reset();
    state.running = true;
    startOverlay.hidden = true;
    gameOverOverlay.hidden = true;
    state.lastTime = performance.now();
    beep(480, 0.04);
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    state.gameOver = true;
    const score = Math.floor(state.score);
    const previousBest = state.best;

    if (score > state.best) {
      state.best = score;
      store.set("trexBestV2", state.best);
    }

    finalScore.textContent = pad(score);
    gameOverMessage.textContent = score > previousBest
      ? "New best. Go again."
      : score > 250
        ? "Good run. Try to beat it."
        : "Try another run.";
    updateScore();
    gameOverOverlay.hidden = false;
    beep(145, 0.11);
  }

  function jump() {
    if (!state.running) {
      start();
      return;
    }
    if (!dino.grounded) return;

    dino.ducking = false;
    dino.width = 86;
    dino.height = 72;
    dino.velocityY = -900;
    dino.grounded = false;
    beep(620, 0.03);
  }

  function setDuck(active) {
    if (!state.running || !dino.grounded) return;
    dino.ducking = active;
    dino.width = active ? 94 : 86;
    dino.height = active ? 49 : 72;
    dino.y = groundY() - dino.height;
  }

  function spawnObstacle() {
    const birdChance = state.score > 160 && Math.random() > 0.7;
    if (birdChance) {
      state.obstacles.push({
        type: "bird",
        x: canvas.logicalWidth + 50,
        y: groundY() - 83,
        width: 54,
        height: 27,
        flap: 0
      });
      return;
    }

    const tall = Math.random() > 0.58;
    state.obstacles.push({
      type: "cactus",
      x: canvas.logicalWidth + 50,
      y: groundY() - (tall ? 66 : 48),
      width: tall ? 32 : 42,
      height: tall ? 66 : 48
    });
  }

  function collide(a, b) {
    const xInset = a.ducking ? 13 : 15;
    const topInset = a.ducking ? 8 : 10;
    const bottomInset = 5;
    return a.x + xInset < b.x + b.width &&
      a.x + a.width - xInset > b.x &&
      a.y + topInset < b.y + b.height &&
      a.y + a.height - bottomInset > b.y;
  }

  function update(delta) {
    state.score += delta * (state.speed / 18);
    state.speed = Math.min(900, 420 + state.score * 0.62);
    state.groundOffset = (state.groundOffset + state.speed * delta) % 38;
    state.animationTime += delta;
    state.spawnTimer += delta;

    if (state.spawnTimer >= state.nextSpawn) {
      spawnObstacle();
      state.spawnTimer = 0;
      const pace = Math.max(0.58, 1.22 - state.speed / 1250);
      state.nextSpawn = pace + Math.random() * 0.72;
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

    state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -30);
    updateScore();
  }

  function polygon(points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function drawStandingTrex(c) {
    const legPhase = Math.sin(state.animationTime * 15) > 0;

    ctx.fillStyle = c.ink;

    // Long tail and heavy body.
    polygon([[0, 43], [24, 29], [48, 28], [57, 40], [45, 55], [22, 53], [7, 48]]);

    // Neck, large skull and long jaw.
    polygon([[43, 31], [49, 9], [66, 2], [82, 6], [86, 14], [86, 29], [66, 29], [63, 41], [49, 43]]);
    ctx.fillRect(64, 25, 22, 9);

    // Tiny T-Rex arms.
    ctx.fillRect(48, 36, 17, 5);
    ctx.fillRect(60, 39, 5, 8);
    ctx.fillRect(62, 45, 7, 4);

    // Alternating running legs and broad feet.
    if (!dino.grounded) {
      polygon([[28, 50], [40, 50], [38, 63], [29, 68], [22, 65]]);
      polygon([[43, 50], [55, 51], [59, 63], [52, 69], [44, 66]]);
    } else if (legPhase) {
      polygon([[27, 50], [39, 50], [35, 66], [21, 66], [21, 61], [28, 60]]);
      polygon([[43, 51], [54, 51], [58, 66], [48, 66], [45, 60]]);
    } else {
      polygon([[28, 50], [39, 50], [41, 66], [31, 66], [27, 59]]);
      polygon([[43, 51], [54, 51], [50, 66], [36, 66], [36, 61], [44, 60]]);
    }

    // Eye and open mouth make the silhouette easier to read.
    ctx.fillStyle = c.eye;
    ctx.fillRect(72, 10, 5, 5);
    ctx.fillStyle = c.sky;
    ctx.fillRect(69, 27, 17, 4);
    ctx.fillRect(72, 31, 4, 3);
    ctx.fillRect(80, 31, 4, 3);
  }

  function drawDuckingTrex(c) {
    const legPhase = Math.sin(state.animationTime * 16) > 0;
    ctx.fillStyle = c.ink;

    polygon([[0, 32], [24, 20], [54, 20], [66, 29], [51, 42], [24, 42], [8, 38]]);
    polygon([[49, 22], [61, 5], [79, 3], [93, 9], [93, 25], [74, 25], [68, 34], [56, 34]]);
    ctx.fillRect(72, 21, 21, 8);
    ctx.fillRect(54, 31, 15, 4);
    ctx.fillRect(65, 34, 4, 7);

    if (legPhase) {
      ctx.fillRect(27, 39, 14, 9);
      ctx.fillRect(55, 40, 18, 8);
    } else {
      ctx.fillRect(20, 40, 20, 8);
      ctx.fillRect(52, 39, 14, 9);
    }

    ctx.fillStyle = c.eye;
    ctx.fillRect(80, 9, 5, 5);
    ctx.fillStyle = c.sky;
    ctx.fillRect(76, 23, 17, 3);
  }

  function drawDino(c) {
    ctx.save();
    ctx.translate(dino.x, dino.y);
    if (dino.ducking) drawDuckingTrex(c);
    else drawStandingTrex(c);
    ctx.restore();
  }

  function drawObstacle(obstacle, c) {
    ctx.save();
    ctx.translate(obstacle.x, obstacle.y);
    ctx.fillStyle = obstacle.type === "bird" ? c.accent : c.ink;

    if (obstacle.type === "bird") {
      ctx.fillRect(10, 8, 31, 12);
      ctx.fillRect(37, 3, 13, 13);
      const wingY = Math.sin(obstacle.flap) > 0 ? 0 : 13;
      ctx.fillRect(10, wingY, 19, 8);
      ctx.fillStyle = c.sky;
      ctx.fillRect(44, 6, 3, 3);
    } else {
      ctx.fillRect(obstacle.width / 2 - 6, 0, 12, obstacle.height);
      ctx.fillRect(3, obstacle.height * 0.34, 10, 9);
      ctx.fillRect(3, obstacle.height * 0.34, 7, 24);
      ctx.fillRect(obstacle.width - 13, obstacle.height * 0.48, 10, 9);
      ctx.fillRect(obstacle.width - 10, obstacle.height * 0.2, 7, obstacle.height * 0.35);
    }

    ctx.restore();
  }

  function drawCloud(x, y, c) {
    ctx.fillStyle = c.muted;
    ctx.globalAlpha = 0.28;
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

    drawCloud(canvas.logicalWidth * 0.24 - state.groundOffset * 0.08, 72, c);
    drawCloud(canvas.logicalWidth * 0.68 - state.groundOffset * 0.14, 118, c);

    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY());
    ctx.lineTo(canvas.logicalWidth, groundY());
    ctx.stroke();

    ctx.fillStyle = c.muted;
    for (let x = -state.groundOffset; x < canvas.logicalWidth; x += 38) {
      ctx.fillRect(x, groundY() + 15 + ((x / 38) % 2 ? 7 : 0), 17, 3);
    }

    drawDino(c);
    state.obstacles.forEach((obstacle) => drawObstacle(obstacle, c));
  }

  function loop(time) {
    if (!state.running) {
      draw();
      return;
    }

    const delta = Math.min(0.032, (time - state.lastTime) / 1000 || 0);
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
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch { /* sound is optional */ }
  }

  function toggleSound() {
    state.sound = !state.sound;
    soundButton.setAttribute("aria-pressed", String(state.sound));
    soundButton.setAttribute("aria-label", state.sound ? "Turn sound off" : "Turn sound on");
    soundState.textContent = state.sound ? "on" : "off";
    beep(560, 0.04);
  }

  function toggleTheme() {
    state.night = !state.night;
    document.body.classList.toggle("night", state.night);
    themeButton.setAttribute("aria-pressed", String(state.night));
    themeButton.setAttribute("aria-label", state.night ? "Switch to day mode" : "Switch to night mode");
    themeState.textContent = state.night ? "night" : "day";
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

  updateScore();
  resizeCanvas();
})();
