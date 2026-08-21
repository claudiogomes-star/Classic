// Motor Principal do Jogo: Loop, Câmera, Colisões, Spawner e Interface

class InputManager {
  constructor() {
    this.keys = {};
    this.pressed = {};

    window.addEventListener('keydown', (e) => {
      // Prevenir scroll padrão com setas e espaço
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.pressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch Controls Setup
    this.initTouchControls();
  }

  isDown(action) {
    // Teclado
    switch (action) {
      case 'left': return this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['TouchLeft'];
      case 'right': return this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['TouchRight'];
      case 'up': return this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['TouchUp'];
      case 'down': return this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['TouchDown'];
      case 'jump': return this.keys['Space'] || this.keys['KeyJ'] || this.keys['TouchJump'];
      case 'shoot': return this.keys['KeyK'] || this.keys['KeyZ'] || this.keys['TouchShoot'];
      case 'bomb': return this.keys['KeyL'] || this.keys['KeyX'] || this.keys['TouchBomb'];
      case 'enter': return this.keys['KeyE'] || this.keys['KeyC'] || this.keys['TouchEnter'];
      default: return false;
    }
  }

  isPressed(action) {
    let result = false;
    switch (action) {
      case 'jump': result = this.pressed['Space'] || this.pressed['KeyJ'] || this.pressed['TouchJump']; break;
      case 'shoot': result = this.pressed['KeyK'] || this.pressed['KeyZ'] || this.pressed['TouchShoot']; break;
      case 'bomb': result = this.pressed['KeyL'] || this.pressed['KeyX'] || this.pressed['TouchBomb']; break;
      case 'enter': result = this.pressed['KeyE'] || this.pressed['KeyC'] || this.pressed['TouchEnter']; break;
    }
    return !!result;
  }

  clearPressed() {
    this.pressed = {};
  }

  initTouchControls() {
    const bindTouch = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys[key] = true;
        this.pressed[key] = true;
        el.classList.add('active');
      });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys[key] = false;
        el.classList.remove('active');
      });
    };

    bindTouch('btn-touch-left', 'TouchLeft');
    bindTouch('btn-touch-right', 'TouchRight');
    bindTouch('btn-touch-up', 'TouchUp');
    bindTouch('btn-touch-down', 'TouchDown');
    bindTouch('btn-touch-jump', 'TouchJump');
    bindTouch('btn-touch-shoot', 'TouchShoot');
    bindTouch('btn-touch-bomb', 'TouchBomb');
    bindTouch('btn-touch-enter', 'TouchEnter');
  }

  updateGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    // D-pad / Analógico
    const axX = gp.axes[0];
    const axY = gp.axes[1];
    this.keys['KeyA'] = axX < -0.3 || gp.buttons[14]?.pressed;
    this.keys['KeyD'] = axX > 0.3 || gp.buttons[15]?.pressed;
    this.keys['KeyW'] = axY < -0.3 || gp.buttons[12]?.pressed;
    this.keys['KeyS'] = axY > 0.3 || gp.buttons[13]?.pressed;

    // Botões de Ação
    if (gp.buttons[0]?.pressed && !this.keys['Space']) this.pressed['Space'] = true; // A / X (Pulo)
    this.keys['Space'] = gp.buttons[0]?.pressed;

    if (gp.buttons[2]?.pressed && !this.keys['KeyK']) this.pressed['KeyK'] = true; // X / Quadrado (Tiro)
    this.keys['KeyK'] = gp.buttons[2]?.pressed;

    if (gp.buttons[1]?.pressed && !this.keys['KeyL']) this.pressed['KeyL'] = true; // B / Círculo (Granada)
    this.keys['KeyL'] = gp.buttons[1]?.pressed;

    if (gp.buttons[3]?.pressed && !this.keys['KeyE']) this.pressed['KeyE'] = true; // Y / Triângulo (Slug)
    this.keys['KeyE'] = gp.buttons[3]?.pressed;
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.input = new InputManager();

    // Dimensões Virtuais do Jogo (Resolução Arcade 16:9)
    this.canvas.width = 960;
    this.canvas.height = 540;

    this.camera = { x: 0, y: 0 };
    this.shakePower = 0;
    this.shakeDuration = 0;

    this.time = 0;
    this.lastTime = 0;
    this.state = 'START'; // 'START', 'PLAYING', 'GAMEOVER', 'VICTORY'

    // Modo de Jogo
    this.gameMode = '1P'; // '1P' ou '2P'

    // Entidades
    this.map = null;
    this.players = []; // Array de jogadores para suportar multiplayer
    this.enemies = [];
    this.boss = null;
    this.slugs = [];
    this.pows = [];
    this.projectiles = [];
    this.explosions = [];
    this.particles = [];
    this.pickups = [];
    this.floatingTexts = [];

    // Seleções de Personagens
    this.p1Character = 'claudio';
    this.p2Character = 'marco';

    // Cache de elementos do HUD - Player 1
    this.hudHpFill = document.getElementById('hud-hp-fill');
    this.hudScore = document.getElementById('hud-score');
    this.hudWeaponName = document.getElementById('hud-weapon-name');
    this.hudWeaponAmmo = document.getElementById('hud-weapon-ammo');
    this.hudWeaponIcon = document.getElementById('hud-weapon-icon');
    this.hudGrenades = document.getElementById('hud-grenades');
    this.hudLivesContainer = document.getElementById('hud-lives-icons');
    this.hudCharImg = document.getElementById('hud-char-img');
    this.hudCharName = document.getElementById('hud-char-name');
    
    // Cache de elementos do HUD - Player 2
    this.hudP2Group = document.getElementById('hud-p2-group');
    this.hudP2HpFill = document.getElementById('hud-p2-hp-fill');
    this.hudP2WeaponName = document.getElementById('hud-p2-weapon-name');
    this.hudP2WeaponAmmo = document.getElementById('hud-p2-weapon-ammo');
    this.hudP2WeaponIcon = document.getElementById('hud-p2-weapon-icon');
    this.hudP2Grenades = document.getElementById('hud-p2-grenades');
    this.hudP2LivesContainer = document.getElementById('hud-p2-lives-icons');
    this.hudP2CharImg = document.getElementById('hud-p2-char-img');
    this.hudP2CharName = document.getElementById('hud-p2-char-name');
    
    // Boss e Slug HUD
    this.bossHud = document.getElementById('boss-hud');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.slugHud = document.getElementById('slug-hud');
    this.slugCannonCount = document.getElementById('slug-cannon-count');

    this.init();
  }

  init() {
    // Configuração do Seletor de Modo (1P / 2P)
    this.setupModeSelection();
    
    // Configuração da Seleção de Personagens
    this.setupCharacterSelection();

    // Botão Iniciar
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startGame();
      });
    }

    // Botão Reiniciar
    const restartBtn = document.getElementById('btn-restart-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.startGame();
      });
    }

    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.startGame();
      });
    }

    // Botão Mute
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        audio.init();
        const muted = audio.toggleMute();
        audioBtn.textContent = muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
      });
    }

    // Iniciar loop de animação
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupModeSelection() {
    const mode1PBtn = document.getElementById('btn-mode-1p');
    const mode2PBtn = document.getElementById('btn-mode-2p');
    const p2SelectSection = document.getElementById('p2-select-section');

    if (mode1PBtn) {
      mode1PBtn.addEventListener('click', () => {
        this.gameMode = '1P';
        mode1PBtn.classList.add('active');
        mode2PBtn.classList.remove('active');
        if (p2SelectSection) p2SelectSection.style.display = 'none';
      });
    }

    if (mode2PBtn) {
      mode2PBtn.addEventListener('click', () => {
        this.gameMode = '2P';
        mode2PBtn.classList.add('active');
        mode1PBtn.classList.remove('active');
        if (p2SelectSection) p2SelectSection.style.display = 'block';
        audio.init();
        audio.announce('CO-OP MODE');
      });
    }
  }

  setupCharacterSelection() {
    // Seleção P1
    const cardsP1 = document.querySelectorAll('.char-card[data-player="1"]');
    cardsP1.forEach(card => {
      card.addEventListener('click', () => {
        const charId = card.dataset.char;
        if (!charId) return;

        this.p1Character = charId;
        cardsP1.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        audio.init();
        audio.resume();
        audio.announce(charId.toUpperCase() + " SELECTED");
      });
    });

    // Seleção P2
    const cardsP2 = document.querySelectorAll('.char-card[data-player="2"]');
    cardsP2.forEach(card => {
      card.addEventListener('click', () => {
        const charId = card.dataset.char;
        if (!charId) return;

        this.p2Character = charId;
        cardsP2.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        audio.init();
        audio.resume();
        audio.announce(charId.toUpperCase() + " PLAYER 2");
      });
    });
  }

  startGame() {
        audio.resume();

        let charNameDisplay = 'CLÁUDIO';
        if (charId === 'claudio') {
          charNameDisplay = 'CLÁUDIO';
          audio.announce("CLÁUDIO SELECTED");
        } else if (charId === 'marco') {
          charNameDisplay = 'MARCO';
          audio.announce("MARCO SELECTED");
        } else if (charId === 'tarma') {
          charNameDisplay = 'TARMA';
          audio.announce("TARMA SELECTED");
        } else if (charId === 'fio') {
          charNameDisplay = 'FIO';
          audio.announce("FIO SELECTED");
        }

        // Atualizar preview no HUD
        this.updateHUDCharacter(charId, charNameDisplay);
      });
    });
  }

  updateHUDCharacter(charId, name) {
    if (this.hudCharName) this.hudCharName.textContent = name;
    if (this.hudCharImg) {
      if (charId === 'claudio') {
        this.hudCharImg.src = 'assets/claudio.png';
        this.hudCharImg.style.display = 'block';
      } else {
        // Gera avatar ou exibe foto representativa
        this.hudCharImg.src = 'assets/claudio.png'; // Fallback
      }
    }
  }

  startGame() {
    audio.init();
    audio.resume();
    audio.startBGM();

    const charAnnounce = this.selectedCharacter === 'claudio' ? 'CLÁUDIO' : this.selectedCharacter.toUpperCase();
    audio.announce(`${charAnnounce}! MISSION 1 START`);

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';

    this.map = new LevelMap(this.canvas.width, this.canvas.height);
    this.player = new Player(60, this.canvas.height - 180, this.selectedCharacter);
    this.enemies = [];
    this.boss = null;
    this.slugs = [];
    this.pows = [];
    this.projectiles = [];
    this.explosions = [];
    this.particles = [];
    this.pickups = [];
    this.floatingTexts = [];

    // Spawna os Reféns POW
    this.map.powSpawns.forEach(p => {
      this.pows.push(new POW(p.x, p.y, p.reward));
    });

    // Spawna o Tanque Slug
    this.map.slugSpawns.forEach(s => {
      this.slugs.push(new SlugVehicle(s.x, s.y));
    });

    // Atualizar HUD com o personagem inicial
    this.updateHUDCharacter(this.selectedCharacter, charAnnounce);

    // Texto de Entrada Triunfal do Personagem
    const introBadge = this.selectedCharacter === 'claudio' ? '★ CLÁUDIO STRIKE LEADER ★' : `${charAnnounce} READY!`;
    this.addFloatingText(this.player.x + 30, this.player.y - 35, introBadge, '#ffcc00', 13);

    this.state = 'PLAYING';
    this.lastTime = performance.now();
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.time += dt;

    this.input.updateGamepad();

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    this.input.clearPressed();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    renderer.update(dt);

    // 1. Atualizar Jogador ou Tanque Ativo
    if (this.player) {
      this.player.update(dt, this.input, this);
    }

    // 2. Atualizar Tanques Slug
    this.slugs.forEach(slug => {
      slug.update(dt, this.input, this);
    });

    // 3. Atualizar e Spawnar Inimigos por Proximidade do Jogador
    this.map.enemySpawners.forEach(spawner => {
      if (!spawner.spawned && this.player.x > spawner.triggerX) {
        spawner.spawned = true;
        this.enemies.push(new Enemy(spawner.x, spawner.y, spawner.type));
      }
    });

    // Atualizar Inimigos
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.enemies.forEach(e => {
      e.update(dt, this.player, this);
    });

    // 4. Checar Spawn do Chefão (Goliath Boss)
    if (!this.boss && this.map.bossSpawn && this.player.x > this.map.bossSpawn.triggerX) {
      this.boss = new Boss(this.map.bossSpawn.x, this.map.bossSpawn.y);
      audio.playBossWarning();
      this.bossHud.style.display = 'flex';
      this.addFloatingText(this.boss.x, this.boss.y - 30, 'WARNING! GOLIATH MECHATANK!', '#ff0033', 14);
    }

    if (this.boss) {
      this.boss.update(dt, this.player, this);
    }

    // 5. Atualizar Reféns POW
    this.pows.forEach(pow => {
      pow.update(dt, this.player, this);
    });

    // 6. Atualizar Projéteis e Checar Colisões
    this.updateProjectiles(dt);

    // 7. Atualizar Explosões
    this.explosions.forEach(exp => {
      exp.life -= dt;
    });
    this.explosions = this.explosions.filter(exp => exp.life > 0);

    // 8. Atualizar Partículas (Fumaça, Cartuchos, Faíscas)
    this.updateParticles(dt);

    // 9. Atualizar Textos Flutuantes
    this.floatingTexts.forEach(t => {
      t.y -= 24 * dt;
      t.alpha -= 1.1 * dt;
    });
    this.floatingTexts = this.floatingTexts.filter(t => t.alpha > 0);

    // 10. Coleta de Itens Pickups
    this.checkPickupCollisions();

    // 11. Atualizar Câmera e Screen Shake
    this.updateCamera(dt);

    // 12. Atualizar HUD
    this.updateHUD();
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const alive = p.update(dt, this);
      if (!alive) {
        if (p.type === 'grenade' || p.type === 'slug_cannon') {
          this.spawnExplosion(p.x, p.y, p.type === 'slug_cannon' ? 65 : 45);
          audio.playExplosion(true);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Colisão de Projéteis do Jogador contra Inimigos, Chefão e Barris
      if (p.isPlayer) {
        let hit = false;

        // Contra Inimigos Comuns
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (p.x > e.x && p.x < e.x + e.width && p.y > e.y && p.y < e.y + e.height) {
            e.takeDamage(p.damage, Math.atan2(p.vy, p.vx), this);
            hit = true;
            break;
          }
        }

        // Contra o Chefão
        if (!hit && this.boss && !this.boss.isDead) {
          if (p.x > this.boss.x && p.x < this.boss.x + this.boss.width && p.y > this.boss.y && p.y < this.boss.y + this.boss.height) {
            this.boss.takeDamage(p.damage, this);
            hit = true;
          }
        }

        // Contra Barris e Caixas Destrutíveis
        if (!hit) {
          for (let k = 0; k < this.map.destructibles.length; k++) {
            const obj = this.map.destructibles[k];
            if (!obj.destroyed && p.x > obj.x && p.x < obj.x + obj.width && p.y > obj.y && p.y < obj.y + obj.height) {
              obj.hp -= p.damage;
              hit = true;
              if (obj.hp <= 0) {
                obj.destroyed = true;
                if (obj.type === 'barrel') {
                  this.spawnExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, 60);
                  audio.playExplosion(true);
                  // Dano em área nos inimigos próximos
                  this.enemies.forEach(e => {
                    if (Math.hypot((e.x + e.width / 2) - (obj.x + obj.width / 2), (e.y + e.height / 2) - (obj.y + obj.height / 2)) < 110) {
                      e.takeDamage(120, 0, this);
                    }
                  });
                } else {
                  this.spawnExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, 25);
                  audio.playExplosion(false);
                  // Drop de item na caixa
                  this.pickups.push(new Pickup(obj.x, obj.y, 'BOMB'));
                }
              }
              break;
            }
          }
        }

        if (hit && p.type !== 'laser' && p.type !== 'flame') {
          if (p.type === 'rocket' || p.type === 'grenade' || p.type === 'slug_cannon') {
            this.spawnExplosion(p.x, p.y, p.type === 'slug_cannon' ? 65 : 45);
            audio.playExplosion(true);
          } else {
            this.spawnSpark(p.x, p.y);
          }
          this.projectiles.splice(i, 1);
        }

      } else {
        // Projétil Inimigo contra o Jogador ou Tanque Slug
        const target = (this.player.inSlug && this.player.slugRef) ? this.player.slugRef : this.player;
        if (p.x > target.x && p.x < target.x + target.width && p.y > target.y && p.y < target.y + target.height) {
          target.takeDamage(p.damage, this);
          if (p.type === 'rocket' || p.type === 'grenade') {
            this.spawnExplosion(p.x, p.y, 40);
            audio.playExplosion(true);
          }
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  checkPickupCollisions() {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const item = this.pickups[i];
      const dist = Math.hypot((this.player.x + this.player.width / 2) - (item.x + 14), (this.player.y + this.player.height / 2) - (item.y + 14));

      if (dist < 34) {
        audio.playItemPickup();

        if (item.type === 'FOOD') {
          this.player.score += 500;
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
          this.addFloatingText(item.x, item.y - 15, '+500 FOOD!', '#00ff66');
        } else if (item.type === 'BOMB') {
          this.player.grenades += 10;
          this.addFloatingText(item.x, item.y - 15, '+10 BOMBS!', '#ff3300');
        } else {
          this.player.equipWeapon(item.type, item.ammo, this);
        }

        this.pickups.splice(i, 1);
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'casing') {
        p.vy += 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += 0.3;
        // Quique no chão
        if (p.y > this.canvas.height - 80) {
          p.y = this.canvas.height - 80;
          p.vy = -p.vy * 0.4;
          p.vx *= 0.7;
        }
      } else if (p.type === 'smoke') {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 8 * dt;
        p.alpha = p.life / p.maxLife;
      } else if (p.type === 'spark' || p.type === 'blood') {
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
      }
    }
  }

  updateCamera(dt) {
    const targetFocus = (this.player.inSlug && this.player.slugRef) ? this.player.slugRef : this.player;
    let targetX = targetFocus.x - this.canvas.width * 0.35;

    // Se o Chefão estiver ativado, travar a câmera na arena
    if (this.boss) {
      const arenaMinX = this.map.bossSpawn.triggerX;
      targetX = Math.max(arenaMinX, Math.min(this.map.width - this.canvas.width, targetX));
    } else {
      targetX = Math.max(0, Math.min(this.map.width - this.canvas.width, targetX));
    }

    // Interpolação suave
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y = 0;

    // Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      this.camera.x += (Math.random() - 0.5) * this.shakePower * 2;
      this.camera.y += (Math.random() - 0.5) * this.shakePower * 2;
    }
  }

  triggerScreenShake(power, duration) {
    this.shakePower = power;
    this.shakeDuration = duration;
  }

  // --- RESOLUÇÃO DE COLISÕES DE PLATAFORMAS ---
  resolveHorizontalCollision(ent) {
    this.map.platforms.forEach(p => {
      if (ent.x + ent.width > p.x && ent.x < p.x + p.width && ent.y + ent.height > p.y && ent.y < p.y + p.height) {
        if (p.isGround) {
          if (ent.vx > 0) ent.x = p.x - ent.width;
          else if (ent.vx < 0) ent.x = p.x + p.width;
          ent.vx = 0;
        }
      }
    });
  }

  resolveVerticalCollision(ent) {
    this.map.platforms.forEach(p => {
      if (ent.x + ent.width * 0.7 > p.x && ent.x + ent.width * 0.3 < p.x + p.width) {
        // Aterrissagem no topo da plataforma
        if (ent.y + ent.height >= p.y && ent.y + ent.height <= p.y + 18 && ent.vy >= 0) {
          ent.y = p.y - ent.height;
          ent.vy = 0;
          ent.onGround = true;
        }
      }
    });
  }

  // --- SPAWNERS DE EFEITOS E PARTÍCULAS ---
  spawnExplosion(x, y, radius = 40) {
    const blobs = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      blobs.push({
        x: (Math.random() - 0.5) * radius * 0.8,
        y: (Math.random() - 0.5) * radius * 0.8,
        r: radius * (0.4 + Math.random() * 0.4)
      });
    }
    this.explosions.push({
      x, y, radius,
      life: 0.45,
      maxLife: 0.45,
      blobs
    });
  }

  spawnCasing(x, y, dir) {
    this.particles.push({
      type: 'casing',
      x, y,
      vx: dir * (2 + Math.random() * 2),
      vy: -3 - Math.random() * 2,
      rotation: Math.random() * Math.PI,
      life: 1.2,
      maxLife: 1.2
    });
  }

  spawnSpark(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'spark',
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  spawnSmoke(x, y, radius = 6) {
    this.particles.push({
      type: 'smoke',
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1 - Math.random() * 1.5,
      radius,
      alpha: 1,
      life: 0.5,
      maxLife: 0.5
    });
  }

  spawnBlood(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        type: 'blood',
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 - Math.random() * 3,
        radius: 2 + Math.random() * 2,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  spawnDust(x, y) {
    for (let i = 0; i < 3; i++) {
      this.spawnSmoke(x + (Math.random() - 0.5) * 12, y - 2, 4);
    }
  }

  addFloatingText(x, y, text, color = '#ffee00', size = 11) {
    this.floatingTexts.push({ x, y, text, color, size, alpha: 1.0 });
  }

  getClosestEnemy(x, y) {
    let closest = null;
    let minDist = 600;
    this.enemies.forEach(e => {
      const d = Math.hypot((e.x + e.width / 2) - x, (e.y + e.height / 2) - y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    });
    if (!closest && this.boss && !this.boss.isDead) {
      closest = this.boss;
    }
    return closest;
  }

  // --- ATUALIZAÇÃO DO HUD EM TEMPO REAL ---
  updateHUD() {
    if (!this.player) return;

    // Barra de Vida do Jogador
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    this.hudHpFill.style.width = `${hpPct}%`;

    // Pontuação
    this.hudScore.textContent = String(this.player.score).padStart(6, '0');

    // Arma Atual
    this.hudWeaponName.textContent = this.player.weapon;
    this.hudWeaponAmmo.textContent = this.player.ammo === Infinity ? '∞' : this.player.ammo;
    this.hudWeaponIcon.textContent = this.player.weapon[0];

    // Granadas
    this.hudGrenades.textContent = `x${this.player.grenades}`;

    // Vidas
    this.hudLivesContainer.innerHTML = '';
    for (let i = 0; i < Math.max(0, this.player.lives); i++) {
      const lifeIcon = document.createElement('span');
      lifeIcon.className = 'life-icon';
      this.hudLivesContainer.appendChild(lifeIcon);
    }

    // Tanque Slug HUD
    if (this.player.inSlug && this.player.slugRef) {
      this.slugHud.style.display = 'flex';
      this.slugCannonCount.textContent = `HP: ${this.player.slugRef.hp} | CANNON: x${this.player.slugRef.cannons}`;
    } else {
      this.slugHud.style.display = 'none';
    }

    // Barra de Vida do Chefão
    if (this.boss && !this.boss.isDead) {
      const bossHpPct = Math.max(0, Math.min(100, (this.boss.hp / this.boss.maxHp) * 100));
      this.bossHpFill.style.width = `${bossHpPct}%`;
    } else {
      this.bossHud.style.display = 'none';
    }
  }

  // --- FINALIZAÇÃO DE MISSÃO & GAME OVER ---
  gameOver() {
    this.state = 'GAMEOVER';
    audio.announce("GAME OVER");
    document.getElementById('final-score-gameover').textContent = this.player.score;
    document.getElementById('gameover-screen').style.display = 'flex';
  }

  missionComplete() {
    this.state = 'VICTORY';
    audio.playMissionComplete();
    audio.announce("MISSION ALL OVER");
    document.getElementById('final-score-victory').textContent = this.player.score;
    document.getElementById('victory-screen').style.display = 'flex';
  }

  // --- RENDERIZAÇÃO DO FRAME ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'START') {
      // Desenhar fundo arcade animado
      renderer.drawParallaxBackground(this.ctx, { x: this.time * 20, y: 0 }, this.canvas.width, this.canvas.height, 4000);
      return;
    }

    // 1. Cenário Parallax
    renderer.drawParallaxBackground(this.ctx, this.camera, this.canvas.width, this.canvas.height, this.map.width);

    // 2. Plataformas e Obstáculos
    renderer.drawMapElements(this.ctx, this.camera, this.map);

    // 3. Tanques Slug
    this.slugs.forEach(s => {
      if (!s.destroyed) renderer.drawSlug(this.ctx, this.camera, s, (this.player && this.player.characterId) || this.selectedCharacter);
    });

    // 4. Reféns POW
    this.pows.forEach(pow => {
      renderer.drawPOW(this.ctx, this.camera, pow);
    });

    // 5. Inimigos Comuns
    this.enemies.forEach(e => {
      renderer.drawEnemy(this.ctx, this.camera, e);
    });

    // 6. Chefão Goliath
    if (this.boss) {
      renderer.drawBoss(this.ctx, this.camera, this.boss);
    }

    // 7. Jogador (se não estiver dentro do tanque)
    if (this.player && !this.player.inSlug && !this.player.isDead) {
      renderer.drawPlayer(this.ctx, this.camera, this.player);
    }

    // 8. Itens Coletáveis Pickups
    renderer.drawPickups(this.ctx, this.camera, this.pickups);

    // 9. Projéteis e Granadas
    renderer.drawProjectiles(this.ctx, this.camera, this.projectiles);

    // 10. Partículas
    renderer.drawParticles(this.ctx, this.camera, this.particles);

    // 11. Explosões
    renderer.drawExplosions(this.ctx, this.camera, this.explosions);

    // 12. Textos Flutuantes
    renderer.drawFloatingTexts(this.ctx, this.camera, this.floatingTexts);
  }
}

// Inicializar motor de jogo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new Game();
});
