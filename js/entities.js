// Entidades e Lógica de Jogo: Jogador, Inimigos, Chefão, Reféns, Veículo e Projéteis

// ==========================================
// 1. JOGADOR (CLAUDIO, MARCO, TARMA, FIO)
// ==========================================
class Player {
  constructor(x, y, characterId = 'claudio', playerIndex = 0) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 46;
    this.vx = 0;
    this.vy = 0;
    this.jumpForce = -10.5;
    this.gravity = 0.48;
    this.onGround = false;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.isCrouching = false;
    this.aimX = 1;
    this.aimY = 0;

    // Configuração do Jogador e Índice (1P ou 2P)
    this.characterId = characterId;
    this.playerIndex = playerIndex;
    this.hasWarPaint = (this.characterId === 'claudio');

    this.speed = 4.2;
    this.fireRateMultiplier = 1.0;
    this.damageResistance = 1.0;
    this.meleeDamage = 75;
    this.meleeRange = 40;
    this.pickupMultiplier = 1.0;
    this.slugBonus = false;

    // Status Base
    this.hp = 100;
    this.maxHp = 100;
    this.lives = 3;
    this.score = 0;
    this.grenades = 10;
    
    // Armamento Base
    this.weapon = 'PISTOL';
    this.ammo = Infinity;
    this.shootCooldown = 0;
    this.shootRecoil = false;
    this.shootFlashTimer = 0;
    this.meleeTimer = 0;

    // Aplicar Especialidades por Personagem
    if (this.characterId === 'claudio') {
      // Claudio: Strike Master & Wielder of the Nordic Axe
      this.speed = 4.8;
      this.grenades = 15;
      this.meleeDamage = 110;
      this.meleeRange = 50;
      this.hasWarPaint = true;
      this.weapon = 'AXE'; // Claudio inicia empunhando o Machado Nórdico Dourado e Preto!
      this.ammo = 100;
    } else if (this.characterId === 'marco') {
      // Marco: Burst Fire (Maior cadência de tiro)
      this.speed = 4.2;
      this.fireRateMultiplier = 1.25;
    } else if (this.characterId === 'tarma') {
      // Tarma: Slug Master (Tanque aprimorado e resistência física)
      this.speed = 4.2;
      this.damageResistance = 0.85;
      this.slugBonus = true;
    } else if (this.characterId === 'fio') {
      // Fio: Supply Drop (Começa com Heavy Machine Gun e bônus de itens)
      this.speed = 4.2;
      this.weapon = 'HMG';
      this.ammo = 300;
      this.pickupMultiplier = 1.5;
    }

    // Estados Especiais
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.inSlug = false;
    this.slugRef = null;
    this.isDead = false;
    this.respawnTimer = 0;
  }

  update(dt, input, game) {
    if (this.isDead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn(game);
      }
      return;
    }

    // --- VERIFICAÇÃO DE QUEDA FATAL EM BURACO / ABISMO ---
    if (this.y > game.canvas.height + 35 && !this.isDead) {
      audio.playPitFall();
      game.addFloatingText(this.x, game.canvas.height - 40, 'FALLEN INTO THE ABYSS!', '#ff2222', 13);
      this.die(game);
      return;
    }

    // Se estiver pilotando o tanque Slug, a movimentação é delegada ao veículo
    if (this.inSlug && this.slugRef) {
      this.x = this.slugRef.x + 20;
      this.y = this.slugRef.y - 10;
      return;
    }

    // Timers de Recuo e Muzzle Flash
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.shootFlashTimer > 0) this.shootFlashTimer -= dt;
    if (this.meleeTimer > 0) this.meleeTimer -= dt;

    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) this.isInvulnerable = false;
    }

    // --- ENTRADA DE MOVIMENTO (1P ou 2P) ---
    const prefix = (this.playerIndex === 1) ? 'p2_' : '';
    const moveLeft = input.isDown(prefix + 'left');
    const moveRight = input.isDown(prefix + 'right');
    const lookUp = input.isDown(prefix + 'up');
    const lookDown = input.isDown(prefix + 'down');
    const jumpPressed = input.isPressed(prefix + 'jump');
    const shootPressed = input.isDown(prefix + 'shoot');
    const bombPressed = input.isPressed(prefix + 'bomb');
    const enterPressed = input.isPressed(prefix + 'enter');

    // Agachamento
    this.isCrouching = lookDown && this.onGround;

    // Movimentação Horizontal
    if (!this.isCrouching) {
      if (moveLeft && !moveRight) {
        this.vx = -this.speed;
        this.facing = -1;
      } else if (moveRight && !moveLeft) {
        this.vx = this.speed;
        this.facing = 1;
      } else {
        this.vx = 0;
      }
    } else {
      this.vx = 0;
    }

    // Direção da Mira (8 Direções)
    this.aimX = (moveLeft && !moveRight) ? -1 : ((moveRight && !moveLeft) ? 1 : this.facing);
    this.aimY = lookUp ? -1 : (lookDown ? 1 : 0);

    // Pulo
    if (jumpPressed && this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
      audio.playJump();
      game.spawnDust(this.x + this.width / 2, this.y + this.height);
    }

    // Gravidade
    this.vy += this.gravity;
    if (this.vy > 14) this.vy = 14;

    // Aplicação de Movimento e Colisão
    this.x += this.vx;
    game.resolveHorizontalCollision(this);

    this.y += this.vy;
    this.onGround = false;
    game.resolveVerticalCollision(this);

    // Ação: Atirar ou Desferir Machado
    if (shootPressed) {
      this.tryShoot(game);
    }

    // Ação: Lançar Granada
    if (bombPressed && this.grenades > 0) {
      this.throwGrenade(game);
    }

    // Ação: Entrar no Cyber Slug
    if (enterPressed) {
      this.tryEnterSlug(game);
    }

    // Checar Ataque Corpo a Corpo se houver inimigo colado
    this.checkMeleeAttack(game);
  }

  tryShoot(game) {
    if (this.shootCooldown > 0) return;

    // Verificar se há inimigo corpo a corpo antes de disparar
    if (this.checkMeleeAttack(game)) return;

    // Definir cadência por arma
    let fireDelay = 0.18;
    switch (this.weapon) {
      case 'AXE': fireDelay = 0.22; break; // Machado Nórdico: balanço potente
      case 'HMG': fireDelay = 0.08; break;
      case 'SHOTGUN': fireDelay = 0.45; break;
      case 'ROCKET': fireDelay = 0.35; break;
      case 'FLAME': fireDelay = 0.06; break;
      case 'LASER': fireDelay = 0.05; break;
      default: fireDelay = 0.16; break;
    }
    
    // Aplicar multiplicador de cadência
    fireDelay /= this.fireRateMultiplier;

    this.shootCooldown = fireDelay;
    this.shootFlashTimer = 0.06;
    this.shootRecoil = true;
    setTimeout(() => { this.shootRecoil = false; }, 70);

    // Origem do Disparo
    let spawnX = this.x + (this.facing === 1 ? this.width + 4 : -4);
    let spawnY = this.y + (this.isCrouching ? 28 : 18);

    let dirX = this.facing;
    let dirY = 0;

    if (this.aimY < 0) {
      dirY = -1;
      dirX = (this.aimX !== 0) ? this.aimX * 0.7 : 0;
      spawnX = this.x + this.width / 2;
      spawnY = this.y - 6;
    } else if (this.aimY > 0 && !this.onGround) {
      dirY = 1;
      dirX = 0;
      spawnX = this.x + this.width / 2;
      spawnY = this.y + this.height + 4;
    }

    const norm = Math.hypot(dirX, dirY) || 1;
    const ndx = dirX / norm;
    const ndy = dirY / norm;

    // Disparar projéteis de acordo com a arma
    this.spawnWeaponProjectiles(game, spawnX, spawnY, ndx, ndy);

    // Ejetar cartucho de latão (se for arma de fogo)
    if (this.weapon !== 'AXE') {
      game.spawnCasing(this.x + this.width / 2, this.y + 16, -this.facing);
    }

    // Consumir Munição
    if (this.weapon !== 'PISTOL') {
      this.ammo--;
      if (this.ammo <= 0) {
        this.weapon = 'PISTOL';
        this.ammo = Infinity;
        game.addFloatingText(this.x, this.y - 10, 'PISTOL', '#ffffff');
      }
    }
  }

  spawnWeaponProjectiles(game, sx, sy, dx, dy) {
    const speed = 14;

    switch (this.weapon) {
      case 'AXE':
        // Machado Nórdico: Onda de Choque Dourada e Corte em Arco
        audio.playAxeSwing();
        this.meleeTimer = 0.3;
        this.hasWarPaint = true;
        game.projectiles.push(new Projectile(sx, sy, dx * 16, dy * 16, 'axe_wave', 135, true, 16, 0.7));
        game.triggerScreenShake(3, 0.08);
        break;

      case 'HMG':
        audio.playShootHMG();
        const spreadAngle = (Math.random() - 0.5) * 0.08;
        const hmgDx = dx * Math.cos(spreadAngle) - dy * Math.sin(spreadAngle);
        const hmgDy = dx * Math.sin(spreadAngle) + dy * Math.cos(spreadAngle);
        game.projectiles.push(new Projectile(sx, sy, hmgDx * 16, hmgDy * 16, 'bullet', 22, true, 4.5));
        game.triggerScreenShake(1.5, 0.05);
        break;

      case 'SHOTGUN':
        audio.playShootShotgun();
        for (let i = -3; i <= 3; i++) {
          const sAngle = i * 0.09;
          const sdx = dx * Math.cos(sAngle) - dy * Math.sin(sAngle);
          const sdy = dx * Math.sin(sAngle) + dy * Math.cos(sAngle);
          const pelletSpeed = 13 + Math.random() * 3;
          game.projectiles.push(new Projectile(sx, sy, sdx * pelletSpeed, sdy * pelletSpeed, 'shotgun', 38, true, 5, 0.35));
        }
        game.triggerScreenShake(5, 0.15);
        break;

      case 'ROCKET':
        audio.playShootRocket();
        game.projectiles.push(new Projectile(sx, sy, dx * 9, dy * 9, 'rocket', 90, true, 6, 2.5, true));
        game.triggerScreenShake(3, 0.1);
        break;

      case 'FLAME':
        audio.playShootFlame();
        for (let i = 0; i < 2; i++) {
          const fAngle = (Math.random() - 0.5) * 0.2;
          const fdx = dx * Math.cos(fAngle) - dy * Math.sin(fAngle);
          const fdy = dx * Math.sin(fAngle) + dy * Math.cos(fAngle);
          game.projectiles.push(new Projectile(sx, sy, fdx * (8 + Math.random() * 3), fdy * (8 + Math.random() * 3), 'flame', 15, true, 10 + Math.random() * 6, 0.3));
        }
        break;

      case 'LASER':
        audio.playShootLaser();
        game.projectiles.push(new Projectile(sx, sy, dx * 20, dy * 20, 'laser', 28, true, 4, 0.8));
        game.triggerScreenShake(1, 0.05);
        break;

      default: // PISTOL
        audio.playShootPistol();
        game.projectiles.push(new Projectile(sx, sy, dx * speed, dy * speed, 'bullet', 18, true, 3.5));
        game.triggerScreenShake(1, 0.04);
        break;
    }
  }

  throwGrenade(game) {
    if (this.grenades <= 0) return;
    this.grenades--;
    const gvx = this.facing * 7 + this.vx * 0.5;
    const gvy = -7;
    game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + 10, gvx, gvy, 'grenade', 140, true, 6, 1.8, false, true));
    game.addFloatingText(this.x, this.y - 12, 'BOMB!', '#ff3300');
  }

  checkMeleeAttack(game) {
    const meleeRange = this.weapon === 'AXE' ? 60 : (this.meleeRange || 40);
    const nearbyEnemy = game.enemies.find(e => {
      const dist = Math.hypot((e.x + e.width / 2) - (this.x + this.width / 2), (e.y + e.height / 2) - (this.y + this.height / 2));
      return dist < meleeRange && Math.abs(e.y - this.y) < 35;
    });

    if (nearbyEnemy && this.meleeTimer <= 0) {
      this.meleeTimer = 0.3;
      if (this.weapon === 'AXE') {
        audio.playAxeHit();
        nearbyEnemy.takeDamage(240, Math.atan2(0, this.facing), game);
        game.addFloatingText(nearbyEnemy.x, nearbyEnemy.y - 15, 'AXE CLEAVE! 240 DMG', '#ffcc00', 13);
        game.triggerScreenShake(5, 0.12);
        game.spawnSpark(nearbyEnemy.x + nearbyEnemy.width / 2, nearbyEnemy.y + nearbyEnemy.height / 2);
      } else {
        audio.playMeleeSlash();
        const dmg = this.meleeDamage || 75;
        nearbyEnemy.takeDamage(dmg, Math.atan2(0, this.facing), game);
        const slashText = this.characterId === 'claudio' ? 'CRITICAL SLASH!' : 'SLASH!';
        const slashColor = this.characterId === 'claudio' ? '#00ffcc' : '#00d9ff';
        game.addFloatingText(nearbyEnemy.x, nearbyEnemy.y - 10, slashText, slashColor);
        game.triggerScreenShake(3, 0.08);
      }
      return true;
    }
    return false;
  }

  tryEnterSlug(game) {
    if (this.inSlug) {
      // Sair do Slug
      this.inSlug = false;
      if (this.slugRef) {
        this.slugRef.isOccupied = false;
        this.x = this.slugRef.x - 20;
        this.y = this.slugRef.y - 20;
        this.vy = -7;
        this.slugRef = null;
      }
      this.isInvulnerable = true;
      this.invulnerableTimer = 1.0;
      return;
    }

    // Procurar tanque próximo
    const slug = game.slugs.find(s => {
      const dist = Math.hypot((s.x + s.width / 2) - (this.x + this.width / 2), (s.y + s.height / 2) - (this.y + this.height / 2));
      return dist < 65 && !s.isOccupied;
    });

    if (slug) {
      this.inSlug = true;
      this.slugRef = slug;
      slug.isOccupied = true;
      slug.driverCharacterId = this.characterId;

      // Se o piloto for Tarma (Slug Master), aplicar bônus de tanque
      if (this.slugBonus && !slug.tarmaBuffed) {
        slug.tarmaBuffed = true;
        slug.maxHp = 400;
        slug.hp = Math.min(slug.maxHp, slug.hp + 100);
        slug.cannons += 5;
        slug.speed = 5.4;
        game.addFloatingText(slug.x + 20, slug.y - 35, 'TARMA SLUG UPGRADE! +100 HP +5 CANNONS', '#ffcc00', 12);
      }

      audio.playSlugEnter();
      audio.announce("OK!");
      game.addFloatingText(slug.x + 20, slug.y - 20, 'SLUG READY!', '#00d9ff');
    }
  }

  takeDamage(amount, game) {
    if (this.isInvulnerable || this.isDead) return;

    if (this.inSlug && this.slugRef) {
      this.slugRef.takeDamage(amount, game);
      return;
    }

    // Aplicar resistência a dano
    if (this.damageResistance) {
      amount *= this.damageResistance;
    }

    this.hp -= amount;
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.2;
    audio.playHit();
    game.triggerScreenShake(4, 0.12);
    game.spawnBlood(this.x + this.width / 2, this.y + this.height / 2);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.isDead = true;
    this.lives--;
    this.respawnTimer = 2.0;
    game.spawnExplosion(this.x + this.width / 2, this.y + this.height / 2, 40);
    audio.playExplosion(false);

    if (this.lives < 0) {
      game.checkGameOver();
    }
  }

  respawn(game) {
    this.isDead = false;
    this.hp = 100;
    
    if (this.characterId === 'claudio') {
      this.weapon = 'AXE';
      this.ammo = 80;
      this.hasWarPaint = true;
    } else if (this.characterId === 'fio') {
      this.weapon = 'HMG';
      this.ammo = 150;
    } else {
      this.weapon = 'PISTOL';
      this.ammo = Infinity;
    }

    this.grenades = this.characterId === 'claudio' ? 15 : 10;
    this.isInvulnerable = true;
    this.invulnerableTimer = 2.5;
    this.x = game.camera.x + 80 + (this.playerIndex * 40);
    this.y = 80;
    this.vx = 0;
    this.vy = 0;
  }

  equipWeapon(type, ammoCount, game) {
    this.weapon = type;
    if (type === 'AXE') {
      this.hasWarPaint = true;
    }
    const finalAmmo = Math.round(ammoCount * (this.pickupMultiplier || 1.0));
    this.ammo = finalAmmo;
    this.score += 500;

    let announceName = "OK!";
    switch (type) {
      case 'AXE': announceName = "NORDIC BATTLE AXE"; audio.playAxeHit(); break;
      case 'HMG': announceName = "HEAVY MACHINE GUN"; break;
      case 'SHOTGUN': announceName = "SHOTGUN"; break;
      case 'ROCKET': announceName = "ROCKET LAUNCHER"; break;
      case 'FLAME': announceName = "FLAME SHOT"; break;
      case 'LASER': announceName = "LASER GUN"; break;
    }

    audio.announce(announceName);
    game.addFloatingText(this.x, this.y - 20, announceName + "!", '#ffcc00', 13);
  }
}

// ==========================================
// 2. INIMIGOS E TROPAS REBELDES
// ==========================================
class Enemy {
  constructor(x, y, type = 'soldier') {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.type = type;
    this.facing = -1;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.flashTimer = 0;
    this.shootTimer = 1.0 + Math.random() * 1.5;

    // Configurações por tipo
    switch (type) {
      case 'shield':
        this.width = 34;
        this.height = 46;
        this.hp = 90;
        this.maxHp = 90;
        this.speed = 1.6;
        this.scoreValue = 300;
        break;

      case 'rocket_trooper':
        this.width = 30;
        this.height = 46;
        this.hp = 45;
        this.maxHp = 45;
        this.speed = 1.8;
        this.scoreValue = 250;
        break;

      case 'drone':
        this.width = 36;
        this.height = 28;
        this.hp = 50;
        this.maxHp = 50;
        this.speed = 2.4;
        this.scoreValue = 400;
        this.baseY = y;
        break;

      default: // soldier
        this.width = 28;
        this.height = 44;
        this.hp = 35;
        this.maxHp = 35;
        this.speed = 2.2;
        this.scoreValue = 150;
        break;
    }
  }

  update(dt, player, game) {
    if (this.flashTimer > 0) this.flashTimer -= dt;
    this.shootTimer -= dt;

    const distToPlayer = player.x - this.x;
    const absDist = Math.abs(distToPlayer);

    // Virar na direção do jogador
    if (this.type !== 'drone') {
      this.facing = distToPlayer > 0 ? 1 : -1;
    }

    if (this.type === 'drone') {
      // IA do Drone: voo senoidal e tracking
      this.x += Math.sign(distToPlayer) * this.speed * 0.8;
      this.y = this.baseY + Math.sin(game.time * 4 + this.id) * 35;

      if (this.shootTimer <= 0 && absDist < 450) {
        this.shootTimer = 2.2 + Math.random();
        // Disparo de projétil de plasma descendente
        const angle = Math.atan2((player.y + 20) - this.y, (player.x + 15) - this.x);
        game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height, Math.cos(angle) * 7, Math.sin(angle) * 7, 'bullet', 15, false, 4));
        audio.playShootPistol();
      }
      return;
    }

    // IA Terrestre (Soldier, Shield, Rocket)
    if (absDist > 240) {
      // Aproximar-se do jogador
      this.vx = this.facing * this.speed;
    } else if (absDist < 90 && this.type !== 'shield') {
      // Recuar se estiver muito perto
      this.vx = -this.facing * this.speed * 0.7;
    } else {
      this.vx = 0;
    }

    // Ataque do Inimigo
    if (this.shootTimer <= 0 && absDist < 500) {
      this.shootTimer = 1.8 + Math.random() * 1.2;
      this.performAttack(player, game);
    }

    // Gravidade e Física
    this.vy += 0.48;
    if (this.vy > 14) this.vy = 14;

    this.x += this.vx;
    game.resolveHorizontalCollision(this);

    this.y += this.vy;
    this.onGround = false;
    game.resolveVerticalCollision(this);
  }

  performAttack(player, game) {
    const sx = this.x + (this.facing === 1 ? this.width + 4 : -4);
    const sy = this.y + 18;

    if (this.type === 'rocket_trooper') {
      // Lança míssil na direção do jogador
      game.projectiles.push(new Projectile(sx, sy, this.facing * 7, 0, 'rocket', 25, false, 5, 3.0, true));
      audio.playShootRocket();
    } else if (this.type === 'shield') {
      // Pistola rápida
      game.projectiles.push(new Projectile(sx, sy, this.facing * 8, 0, 'bullet', 12, false, 3.5));
      audio.playShootPistol();
    } else {
      // Soldado normal: tiro de rifle ou granada ocasional
      if (Math.random() < 0.25) {
        // Arremesso de granada inimiga
        game.projectiles.push(new Projectile(sx, sy - 8, this.facing * 5, -6, 'grenade', 30, false, 5, 2.0, false, true));
      } else {
        game.projectiles.push(new Projectile(sx, sy, this.facing * 9, 0, 'bullet', 14, false, 3.5));
        audio.playShootPistol();
      }
    }
  }

  takeDamage(amount, bulletAngle, game) {
    // Escudo bloqueia 85% de dano frontal
    if (this.type === 'shield') {
      const isFromFront = (this.facing === 1 && Math.cos(bulletAngle) < 0) || (this.facing === -1 && Math.cos(bulletAngle) > 0);
      if (isFromFront) {
        amount *= 0.15;
        game.spawnSpark(this.x + (this.facing === 1 ? this.width : 0), this.y + 20);
      }
    }

    this.hp -= amount;
    this.flashTimer = 0.08;
    game.spawnBlood(this.x + this.width / 2, this.y + this.height / 2);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.hp = 0;
    game.player.score += this.scoreValue;
    game.addFloatingText(this.x, this.y - 12, `+${this.scoreValue}`, '#ffcc00');
    game.spawnExplosion(this.x + this.width / 2, this.y + this.height / 2, 28);
    audio.playExplosion(false);

    // Chance de dropar item de comida para pontuação
    if (Math.random() < 0.18) {
      game.pickups.push(new Pickup(this.x, this.y, 'FOOD'));
    }
  }
}

// ==========================================
// 3. CHEFÃO GIGANTE (GOLIATH MEGA-TANK)
// ==========================================
class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 240;
    this.height = 140;
    this.hp = 1200;
    this.maxHp = 1200;
    this.flashTimer = 0;
    this.attackTimer = 2.0;
    this.cannonAngle = 0;
    this.phase = 1;
    this.isDead = false;
  }

  update(dt, player, game) {
    if (this.isDead) return;
    if (this.flashTimer > 0) this.flashTimer -= dt;

    this.attackTimer -= dt;

    // Fases de Combate
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio < 0.35) this.phase = 3;
    else if (hpRatio < 0.7) this.phase = 2;

    // Mirar canhão principal no jogador
    const targetAngle = Math.atan2((player.y + 20) - (this.y + 40), (player.x + 15) - (this.x + this.width - 40));
    this.cannonAngle = Math.max(-0.6, Math.min(0.6, targetAngle));

    // Executar Ataques de acordo com a fase
    if (this.attackTimer <= 0) {
      this.performBossAttack(player, game);
    }
  }

  performBossAttack(player, game) {
    if (this.phase === 1) {
      // Fase 1: Rajada de Metralhadora Vulcan + Canhão Pesado
      this.attackTimer = 2.5;
      audio.playShootShotgun();
      const sx = this.x - 20;
      const sy = this.y + 40;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (this.isDead) return;
          game.projectiles.push(new Projectile(sx, sy, -11, (i - 1.5) * 1.5, 'bullet', 20, false, 5));
          audio.playShootHMG();
        }, i * 140);
      }

    } else if (this.phase === 2) {
      // Fase 2: Chuva de Mísseis Verticais
      this.attackTimer = 3.2;
      audio.playBossWarning();
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (this.isDead) return;
          const rx = player.x + (i - 2.5) * 80;
          game.projectiles.push(new Projectile(rx, -40, 0, 7, 'rocket', 35, false, 6, 3.0, true));
          audio.playShootRocket();
        }, i * 220);
      }

    } else {
      // Fase 3: Disparo Devastador do Canhão de Plasma + Drones de Apoio
      this.attackTimer = 3.8;
      audio.playExplosion(true);
      game.triggerScreenShake(8, 0.4);

      // Mega Raio de Plasma
      const sx = this.x - 30;
      const sy = this.y + 45;
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          if (this.isDead) return;
          game.projectiles.push(new Projectile(sx, sy, -14, (Math.random() - 0.5) * 4, 'laser', 30, false, 7, 1.2));
        }, i * 80);
      }

      // Evocar drone de apoio se houver poucos
      if (game.enemies.filter(e => e.type === 'drone').length < 2) {
        game.enemies.push(new Enemy(this.x - 100, 80, 'drone'));
      }
    }
  }

  takeDamage(amount, game) {
    if (this.isDead) return;
    this.hp -= amount;
    this.flashTimer = 0.06;
    game.spawnSpark(this.x + Math.random() * this.width, this.y + Math.random() * this.height);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.isDead = true;
    this.hp = 0;
    game.player.score += 25000;
    game.addFloatingText(this.x + this.width / 2, this.y, '+25000 BOSS DEFEATED!', '#ffcc00', 16);

    // Efeito de Múltiplas Explosões em Cadeia
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        game.spawnExplosion(this.x + Math.random() * this.width, this.y + Math.random() * this.height, 50 + Math.random() * 30);
        audio.playExplosion(true);
        game.triggerScreenShake(8, 0.2);
      }, i * 250);
    }

    setTimeout(() => {
      game.missionComplete();
    }, 3200);
  }
}

// ==========================================
// 4. THE CYBER SLUG (MINI-TANQUE PILOTÁVEL)
// ==========================================
class SlugVehicle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 72;
    this.height = 48;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.8;
    this.jumpForce = -9.5;
    this.gravity = 0.48;
    this.onGround = false;
    this.facing = 1;
    this.isOccupied = false;
    this.hp = 300;
    this.maxHp = 300;
    this.cannons = 10;
    this.cannonAngle = 0;
    this.shootCooldown = 0;
  }

  update(dt, input, game) {
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    if (this.isOccupied) {
      const moveLeft = input.isDown('left');
      const moveRight = input.isDown('right');
      const lookUp = input.isDown('up');
      const lookDown = input.isDown('down');
      const jumpPressed = input.isPressed('jump');
      const shootDown = input.isDown('shoot');
      const bombPressed = input.isPressed('bomb');
      const enterPressed = input.isPressed('enter');

      // Movimentação
      if (moveLeft && !moveRight) {
        this.vx = -this.speed;
        this.facing = -1;
      } else if (moveRight && !moveLeft) {
        this.vx = this.speed;
        this.facing = 1;
      } else {
        this.vx = 0;
      }

      // Pulo com amortecedores hidráulicos
      if (jumpPressed && this.onGround) {
        this.vy = this.jumpForce;
        this.onGround = false;
        audio.playJump();
        game.spawnDust(this.x + this.width / 2, this.y + this.height);
      }

      // Ângulo do Canhão
      this.cannonAngle = lookUp ? -0.4 : (lookDown ? 0.3 : 0);

      // Disparo da Metralhadora Vulcan Dupla (Cadência Brutal)
      if (shootDown && this.shootCooldown <= 0) {
        this.shootCooldown = 0.07;
        audio.playShootHMG();
        const sx = this.x + (this.facing === 1 ? this.width + 8 : -8);
        const sy = this.y + 16;
        game.projectiles.push(new Projectile(sx, sy, this.facing * 18, (Math.random() - 0.5) * 1.5, 'bullet', 26, true, 5));
        game.spawnCasing(this.x + this.width / 2, this.y + 10, -this.facing);
        game.triggerScreenShake(2, 0.05);
      }

      // Disparo do Super Canhão de 120mm
      if (bombPressed && this.cannons > 0) {
        this.cannons--;
        audio.playSlugCannon();
        const sx = this.x + (this.facing === 1 ? this.width + 12 : -12);
        const sy = this.y + 12;
        game.projectiles.push(new Projectile(sx, sy, this.facing * 15, -1, 'slug_cannon', 220, true, 12, 1.5));
        game.triggerScreenShake(7, 0.2);
        game.addFloatingText(this.x + 20, this.y - 15, 'CANNON!', '#ff7700');
      }

      // Sair do Tanque
      if (enterPressed) {
        game.player.tryEnterSlug(game);
      }
    } else {
      this.vx = 0;
    }

    // Gravidade
    this.vy += this.gravity;
    if (this.vy > 14) this.vy = 14;

    this.x += this.vx;
    game.resolveHorizontalCollision(this);

    this.y += this.vy;
    this.onGround = false;
    game.resolveVerticalCollision(this);
  }

  takeDamage(amount, game) {
    this.hp -= amount;
    game.triggerScreenShake(5, 0.15);
    game.spawnSpark(this.x + Math.random() * this.width, this.y + Math.random() * this.height);

    if (this.hp <= 0) {
      // Destruição do Tanque & Ejeção do Jogador
      game.spawnExplosion(this.x + this.width / 2, this.y + this.height / 2, 50);
      audio.playExplosion(true);
      if (this.isOccupied) {
        game.player.inSlug = false;
        game.player.slugRef = null;
        game.player.isInvulnerable = true;
        game.player.invulnerableTimer = 1.5;
        game.player.y = this.y - 40;
        game.player.vy = -8;
      }
      this.hp = 0;
      this.destroyed = true;
    }
  }
}

// ==========================================
// 5. REFÉM / PRISIONEIRO DE GUERRA (POW)
// ==========================================
class POW {
  constructor(x, y, rewardType = 'HMG') {
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 42;
    this.rescued = false;
    this.saluteTimer = 0;
    this.rewardType = rewardType;
    this.facing = 1;
    this.vy = 0;
    this.onGround = false;
  }

  update(dt, player, game) {
    if (!this.rescued) {
      // Checar se o jogador encostou ou disparou perto
      const dist = Math.hypot((player.x + player.width / 2) - (this.x + this.width / 2), (player.y + player.height / 2) - (this.y + this.height / 2));
      if (dist < 40) {
        this.free(game);
      }
    } else {
      if (this.saluteTimer > 0) {
        this.saluteTimer -= dt;
        if (this.saluteTimer <= 0) {
          // Soltar o item de recompensa
          game.pickups.push(new Pickup(this.x + 10, this.y + 10, this.rewardType));
        }
      } else {
        // Correr para fora da tela
        this.x -= 3.5;
      }
    }

    // Gravidade
    this.vy += 0.48;
    this.y += this.vy;
    game.resolveVerticalCollision(this);
  }

  free(game) {
    if (this.rescued) return;
    this.rescued = true;
    this.saluteTimer = 1.4;
    audio.announce("THANK YOU");
    audio.playItemPickup();
    game.player.score += 1000;
    game.addFloatingText(this.x, this.y - 15, '+1000 RESCUED!', '#ffee00', 12);
  }
}

// ==========================================
// 6. PROJÉTEIS, GRANADAS E EXPLOSÕES
// ==========================================
class Projectile {
  constructor(x, y, vx, vy, type = 'bullet', damage = 20, isPlayer = true, radius = 4, life = 2.0, isHoming = false, hasGravity = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.radius = radius;
    this.life = life;
    this.isHoming = isHoming;
    this.hasGravity = hasGravity;
    this.rotation = 0;
  }

  update(dt, game) {
    this.life -= dt;
    if (this.life <= 0) return false;

    // Física Parabólica para Granadas
    if (this.hasGravity) {
      this.vy += 0.45;
      this.rotation += 0.2;
      this.x += this.vx;
      this.y += this.vy;

      // Colisão de granada com plataformas (quique)
      game.map.platforms.forEach(plat => {
        if (this.x > plat.x && this.x < plat.x + plat.width && this.y > plat.y && this.y < plat.y + plat.height) {
          this.y = plat.y - 2;
          this.vy = -this.vy * 0.45;
          this.vx *= 0.7;
          audio.playJump();
        }
      });

      return true;
    }

    // Míssil Teleguiado
    if (this.isHoming) {
      const target = this.isPlayer ? game.getClosestEnemy(this.x, this.y) : game.player;
      if (target) {
        const tx = target.x + target.width / 2;
        const ty = target.y + target.height / 2;
        const targetAngle = Math.atan2(ty - this.y, tx - this.x);
        const currentAngle = Math.atan2(this.vy, this.vx);
        let diff = targetAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turnSpeed = 0.08;
        const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
        const currentSpeed = Math.hypot(this.vx, this.vy);
        this.vx = Math.cos(newAngle) * currentSpeed;
        this.vy = Math.sin(newAngle) * currentSpeed;
      }
      // Rastro de fumaça de míssil
      game.spawnSmoke(this.x, this.y, 4);
    }

    this.x += this.vx;
    this.y += this.vy;
    return true;
  }
}

// ==========================================
// 7. ITENS COLETÁVEIS (PICKUPS)
// ==========================================
class Pickup {
  constructor(x, y, type = 'HMG') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 28;
    this.height = 28;

    switch (type) {
      case 'AXE': this.icon = '🪓'; this.color = '#ffd700'; this.ammo = 80; break;
      case 'HMG': this.icon = 'H'; this.color = '#ff9900'; this.ammo = 150; break;
      case 'SHOTGUN': this.icon = 'S'; this.color = '#38bdf8'; this.ammo = 30; break;
      case 'ROCKET': this.icon = 'R'; this.color = '#ef4444'; this.ammo = 25; break;
      case 'FLAME': this.icon = 'F'; this.color = '#f97316'; this.ammo = 80; break;
      case 'LASER': this.icon = 'L'; this.color = '#00ffff'; this.ammo = 100; break;
      case 'BOMB': this.icon = 'B'; this.color = '#e11d48'; this.ammo = 10; break;
      default: this.icon = '★'; this.color = '#ffd700'; this.ammo = 0; break; // FOOD / BONUS
    }
  }
}
