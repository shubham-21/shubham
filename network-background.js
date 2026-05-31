/**
 * Hero network background — distributed systems visualization
 * Canvas animation: nodes, dynamic connections, event particles, stream paths
 */
(function () {
  "use strict";

  var canvas = null;
  var hero = null;
  var ctx = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var nodes = [];
  var particles = [];
  var eventPath = null;
  var lastPathSpawn = 0;
  var lastParticleSpawn = 0;
  var running = !reducedMotion;
  var rafId = null;
  var connectDist = 140;
  var initialized = false;

  var PATH_INTERVAL = 5500;
  var PARTICLE_INTERVAL = 350;
  var MAX_PARTICLES = 22;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function getNodeCount() {
    if (width < 576) return 28;
    if (width < 992) return 38;
    return 48;
  }

  function createNodes() {
    var count = getNodeCount();
    connectDist = Math.min(170, Math.max(100, width * 0.19));
    nodes = [];

    for (var i = 0; i < count; i++) {
      nodes.push({
        x: rand(30, Math.max(60, width - 30)),
        y: rand(30, Math.max(60, height - 30)),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
        r: rand(2, 3.5),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.008, 0.016),
      });
    }
  }

  function resize() {
    if (!hero || !canvas || !ctx) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = hero.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);

    if (width < 50 || height < 50) return;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!initialized || nodes.length !== getNodeCount()) {
      createNodes();
      particles = [];
      eventPath = null;
      initialized = true;
    }
  }

  function getConnections() {
    var distSq = connectDist * connectDist;
    var pairs = {};
    var connections = [];

    for (var i = 0; i < nodes.length; i++) {
      var neighbors = [];

      for (var j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < distSq) {
          neighbors.push({ j: j, d2: d2, dist: Math.sqrt(d2) });
        }
      }

      neighbors.sort(function (a, b) {
        return a.d2 - b.d2;
      });

      for (var k = 0; k < Math.min(3, neighbors.length); k++) {
        var n = neighbors[k].j;
        var key = i < n ? i + "-" + n : n + "-" + i;
        if (!pairs[key]) {
          pairs[key] = true;
          connections.push({
            a: i < n ? i : n,
            b: i < n ? n : i,
            dist: neighbors[k].dist,
          });
        }
      }
    }

    return connections;
  }

  function getAdjacency(connections) {
    var adj = {};
    for (var i = 0; i < nodes.length; i++) adj[i] = [];

    connections.forEach(function (c) {
      adj[c.a].push(c.b);
      adj[c.b].push(c.a);
    });

    return adj;
  }

  function spawnEventPath(connections, adj) {
    if (connections.length === 0) return;

    var start = Math.floor(rand(0, nodes.length));
    var attempts = 0;
    var path = [start];

    while (path.length < 5 && attempts < 20) {
      var current = path[path.length - 1];
      var neighbors = adj[current];
      if (!neighbors || neighbors.length === 0) break;

      var next = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (path.indexOf(next) !== -1 && path.length > 2) {
        attempts++;
        continue;
      }
      path.push(next);
      attempts = 0;
    }

    if (path.length < 3) return;

    eventPath = {
      indices: path,
      progress: 0,
      speed: rand(0.003, 0.005),
      fade: 1,
    };
  }

  function spawnParticle(connections) {
    if (particles.length >= MAX_PARTICLES || connections.length === 0) return;

    var conn = connections[Math.floor(Math.random() * connections.length)];
    if (Math.random() > 0.5) return;

    particles.push({
      from: conn.a,
      to: conn.b,
      t: 0,
      speed: rand(0.006, 0.012),
      size: rand(1.5, 2.5),
    });
  }

  function updateNodes() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;

      var pad = 24;
      if (n.x < pad) { n.x = pad; n.vx = Math.abs(n.vx); }
      if (n.x > width - pad) { n.x = width - pad; n.vx = -Math.abs(n.vx); }
      if (n.y < pad) { n.y = pad; n.vy = Math.abs(n.vy); }
      if (n.y > height - pad) { n.y = height - pad; n.vy = -Math.abs(n.vy); }
    }
  }

  function updateParticles() {
    particles = particles.filter(function (p) {
      p.t += p.speed;
      return p.t <= 1;
    });
  }

  function updateEventPath() {
    if (!eventPath) return;

    eventPath.progress += eventPath.speed;

    if (eventPath.progress >= 1) {
      eventPath.fade -= 0.025;
      if (eventPath.fade <= 0) eventPath = null;
    }
  }

  function drawConnections(connections) {
    connections.forEach(function (c) {
      var a = nodes[c.a];
      var b = nodes[c.b];
      var alpha = 0.1 + (1 - c.dist / connectDist) * 0.1;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "rgba(37, 99, 235, " + alpha.toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawEventPath() {
    if (!eventPath) return;

    var indices = eventPath.indices;
    var totalSegments = indices.length - 1;
    var travel = eventPath.progress * totalSegments;
    var segIndex = Math.min(Math.floor(travel), totalSegments - 1);
    var segT = travel - segIndex;

    ctx.save();
    ctx.globalAlpha = eventPath.fade;

    ctx.beginPath();
    for (var s = 0; s < indices.length; s++) {
      var pt = nodes[indices[s]];
      if (s === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = "rgba(37, 99, 235, 0.18)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(59, 130, 246, 0.4)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (var i = 0; i <= segIndex && i < totalSegments; i++) {
      var from = nodes[indices[i]];
      var to = nodes[indices[i + 1]];
      var t = i < segIndex ? 1 : segT;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.28)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    if (segIndex < totalSegments) {
      var headFrom = nodes[indices[segIndex]];
      var headTo = nodes[indices[segIndex + 1]];
      var hx = headFrom.x + (headTo.x - headFrom.x) * segT;
      var hy = headFrom.y + (headTo.y - headFrom.y) * segT;

      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(96, 165, 250, 0.45)";
      ctx.shadowColor = "rgba(59, 130, 246, 0.6)";
      ctx.shadowBlur = 14;
      ctx.fill();
    }

    ctx.restore();
  }

  function drawNodes() {
    nodes.forEach(function (n) {
      var glow = 0.14 + Math.sin(n.pulse) * 0.06;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, " + (glow * 0.35).toFixed(3) + ")";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, " + glow.toFixed(3) + ")";
      ctx.shadowColor = "rgba(59, 130, 246, 0.35)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(147, 197, 253, 0.35)";
      ctx.fill();
    });
  }

  function drawParticles() {
    particles.forEach(function (p) {
      var a = nodes[p.from];
      var b = nodes[p.to];
      var x = a.x + (b.x - a.x) * p.t;
      var y = a.y + (b.y - a.y) * p.t;
      var alpha = 0.18 + Math.sin(p.t * Math.PI) * 0.12;

      ctx.beginPath();
      ctx.arc(x, y, p.size + 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, " + (alpha * 0.4).toFixed(3) + ")";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(96, 165, 250, " + alpha.toFixed(3) + ")";
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function render() {
    if (!initialized || width <= 0 || height <= 0) return null;
    ctx.clearRect(0, 0, width, height);
    var connections = getConnections();
    drawConnections(connections);
    drawEventPath();
    drawNodes();
    drawParticles();
    return connections;
  }

  function tick(timestamp) {
    if (!running || !initialized) {
      rafId = null;
      return;
    }

    var connections = getConnections();
    var adj = getAdjacency(connections);

    updateNodes();

    if (timestamp - lastParticleSpawn > PARTICLE_INTERVAL) {
      spawnParticle(connections);
      lastParticleSpawn = timestamp;
    }

    if (!eventPath && timestamp - lastPathSpawn > PATH_INTERVAL) {
      spawnEventPath(connections, adj);
      lastPathSpawn = timestamp;
    }

    updateParticles();
    updateEventPath();
    render();

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId || reducedMotion || !initialized) return;
    lastPathSpawn = performance.now();
    lastParticleSpawn = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function start() {
    resize();
    if (!initialized) {
      window.requestAnimationFrame(start);
      return;
    }

    if (reducedMotion) {
      render();
      return;
    }

    running = !document.hidden;
    if (running) startLoop();
  }

  function onVisibilityChange() {
    running = !document.hidden && !reducedMotion;
    if (running) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (!reducedMotion && running) render();
    }, 100);
  }

  function init() {
    canvas = document.getElementById("hero-network-canvas");
    hero = document.getElementById("hero");
    if (!canvas || !hero) return;

    ctx = canvas.getContext("2d", { alpha: true });

    document.addEventListener("visibilitychange", onVisibilityChange);

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(onResize).observe(hero);
    }
    window.addEventListener("resize", onResize);

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
