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
    this.meleeComboStep = 0;
    this.meleeAttackTime = 0; // Tempo de animação do ataque
    this.isAttacking = false; // Flag de ataque ativo
    this.isSpinning = false; // Flag de spin 360°
    this.spinAngle = 0; // Ângulo do spin atual
    this.attackDirection = 'vertical'; // 'vertical' ou 'horizontal'
    this.isExecuting = false; // Flag de execução aérea
    this.executionPhase = 0; // 0=subindo, 1=no topo, 2=descendo
    this.executionDirection = 1;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // Aplicar Especialidades por Personagem
    if (this.characterId === 'claudio') {
      // Claudio: Nordic Warrior & Wielder of the Leviathan Axe
      this.speed = 5.2; // Mais rápido e ágil
      this.grenades = 15;
      this.meleeDamage = 220; // Dano ÉPICO de Machado
      this.meleeRange = 75; // Alcance estendido
      this.hasWarPaint = true;
      this.weapon = 'AXE'; // Claudio empunha o Machado Nórdico!
      this.ammo = Infinity; // Machado não gasta munição
    } else if (this.characterId === 'jessica') {
      // Jessica: Elite Phantom Huntress / Bow Specialist
      this.speed = 5.2; // Alta agilidade e reflexos rápidos
      this.grenades = 12;
      this.meleeDamage = 95;
      this.meleeRange = 45;
      this.weapon = 'BOW'; // Jessica inicia com o Arco Tático Cyber!
      this.ammo = 180;
      this.pickupMultiplier = 1.35;
      this.bowCombo = 0;
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
    // Dar mais margem - só morre se cair BEM longe da tela
    const abyssLevel = game.canvas.height + 120; // Aumentado de 40 para 120
    if (this.y > abyssLevel && !this.isDead) {
      audio.playPitFall();
      game.addFloatingText(this.x, game.canvas.height - 60, 'CAIU NO ABISMO!', '#ff2222', 13);
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
    if (this.meleeAttackTime > 0) {
      this.meleeAttackTime -= dt;
      if (this.meleeAttackTime <= 0) {
        this.isAttacking = false;
      }
    }

    // Atualizar spin 360°
    if (this.isSpinning) {
      this.spinAngle += dt * 18; // Velocidade de rotação
      if (this.spinAngle >= Math.PI * 2) {
        this.isSpinning = false;
        this.spinAngle = 0;
      }
    }

    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) this.isInvulnerable = false;
    }

    // --- ENTRADA DE MOVIMENTO (1P ou 2P) ---
    // Player 1 (índice 0): WASD + J/K/L/E
    // Player 2 (índice 1): Arrows + U/I/O/P ou NumPad1/2/3/0
    let moveLeft, moveRight, lookUp, lookDown, jumpPressed, shootPressed, bombPressed, enterPressed, executionPressed;
    
    if (this.playerIndex === 0) {
      // Jogador 1 (WASD + J/K/L/R/E)
      moveLeft = input.isDown('left');
      moveRight = input.isDown('right');
      lookUp = input.isDown('up');
      lookDown = input.isDown('down');
      jumpPressed = input.isPressed('jump');
      shootPressed = input.isDown('shoot');
      bombPressed = input.isPressed('bomb');
      enterPressed = input.isPressed('enter');
      executionPressed = input.isPressed('execution');
    } else {
      // Jogador 2 (Setas + 1/2/3/4/0 ou Numpad)
      moveLeft = input.isDown('p2_left');
      moveRight = input.isDown('p2_right');
      lookUp = input.isDown('p2_up');
      lookDown = input.isDown('p2_down');
      jumpPressed = input.isPressed('p2_jump');
      shootPressed = input.isDown('p2_shoot');
      bombPressed = input.isPressed('p2_bomb');
      enterPressed = input.isPressed('p2_enter');
      executionPressed = input.isPressed('p2_execution');
    }

    // Pequena tolerância no pulo deixa o controle mais justo: o comando ainda
    // é aceito logo após sair de uma plataforma ou pouco antes de aterrissar.
    this.coyoteTimer = this.onGround ? 0.1 : Math.max(0, this.coyoteTimer - dt);
    if (jumpPressed) this.jumpBufferTimer = 0.12;
    else this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    // Agachamento
    this.isCrouching = lookDown && this.onGround;

    // Movimentação Horizontal
    if (this.isExecuting) {
      // A execução mantém o avanço no ar; antes, o personagem perdia o dash
      // no quadro seguinte caso o jogador soltasse a tecla de direção.
      this.vx = this.executionDirection * 8.5;
      this.facing = this.executionDirection;
    } else if (!this.isCrouching) {
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
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isExecuting) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
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

    // Efeito de Execução Aérea em Voo e Impacto no Solo
    if (this.isExecuting) {
      game.spawnBlood(this.x + this.width / 2, this.y + this.height / 2);
      game.spawnSpark(this.x + this.width / 2, this.y + this.height / 2);
      if (this.onGround && this.vy >= 0) {
        this.finishExecutionImpact(game);
      }
    }

    // Ação: Atirar ou Desferir Machado
    if (shootPressed) {
      // Se tiver o Machado Nórdico, só ataca corpo a corpo
      if (this.weapon === 'AXE') {
        // Alternar entre ataque vertical e horizontal
        if (lookDown) {
          // Segurando S = Ataque VERTICAL (de cima pra baixo)
          this.attackDirection = 'vertical';
        } else {
          // Normal = Ataque HORIZONTAL (esquerda pra direita)
          this.attackDirection = 'horizontal';
        }
        this.tryAxeMeleeAttack(game);
      } else {
        this.tryShoot(game);
      }
    }

    // Ação: Lançar Granada OU SPIN ATTACK 360° (se tiver machado)
    if (bombPressed) {
      if (this.weapon === 'AXE' && this.grenades > 0) {
        // ATAQUE ESPECIAL 360° GIRANDO O PERSONAGEM INTEIRO!
        this.tryAxeSpinAttack(game);
      } else if (this.grenades > 0) {
        this.throwGrenade(game);
      }
    }

    // Ação: Entrar no Cyber Slug
    if (enterPressed) {
      this.tryEnterSlug(game);
    }

    // Ação: EXECUÇÃO AÉREA (Tecla R para 1P, Tecla 4 para 2P)
    if (executionPressed) {
      if (!this.inSlug) {
        if (this.weapon === 'AXE' || this.characterId === 'claudio') {
          this.tryAxeExecutionJump(game);
        } else if (this.weapon === 'BOW' || this.characterId === 'jessica') {
          this.tryBowSpecialRain(game);
        }
      }
    }
  }

  // === ATAQUE DO MACHADO NÓRDICO (VERTICAL OU HORIZONTAL) ===
  tryAxeMeleeAttack(game) {
    if (this.meleeTimer > 0) return;

    // ATIVAR MODO DE ATAQUE
    this.isAttacking = true;
    this.meleeAttackTime = 0.4;
    
    const attackRange = this.meleeRange || 70;
    const hitEnemies = [];
    const dashDistance = 12;
    this.x += this.facing * dashDistance;

    // Buscar inimigos em alcance
    game.enemies.forEach(e => {
      const dist = Math.hypot((e.x + e.width / 2) - (this.x + this.width / 2), (e.y + e.height / 2) - (this.y + this.height / 2));
      const angle = Math.atan2((e.y + e.height / 2) - (this.y + this.height / 2), (e.x + e.width / 2) - (this.x + this.width / 2));
      const facingAngle = this.facing === 1 ? 0 : Math.PI;
      const angleDiff = Math.abs(angle - facingAngle);
      
      if (dist < attackRange && angleDiff < Math.PI / 2 && Math.abs(e.y - this.y) < 60) {
        hitEnemies.push(e);
      }
    });

    if (game.boss && !game.boss.isDead) {
      const bDist = Math.hypot((game.boss.x + game.boss.width / 2) - (this.x + this.width / 2), (game.boss.y + game.boss.height / 2) - (this.y + this.height / 2));
      if (bDist < attackRange + 90) {
        hitEnemies.push(game.boss);
      }
    }

    if (hitEnemies.length > 0) {
      this.meleeTimer = 0.28;
      this.meleeComboStep = (this.meleeComboStep + 1) % 3;

      if (this.meleeComboStep === 0) {
        audio.playAxeSwing();
      } else if (this.meleeComboStep === 1) {
        audio.playAxeHit();
      } else {
        audio.playAxeSwing();
        setTimeout(() => audio.playExplosion(false), 120);
      }
      
      const shakeIntensity = 7 + this.meleeComboStep * 2;
      game.triggerScreenShake(shakeIntensity, 0.2);

      hitEnemies.forEach(enemy => {
        const baseDamage = this.meleeDamage || 180;
        const comboDamage = baseDamage * (1 + this.meleeComboStep * 0.35);
        
        if (enemy.takeDamage) {
          enemy.takeDamage(comboDamage, Math.atan2(0, this.facing), game);
        }
        
        // Efeitos diferentes por direção de ataque
        if (this.attackDirection === 'vertical') {
          // VERTICAL: Impacto no chão
          game.spawnSpark(enemy.x + enemy.width / 2, enemy.y + enemy.height);
          
          for (let i = 0; i < 15; i++) {
            const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
            game.particles.push({
              type: 'blood',
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height,
              vx: Math.cos(angle) * (3 + Math.random() * 8),
              vy: Math.sin(angle) * (-8 - Math.random() * 6),
              radius: 3 + Math.random() * 2,
              life: 0.7,
              maxLife: 0.7,
              color: this.meleeComboStep === 2 ? '#ff1a1a' : '#ffd700'
            });
          }

          if (enemy.vx !== undefined) {
            enemy.vx = this.facing * 10;
            enemy.vy = -8;
          }
        } else {
          // HORIZONTAL: Corte lateral
          game.spawnSpark(enemy.x + (this.facing === 1 ? enemy.width : 0), enemy.y + enemy.height / 2);
          
          for (let i = 0; i < 15; i++) {
            const angle = this.facing === 1 ? 0 : Math.PI;
            const spread = (Math.random() - 0.5) * Math.PI / 4;
            game.particles.push({
              type: 'blood',
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: Math.cos(angle + spread) * (8 + Math.random() * 6),
              vy: Math.sin(spread) * (4 + Math.random() * 4),
              radius: 3 + Math.random() * 2,
              life: 0.7,
              maxLife: 0.7,
              color: this.meleeComboStep === 2 ? '#ff3300' : '#ffd700'
            });
          }

          if (enemy.vx !== undefined) {
            enemy.vx = this.facing * 14;
            enemy.vy = -4;
          }
        }
      });

      // Textos por direção
      const verticalTexts = ['⚡ SLAM!', '💥 ESMAGAR!', '🔥 EXECUÇÃO!'];
      const horizontalTexts = ['⚔️ CORTE!', '💫 CLEAVE!', '⚡ DEVASTAR!'];
      const comboColors = ['#ffcc00', '#ff6600', '#ff0000'];
      const texts = this.attackDirection === 'vertical' ? verticalTexts : horizontalTexts;
      
      game.addFloatingText(
        this.x, 
        this.y - 30, 
        texts[this.meleeComboStep] + ` ${Math.floor(this.meleeDamage * (1 + this.meleeComboStep * 0.35))}`, 
        comboColors[this.meleeComboStep], 
        14
      );

      // Ondas de choque
      const impactX = this.x + this.width / 2 + (this.attackDirection === 'horizontal' ? this.facing * 35 : 0);
      const impactY = this.attackDirection === 'vertical' ? this.y + this.height + 5 : this.y + this.height / 2;
      
      for (let i = 0; i < 20; i++) {
        const angle = this.attackDirection === 'vertical' ? 
          Math.PI / 2 + (Math.random() - 0.5) * Math.PI :
          (this.facing === 1 ? 0 : Math.PI) + (Math.random() - 0.5) * Math.PI / 2;
        
        game.particles.push({
          type: 'spark',
          x: impactX + (Math.random() - 0.5) * 20,
          y: impactY + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * (5 + Math.random() * 8),
          vy: Math.sin(angle) * (5 + Math.random() * 8),
          life: 0.5,
          maxLife: 0.5
        });
      }

      for (let i = 0; i < 8; i++) {
        game.spawnSmoke(
          impactX + (Math.random() - 0.5) * 50, 
          impactY, 
          10
        );
      }

      return true;
    }

    // Swing no ar
    if (this.meleeTimer <= 0) {
      this.meleeTimer = 0.25;
      audio.playAxeSwing();
      
      for (let i = 0; i < 5; i++) {
        game.particles.push({
          type: 'spark',
          x: this.x + this.width / 2 + this.facing * 25,
          y: this.y + (Math.random() - 0.5) * 20,
          vx: this.facing * (3 + Math.random() * 4),
          vy: (Math.random() - 0.5) * 6,
          life: 0.2,
          maxLife: 0.2
        });
      }
      
      game.addFloatingText(this.x, this.y - 10, '~whoosh~', '#888888', 8);
      return false;
    }

    return false;
  }

  // === ATAQUE ESPECIAL 360° GIRANDO O MACHADO ===
  tryAxeSpinAttack(game) {
    if (this.meleeTimer > 0 || this.isSpinning) return;

    // Consumir 1 granada para ativar o spin
    this.grenades--;
    
    // Ativar modo SPIN 360°
    this.isSpinning = true;
    this.spinAngle = 0;
    this.meleeTimer = 0.6; // Cooldown longo após spin
    
    // Som épico de spin
    audio.playAxeSwing();
    setTimeout(() => audio.playAxeHit(), 150);
    setTimeout(() => audio.playExplosion(true), 300);
    
    // Screen shake contínuo
    game.triggerScreenShake(10, 0.6);
    
    // Texto de ultimate
    game.addFloatingText(this.x, this.y - 35, '⚔️ SPIN DEVASTADOR 360° ⚔️', '#ff3300', 15);
    
    // Dano contínuo durante toda a rotação
    let hitCount = 0;
    const spinDamage = (this.meleeDamage || 180) * 1.5; // 50% mais dano
    
    const spinInterval = setInterval(() => {
      if (!this.isSpinning) {
        clearInterval(spinInterval);
        return;
      }
      
      hitCount++;
      
      // Detectar inimigos em TODAS as direções (360°)
      const spinRange = 85;
      
      game.enemies.forEach(e => {
        const dist = Math.hypot((e.x + e.width / 2) - (this.x + this.width / 2), (e.y + e.height / 2) - (this.y + this.height / 2));
        if (dist < spinRange) {
          if (e.takeDamage) {
            e.takeDamage(spinDamage / 4, Math.atan2(e.y - this.y, e.x - this.x), game);
          }
          
          // Knockback radial
          if (e.vx !== undefined) {
            const angle = Math.atan2(e.y - this.y, e.x - this.x);
            e.vx = Math.cos(angle) * 12;
            e.vy = Math.sin(angle) * 12 - 4;
          }
        }
      });
      
      // Boss também
      if (game.boss && !game.boss.isDead) {
        const bDist = Math.hypot((game.boss.x + game.boss.width / 2) - (this.x + this.width / 2), (game.boss.y + game.boss.height / 2) - (this.y + this.height / 2));
        if (bDist < spinRange + 100) {
          game.boss.takeDamage(spinDamage / 4, game);
        }
      }
      
      // Partículas circulares INTENSAS durante o spin
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const radius = 50 + Math.sin(this.spinAngle * 3) * 10;
        game.particles.push({
          type: 'spark',
          x: this.x + this.width / 2 + Math.cos(a + this.spinAngle) * radius,
          y: this.y + this.height / 2 + Math.sin(a + this.spinAngle) * radius,
          vx: Math.cos(a + this.spinAngle) * 12,
          vy: Math.sin(a + this.spinAngle) * 12,
          life: 0.5,
          maxLife: 0.5
        });
      }
      
      // Rastro dourado circular do machado
      for (let i = 0; i < 3; i++) {
        const angle = this.spinAngle + (Math.random() - 0.5) * 0.3;
        game.particles.push({
          type: 'spark',
          x: this.x + this.width / 2 + Math.cos(angle) * 45,
          y: this.y + this.height / 2 + Math.sin(angle) * 45,
          vx: 0,
          vy: 0,
          life: 0.3,
          maxLife: 0.3
        });
      }
      
    }, 80); // Tick de dano a cada 80ms
    
    return true;
  }

  // === EXECUÇÃO AÉREA DEVASTADORA (TECLA R / 4) - PULAR E DIVIDIR O INIMIGO AO MEIO ===
  tryAxeExecutionJump(game) {
    if (this.meleeTimer > 0 || this.isExecuting) return false;

    this.isExecuting = true;
    this.isAttacking = true;
    this.meleeAttackTime = 1.2;
    this.meleeTimer = 1.0;

    // Salto ágil para frente
    this.vy = -13.5;
    this.executionDirection = this.facing;
    this.vx = this.executionDirection * 8.5;
    this.onGround = false;

    audio.playAxeSwing();
    game.triggerScreenShake(8, 0.25);
    game.addFloatingText(this.x + this.width / 2, this.y - 25, '⚡ DEGOLAR! ⚡', '#ff0000', 16);

    for (let i = 0; i < 25; i++) {
      game.particles.push({
        type: 'spark',
        x: this.x + this.width / 2,
        y: this.y + this.height,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 12,
        life: 0.5,
        maxLife: 0.5
      });
    }
    return true;
  }

  finishExecutionImpact(game) {
    this.isExecuting = false;
    this.isAttacking = false;
    this.vx = 0;

    audio.playExplosion(true);
    audio.playAxeHit();
    game.triggerScreenShake(18, 0.45);

    const impactX = this.x + this.facing * 35;
    const impactY = this.y + this.height;

    // Explosão massiva de impacto
    game.spawnExplosion(impactX, impactY, 70);

    // Buscar inimigos no raio do corte
    const cleaveRadius = 140;
    let hitCount = 0;

    game.enemies.forEach(e => {
      const dist = Math.hypot((e.x + e.width / 2) - impactX, (e.y + e.height / 2) - impactY);
      if (dist < cleaveRadius) {
        const damage = 650; // Dano massivo que parte ao meio
        if (game.addExecutionSplit) game.addExecutionSplit(e, this.facing);
        e.takeDamage(damage, Math.atan2(0, this.facing), game);
        hitCount++;

        // Efeito visual de corte vertical e sangue jorrando dos dois lados
        const ex = e.x + e.width / 2;
        const ey = e.y + e.height / 2;
        for (let i = 0; i < 35; i++) {
          const side = (i % 2 === 0) ? -1 : 1;
          game.particles.push({
            type: 'blood',
            x: ex,
            y: ey + (Math.random() - 0.5) * e.height,
            vx: side * (6 + Math.random() * 10),
            vy: -4 - Math.random() * 8,
            radius: 4 + Math.random() * 3,
            life: 0.8,
            maxLife: 0.8
          });
        }
      }
    });

    if (game.boss && !game.boss.isDead) {
      const bDist = Math.hypot((game.boss.x + game.boss.width / 2) - impactX, (game.boss.y + game.boss.height / 2) - impactY);
      if (bDist < cleaveRadius + 80) {
        game.boss.takeDamage(500, game);
        hitCount++;
      }
    }

    if (hitCount > 0) {
      game.addFloatingText(impactX, impactY - 50, '💀 DIVIDIDO AO MEIO! 💀', '#ff0000', 18);
    }

    // Rachadura e faíscas no chão
    for (let i = 0; i < 35; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI / 2;
      game.particles.push({
        type: 'spark',
        x: impactX,
        y: impactY,
        vx: Math.cos(angle) * (8 + Math.random() * 12),
        vy: Math.sin(angle) * (8 + Math.random() * 12),
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  tryBowSpecialRain(game) {
    if (this.shootCooldown > 0) return false;
    this.shootCooldown = 0.8;

    audio.playBowSpecial();
    game.triggerScreenShake(8, 0.3);
    game.addFloatingText(this.x, this.y - 25, '🏹 CHUVA DE FLECHAS! 🏹', '#00d9ff', 15);

    // Dispara 10 flechas de plasma do céu caindo em leque
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const arrowX = this.x - 100 + i * 50;
        game.projectiles.push(new Projectile(arrowX, -30, (Math.random() - 0.5) * 2, 16, 'arrow', 60, true, 8, 1.5));
        audio.playBowShot();
      }, i * 60);
    }
    return true;
  }

  tryShoot(game) {
    if (this.shootCooldown > 0) return;

    // Definir cadência por arma
    let fireDelay = 0.18;
    switch (this.weapon) {
      case 'BOW': fireDelay = 0.14; break; // Alta cadência do Arco Tático
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
    if (this.weapon !== 'AXE' && this.weapon !== 'BOW') {
      game.spawnCasing(this.x + this.width / 2, this.y + 16, -this.facing);
    }

    // Consumir Munição
    if (this.weapon !== 'PISTOL' && this.weapon !== 'AXE') {
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
      case 'BOW':
        // Arco Tático da Jessica: Flechas Perfurantes & Rajada Tripla
        audio.playBowShot();
        this.bowCombo = (this.bowCombo || 0) + 1;
        if (this.bowCombo % 3 === 0) {
          // Rajada Tripla Especial em Leque
          audio.playBowSpecial();
          for (let i = -1; i <= 1; i++) {
            const spread = i * 0.12;
            const adx = dx * Math.cos(spread) - dy * Math.sin(spread);
            const ady = dx * Math.sin(spread) + dy * Math.cos(spread);
            game.projectiles.push(new Projectile(sx, sy, adx * 22, ady * 22, 'arrow', 85, true, 5, 1.6));
          }
          game.triggerScreenShake(3, 0.08);
          game.addFloatingText(sx, sy - 20, '🏹 TRIPLE ARROW!', '#00d9ff', 12);
        } else {
          // Flecha Única Rápida e Perfurante
          game.projectiles.push(new Projectile(sx, sy, dx * 24, dy * 24, 'arrow', 75, true, 5, 1.8));
          game.triggerScreenShake(1.5, 0.04);
        }
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

    if (this.characterId === 'jessica' && this.weapon === 'BOW') {
      // Jessica dispara uma Flecha Explosiva Tática (Bomb Arrow)
      audio.playBowShot();
      audio.playBowSpecial();
      const gvx = this.facing * 18;
      const gvy = -3;
      game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + 12, gvx, gvy, 'bomb_arrow', 200, true, 7, 2.0));
      game.addFloatingText(this.x, this.y - 15, '💥 BOMB ARROW!', '#00d9ff', 12);
      return;
    }

    const gvx = this.facing * 7 + this.vx * 0.5;
    const gvy = -7;
    game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + 10, gvx, gvy, 'grenade', 140, true, 6, 1.8, false, true));
    game.addFloatingText(this.x, this.y - 12, 'BOMB!', '#ff3300');
  }

  checkMeleeAttack(game) {
    // Ataques corpo a corpo para personagens sem machado
    if (this.weapon === 'AXE') return false; // Claudio usa o sistema especial de machado

    const meleeRange = this.meleeRange || 40;
    const nearbyEnemy = game.enemies.find(e => {
      const dist = Math.hypot((e.x + e.width / 2) - (this.x + this.width / 2), (e.y + e.height / 2) - (this.y + this.height / 2));
      return dist < meleeRange && Math.abs(e.y - this.y) < 35;
    });

    if (nearbyEnemy && this.meleeTimer <= 0) {
      this.meleeTimer = 0.3;
      audio.playMeleeSlash();
      const dmg = this.meleeDamage || 75;
      nearbyEnemy.takeDamage(dmg, Math.atan2(0, this.facing), game);
      const slashText = this.characterId === 'jessica' ? 'PHANTOM KICK!' : 'SLASH!';
      const slashColor = this.characterId === 'jessica' ? '#c084fc' : '#00d9ff';
      game.addFloatingText(nearbyEnemy.x, nearbyEnemy.y - 10, slashText, slashColor);
      game.triggerScreenShake(3, 0.08);
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
      slug.driverPlayerIndex = this.playerIndex;

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
    this.respawnTimer = 2.5;
    game.spawnExplosion(this.x + this.width / 2, this.y + this.height / 2, 40);
    audio.playExplosion(false);

    if (this.lives < 0) {
      // Verificar se todos os jogadores morreram
      game.checkAllPlayersDead();
    }
  }

  respawn(game) {
    this.isDead = false;
    this.hp = 100;
    
    if (this.characterId === 'claudio') {
      this.weapon = 'AXE';
      this.ammo = Infinity; // Machado não usa munição
      this.hasWarPaint = true;
      this.grenades = 15;
    } else if (this.characterId === 'jessica') {
      this.weapon = 'BOW';
      this.ammo = 180;
      this.grenades = 12;
    } else if (this.characterId === 'fio') {
      this.weapon = 'HMG';
      this.ammo = 150;
      this.grenades = 10;
    } else {
      this.weapon = 'PISTOL';
      this.ammo = Infinity;
      this.grenades = 10;
    }

    this.isInvulnerable = true;
    this.invulnerableTimer = 2.5;
    this.x = game.camera.x + 80 + (this.playerIndex * 40);
    this.y = 80;
    this.vx = 0;
    this.vy = 0;
  }

  equipWeapon(type, ammoCount, game) {
    // Claudio NÃO pode trocar o Machado Nórdico por outras armas!
    if (this.characterId === 'claudio' && type !== 'AXE') {
      game.addFloatingText(this.x, this.y - 20, 'MACHADO ETERNO!', '#ffcc00', 11);
      audio.announce("LEVIATHAN AXE");
      return;
    }

    this.weapon = type;
    if (type === 'AXE') {
      this.hasWarPaint = true;
    }
    const finalAmmo = Math.round(ammoCount * (this.pickupMultiplier || 1.0));
    this.ammo = finalAmmo;
    this.score += 500;

    let announceName = "OK!";
    switch (type) {
      case 'AXE': announceName = "LEVIATHAN AXE"; audio.playAxeHit(); break;
      case 'BOW': announceName = "CYBER BOW"; audio.playBowSpecial(); break;
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
// 2. INIMIGOS E TROPAS ADAPTADAS POR BIOMA
// ==========================================
class Enemy {
  constructor(x, y, type = 'soldier', biome = 'tokyo') {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.type = type;
    this.biome = biome; // 'tokyo', 'brazil', 'europe', 'egypt'
    this.facing = -1;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.flashTimer = 0;
    this.shootTimer = 0.8 + Math.random() * 1.5;
    this.animTime = Math.random() * 10;

    // Configurações por tipo e bioma
    switch (type) {
      case 'shield':
        this.width = 34;
        this.height = 46;
        this.hp = biome === 'egypt' ? 120 : (biome === 'europe' ? 100 : 90);
        this.maxHp = this.hp;
        this.speed = 1.6;
        this.scoreValue = 300;
        break;

      case 'rocket_trooper':
        this.width = 30;
        this.height = 46;
        this.hp = biome === 'egypt' ? 60 : 45;
        this.maxHp = this.hp;
        this.speed = 1.8;
        this.scoreValue = 250;
        break;

      case 'drone':
        this.width = 36;
        this.height = 28;
        this.hp = biome === 'egypt' ? 65 : 50;
        this.maxHp = this.hp;
        this.speed = 2.4;
        this.scoreValue = 400;
        this.baseY = y;
        break;

      default: // soldier
        this.width = 28;
        this.height = 44;
        this.hp = biome === 'egypt' ? 45 : (biome === 'europe' ? 40 : 35);
        this.maxHp = this.hp;
        this.speed = 2.2;
        this.scoreValue = 150;
        break;
    }
  }

  update(dt, player, game) {
    this.animTime += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    this.shootTimer -= dt;

    const distToPlayer = player.x - this.x;
    const absDist = Math.abs(distToPlayer);

    // Virar na direção do jogador
    if (this.type !== 'drone') {
      this.facing = distToPlayer > 0 ? 1 : -1;
    }

    if (this.type === 'drone') {
      // IA do Drone: voo senoidal e tracking suave
      this.x += Math.sign(distToPlayer) * this.speed * 0.8;
      this.y = this.baseY + Math.sin(game.time * 4 + this.id) * 35;

      if (this.shootTimer <= 0 && absDist < 480) {
        this.shootTimer = 2.0 + Math.random();
        const angle = Math.atan2((player.y + 20) - this.y, (player.x + 15) - this.x);
        game.projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height, Math.cos(angle) * 7.5, Math.sin(angle) * 7.5, 'bullet', 15, false, 4));
        audio.playShootPistol();
      }
      return;
    }

    // IA Terrestre (Soldier, Shield, Rocket)
    if (absDist > 220) {
      this.vx = this.facing * this.speed;
    } else if (absDist < 80 && this.type !== 'shield') {
      this.vx = -this.facing * this.speed * 0.7;
    } else {
      this.vx = 0;
    }

    // Ataque do Inimigo
    if (this.shootTimer <= 0 && absDist < 520) {
      this.shootTimer = 1.6 + Math.random() * 1.2;
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
      game.projectiles.push(new Projectile(sx, sy, this.facing * 7.5, 0, 'rocket', 25, false, 5, 3.0, true));
      audio.playShootRocket();
    } else if (this.type === 'shield') {
      game.projectiles.push(new Projectile(sx, sy, this.facing * 8.5, 0, 'bullet', 12, false, 3.5));
      audio.playShootPistol();
    } else {
      if (Math.random() < 0.25) {
        game.projectiles.push(new Projectile(sx, sy - 8, this.facing * 5, -6, 'grenade', 30, false, 5, 2.0, false, true));
      } else {
        game.projectiles.push(new Projectile(sx, sy, this.facing * 9, 0, 'bullet', 14, false, 3.5));
        audio.playShootPistol();
      }
    }
  }

  takeDamage(amount, bulletAngle, game) {
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
    game.players.forEach(p => { p.score += this.scoreValue; });
    game.addFloatingText(this.x, this.y - 12, `+${this.scoreValue}`, '#ffcc00');
    game.spawnExplosion(this.x + this.width / 2, this.y + this.height / 2, 28);
    audio.playExplosion(false);

    if (Math.random() < 0.2) {
      game.pickups.push(new Pickup(this.x, this.y, 'FOOD'));
    }
  }
}

// ==========================================
// 3. CHEFÃO TITÃ (MECHAGODZILLA DINÂMICO HD)
// ==========================================
class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 260; // Titã Imponente e Gigantesco
    this.height = 240;
    // Vida calibrada para uma luta de chefe: ataques especiais ainda causam
    // impacto, mas não encerram a batalha em poucos segundos.
    this.hp = 7600;
    this.maxHp = 7600;
    this.flashTimer = 0;
    this.phase = 1;
    this.isDead = false;
    this.lastAttack = null;

    // Máquina de Estados do MechaGodzilla
    // 'INTRO', 'IDLE', 'WALK', 'RUSH', 'PREPARE_LASER', 'FIRE_LASER', 'RECOIL_LASER', 'MISSILE_SALVO', 'TITAN_STOMP', 'DYING'
    this.state = 'INTRO';
    this.stateTimer = 1.4;
    this.attackCooldown = 2.0;

    // Movimentação, Física e Inércia - MELHORADA PARA SER MAIS FLUIDA!
    this.vx = 0;
    this.vy = 0;
    this.facing = -1; // -1 = Esquerda (olhando para os jogadores), 1 = Direita
    this.targetFacing = -1;
    this.turnTimer = 0;
    this.speed = 2.35;
    this.chaseDistance = 230;
    this.stepTimer = 0;
    this.stepCount = 0;
    this.rushDamageTimer = 0;
    this.rushPulseTimer = 0;

    // Animações Fluidas e Articulação - MUITO MAIS SUAVE!
    this.animTime = 0;
    this.bodyBob = 0;
    this.targetBodyBob = 0; // Para interpolação suave
    this.bodyLean = 0;
    this.targetBodyLean = 0; // Para interpolação suave
    this.headAngle = 0;
    this.targetHeadAngle = 0; // Cabeça acompanha suavemente
    this.cannonAngle = 0;
    this.spineGlow = 0.3;
    this.recoilX = 0;
    this.impactWobble = 0;
    this.impactTilt = 0;
    this.impactOffsetY = 0;
    this.chargeParticles = [];
    this.cinematicX = null;
    this.cinematicY = null;
    this.cinematicScale = 1;
    this.cinematicOpacity = 1;
    this.cinematicTilt = 0;
    this.hiddenByDragon = false;

    // Sistema do Mega Raio Laser (Proton Scream)
    this.laserActive = false;
    this.laserTimer = 0;
    this.laserDamageCooldown = 0;

    // Limites de locomoção na Arena do Egito
    this.minArenaX = 3800;
    this.maxArenaX = 5120;
  }

  update(dt, player, game) {
    this.animTime += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;

    // Depois da destruição, só a cinemática controla a carcaça. Isso evita
    // novas transições de fase/ataques enquanto o dragão entra em cena.
    if (this.isDead || this.state === 'DYING') {
      this.laserActive = false;
      return;
    }

    if (this.stateTimer > 0) this.stateTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.laserDamageCooldown > 0) this.laserDamageCooldown -= dt;
    this.impactWobble = Math.max(0, this.impactWobble - dt * 2.8);
    this.impactTilt += (0 - this.impactTilt) * 7 * dt;
    this.impactOffsetY += (0 - this.impactOffsetY) * 11 * dt;

    // Recoil suave retornando a zero
    this.recoilX += (0 - this.recoilX) * 5 * dt;
    
    // INTERPOLAÇÃO SUAVE para movimentos mais fluidos e orgânicos!
    this.bodyBob += (this.targetBodyBob - this.bodyBob) * 8 * dt;
    this.bodyLean += (this.targetBodyLean - this.bodyLean) * 6 * dt;
    this.headAngle += (this.targetHeadAngle - this.headAngle) * 10 * dt;

    // Fases de Fúria do Titã. A transição acontece uma única vez para ficar
    // clara para o jogador, em vez de reiniciar efeitos a cada quadro.
    const hpRatio = this.hp / this.maxHp;
    const nextPhase = hpRatio < 0.35 ? 3 : (hpRatio < 0.7 ? 2 : 1);
    if (nextPhase > this.phase) this.enterPhase(nextPhase, game);

    // Mirar a cabeça e canhão na direção do jogador mais próximo - COM SUAVIDADE!
    const targetP = game.getClosestPlayer(this.x + this.width / 2, this.y + this.height / 2);
    const distToTarget = (targetP.x + targetP.width / 2) - (this.x + this.width / 2);
    const absDist = Math.abs(distToTarget);

    this.targetFacing = distToTarget > 0 ? 1 : -1;

    const angleToTarget = Math.atan2((targetP.y + 20) - (this.y + 60), (targetP.x + 15) - (this.x + (this.facing === 1 ? this.width : 0)));
    this.targetHeadAngle = Math.max(-0.45, Math.min(0.45, angleToTarget)); // Usar target ao invés de setar direto
    this.cannonAngle = this.headAngle; // Usar o valor interpolado

    // Atualizar partículas de carregamento de energia
    this.updateChargeParticles(dt);

    // ==========================================
    // MÁQUINA DE ESTADOS & COMPORTAMENTO DO CHEFE
    // ==========================================
    switch (this.state) {
      case 'INTRO':
        // Entrada triunfal: pouso pesado com tremor e rugido
        this.spineGlow = 0.5 + Math.sin(this.animTime * 10) * 0.4;
        if (this.stateTimer <= 0) {
          game.triggerScreenShake(14, 0.5);
          audio.playMechaRoar();
          game.spawnExplosion(this.x + 40, this.y + this.height - 10, 45);
          game.spawnExplosion(this.x + this.width - 40, this.y + this.height - 10, 45);
          this.state = 'IDLE';
          this.stateTimer = 1.0;
        }
        break;

      case 'IDLE':
        this.vx = 0;
        this.targetBodyBob = Math.sin(this.animTime * 3) * 4; // Respiração suave
        this.targetBodyLean = 0;
        this.spineGlow = 0.3 + Math.sin(this.animTime * 4) * 0.2;

        // Virar suavemente se o jogador estiver do outro lado
        if (this.facing !== this.targetFacing) {
          this.turnTimer += dt;
          if (this.turnTimer > 0.35) {
            this.facing = this.targetFacing;
            this.turnTimer = 0;
          }
        } else {
          this.turnTimer = 0;
        }

        // Escolher próximo movimento ao terminar o cooldown
        if (this.attackCooldown <= 0 && this.stateTimer <= 0) {
          this.decideNextAction(absDist, game);
        }
        break;

      case 'WALK': {
        // Perseguição contínua: o Titã recalcula a direção durante a marcha,
        // impedindo que ele continue andando para o lado errado do alvo.
        const chaseDirection = distToTarget >= 0 ? 1 : -1;
        this.facing = chaseDirection;
        this.targetFacing = chaseDirection;
        this.vx = chaseDirection * this.speed;
        const walkGait = Math.sin(this.animTime * 7.2);
        this.targetBodyBob = walkGait * 3.5 + Math.abs(walkGait) * 5;
        this.targetBodyLean = this.facing * (0.07 + walkGait * 0.035);
        this.spineGlow = 0.4 + Math.sin(this.animTime * 6) * 0.2;

        // Passadas pesadas com tremor de tela e poeira
        this.stepTimer += dt;
        if (this.stepTimer >= 0.32) { // Passos mais rápidos
          this.stepTimer = 0;
          this.stepCount++;
          game.triggerScreenShake(4, 0.15);
          audio.playMechaStep();
          const footX = this.x + (this.stepCount % 2 === 0 ? 50 : this.width - 50);
          game.spawnDust(footX, this.y + this.height - 5);
        }

        // Limites da arena
        if ((this.facing === -1 && this.x <= this.minArenaX) || (this.facing === 1 && this.x >= this.maxArenaX)) {
          this.vx = 0;
          this.state = 'IDLE';
          this.stateTimer = 0.5;
        }

        // Só interrompe a perseguição ao alcançar distância de combate. Se o
        // jogador fugir, ele continua avançando em vez de voltar ao idle.
        if (absDist <= this.chaseDistance || this.stateTimer <= 0) {
          this.vx = 0;
          this.decideNextAction(absDist, game);
        }
        break;
      }

      case 'RUSH': {
        // Investida curta e muito rápida nas fases de fúria. É telegráfica
        // pelo texto/efeito no começo, mas obriga o jogador a sair da linha.
        const rushDirection = this.rushDirection || this.facing;
        this.facing = rushDirection;
        const rushMultiplier = this.phase === 3 ? 5.1 : (this.phase === 2 ? 4.45 : 3.8);
        this.vx = rushDirection * this.speed * rushMultiplier;
        const rushGait = Math.sin(this.animTime * 13);
        this.targetBodyBob = rushGait * 5 + Math.abs(rushGait) * 7;
        this.targetBodyLean = rushDirection * (0.16 + rushGait * 0.05);
        this.spineGlow = 1.2;

        this.stepTimer += dt;
        if (this.stepTimer >= 0.11) {
          this.stepTimer = 0;
          game.triggerScreenShake(8, 0.14);
          game.spawnDust(this.x + this.width / 2, this.y + this.height - 5);
          game.spawnSpark(this.x + (rushDirection === 1 ? 12 : this.width - 12), this.y + this.height - 46);
        }

        this.rushDamageTimer = Math.max(0, (this.rushDamageTimer || 0) - dt);
        if (this.rushDamageTimer <= 0) {
          this.rushDamageTimer = 0.2;
          const impactX = this.x + (rushDirection === 1 ? this.width + 52 : -52);
          const rushDamage = this.phase === 3 ? 78 : (this.phase === 2 ? 64 : 50);
          this.damagePlayersNear(impactX, this.y + this.height * 0.58, 205, rushDamage, game);
          game.spawnExplosion(impactX, this.y + this.height * 0.62, 26);
        }

        if (this.stateTimer <= 0 || (rushDirection === -1 && this.x <= this.minArenaX) || (rushDirection === 1 && this.x >= this.maxArenaX)) {
          this.vx = 0;
          this.state = 'IDLE';
          this.stateTimer = 0.45;
          this.attackCooldown = 1.1;
        }
        break;
      }

      case 'PREPARE_LASER':
        // Carregamento de energia nos espinhos e boca (Anticipation)
        this.vx = 0;
        this.targetBodyBob = -6; // Agacha mais para firmar
        this.targetBodyLean = -this.facing * 0.15; // Inclina mais para trás
        this.spineGlow = 1.0 + (1 - this.stateTimer / 0.7) * 1.2;

        // Gerar vórtice de partículas de plasma convergindo na boca
        if (Math.random() < 0.6) {
          const mouthX = this.x + (this.facing === 1 ? this.width + 10 : -10);
          const mouthY = this.y + 65;
          const rad = 60 + Math.random() * 50;
          const ang = Math.random() * Math.PI * 2;
          this.chargeParticles.push({
            x: mouthX + Math.cos(ang) * rad,
            y: mouthY + Math.sin(ang) * rad,
            tx: mouthX,
            ty: mouthY,
            life: 0.35,
            maxLife: 0.35
          });
        }

        if (this.stateTimer <= 0) {
          // Disparar o Proton Scream!
          this.state = 'FIRE_LASER';
          this.stateTimer = 1.3; // Duração do feixe contínuo
          this.laserActive = true;
          audio.playProtonBeam();
          game.addFloatingText(this.x + this.width / 2, this.y - 30, '⚡ PROTON SCREAM! ⚡', '#ff0033', 16);
          this.recoilX = -this.facing * 18;
        }
        break;

      case 'FIRE_LASER':
        // Feixe Laser Massivo Ativo
        this.vx = 0;
        this.laserActive = true;
        this.spineGlow = 2.0;
        this.bodyBob = Math.sin(this.animTime * 30) * 2; // Vibração intensa
        this.bodyLean = -this.facing * 0.14; // Recoil contínuo
        this.recoilX -= this.facing * 12 * dt;

        // Tremer a tela continuamente durante o disparo
        game.triggerScreenShake(7.5, 0.15);

        // Danificar jogadores atingidos pelo feixe contínuo
        if (this.laserDamageCooldown <= 0) {
          this.laserDamageCooldown = 0.12;
          this.checkLaserCollisions(game);
        }

        // Fagulhas e impacto de plasma no chão
        if (Math.random() < 0.7) {
          const beamLen = 950;
          const hitX = this.x + (this.facing === 1 ? this.width + Math.random() * beamLen : -Math.random() * beamLen);
          game.spawnSpark(hitX, this.y + 65 + (Math.random() - 0.5) * 20);
        }

        if (this.stateTimer <= 0) {
          this.laserActive = false;
          this.state = 'RECOIL_LASER';
          this.stateTimer = 0.5;
          this.attackCooldown = this.phase === 3 ? 1.8 : 2.5;
        }
        break;

      case 'RECOIL_LASER':
        // Recuperação e dissipação de calor/fumaça pelos exaustores
        this.laserActive = false;
        this.spineGlow = Math.max(0.3, this.stateTimer / 0.5);
        this.bodyBob = 0;
        this.bodyLean = 0;

        // Liberar vapor de resfriamento
        if (Math.random() < 0.5) {
          game.spawnSmoke(this.x + (this.facing === 1 ? 30 : this.width - 30), this.y + 40, 10);
        }

        if (this.stateTimer <= 0) {
          this.state = 'IDLE';
          this.stateTimer = 0.6;
        }
        break;

      case 'MISSILE_SALVO':
        this.vx = 0;
        this.bodyBob = -2;
        this.spineGlow = 0.8;

        if (this.stateTimer <= 0) {
          this.state = 'IDLE';
          this.stateTimer = 0.8;
          this.attackCooldown = 2.4;
        }
        break;

      case 'TITAN_STOMP':
        this.vx = 0;
        if (this.stateTimer <= 0) {
          this.state = 'IDLE';
          this.stateTimer = 0.7;
          this.attackCooldown = 2.2;
        }
        break;

      case 'DYING':
        this.vx = 0;
        this.laserActive = false;
        this.spineGlow = Math.random() * 2.0;
        this.bodyBob = Math.sin(this.animTime * 20) * 3;
        break;
    }

    // Aplicar velocidade horizontal
    this.x += this.vx;
    this.x = Math.max(this.minArenaX, Math.min(this.maxArenaX, this.x));
  }

  decideNextAction(distToPlayer, game) {
    // Escolhe a próxima tática com base na distância e fase
    const choices = [];

    // À distância ele fecha o cerco. Ataques à distância existem para punir
    // fuga, mas a prioridade é levar o combate até o jogador.
    if (distToPlayer > 440) {
      choices.push('WALK', 'WALK', 'WALK', 'MISSILE_SALVO');
    } else if (distToPlayer > this.chaseDistance) {
      choices.push('WALK', 'PREPARE_LASER', 'MISSILE_SALVO', 'WALK');
    } else {
      // Muito perto: pisada sísmica devastadora ou laser
      choices.push('TITAN_STOMP', 'TITAN_STOMP', 'PREPARE_LASER');
    }

    // A investida volta a ser uma assinatura do Titã já na fase 1. Nas
    // fases seguintes ela aparece com mais frequência e alcance maior.
    if (distToPlayer > 180 && distToPlayer < 980) {
      choices.push('RUSH');
      if (this.phase >= 2) choices.push('RUSH', 'RUSH');
      if (this.phase === 3) choices.push('RUSH');
    }

    // Evita repetir o mesmo ataque especial em sequência: a luta fica mais
    // legível e o jogador sempre tem uma janela para reagir.
    let nextAction = choices[Math.floor(Math.random() * choices.length)];
    if (nextAction === this.lastAttack && choices.length > 1) {
      const alternatives = choices.filter(choice => choice !== this.lastAttack);
      nextAction = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    this.lastAttack = nextAction;

    if (nextAction === 'WALK') {
      this.state = 'WALK';
      // Tempo suficiente para avançar de verdade; a distância de combate pode
      // encerrar esse estado antes se o jogador estiver próximo.
      this.stateTimer = 2.8 + Math.random() * 1.4;
      this.stepTimer = 0;
    } else if (nextAction === 'RUSH') {
      this.executeRush(game);
    } else if (nextAction === 'PREPARE_LASER') {
      this.state = 'PREPARE_LASER';
      this.stateTimer = 0.65;
      audio.playLaserCharge();
    } else if (nextAction === 'MISSILE_SALVO') {
      this.executeMissileSalvo(game);
    } else if (nextAction === 'TITAN_STOMP') {
      this.executeTitanStomp(game);
    }
  }

  executeRush(game) {
    this.state = 'RUSH';
    this.stateTimer = this.phase === 3 ? 1.45 : (this.phase === 2 ? 1.22 : 1.05);
    this.rushDirection = this.targetFacing;
    this.facing = this.rushDirection;
    this.stepTimer = 0;
    this.rushDamageTimer = 0;
    this.rushPulseTimer = 0;
    audio.playMechaRoar();
    game.triggerScreenShake(12, 0.25);
    game.addFloatingText(this.x + this.width / 2, this.y - 25, '⚠️ TITAN BREAKER CHARGE! ⚠️', '#ff3300', 15);
  }

  executeMissileSalvo(game) {
    this.state = 'MISSILE_SALVO';
    this.stateTimer = 1.2;
    const attackRunId = game.runId;
    audio.playBossWarning();
    game.addFloatingText(this.x + this.width / 2, this.y - 25, '🚀 MISSILE SWARM! 🚀', '#ffaa00', 14);

    const count = this.phase === 3 ? 10 : (this.phase === 2 ? 7 : 5);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (game.runId !== attackRunId || game.boss !== this || this.isDead || game.cinematicActive || game.state !== 'PLAYING') return;
        const sx = this.x + (this.facing === 1 ? 40 + i * 15 : this.width - 40 - i * 15);
        const sy = this.y - 15;
        const target = game.getClosestPlayer(sx, sy);
        const tx = target.x + target.width / 2;
        const ty = target.y + target.height / 2;
        const angle = Math.atan2(ty - sy, tx - sx);
        const spread = (i - (count - 1) / 2) * 0.08;
        const speed = 8.5;
        game.projectiles.push(new Projectile(
          sx, sy, Math.cos(angle + spread) * speed, Math.sin(angle + spread) * speed,
          'rocket', this.phase === 3 ? 48 : 40, false, 6, 3.5, true
        ));
        audio.playShootRocket();
        game.spawnSmoke(sx, sy, 8);
      }, i * 140);
    }
  }

  executeTitanStomp(game) {
    this.state = 'TITAN_STOMP';
    this.stateTimer = 1.0;
    const attackRunId = game.runId;
    audio.playExplosion(true);
    game.triggerScreenShake(14, 0.45);
    game.addFloatingText(this.x + this.width / 2, this.y + this.height - 20, '💥 TITAN SEISMIC STOMP! 💥', '#ff3300', 15);

    // Onda de choque que viaja pelo chão da arena em ambas as direções
    const waveCount = this.phase === 3 ? 16 : 13;
    for (let i = 0; i < waveCount; i++) {
      setTimeout(() => {
        if (game.runId !== attackRunId || game.boss !== this || this.isDead || game.cinematicActive || game.state !== 'PLAYING') return;
        const groundY = this.y + this.height - 10;
        const sx1 = this.x - i * 40;
        const sx2 = this.x + this.width + i * 40;

        game.spawnExplosion(sx1, groundY, 28);
        game.spawnExplosion(sx2, groundY, 28);
        const stompDamage = this.phase === 3 ? 42 : 34;
        this.damagePlayersNear(sx1, groundY, 64, stompDamage, game);
        this.damagePlayersNear(sx2, groundY, 64, stompDamage, game);

        // Disparo secundário de plasma
        if (i % 3 === 0) {
          const cannonY = this.y + 90;
          const cannonX = this.x + (this.facing === 1 ? this.width + 10 : -10);
          game.projectiles.push(new Projectile(cannonX, cannonY, this.facing * 17, (Math.random() - 0.5) * 1.5, 'laser', this.phase === 3 ? 36 : 29, false, 6, 1.2));
          audio.playShootLaser();
        }
      }, i * 55);
    }
  }

  checkLaserCollisions(game) {
    const mouthX = this.x + (this.facing === 1 ? this.width + 15 : -15);
    const mouthY = this.y + 65;
    const beamLength = 1000;
    const beamHeight = 44;

    const beamMinX = this.facing === 1 ? mouthX : mouthX - beamLength;
    const beamMaxX = this.facing === 1 ? mouthX + beamLength : mouthX;
    const beamMinY = mouthY - beamHeight / 2;
    const beamMaxY = mouthY + beamHeight / 2;

    // Verificar colisão com jogadores vivos
    game.players.forEach(p => {
      if (p.isDead || p.isInvulnerable) return;
      if (p.x + p.width > beamMinX && p.x < beamMaxX && p.y + p.height > beamMinY && p.y < beamMaxY) {
        p.takeDamage(this.phase === 3 ? 38 : 32, game);
        game.spawnBlood(p.x + p.width / 2, p.y + p.height / 2);
      }
    });

    // Verificar colisão com o Slug
    game.slugs.forEach(s => {
      if (s.destroyed) return;
      if (s.x + s.width > beamMinX && s.x < beamMaxX && s.y + s.height > beamMinY && s.y < beamMaxY) {
        s.takeDamage(20, game);
        game.spawnSpark(s.x + s.width / 2, s.y + s.height / 2);
      }
    });
  }

  enterPhase(phase, game) {
    this.phase = phase;
    this.speed = phase === 3 ? 4.1 : 3.15;
    this.chaseDistance = phase === 3 ? 175 : 205;
    this.attackCooldown = 0.8;
    game.triggerScreenShake(phase === 3 ? 12 : 8, 0.35);
    audio.playMechaRoar();
    const label = phase === 3 ? '☢️ NÚCLEO EM FUSÃO! ☢️' : '⚠️ PROTOCOLO DE CAÇA ATIVO! ⚠️';
    game.addFloatingText(this.x + this.width / 2, this.y - 45, label, phase === 3 ? '#ff3300' : '#ffaa00', 16);
  }

  damagePlayersNear(x, y, radius, damage, game) {
    game.players.forEach(player => {
      if (player.isDead || player.isInvulnerable) return;
      const target = player.inSlug && player.slugRef ? player.slugRef : player;
      const centerX = target.x + target.width / 2;
      const centerY = target.y + target.height / 2;
      if (Math.hypot(centerX - x, centerY - y) <= radius) {
        player.takeDamage(damage, game);
        game.spawnDust(centerX, target.y + target.height);
      }
    });
  }

  updateChargeParticles(dt) {
    for (let i = this.chargeParticles.length - 1; i >= 0; i--) {
      const p = this.chargeParticles[i];
      p.life -= dt;
      const progress = 1 - (p.life / p.maxLife);
      p.curX = p.x + (p.tx - p.x) * progress;
      p.curY = p.y + (p.ty - p.y) * progress;
      if (p.life <= 0) {
        this.chargeParticles.splice(i, 1);
      }
    }
  }

  takeDamage(amount, arg2, arg3) {
    if (this.isDead) return;
    const game = (arg2 && typeof arg2 === 'object' && arg2.spawnSpark) ? arg2 : (arg3 && typeof arg3 === 'object' && arg3.spawnSpark ? arg3 : (window.game || null));
    this.hp -= amount;
    this.flashTimer = 0.08;
    const impactStrength = Math.min(1, amount / 360);
    this.recoilX += (this.facing === -1 ? 3 : -3) * (1 + impactStrength * 1.8);
    this.impactWobble = Math.min(1.2, this.impactWobble + impactStrength);
    this.impactTilt += -this.facing * impactStrength * 0.13;
    this.impactOffsetY -= impactStrength * 5;

    if (game && game.spawnSpark) {
      game.spawnSpark(this.x + Math.random() * this.width, this.y + Math.random() * this.height);
    }

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    if (this.isDead && this.state === 'DYING') return;
    this.isDead = true;
    this.state = 'DYING';
    this.hp = 0;
    this.laserActive = false;
    this.cinematicX = this.x;
    this.cinematicY = this.y;
    this.cinematicScale = 1;
    this.cinematicOpacity = 1;
    this.cinematicTilt = this.facing * 0.035;
    const g = game || window.game;
    const finaleRunId = g ? g.runId : null;
    if (g && g.players) {
      g.players.forEach(p => { p.score += 50000; });
    }
    if (g && g.addFloatingText) {
      g.addFloatingText(this.x + this.width / 2, this.y - 25, '👑 MECHAGODZILLA DESTROYED! +50000 👑', '#ffcc00', 18);
    }
    audio.playMechaRoar();

    // A carcaça sofre uma pane em cadeia antes de ser recolhida pelo dragão.
    // Menos explosões preservam o corpo para a transição cinematográfica.
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        // Timers pertencem a esta partida. Eles não podem vazar uma explosão
        // para uma nova missão após o jogador apertar "jogar novamente".
        if (g && g.runId === finaleRunId && (g.state === 'PLAYING' || g.cinematicActive) && g.spawnExplosion) {
          g.spawnExplosion(this.x + Math.random() * this.width, this.y + Math.random() * this.height, 65 + Math.random() * 45);
          audio.playExplosion(true);
          if (g.triggerScreenShake) g.triggerScreenShake(11, 0.3);
        }
      }, i * 110);
    }

    if (g && g.startDragonFinale) {
      g.startDragonFinale(this);
    } else {
      setTimeout(() => {
        if (g && g.missionComplete) g.missionComplete();
      }, 2400);
    }
  }
}

// ==========================================
// 4. CINEMÁTICA FINAL — DRAGÃO TRICÉFALO
// ==========================================
class DragonCinematic {
  constructor(boss, game) {
    this.boss = boss;
    this.state = 'APPROACH';
    this.stateTime = 0;
    this.totalTime = 0;
    this.x = boss.x + 720;
    this.y = boss.y - 200;
    this.scale = 1.05;
    this.facing = -1;
    this.bank = 0;
    this.wingPhase = 0;
    this.tailPhase = 0;
    this.headPhase = 0;
    this.carrying = false;
    this.sweepHit = false;
    this.impactDone = false;
    this.impactPulses = 0;
    this.originX = this.x;
    this.originY = this.y;
    this.game = game;
  }

  transition(nextState) {
    this.state = nextState;
    this.stateTime = 0;
  }

  update(dt, game) {
    this.stateTime += dt;
    this.totalTime += dt;
    const wingSpeed = this.state === 'CARRY' || this.state === 'RETURN' || this.state === 'SWEEP' ? 13 : 8;
    this.wingPhase += dt * wingSpeed;
    this.tailPhase += dt * 5;
    this.headPhase += dt * 4;

    const boss = this.boss;
    const easeOut = t => 1 - Math.pow(1 - Math.min(1, t), 3);

    if (this.state === 'APPROACH') {
      this.facing = -1;
      this.bank += (0.05 - this.bank) * Math.min(1, dt * 5);
      const progress = easeOut(this.stateTime / 1.15);
      this.x = this.originX + ((boss.x + 420) - this.originX) * progress;
      this.y = this.originY + ((boss.y - 150) - this.originY) * progress + Math.sin(this.wingPhase) * 13;
      this.scale = 1.05 + progress * 0.12;
      this.setFallingBossPose(progress);
      if (this.stateTime >= 1.15) {
        audio.playMechaRoar();
        game.addFloatingText(boss.x + boss.width / 2, boss.y - 115, '🐉 UMA PRESENÇA ANCESTRAL DESCEU! 🐉', '#ffe066', 14);
        this.originX = this.x;
        this.originY = this.y;
        this.transition('SWEEP');
      }
      return;
    }

    if (this.state === 'SWEEP') {
      // Rasante de garra: o dragão passa rente à carcaça antes de segurá-la.
      this.facing = -1;
      this.bank += (0.23 - this.bank) * Math.min(1, dt * 9);
      const progress = easeOut(this.stateTime / 0.7);
      this.x = this.originX + ((boss.x + 135) - this.originX) * progress;
      this.y = this.originY + ((boss.y - 35) - this.originY) * progress + Math.sin(this.wingPhase * 1.6) * 8;
      this.scale = 1.16 + progress * 0.1;
      this.setFallingBossPose(1);
      if (!this.sweepHit && this.stateTime >= 0.25) {
        this.sweepHit = true;
        game.triggerDragonClawStrike(boss);
      }
      if (this.stateTime >= 0.7) this.transition('GRAB');
      return;
    }

    if (this.state === 'GRAB') {
      this.facing = -1;
      this.bank += (-0.04 - this.bank) * Math.min(1, dt * 7);
      this.y = boss.y - 105 + Math.sin(this.wingPhase * 0.7) * 7;
      this.x = boss.x + 135;
      this.scale = 1.17 + Math.sin(this.wingPhase) * 0.025;
      if (this.stateTime > 0.22) this.carrying = true;
      if (this.carrying) this.attachBoss();
      if (this.stateTime >= 0.72) {
        game.triggerScreenShake(11, 0.32);
        game.addFloatingText(this.x, this.y - 125, '⚡ O DRAGÃO RECLAMA O TITÃ! ⚡', '#fff1a8', 14);
        this.originX = this.x;
        this.originY = this.y;
        this.transition('CARRY');
      }
      return;
    }

    if (this.state === 'CARRY') {
      // O dragão faz a curva e carrega o Mecha para a direita, de frente para
      // a direção do voo, em vez de deslizar de costas.
      this.facing = 1;
      this.bank += (-0.14 - this.bank) * Math.min(1, dt * 6);
      const progress = easeOut(this.stateTime / 1.15);
      this.x = this.originX + 650 * progress;
      this.y = this.originY - 280 * progress + Math.sin(this.wingPhase) * 12;
      this.scale = 1.17 - progress * 0.16;
      this.attachBoss();
      if (this.stateTime >= 1.15) {
        boss.hiddenByDragon = true;
        this.carrying = false;
        this.originX = game.camera.x + game.canvas.width + 360;
        this.originY = 120;
        this.transition('RETURN');
      }
      return;
    }

    if (this.state === 'RETURN') {
      const progress = easeOut(this.stateTime / 1.05);
      const targetX = game.camera.x + game.canvas.width * 0.53;
      const targetY = 255;
      this.x = this.originX + (targetX - this.originX) * progress;
      this.y = this.originY + (targetY - this.originY) * progress;
      // Crescer durante o mergulho cria a sensação de salto em direção à tela.
      this.scale = 0.92 + progress * 1.9;
      this.facing = -1;
      this.bank += (0.16 - this.bank) * Math.min(1, dt * 6);
      if (this.stateTime >= 1.05) {
        this.transition('IMPACT');
      }
      return;
    }

    if (this.state === 'IMPACT') {
      this.bank += (0 - this.bank) * Math.min(1, dt * 9);
      this.scale = 2.82 + Math.sin(this.stateTime * 20) * 0.07;
      this.y = 255 + Math.sin(this.wingPhase * 0.5) * 4;
      if (!this.impactDone) {
        this.impactDone = true;
        game.triggerDragonImpact(this.x, this.y, 760);
        this.impactPulses = 1;
      }
      const wantedPulses = Math.min(4, Math.floor(this.stateTime / 0.18) + 1);
      while (this.impactPulses < wantedPulses) {
        game.triggerDragonAftershock(this.x, this.y, this.impactPulses);
        this.impactPulses++;
      }
      if (this.stateTime >= 0.95) this.transition('ASCEND');
      return;
    }

    if (this.state === 'ASCEND') {
      this.bank += (-0.1 - this.bank) * Math.min(1, dt * 4);
      this.y -= 330 * dt;
      this.x += 150 * dt;
      this.scale = Math.max(0.7, this.scale - 0.7 * dt);
      if (this.stateTime >= 1.15) {
        this.state = 'DONE';
        // Centraliza a saída da cinemática para limpar os efeitos e garantir
        // que a tela de vitória sempre apareça, mesmo após um impacto pesado.
        if (game.finishDragonFinale) game.finishDragonFinale();
        else game.missionComplete();
      }
    }
  }

  attachBoss() {
    this.boss.cinematicX = this.x - 130;
    // A posição é o canto superior do sprite; manter o centro próximo às
    // patas evita que a carcaça pareça flutuar abaixo do dragão.
    this.boss.cinematicY = this.y - 20;
    this.boss.cinematicScale = 0.58;
    this.boss.cinematicOpacity = 0.94;
    this.boss.cinematicTilt = -this.facing * 0.16 + Math.sin(this.wingPhase * 0.5) * 0.04;
  }

  setFallingBossPose(progress) {
    const bob = Math.sin(this.wingPhase * 0.7) * (3 + progress * 4);
    this.boss.cinematicX = this.boss.x + Math.sin(this.tailPhase) * 3;
    this.boss.cinematicY = this.boss.y + 6 + bob;
    this.boss.cinematicScale = 1;
    this.boss.cinematicOpacity = 0.88;
    this.boss.cinematicTilt = this.boss.facing * (0.05 + progress * 0.18);
  }
}

// ==========================================
// 5. THE CYBER SLUG (MINI-TANQUE PILOTÁVEL)
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
      const isP2 = this.driverPlayerIndex === 1;
      const moveLeft = isP2 ? input.isDown('p2_left') : input.isDown('left');
      const moveRight = isP2 ? input.isDown('p2_right') : input.isDown('right');
      const lookUp = isP2 ? input.isDown('p2_up') : input.isDown('up');
      const lookDown = isP2 ? input.isDown('p2_down') : input.isDown('down');
      const jumpPressed = isP2 ? input.isPressed('p2_jump') : input.isPressed('jump');
      const shootDown = isP2 ? input.isDown('p2_shoot') : input.isDown('shoot');
      const bombPressed = isP2 ? input.isPressed('p2_bomb') : input.isPressed('bomb');
      const enterPressed = isP2 ? input.isPressed('p2_enter') : input.isPressed('enter');

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
      const target = this.isPlayer ? game.getClosestEnemy(this.x, this.y) : game.getClosestPlayer(this.x, this.y);
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
      case 'BOW': this.icon = '🏹'; this.color = '#00d9ff'; this.ammo = 120; break;
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
