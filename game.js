'use strict';

const canvas = document.querySelector('#space');
const ctx = canvas.getContext('2d');
const ui = {
  hud: document.querySelector('#hud'),
  mission: document.querySelector('#mission-name'),
  health: document.querySelector('#health-fill'),
  healthValue: document.querySelector('#health-value'),
  shield: document.querySelector('#shield-fill'),
  shieldValue: document.querySelector('#shield-value'),
  score: document.querySelector('#score-value'),
  kills: document.querySelector('#kills-value'),
  ammo: document.querySelector('#ammo-value'),
  bossHud: document.querySelector('#boss-hud'),
  bossName: document.querySelector('#boss-name'),
  bossHealth: document.querySelector('#boss-fill'),
  toast: document.querySelector('#toast'),
  boost: document.querySelector('#boost-indicator'),
  touchControls: document.querySelector('#touch-controls'),
  menu: document.querySelector('#screen-menu'),
  start: document.querySelector('#start-button'),
  pause: document.querySelector('#screen-pause'),
  end: document.querySelector('#screen-end'),
  endEyebrow: document.querySelector('#end-eyebrow'),
  endTitle: document.querySelector('#end-title'),
  endMessage: document.querySelector('#end-message'),
  endScore: document.querySelector('#end-score'),
  endCoins: document.querySelector('#end-coins'),
  continue: document.querySelector('#continue-button'),
  coinValue: document.querySelector('#coin-value'),
  shipList: document.querySelector('#ship-list'),
  upgrade: document.querySelector('#upgrade-button'),
  upgradeCost: document.querySelector('#upgrade-cost'),
  hullUpgrade: document.querySelector('#hull-upgrade-button'),
  hullUpgradeCost: document.querySelector('#hull-upgrade-cost'),
  paintList: document.querySelector('#paint-list'),
  paintStatus: document.querySelector('#paint-status'),
  menuSound: document.querySelector('#menu-sound-button'),
  hudSound: document.querySelector('#hud-sound-button')
};

const missions = [
  { name: 'Defesa da Estação', description: 'Proteja a estação orbital de Vesper.', target: 8, boss: false, scene: 'station' },
  { name: 'Campo de Asteroides', description: 'Atravesse o cinturão e neutralize a patrulha.', target: 11, boss: false, scene: 'asteroids' },
  { name: 'Frota Inimiga', description: 'Desmonte a armada que bloqueia o setor.', target: 14, boss: true, scene: 'fleet' },
  { name: 'Última Esperança', description: 'Defenda o planeta Nébula da invasão.', target: 17, boss: false, scene: 'planet' },
  { name: 'O Cruzador Sombrio', description: 'Derrote o cruzador que comanda o bloqueio.', target: 19, boss: true, scene: 'fleet' },
  { name: 'Nebulosa Fantasma', description: 'Localize e destrua os caças escondidos na nebulosa.', target: 21, boss: false, scene: 'nebula' },
  { name: 'Cerco de Órion', description: 'Rompa as linhas de defesa da frota de Órion.', target: 23, boss: true, scene: 'planet' },
  { name: 'Tempestade Cósmica', description: 'Sobreviva à tempestade e elimine a escolta alienígena.', target: 25, boss: false, scene: 'asteroids' },
  { name: 'Bastião da Fronteira', description: 'Abra caminho até a última defesa inimiga.', target: 27, boss: true, scene: 'station' },
  { name: 'A Nave-Mãe', description: 'Enfrente a nave-mãe Oblivion e salve a galáxia.', target: 30, boss: true, scene: 'mothership' }
];

const ships = [
  { id: 'swift', name: 'Cometa', kind: 'CAÇA RÁPIDO', cost: 0, speed: 340, health: 100, rate: .17, damage: 13, color: '#80efff', description: 'Caça ágil · tiro rápido' },
  { id: 'heavy', name: 'Sentinela', kind: 'CRUZADOR PESADO', cost: 55, speed: 255, health: 160, rate: .27, damage: 21, color: '#ffd18b', description: 'Casco forte · tiro potente' },
  { id: 'alien', name: 'Espectro', kind: 'NAVE ALIENÍGENA', cost: 95, speed: 300, health: 125, rate: .20, damage: 17, color: '#d0a0ff', description: 'Nave alienígena · equilibrada' },
  { id: 'raptor', name: 'Raptor', kind: 'INTERCEPTOR', cost: 150, speed: 375, health: 105, rate: .15, damage: 14, color: '#8dffb0', description: 'Velocidade máxima' },
  { id: 'titan', name: 'Titã', kind: 'NAVE DE ASSALTO', cost: 230, speed: 230, health: 205, rate: .31, damage: 27, color: '#ff9fb7', description: 'Canhões pesados · blindagem máxima' }
];

const paints = [
  { id: 'cyan', name: 'Azul estelar', color: '#80efff', cost: 0 },
  { id: 'amber', name: 'Âmbar solar', color: '#ffc46b', cost: 20 },
  { id: 'violet', name: 'Violeta cósmico', color: '#c59aff', cost: 35 },
  { id: 'green', name: 'Verde plasma', color: '#7dffaf', cost: 50 },
  { id: 'rose', name: 'Rosa nebular', color: '#ff91be', cost: 65 }
];
const freshProfile = () => ({
  credits: 0,
  selected: 'swift',
  unlocked: ['swift'],
  weaponLevel: 0,
  hullLevel: 0,
  paint: 'cyan',
  unlockedPaints: ['cyan'],
  soundEnabled: true,
  bestStage: 1
});
let profile = freshProfile();
try {
  const stored = localStorage.getItem('galactic-journeys-profile');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && Number.isFinite(parsed.credits) && Array.isArray(parsed.unlocked)) {
      profile = {
        credits: Math.max(0, Math.floor(parsed.credits)),
        selected: ships.some(ship => ship.id === parsed.selected) ? parsed.selected : 'swift',
        unlocked: [...new Set(['swift', ...parsed.unlocked.filter(id => ships.some(ship => ship.id === id))])],
        weaponLevel: Math.max(0, Math.min(3, Math.floor(parsed.weaponLevel) || 0)),
        hullLevel: Math.max(0, Math.min(3, Math.floor(parsed.hullLevel) || 0)),
        paint: paints.some(paint => paint.id === parsed.paint) ? parsed.paint : 'cyan',
        unlockedPaints: [...new Set(['cyan', ...(Array.isArray(parsed.unlockedPaints) ? parsed.unlockedPaints : []).filter(id => paints.some(paint => paint.id === id))])],
        soundEnabled: parsed.soundEnabled !== false,
        bestStage: Math.max(1, Math.min(missions.length, Math.floor(parsed.bestStage) || 1))
      };
    }
  }
} catch (error) {
  console.warn('Não foi possível ler o progresso salvo; uma nova carreira será iniciada.', error);
}

const game = {
  mode: 'menu',
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: 1,
  stage: 1,
  score: 0,
  kills: 0,
  runCredits: 0,
  specialAmmo: 3,
  player: null,
  enemies: [],
  playerShots: [],
  enemyShots: [],
  missiles: [],
  asteroids: [],
  particles: [],
  stars: [],
  boss: null,
  spawnTimer: 0,
  asteroidTimer: 0,
  bossPending: false,
  toastTimer: 0,
  hudTimer: 0,
  now: 0
};
const keys = new Set();
const joystick = { x: 0, y: 0, pointer: null };
const touch = { fire: false, boost: false };
let audioContext = null;
let lastFrame = performance.now();

function saveProfile() {
  try {
    localStorage.setItem('galactic-journeys-profile', JSON.stringify(profile));
  } catch (error) {
    console.warn('Não foi possível salvar o progresso neste dispositivo.', error);
    showToast('Progresso não pôde ser salvo neste dispositivo');
  }
}

function shipById(id = profile.selected) {
  return ships.find(ship => ship.id === id) || ships[0];
}

function paintById(id = profile.paint) {
  return paints.find(paint => paint.id === id) || paints[0];
}

function resize() {
  game.width = window.innerWidth;
  game.height = window.innerHeight;
  game.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(game.width * game.dpr);
  canvas.height = Math.round(game.height * game.dpr);
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  if (game.player) {
    game.player.x = Math.min(game.width - 24, Math.max(24, game.player.x));
    game.player.y = Math.min(game.height - 45, Math.max(100, game.player.y));
  }
  seedStars();
}

function seedStars() {
  const count = Math.min(180, Math.floor(game.width * game.height / 5200));
  game.stars = Array.from({ length: count }, () => ({
    x: Math.random() * game.width,
    y: Math.random() * game.height,
    z: .2 + Math.random() * .8,
    size: .5 + Math.random() * 1.7,
    twinkle: Math.random() * Math.PI * 2
  }));
}

function renderHangar() {
  ui.coinValue.textContent = profile.credits;
  ui.shipList.replaceChildren();
  for (const ship of ships) {
    const unlocked = profile.unlocked.includes(ship.id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `ship-card${profile.selected === ship.id ? ' selected' : ''}${unlocked ? '' : ' locked'}`;
    card.setAttribute('aria-label', unlocked ? `Selecionar ${ship.name}` : `Desbloquear ${ship.name} por ${ship.cost} créditos`);
    const art = document.createElement('span');
    art.className = 'ship-art';
    art.style.setProperty('--ship-color', ship.color);
    const silhouette = document.createElement('i');
    silhouette.className = `ship-silhouette ship-${ship.id}`;
    art.append(silhouette);
    const name = document.createElement('strong');
    name.textContent = ship.name;
    const details = document.createElement('small');
    details.textContent = unlocked ? ship.description : `🔒 ${ship.cost} ◈`;
    card.append(art, name, details);
    card.addEventListener('click', () => {
      if (unlocked) {
        profile.selected = ship.id;
      } else if (profile.credits >= ship.cost) {
        profile.credits -= ship.cost;
        profile.unlocked.push(ship.id);
        profile.selected = ship.id;
        saveProfile();
      } else {
        showToast(`Faltam ${ship.cost - profile.credits} créditos para desbloquear`);
        return;
      }
      saveProfile();
      renderHangar();
    });
    ui.shipList.append(card);
  }
  const upgradeCost = 25 * (profile.weaponLevel + 1);
  ui.upgradeCost.textContent = upgradeCost;
  ui.upgrade.disabled = profile.weaponLevel >= 3 || profile.credits < upgradeCost;
  if (profile.weaponLevel >= 3) {
    ui.upgrade.textContent = 'Canhões no nível máximo';
  } else {
    ui.upgrade.replaceChildren(`Aprimorar canhões Nv. ${profile.weaponLevel} · `, ui.upgradeCost, ' ◈');
  }
  const hullCost = 40 + profile.hullLevel * 35;
  ui.hullUpgradeCost.textContent = hullCost;
  ui.hullUpgrade.disabled = profile.hullLevel >= 3 || profile.credits < hullCost;
  if (profile.hullLevel >= 3) {
    ui.hullUpgrade.textContent = 'Blindagem no nível máximo';
  } else {
    ui.hullUpgrade.replaceChildren(`Reforçar casco Nv. ${profile.hullLevel} · `, ui.hullUpgradeCost, ' ◈');
  }
  const startLabel = profile.bestStage > 1
    ? `CONTINUAR · FASE ${profile.bestStage}/${missions.length}`
    : 'INICIAR MISSÃO';
  ui.start.replaceChildren(startLabel, ' ', Object.assign(document.createElement('span'), { textContent: '➜' }));
  ui.paintList.replaceChildren();
  for (const paint of paints) {
    const unlockedPaint = profile.unlockedPaints.includes(paint.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `paint-swatch${profile.paint === paint.id ? ' selected' : ''}${unlockedPaint ? '' : ' locked'}`;
    button.style.setProperty('--paint-color', paint.color);
    button.title = `${paint.name}${unlockedPaint ? '' : ` · ${paint.cost} créditos`}`;
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-pressed', String(profile.paint === paint.id));
    button.addEventListener('click', () => {
      if (!profile.unlockedPaints.includes(paint.id)) {
        if (profile.credits < paint.cost) {
          showToast(`Faltam ${paint.cost - profile.credits} créditos para esta pintura`);
          return;
        }
        profile.credits -= paint.cost;
        profile.unlockedPaints.push(paint.id);
      }
      profile.paint = paint.id;
      saveProfile();
      renderHangar();
    });
    ui.paintList.append(button);
  }
  const selectedPaint = paintById();
  ui.paintStatus.textContent = profile.unlockedPaints.includes(selectedPaint.id) ? selectedPaint.name : `${selectedPaint.cost} ◈`;
  updateSoundButtons();
}

function showToast(message, duration = 2200) {
  ui.toast.textContent = message;
  ui.toast.classList.remove('hidden');
  game.toastTimer = duration;
}

function awardCredits(amount) {
  const reward = Math.max(0, Math.floor(amount));
  if (reward === 0) return;
  profile.credits += reward;
  game.runCredits += reward;
  saveProfile();
}

function updateSoundButtons() {
  const enabled = profile.soundEnabled;
  ui.menuSound.textContent = enabled ? '♫ SOM: LIGADO' : '♫ SOM: DESLIGADO';
  ui.menuSound.setAttribute('aria-pressed', String(enabled));
  ui.hudSound.textContent = enabled ? '♫' : '×';
  ui.hudSound.setAttribute('aria-label', enabled ? 'Desligar som' : 'Ligar som');
  ui.hudSound.setAttribute('aria-pressed', String(enabled));
}

function toggleSound() {
  initAudio();
  profile.soundEnabled = !profile.soundEnabled;
  saveProfile();
  updateSoundButtons();
  if (profile.soundEnabled) sound(660, .13, 'sine', .045, 880);
}

function showMenu() {
  game.mode = 'menu';
  ui.menu.classList.remove('hidden');
  ui.pause.classList.add('hidden');
  ui.end.classList.add('hidden');
  ui.hud.classList.add('hidden');
  ui.touchControls.classList.add('hidden');
  ui.boost.classList.add('hidden');
  ui.bossHud.classList.add('hidden');
  renderHangar();
}

function createPlayer() {
  const ship = shipById();
  const paint = paintById();
  const hullMultiplier = 1 + profile.hullLevel * .16;
  return {
    x: game.width / 2,
    y: game.height * .73,
    radius: 17,
    health: Math.round(ship.health * hullMultiplier),
    maxHealth: Math.round(ship.health * hullMultiplier),
    shield: 100 + profile.hullLevel * 20,
    maxShield: 100 + profile.hullLevel * 20,
    speed: ship.speed * (1 + profile.hullLevel * .025),
    fireRate: ship.rate,
    damage: ship.damage + profile.weaponLevel * 5 + profile.hullLevel * 2,
    fireCooldown: .1,
    shieldDelay: 0,
    boost: 100,
    invulnerable: 0,
    ship,
    paint: paint.color
  };
}

function startMission(stage = profile.bestStage, preserveRun = false) {
  game.stage = stage;
  if (!preserveRun) {
    game.score = 0;
    game.kills = 0;
    game.runCredits = 0;
  }
  game.specialAmmo = 3;
  game.player = createPlayer();
  game.enemies = [];
  game.playerShots = [];
  game.enemyShots = [];
  game.missiles = [];
  game.asteroids = [];
  game.particles = [];
  game.boss = null;
  game.spawnTimer = .7;
  game.asteroidTimer = .5;
  game.bossPending = false;
  game.mode = 'playing';
  keys.clear();
  joystick.x = 0;
  joystick.y = 0;
  touch.fire = false;
  touch.boost = false;
  document.querySelector('#joystick-knob').style.transform = 'translate(-50%, -50%)';
  ui.menu.classList.add('hidden');
  ui.pause.classList.add('hidden');
  ui.end.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  ui.touchControls.classList.remove('hidden');
  ui.bossHud.classList.add('hidden');
  ui.mission.textContent = `FASE ${stage}/${missions.length} · ${missions[stage - 1].name}`;
  ui.boost.classList.add('hidden');
  updateHud();
  showToast(`MISSÃO ${stage}: ${missions[stage - 1].description.toUpperCase()}`, 3200);
  initAudio();
  sound(440, .13, 'sine', .04, 660);
  sound(660, .2, 'sine', .035, 880);
}

function pauseGame() {
  if (game.mode !== 'playing') return;
  game.mode = 'paused';
  touch.fire = false;
  touch.boost = false;
  ui.pause.classList.remove('hidden');
}

function resumeGame() {
  if (game.mode !== 'paused') return;
  game.mode = 'playing';
  ui.pause.classList.add('hidden');
  lastFrame = performance.now();
}

function finishMission(won) {
  if (game.mode !== 'playing') return;
  game.mode = 'end';
  ui.end.classList.remove('hidden');
  ui.pause.classList.add('hidden');
  ui.touchControls.classList.add('hidden');
  ui.bossHud.classList.add('hidden');
  ui.boost.classList.add('hidden');
  ui.endScore.textContent = game.score;
  ui.endCoins.textContent = game.runCredits;
  if (won) {
    const bonus = 20 + game.stage * 10 + Math.floor(game.score / 250);
    awardCredits(bonus);
    profile.bestStage = Math.max(profile.bestStage, Math.min(missions.length, game.stage + 1));
    saveProfile();
    ui.endEyebrow.textContent = game.stage === missions.length ? 'A GALÁXIA ESTÁ A SALVO' : 'MISSÃO CONCLUÍDA';
    ui.endTitle.textContent = game.stage === missions.length ? 'Vitória galáctica!' : 'Setor protegido';
    ui.endMessage.textContent = game.stage === missions.length
      ? `A nave-mãe foi derrotada. Você salvou a galáxia! Ganhou ${bonus} créditos de bônus, além dos créditos por inimigos derrotados.`
      : `${missions[game.stage - 1].description} Bônus da missão: ${bonus} créditos. Cada inimigo derrotado também rende créditos para comprar naves, pinturas e melhorias.`;
    ui.continue.classList.toggle('hidden', game.stage >= missions.length);
    ui.continue.textContent = game.stage >= missions.length ? 'JOGAR NOVAMENTE' : 'PRÓXIMA MISSÃO ➜';
    ui.endCoins.textContent = game.runCredits;
    sound(660, .2, 'sine', .05, 880);
    sound(880, .32, 'sine', .05, 1175);
  } else {
    ui.endEyebrow.textContent = 'SINAL PERDIDO';
    ui.endTitle.textContent = 'Nave destruída';
    ui.endMessage.textContent = 'A galáxia ainda precisa de você. Reabasteça, escolha sua nave e tente novamente.';
    ui.continue.classList.add('hidden');
    sound(160, .65, 'sawtooth', .07, 45);
  }
  renderHangar();
}

function completeStage() {
  finishMission(true);
}

function initAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  if (audioContext?.state === 'suspended') {
    audioContext.resume().catch(error => console.warn('Não foi possível iniciar o áudio.', error));
  }
}

function sound(frequency, duration, type = 'sine', volume = .035, endFrequency = frequency * .6) {
  if (!audioContext || !profile.soundEnabled) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, endFrequency), audioContext.currentTime + duration);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function shoot() {
  const player = game.player;
  if (!player || player.fireCooldown > 0) return;
  player.fireCooldown = player.fireRate;
  const spread = profile.weaponLevel >= 2 ? 9 : 5;
  const damage = player.damage;
  game.playerShots.push(
    { x: player.x - spread, y: player.y - 19, vx: -12, vy: -590, damage, radius: 4, color: player.ship.color },
    { x: player.x + spread, y: player.y - 19, vx: 12, vy: -590, damage, radius: 4, color: player.ship.color }
  );
  if (profile.weaponLevel >= 3) {
    game.playerShots.push({ x: player.x, y: player.y - 24, vx: 0, vy: -660, damage: damage * .8, radius: 5, color: '#d5a1ff' });
  }
  sound(570, .075, 'sawtooth', .018, 260);
}

function useSpecial() {
  if (game.mode !== 'playing' || game.specialAmmo <= 0) return;
  const targets = [...game.enemies, ...(game.boss ? [game.boss] : [])]
    .sort((a, b) => Math.hypot(a.x - game.player.x, a.y - game.player.y) - Math.hypot(b.x - game.player.x, b.y - game.player.y))
    .slice(0, 4);
  if (!targets.length) {
    showToast('Nenhum alvo no alcance');
    return;
  }
  game.specialAmmo -= 1;
  for (const target of targets) {
    game.missiles.push({ x: game.player.x, y: game.player.y - 16, target, speed: 500, damage: 55 + profile.weaponLevel * 12, trail: [] });
  }
  sound(180, .35, 'triangle', .08, 780);
  updateHud();
}

function spawnEnemy() {
  const size = 14 + Math.random() * 6;
  const kind = Math.random() < .32 ? 'scout' : 'fighter';
  game.enemies.push({
    x: 28 + Math.random() * (game.width - 56),
    y: -30,
    baseX: 0,
    radius: size,
    health: kind === 'scout' ? 20 + game.stage * 2 : 34 + game.stage * 4,
    maxHealth: kind === 'scout' ? 20 + game.stage * 2 : 34 + game.stage * 4,
    speed: (kind === 'scout' ? 105 : 75) + game.stage * 8,
    kind,
    age: 0,
    fireTimer: .8 + Math.random() * 1.7,
    drift: Math.random() < .5 ? -1 : 1
  });
  const enemy = game.enemies[game.enemies.length - 1];
  enemy.baseX = enemy.x;
}

function spawnAsteroid() {
  const radius = 13 + Math.random() * 19;
  game.asteroids.push({
    x: Math.random() * game.width,
    y: -radius,
    radius,
    vx: (Math.random() - .5) * 80,
    vy: 100 + Math.random() * 130,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - .5) * 2.5,
    health: radius > 24 ? 48 : 24
  });
}

function spawnBoss() {
  const finalBoss = game.stage === missions.length;
  const hp = 280 + game.stage * 95;
  game.boss = {
    x: game.width / 2,
    y: -80,
    radius: finalBoss ? 62 : 43 + Math.min(10, game.stage),
    health: hp,
    maxHealth: hp,
    age: 0,
    fireTimer: .65,
    phase: 0,
    direction: 1,
    name: finalBoss ? 'NAVE-MÃE: OBLIVION' : `CHEFE DO SETOR ${String(game.stage).padStart(2, '0')}`
  };
  game.bossPending = false;
  ui.bossName.textContent = game.boss.name;
  ui.bossHud.classList.remove('hidden');
  showToast('ALERTA: ASSINATURA DE CHEFE DETECTADA', 2500);
}

function addExplosion(x, y, color = '#70eaff', count = 18, scale = 1) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (40 + Math.random() * 230) * scale;
    const life = .35 + Math.random() * .65;
    game.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      radius: 1.5 + Math.random() * 3.5 * scale,
      color
    });
  }
  if (game.particles.length > 420) game.particles.splice(0, game.particles.length - 420);
}

function destroyEnemy(enemy) {
  const index = game.enemies.indexOf(enemy);
  if (index < 0) return;
  game.enemies.splice(index, 1);
  game.kills += 1;
  const points = enemy.kind === 'scout' ? 120 : 180;
  game.score += points;
  awardCredits(Math.max(2, Math.floor(points / 60)));
  addExplosion(enemy.x, enemy.y, enemy.kind === 'scout' ? '#ff668c' : '#ffbd70', 16);
  sound(115, .18, 'triangle', .035, 45);
  if (game.kills === missions[game.stage - 1].target) showToast('ALVOS DA ÁREA ELIMINADOS');
}

function destroyBoss() {
  const boss = game.boss;
  if (!boss) return;
  game.kills += 1;
  game.score += 2500;
  awardCredits(20 + game.stage * 2);
  for (let i = 0; i < 7; i++) {
    addExplosion(boss.x + (Math.random() - .5) * 100, boss.y + (Math.random() - .5) * 65, i % 2 ? '#ffb263' : '#ff5c9d', 24, 1.3);
  }
  game.boss = null;
  ui.bossHud.classList.add('hidden');
  sound(75, .8, 'sawtooth', .12, 25);
  completeStage();
}

function damagePlayer(amount) {
  const player = game.player;
  if (player.invulnerable > 0) return;
  player.invulnerable = .32;
  player.shieldDelay = 2.5;
  let remaining = amount;
  if (player.shield > 0) {
    const absorbed = Math.min(player.shield, remaining);
    player.shield -= absorbed;
    remaining -= absorbed;
    addExplosion(player.x, player.y, '#66bfff', 7, .6);
    sound(320, .12, 'sine', .045, 180);
  }
  if (remaining > 0) {
    player.health -= remaining;
    addExplosion(player.x, player.y, '#ff697a', 9, .75);
    sound(175, .2, 'sawtooth', .045, 65);
  }
  if (player.health <= 0) {
    player.health = 0;
    addExplosion(player.x, player.y, '#8eeeff', 48, 1.7);
    sound(90, .7, 'sawtooth', .1, 30);
    finishMission(false);
  }
}

function circleHit(a, b, radiusA = a.radius, radiusB = b.radius) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < (radiusA + radiusB) ** 2;
}

function update(dt) {
  game.now += dt;
  if (game.toastTimer > 0) {
    game.toastTimer -= dt * 1000;
    if (game.toastTimer <= 0) ui.toast.classList.add('hidden');
  }
  for (const star of game.stars) {
    star.y += (22 + star.z * 105) * dt * (game.mode === 'playing' ? 1.8 : .35);
    if (star.y > game.height + 2) {
      star.y = -2;
      star.x = Math.random() * game.width;
    }
  }
  if (game.mode !== 'playing') {
    updateParticles(dt);
    return;
  }

  const player = game.player;
  player.fireCooldown -= dt;
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.shieldDelay -= dt;
  player.boost = Math.min(100, player.boost + 18 * dt);
  if (player.shieldDelay <= 0) player.shield = Math.min(player.maxShield, player.shield + 10 * dt);
  const horizontal = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) -
    (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0) + joystick.x;
  const vertical = (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) -
    (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) + joystick.y;
  const magnitude = Math.hypot(horizontal, vertical);
  const normalizer = magnitude > 1 ? 1 / magnitude : 1;
  const boosting = (keys.has('ShiftLeft') || keys.has('ShiftRight') || touch.boost) && player.boost > 0;
  const speed = player.speed * (boosting ? 1.6 : 1);
  if (boosting) player.boost = Math.max(0, player.boost - 48 * dt);
  player.x = Math.max(24, Math.min(game.width - 24, player.x + horizontal * normalizer * speed * dt));
  player.y = Math.max(85, Math.min(game.height - 34, player.y + vertical * normalizer * speed * dt));
  ui.boost.classList.toggle('hidden', !boosting);

  if (keys.has('Space') || touch.fire) shoot();
  if (game.spawnTimer > 0) game.spawnTimer -= dt;
  else if (game.kills < missions[game.stage - 1].target && game.enemies.length < 7) {
    spawnEnemy();
    game.spawnTimer = Math.max(.42, 1.55 - game.stage * .12) * (.65 + Math.random() * .7);
  }
  if (missions[game.stage - 1].scene === 'asteroids') {
    game.asteroidTimer -= dt;
    if (game.asteroidTimer <= 0) {
      spawnAsteroid();
      game.asteroidTimer = .45 + Math.random() * .7;
    }
  }

  for (let i = game.playerShots.length - 1; i >= 0; i--) {
    const shot = game.playerShots[i];
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (shot.y < -20 || shot.x < -20 || shot.x > game.width + 20) {
      game.playerShots.splice(i, 1);
      continue;
    }
    let hit = false;
    for (const enemy of game.enemies) {
      if (circleHit(shot, enemy)) {
        enemy.health -= shot.damage;
        addExplosion(shot.x, shot.y, '#8ceaff', 4, .35);
        if (enemy.health <= 0) destroyEnemy(enemy);
        hit = true;
        break;
      }
    }
    if (!hit && game.boss && circleHit(shot, game.boss, shot.radius, game.boss.radius)) {
      game.boss.health -= shot.damage;
      addExplosion(shot.x, shot.y, '#ffb9cc', 4, .4);
      if (game.boss.health <= 0) destroyBoss();
      hit = true;
    }
    if (hit) game.playerShots.splice(i, 1);
  }

  for (const enemy of game.enemies) {
    enemy.age += dt;
    enemy.y += enemy.speed * dt;
    enemy.x = enemy.baseX + Math.sin(enemy.age * (enemy.kind === 'scout' ? 2.4 : 1.4)) * (enemy.kind === 'scout' ? 70 : 36) * enemy.drift;
    enemy.x = Math.max(enemy.radius, Math.min(game.width - enemy.radius, enemy.x));
    enemy.fireTimer -= dt;
    if (enemy.fireTimer <= 0 && enemy.y > 20 && enemy.y < game.height - 160) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      const velocity = enemy.kind === 'scout' ? 205 : 175;
      game.enemyShots.push({ x: enemy.x, y: enemy.y + 12, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, radius: 5, damage: 11 + game.stage, color: '#ff5d84' });
      sound(245, .09, 'square', .009, 115);
      enemy.fireTimer = 1.2 + Math.random() * 1.5;
    }
    if (enemy.y > game.height + 40) {
      game.enemies.splice(game.enemies.indexOf(enemy), 1);
      damagePlayer(7);
      break;
    }
    if (circleHit(player, enemy)) {
      damagePlayer(18);
      enemy.health = 0;
      destroyEnemy(enemy);
      break;
    }
  }

  for (let i = game.enemyShots.length - 1; i >= 0; i--) {
    const shot = game.enemyShots[i];
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (shot.y > game.height + 20 || shot.y < -20 || shot.x < -20 || shot.x > game.width + 20) {
      game.enemyShots.splice(i, 1);
    } else if (circleHit(player, shot, player.radius, shot.radius)) {
      game.enemyShots.splice(i, 1);
      damagePlayer(shot.damage);
    }
  }

  for (let i = game.missiles.length - 1; i >= 0; i--) {
    const missile = game.missiles[i];
    const target = missile.target;
    if (!game.enemies.includes(target) && target !== game.boss) {
      game.missiles.splice(i, 1);
      continue;
    }
    const angle = Math.atan2(target.y - missile.y, target.x - missile.x);
    missile.x += Math.cos(angle) * missile.speed * dt;
    missile.y += Math.sin(angle) * missile.speed * dt;
    missile.trail.push({ x: missile.x, y: missile.y });
    if (missile.trail.length > 8) missile.trail.shift();
    if (circleHit(missile, target, 6, target.radius)) {
      if (target === game.boss) {
        target.health -= missile.damage;
        if (target.health <= 0) destroyBoss();
      } else {
        target.health -= missile.damage;
        if (target.health <= 0) destroyEnemy(target);
      }
      addExplosion(missile.x, missile.y, '#ffc579', 13, .8);
      game.missiles.splice(i, 1);
    }
  }

  for (let i = game.asteroids.length - 1; i >= 0; i--) {
    const asteroid = game.asteroids[i];
    asteroid.x += asteroid.vx * dt;
    asteroid.y += asteroid.vy * dt;
    asteroid.angle += asteroid.spin * dt;
    if (asteroid.y > game.height + asteroid.radius) {
      game.asteroids.splice(i, 1);
      continue;
    }
    if (circleHit(player, asteroid, player.radius - 3, asteroid.radius * .72)) {
      game.asteroids.splice(i, 1);
      damagePlayer(17);
      addExplosion(asteroid.x, asteroid.y, '#d8ae91', 12, .8);
      continue;
    }
    for (let j = game.playerShots.length - 1; j >= 0; j--) {
      const shot = game.playerShots[j];
      if (circleHit(shot, asteroid, shot.radius, asteroid.radius * .72)) {
        asteroid.health -= shot.damage;
        game.playerShots.splice(j, 1);
        if (asteroid.health <= 0) {
          game.asteroids.splice(i, 1);
          game.score += 40;
          awardCredits(1);
          addExplosion(asteroid.x, asteroid.y, '#d8ae91', 12, .75);
        }
        break;
      }
    }
  }

  if (game.boss) updateBoss(dt);
  if (game.mode === 'playing' && game.kills >= missions[game.stage - 1].target && game.enemies.length === 0 && !game.boss && !game.bossPending) {
    if (missions[game.stage - 1].boss) {
      game.bossPending = true;
      spawnBoss();
    } else {
      completeStage();
    }
  }
  updateParticles(dt);
  game.hudTimer += dt;
  if (game.hudTimer > .12) {
    updateHud();
    game.hudTimer = 0;
  }
}

function updateBoss(dt) {
  const boss = game.boss;
  boss.age += dt;
  boss.y = Math.min(game.height * .22, boss.y + 92 * dt);
  const healthPercent = boss.health / boss.maxHealth;
  boss.phase = healthPercent < .32 ? 2 : healthPercent < .66 ? 1 : 0;
  boss.x += Math.sin(boss.age * (boss.phase === 2 ? 1.35 : .7)) * (boss.phase === 2 ? 145 : 85) * dt;
  boss.x = Math.max(boss.radius + 15, Math.min(game.width - boss.radius - 15, boss.x));
  boss.fireTimer -= dt;
  if (boss.fireTimer <= 0) {
    const baseAngle = Math.atan2(game.player.y - boss.y, game.player.x - boss.x);
    const shotCount = boss.phase === 2 ? 7 : boss.phase === 1 ? 5 : 3;
    for (let i = 0; i < shotCount; i++) {
      const spread = (i - (shotCount - 1) / 2) * .16;
      const angle = baseAngle + spread;
      const speed = boss.phase === 2 ? 245 : 195;
      game.enemyShots.push({ x: boss.x, y: boss.y + boss.radius * .55, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: boss.phase === 2 ? 6 : 5, damage: boss.phase === 2 ? 15 : 12, color: '#ff4f83' });
    }
    boss.fireTimer = boss.phase === 2 ? .66 : boss.phase === 1 ? .95 : 1.25;
    sound(140, .15, 'triangle', .035, 70);
  }
  if (circleHit(game.player, boss, game.player.radius, boss.radius * .76)) damagePlayer(30);
}

function updateParticles(dt) {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const particle = game.particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.max(0, 1 - dt * 1.7);
    particle.vy *= Math.max(0, 1 - dt * 1.7);
    particle.life -= dt;
    if (particle.life <= 0) game.particles.splice(i, 1);
  }
}

function updateHud() {
  if (!game.player) return;
  const healthPercent = Math.max(0, game.player.health / game.player.maxHealth * 100);
  const shieldPercent = Math.max(0, game.player.shield / game.player.maxShield * 100);
  ui.health.style.width = `${healthPercent}%`;
  ui.healthValue.textContent = `${Math.ceil(game.player.health)} / ${game.player.maxHealth}`;
  ui.health.parentElement.parentElement.classList.toggle('critical', healthPercent <= 30);
  ui.shield.style.width = `${shieldPercent}%`;
  ui.shieldValue.textContent = `${Math.ceil(shieldPercent)}%`;
  ui.score.textContent = game.score.toLocaleString('pt-BR');
  ui.kills.textContent = `${game.kills}/${missions[game.stage - 1].target}`;
  ui.ammo.textContent = game.specialAmmo;
  if (game.boss) ui.bossHealth.style.width = `${Math.max(0, game.boss.health / game.boss.maxHealth * 100)}%`;
}

function draw() {
  const w = game.width;
  const h = game.height;
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w * .6, h);
  gradient.addColorStop(0, '#080d25');
  gradient.addColorStop(.55, '#080b1b');
  gradient.addColorStop(1, '#12091f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  drawNebula();
  drawBackdropObject();
  drawStars();
  for (const asteroid of game.asteroids) drawAsteroid(asteroid);
  for (const shot of game.playerShots) drawPlayerShot(shot);
  for (const shot of game.enemyShots) drawEnemyShot(shot);
  for (const missile of game.missiles) drawMissile(missile);
  for (const enemy of game.enemies) drawEnemy(enemy);
  if (game.boss) drawBoss(game.boss);
  if (game.player && game.mode !== 'menu') drawPlayer();
  drawParticles();
  drawScanlines();
}

function drawNebula() {
  const x = game.width * .7;
  const y = game.height * .36;
  const radius = Math.max(game.width, game.height) * .44;
  const nebula = ctx.createRadialGradient(x, y, 0, x, y, radius);
  nebula.addColorStop(0, 'rgba(94, 57, 148, .17)');
  nebula.addColorStop(.42, 'rgba(42, 67, 133, .08)');
  nebula.addColorStop(1, 'rgba(18, 26, 67, 0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, game.width, game.height);
}

function drawBackdropObject() {
  const scene = missions[game.stage - 1]?.scene;
  if (scene === 'station') {
    drawStation();
    return;
  }
  if (scene === 'nebula' || scene === 'mothership') {
    drawDistantGalaxy(scene === 'mothership');
    return;
  }
  if (scene !== 'planet') return;
  const x = game.width * .84;
  const y = game.height * .75;
  const radius = Math.min(game.width, game.height) * .17;
  ctx.save();
  ctx.globalAlpha = .38;
  const planet = ctx.createRadialGradient(x - radius * .4, y - radius * .48, 0, x, y, radius * 1.15);
  planet.addColorStop(0, '#78d7ff');
  planet.addColorStop(.45, '#287cb8');
  planet.addColorStop(1, '#0b1034');
  ctx.fillStyle = planet;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#85eaff66';
  ctx.lineWidth = radius * .08;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 1.48, radius * .32, -.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawDistantGalaxy(mothership) {
  const x = game.width * .78;
  const y = game.height * .42;
  const radius = Math.min(game.width, game.height) * (mothership ? .11 : .15);
  ctx.save();
  ctx.globalAlpha = .35;
  ctx.translate(x, y);
  ctx.rotate(game.now * (mothership ? .025 : .008));
  ctx.scale(1.55, .62);
  ctx.strokeStyle = mothership ? '#ff638e' : '#af7bff';
  ctx.lineWidth = mothership ? 9 : 14;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * .74, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = mothership ? '#4f183a' : '#35206b';
  ctx.beginPath();
  ctx.arc(0, 0, radius * .56, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (mothership) {
    ctx.save();
    ctx.globalAlpha = .32;
    ctx.translate(x, y - radius * 2.5);
    ctx.fillStyle = '#4d183a';
    ctx.strokeStyle = '#ff668b';
    ctx.shadowColor = '#ff527a';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, -radius * .48);
    ctx.lineTo(radius * .6, radius * .3);
    ctx.lineTo(radius * 1.4, radius * .52);
    ctx.lineTo(0, radius * .7);
    ctx.lineTo(-radius * 1.4, radius * .52);
    ctx.lineTo(-radius * .6, radius * .3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawStation() {
  const x = game.width * .14;
  const y = game.height * .36;
  const size = Math.min(game.width, game.height) * .11;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = .43;
  ctx.strokeStyle = '#88dfff';
  ctx.fillStyle = '#203967';
  ctx.shadowColor = '#5dd8ff';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 2;
  ctx.strokeRect(-size * 1.65, -size * .22, size * 3.3, size * .44);
  ctx.fillRect(-size * 1.65, -size * .22, size * 3.3, size * .44);
  ctx.strokeRect(-size * 1.5, -size * .62, size * .56, size * 1.24);
  ctx.strokeRect(size * .94, -size * .62, size * .56, size * 1.24);
  ctx.fillStyle = '#a2f1ff';
  ctx.beginPath();
  ctx.arc(0, 0, size * .48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c5f6ff';
  ctx.beginPath();
  ctx.arc(0, 0, size * .73, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStars() {
  for (const star of game.stars) {
    const alpha = .3 + .65 * (.5 + .5 * Math.sin(game.now * (1 + star.z) + star.twinkle));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = star.z > .75 ? '#d8f7ff' : '#91a9e0';
    ctx.fillRect(star.x, star.y, star.size * star.z, star.size * star.z);
    if (star.z > .9 && game.mode === 'playing') {
      ctx.globalAlpha = .12;
      ctx.fillRect(star.x, star.y - star.z * 13, 1, star.z * 13);
    }
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const p = game.player;
  const boosting = (keys.has('ShiftLeft') || keys.has('ShiftRight') || touch.boost) && p.boost > 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.invulnerable > 0 && Math.floor(game.now * 24) % 2 === 0) ctx.globalAlpha = .55;
  const shipColor = p.paint;
  const flameLength = boosting ? 34 + Math.random() * 18 : 19 + Math.random() * 8;
  const flame = ctx.createLinearGradient(0, 10, 0, flameLength + 14);
  flame.addColorStop(0, '#eaffff');
  flame.addColorStop(.3, boosting ? '#55baff' : '#56e6ff');
  flame.addColorStop(1, '#3283ff00');
  ctx.fillStyle = flame;
  ctx.beginPath();
  const exhaustWidth = p.ship.id === 'titan' ? 16 : p.ship.id === 'heavy' ? 12 : 8;
  ctx.moveTo(-exhaustWidth, 10); ctx.lineTo(0, flameLength + 15); ctx.lineTo(exhaustWidth, 10); ctx.closePath(); ctx.fill();
  ctx.shadowColor = shipColor;
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#d9fbff';
  ctx.strokeStyle = shipColor;
  ctx.lineWidth = 2.5;
  drawPlayerHull(p.ship.id);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#3977bd';
  ctx.beginPath();
  ctx.ellipse(0, -3, p.ship.id === 'titan' ? 6 : 4, p.ship.id === 'heavy' ? 11 : 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shipColor;
  ctx.fillRect(p.ship.id === 'titan' ? -21 : -15, 10, 5, 4);
  ctx.fillRect(p.ship.id === 'titan' ? 16 : 10, 10, 5, 4);
  ctx.restore();
  if (p.shield > 1) {
    ctx.save();
    ctx.globalAlpha = .12 + (p.shield / p.maxShield) * .12;
    ctx.strokeStyle = '#71dcff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#58cfff';
    ctx.shadowBlur = 13;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 28, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlayerHull(shipId) {
  ctx.beginPath();
  if (shipId === 'heavy' || shipId === 'titan') {
    const width = shipId === 'titan' ? 30 : 25;
    const height = shipId === 'titan' ? 26 : 21;
    ctx.moveTo(0, -height);
    ctx.lineTo(width * .45, -height * .62);
    ctx.lineTo(width, -height * .12);
    ctx.lineTo(width * .85, height * .34);
    ctx.lineTo(width * .42, height * .2);
    ctx.lineTo(width * .38, height * .68);
    ctx.lineTo(0, height * .48);
    ctx.lineTo(-width * .38, height * .68);
    ctx.lineTo(-width * .42, height * .2);
    ctx.lineTo(-width * .85, height * .34);
    ctx.lineTo(-width, -height * .12);
    ctx.lineTo(-width * .45, -height * .62);
  } else if (shipId === 'alien') {
    ctx.moveTo(0, -25);
    ctx.lineTo(10, -5);
    ctx.lineTo(26, 8);
    ctx.lineTo(16, 13);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 20);
    ctx.lineTo(-6, 7);
    ctx.lineTo(-16, 13);
    ctx.lineTo(-26, 8);
    ctx.lineTo(-10, -5);
  } else if (shipId === 'raptor') {
    ctx.moveTo(0, -26);
    ctx.lineTo(8, -2);
    ctx.lineTo(30, 16);
    ctx.lineTo(23, 18);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 16);
    ctx.lineTo(-6, 10);
    ctx.lineTo(-23, 18);
    ctx.lineTo(-30, 16);
    ctx.lineTo(-8, -2);
  } else {
    ctx.moveTo(0, -25);
    ctx.lineTo(11, 1);
    ctx.lineTo(24, 15);
    ctx.lineTo(8, 10);
    ctx.lineTo(0, 19);
    ctx.lineTo(-8, 10);
    ctx.lineTo(-24, 15);
    ctx.lineTo(-11, 1);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (shipId === 'titan' || shipId === 'heavy') {
    ctx.beginPath();
    ctx.moveTo(-12, 2); ctx.lineTo(0, 9); ctx.lineTo(12, 2);
    ctx.stroke();
  }
}

function drawPlayerShot(shot) {
  ctx.save();
  ctx.strokeStyle = shot.color;
  ctx.shadowColor = shot.color;
  ctx.shadowBlur = 12;
  ctx.lineWidth = shot.radius;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shot.x, shot.y + 12);
  ctx.lineTo(shot.x, shot.y - 7);
  ctx.stroke();
  ctx.restore();
}

function drawEnemyShot(shot) {
  ctx.save();
  ctx.fillStyle = shot.color;
  ctx.shadowColor = shot.color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemy(enemy) {
  const color = enemy.kind === 'scout' ? '#ff668e' : '#ffac68';
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(Math.PI);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#33182d';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -enemy.radius);
  ctx.lineTo(enemy.radius * 1.25, enemy.radius * .8);
  ctx.lineTo(enemy.radius * .4, enemy.radius * .45);
  ctx.lineTo(0, enemy.radius);
  ctx.lineTo(-enemy.radius * .4, enemy.radius * .45);
  ctx.lineTo(-enemy.radius * 1.25, enemy.radius * .8);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(-3, -2, 6, 9);
  ctx.restore();
}

function drawBoss(boss) {
  const r = boss.radius;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.shadowColor = '#ff386f';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#281429';
  ctx.strokeStyle = '#ff658e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * .38, -r * .35);
  ctx.lineTo(r * 1.55, -r * .17);
  ctx.lineTo(r * 1.18, r * .24);
  ctx.lineTo(r * .66, r * .2);
  ctx.lineTo(r * .45, r * .7);
  ctx.lineTo(0, r * .45);
  ctx.lineTo(-r * .45, r * .7);
  ctx.lineTo(-r * .66, r * .2);
  ctx.lineTo(-r * 1.18, r * .24);
  ctx.lineTo(-r * 1.55, -r * .17);
  ctx.lineTo(-r * .38, -r * .35);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ff315f';
  ctx.beginPath(); ctx.ellipse(0, -r * .05, r * .3, r * .36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffb5c9';
  ctx.fillRect(-r * 1.12, r * .03, r * .25, 5);
  ctx.fillRect(r * .87, r * .03, r * .25, 5);
  ctx.restore();
}

function drawAsteroid(asteroid) {
  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.angle);
  ctx.fillStyle = '#514239';
  ctx.strokeStyle = '#c59e81';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const angle = i / 9 * Math.PI * 2;
    const radius = asteroid.radius * (.75 + .25 * Math.sin(i * 9.1));
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#271e1c88';
  ctx.beginPath(); ctx.arc(-asteroid.radius * .2, -asteroid.radius * .1, asteroid.radius * .23, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawMissile(missile) {
  ctx.save();
  for (let i = 0; i < missile.trail.length; i++) {
    ctx.globalAlpha = i / missile.trail.length * .5;
    ctx.fillStyle = '#ffbc70';
    ctx.beginPath();
    ctx.arc(missile.trail[i].x, missile.trail[i].y, 2 + i * .3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff0bf';
  ctx.shadowColor = '#ff9a45';
  ctx.shadowBlur = 13;
  ctx.beginPath(); ctx.arc(missile.x, missile.y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const particle of game.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawScanlines() {
  ctx.save();
  ctx.globalAlpha = .035;
  ctx.fillStyle = '#9bbfff';
  for (let y = (game.now * 30) % 5; y < game.height; y += 5) ctx.fillRect(0, y, game.width, 1);
  ctx.restore();
}

function frame(time) {
  const dt = Math.min(.033, Math.max(0, (time - lastFrame) / 1000));
  lastFrame = time;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function setJoystick(event) {
  const bounds = document.querySelector('#joystick').getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const max = bounds.width * .35;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const length = Math.hypot(dx, dy);
  const ratio = length > max ? max / length : 1;
  joystick.x = dx * ratio / max;
  joystick.y = dy * ratio / max;
  document.querySelector('#joystick-knob').style.transform = `translate(calc(-50% + ${dx * ratio}px), calc(-50% + ${dy * ratio}px))`;
}

function resetJoystick() {
  joystick.x = 0;
  joystick.y = 0;
  joystick.pointer = null;
  document.querySelector('#joystick-knob').style.transform = 'translate(-50%, -50%)';
}

ui.start.addEventListener('click', () => startMission(profile.bestStage));
document.querySelector('#pause-button').addEventListener('click', pauseGame);
document.querySelector('#resume-button').addEventListener('click', resumeGame);
document.querySelector('#pause-restart-button').addEventListener('click', () => startMission(game.stage));
document.querySelector('#pause-menu-button').addEventListener('click', showMenu);
document.querySelector('#end-restart-button').addEventListener('click', () => startMission(game.stage));
document.querySelector('#end-menu-button').addEventListener('click', showMenu);
ui.menuSound.addEventListener('click', toggleSound);
ui.hudSound.addEventListener('click', toggleSound);
ui.continue.addEventListener('click', () => startMission(game.stage >= missions.length ? 1 : game.stage + 1, game.stage < missions.length));
ui.upgrade.addEventListener('click', () => {
  const cost = 25 * (profile.weaponLevel + 1);
  if (profile.weaponLevel < 3 && profile.credits >= cost) {
    profile.credits -= cost;
    profile.weaponLevel += 1;
    saveProfile();
    renderHangar();
    showToast(`CANHÕES APRIMORADOS · NÍVEL ${profile.weaponLevel}`);
    initAudio();
    sound(520, .2, 'triangle', .05, 850);
  }
});
ui.hullUpgrade.addEventListener('click', () => {
  const cost = 40 + profile.hullLevel * 35;
  if (profile.hullLevel < 3 && profile.credits >= cost) {
    profile.credits -= cost;
    profile.hullLevel += 1;
    saveProfile();
    renderHangar();
    showToast(`NAVE REFORÇADA · NÍVEL ${profile.hullLevel}`);
    initAudio();
    sound(360, .28, 'triangle', .06, 720);
  }
});

document.querySelector('#joystick').addEventListener('pointerdown', event => {
  event.preventDefault();
  joystick.pointer = event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
  setJoystick(event);
});
document.querySelector('#joystick').addEventListener('pointermove', event => {
  if (event.pointerId === joystick.pointer) setJoystick(event);
});
document.querySelector('#joystick').addEventListener('pointerup', event => {
  if (event.pointerId === joystick.pointer) resetJoystick();
});
document.querySelector('#joystick').addEventListener('pointercancel', resetJoystick);
document.querySelector('#touch-fire').addEventListener('pointerdown', event => { event.preventDefault(); touch.fire = true; });
document.querySelector('#touch-fire').addEventListener('pointerup', () => { touch.fire = false; });
document.querySelector('#touch-fire').addEventListener('pointercancel', () => { touch.fire = false; });
document.querySelector('#touch-fire').addEventListener('pointerleave', () => { touch.fire = false; });
document.querySelector('#touch-special').addEventListener('pointerdown', event => { event.preventDefault(); useSpecial(); });
document.querySelector('#touch-boost').addEventListener('pointerdown', event => { event.preventDefault(); touch.boost = true; });
document.querySelector('#touch-boost').addEventListener('pointerup', () => { touch.boost = false; });
document.querySelector('#touch-boost').addEventListener('pointercancel', () => { touch.boost = false; });
document.querySelector('#touch-boost').addEventListener('pointerleave', () => { touch.boost = false; });

window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === 'KeyE' && !event.repeat) useSpecial();
  if (event.code === 'Escape' || event.code === 'KeyP') {
    if (game.mode === 'playing') pauseGame();
    else if (game.mode === 'paused') resumeGame();
  }
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', () => {
  keys.clear();
  touch.fire = false;
  touch.boost = false;
  resetJoystick();
  if (game.mode === 'playing') pauseGame();
});
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.mode === 'playing') pauseGame();
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.error('Não foi possível ativar o modo offline.', error);
  });
}

resize();
renderHangar();
requestAnimationFrame(frame);
