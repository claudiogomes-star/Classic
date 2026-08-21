// Motor de Renderização Gráfica Estilizada para "Cyber Slug: Neon Front"

class GameRenderer {
  constructor() {
    this.smokeParticles = [];
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  // --- CENÁRIO PARALLAX MULTI-CAMADA ---
  drawParallaxBackground(ctx, camera, canvasWidth, canvasHeight, mapWidth) {
    ctx.save();

    // Camada 1: Céu Warzone & Gradiente Crepúsculo Neon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    skyGrad.addColorStop(0, '#0c101d');
    skyGrad.addColorStop(0.4, '#1b1c36');
    skyGrad.addColorStop(0.7, '#421f38');
    skyGrad.addColorStop(0.85, '#69252c');
    skyGrad.addColorStop(1, '#1a0c10');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Lua de Sangue / Sol Industrial ao Fundo
    const sunX = canvasWidth * 0.75 - camera.x * 0.02;
    const sunY = 120;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
    sunGrad.addColorStop(0, '#fff4cc');
    sunGrad.addColorStop(0.3, '#ffaa44');
    sunGrad.addColorStop(0.7, '#ff3300');
    sunGrad.addColorStop(1, 'rgba(255, 51, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Camada 2: Silhueta de Megacidade / Fábricas Distantes (Parallax 0.1)
    const p1 = camera.x * 0.08;
    ctx.fillStyle = '#111224';
    for (let i = -100; i < canvasWidth + 200; i += 70) {
      const x = ((i - p1) % (canvasWidth + 200) + canvasWidth + 200) % (canvasWidth + 200) - 100;
      const h = 180 + Math.sin(i * 13) * 60;
      ctx.fillRect(x, canvasHeight - h - 140, 55, h);
      
      // Janelas e Luzes de Neon Distantes
      ctx.fillStyle = (i % 3 === 0) ? '#ff3366' : '#00d9ff';
      ctx.fillRect(x + 10, canvasHeight - h - 110, 4, 4);
      ctx.fillRect(x + 25, canvasHeight - h - 90, 4, 4);
      ctx.fillRect(x + 40, canvasHeight - h - 130, 4, 4);
      ctx.fillStyle = '#111224';
    }

    // Camada 3: Complexo Industrial & Chaminés com Fogo (Parallax 0.25)
    const p2 = camera.x * 0.25;
    ctx.fillStyle = '#1b1b2f';
    for (let i = -100; i < canvasWidth + 250; i += 120) {
      const x = ((i - p2) % (canvasWidth + 250) + canvasWidth + 250) % (canvasWidth + 250) - 100;
      const h = 120 + Math.cos(i * 7) * 40;
      // Chaminé / Torre
      ctx.fillRect(x, canvasHeight - h - 120, 40, h);
      
      // Chamas no topo das chaminés de refinaria
      if (i % 2 === 0) {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(x + 20, canvasHeight - h - 125, 12 + Math.sin(this.time * 10 + i) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x + 20, canvasHeight - h - 127, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b1b2f';
      }
    }

    // Camada 4: Estruturas de Guerra Midground (Parallax 0.5)
    const p3 = camera.x * 0.5;
    ctx.fillStyle = '#25263a';
    for (let i = -100; i < canvasWidth + 200; i += 160) {
      const x = ((i - p3) % (canvasWidth + 200) + canvasWidth + 200) % (canvasWidth + 200) - 100;
      // Vigas de aço em X
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2d2f48';
      ctx.strokeRect(x, canvasHeight - 190, 80, 80);
      ctx.beginPath();
      ctx.moveTo(x, canvasHeight - 190);
      ctx.lineTo(x + 80, canvasHeight - 110);
      ctx.moveTo(x + 80, canvasHeight - 190);
      ctx.lineTo(x, canvasHeight - 110);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- MAPA / PLATAFORMAS / CHÃO DETALHADO ---
  drawMapElements(ctx, camera, map) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Chão Principal e Plataformas
    map.platforms.forEach(plat => {
      // Sombra projetada
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(plat.x + 4, plat.y + 4, plat.width, plat.height);

      if (plat.isGround) {
        // Chão de asfalto/terra de guerra com placas metálicas
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
        groundGrad.addColorStop(0, '#363d4e');
        groundGrad.addColorStop(0.1, '#272d3b');
        groundGrad.addColorStop(1, '#151922');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Borda superior texturizada / Grama queimada & Detritos
        ctx.fillStyle = '#4f5b73';
        ctx.fillRect(plat.x, plat.y, plat.width, 4);

        // Linhas de placas de aço e rebites
        ctx.strokeStyle = '#1d232f';
        ctx.lineWidth = 2;
        for (let x = plat.x; x < plat.x + plat.width; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, plat.y);
          ctx.lineTo(x, plat.y + plat.height);
          ctx.stroke();

          // Rebites
          ctx.fillStyle = '#63728f';
          ctx.fillRect(x + 4, plat.y + 10, 3, 3);
          ctx.fillRect(x + 4, plat.y + 30, 3, 3);
        }
      } else {
        // Plataformas metálicas elevadas suspensas
        ctx.fillStyle = '#2c3545';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Topo reforçado com grade amarela/preta de segurança industrial
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);

        // Listras de perigo (Hazard Stripes)
        ctx.save();
        ctx.beginPath();
        ctx.rect(plat.x, plat.y + 3, plat.width, 6);
        ctx.clip();
        ctx.fillStyle = '#222';
        for (let hx = plat.x - 20; hx < plat.x + plat.width + 20; hx += 16) {
          ctx.beginPath();
          ctx.moveTo(hx, plat.y + 9);
          ctx.lineTo(hx + 8, plat.y + 3);
          ctx.lineTo(hx + 14, plat.y + 3);
          ctx.lineTo(hx + 6, plat.y + 9);
          ctx.fill();
        }
        ctx.restore();

        // Estrutura de treliça inferior
        ctx.strokeStyle = '#414f66';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      }
    });

    // Obstáculos Destrutíveis (Barris de Combustível, Caixas de Munição)
    if (map.destructibles) {
      map.destructibles.forEach(obj => {
        if (obj.destroyed) return;
        ctx.save();
        ctx.translate(obj.x, obj.y);

        if (obj.type === 'barrel') {
          // Barril Explosivo Vermelho Metal Slug
          const barrelGrad = ctx.createLinearGradient(0, 0, obj.width, 0);
          barrelGrad.addColorStop(0, '#d91414');
          barrelGrad.addColorStop(0.5, '#ff4444');
          barrelGrad.addColorStop(1, '#8a0a0a');
          ctx.fillStyle = barrelGrad;
          ctx.fillRect(0, 0, obj.width, obj.height);

          // Aros de ferro pretos
          ctx.fillStyle = '#222';
          ctx.fillRect(0, 6, obj.width, 4);
          ctx.fillRect(0, obj.height - 10, obj.width, 4);

          // Símbolo de Inflamável / Caveira
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.arc(obj.width / 2, obj.height / 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', obj.width / 2, obj.height / 2);
        } else if (obj.type === 'crate') {
          // Caixa de suprimentos militar de madeira/aço
          ctx.fillStyle = '#61482b';
          ctx.fillRect(0, 0, obj.width, obj.height);
          ctx.strokeStyle = '#3d2b17';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, obj.width, obj.height);

          // Detalhe cruzado
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(obj.width, obj.height);
          ctx.moveTo(obj.width, 0);
          ctx.lineTo(0, obj.height);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    ctx.restore();
  }

  // --- RENDERIZAÇÃO DETALHADA DO JOGADOR (CLAUDIO, MARCO, TARMA, FIO) ---
  drawPlayer(ctx, camera, p) {
    if (p.isInvulnerable && Math.floor(this.time * 20) % 2 === 0) {
      return; // Efeito de piscar na invulnerabilidade
    }

    ctx.save();
    ctx.translate(p.x - camera.x + p.width / 2, p.y - camera.y + p.height / 2);

    // SPIN 360° NA HORIZONTAL - Giro como um PIÃO (não inclinado!)
    let spinScaleX = 1;
    if (p.isSpinning && p.weapon === 'AXE') {
      // Usar escala no eixo X para simular rotação horizontal
      // spinAngle varia de 0 a 2π durante o giro
      spinScaleX = Math.cos(p.spinAngle) * p.facing;
      
      // Quando está de costas (cos negativo), inverte a escala vertical também
      if (Math.abs(Math.cos(p.spinAngle)) < 0.1) {
        spinScaleX = 0.1 * p.facing; // Muito fino quando está de lado
      }
    }

    // Direção horizontal (1 = Direita, -1 = Esquerda)
    ctx.scale(spinScaleX || p.facing, 1);

    // Sombra no chão MAIS REALISTA
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, p.height / 2 - 1, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const isRunning = Math.abs(p.vx) > 0.1 && p.onGround;
    const isCrouching = p.isCrouching && p.onGround;
    const runCycle = isRunning ? Math.sin(this.time * (p.characterId === 'claudio' ? 20 : 16)) : 0;
    const breathe = Math.sin(this.time * 4) * 1.5;
    const charId = p.characterId || 'claudio';

    // Inclinação dinâmica ao correr
    if (isRunning && !p.isAttacking) {
      ctx.rotate(runCycle * 0.05);
    }

    // Pose de ataque com machado (inclinação para frente)
    if (p.isAttacking && charId === 'claudio') {
      ctx.rotate(p.facing * 0.15);
      ctx.translate(p.facing * 8, -3);
    }

    // Definição de Cores Base por Personagem (MELHORADAS)
    let skinColor = '#e8b896'; // Tom de pele mais natural e bonito para Claudio
    let pantsColor = '#1a2332'; // Calça tactical mais escura
    let bootsColor = '#0d1117';
    
    if (charId === 'marco') {
      skinColor = '#f0be8b';
      pantsColor = '#4a5b3a';
      bootsColor = '#1c1f24';
    } else if (charId === 'tarma') {
      skinColor = '#e6b280';
      pantsColor = '#78654b';
      bootsColor = '#2b1d0c';
    } else if (charId === 'fio') {
      skinColor = '#f5c6a5';
      pantsColor = '#5c4838';
      bootsColor = '#2d241e';
    }

    // --- CORPO E MEMBROS ---
    const hipY = isCrouching ? 8 : 4;
    const torsoY = isCrouching ? 0 : -8 + breathe;

    // 1. Pernas & Botas
    ctx.fillStyle = pantsColor;
    if (isCrouching) {
      // Agachado
      ctx.fillRect(-10, 8, 12, 10);
      ctx.fillRect(2, 10, 10, 8);
      // Botas
      ctx.fillStyle = bootsColor;
      ctx.fillRect(-12, 16, 14, 6);
      ctx.fillRect(2, 16, 14, 6);
    } else if (p.onGround) {
      // Correndo ou Parado
      const leg1Angle = runCycle * 0.6;
      const leg2Angle = -runCycle * 0.6;

      // Perna Esquerda / Trás
      ctx.save();
      ctx.translate(-4, hipY);
      ctx.rotate(leg2Angle);
      ctx.fillRect(-3, 0, 7, 14);
      ctx.fillStyle = bootsColor; // Bota
      ctx.fillRect(-4, 12, 10, 6);
      ctx.restore();

      // Perna Direita / Frente
      ctx.save();
      ctx.translate(4, hipY);
      ctx.rotate(leg1Angle);
      ctx.fillStyle = pantsColor;
      ctx.fillRect(-3, 0, 7, 14);
      ctx.fillStyle = bootsColor; // Bota
      ctx.fillRect(-4, 12, 10, 6);
      ctx.restore();
    } else {
      // No Ar / Pulando
      ctx.fillRect(-8, hipY, 7, 10);
      ctx.fillRect(2, hipY - 2, 7, 8);
      ctx.fillStyle = bootsColor;
      ctx.fillRect(-9, hipY + 8, 9, 6);
      ctx.fillRect(2, hipY + 5, 9, 6);
    }

    // 2. Torso e Vestimentas
    ctx.save();
    ctx.translate(0, torsoY);

    if (charId === 'claudio') {
      // --- CLAUDIO: Camisa Branca Social Tática com Gola Aberta e Cinto Preto (MELHORADO) ---
      // Coldre tático nas costas com detalhes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-15, -9, 8, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-14, -7, 6, 5);
      
      // Sombra da camisa (profundidade)
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(-7, -11, 18, 17);

      // Camisa Branca com Caimento Impecável (gradiente sutil)
      const shirtGrad = ctx.createLinearGradient(-8, -12, 10, 4);
      shirtGrad.addColorStop(0, '#ffffff');
      shirtGrad.addColorStop(0.7, '#f8fafc');
      shirtGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = shirtGrad;
      ctx.fillRect(-8, -12, 18, 16);

      // Borda preta interna do decote / gola em V profunda
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-1, -12);
      ctx.lineTo(4, -5);
      ctx.lineTo(8, -12);
      ctx.closePath();
      ctx.fill();

      // Pele no decote da gola aberta
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(1, -12);
      ctx.lineTo(4, -6);
      ctx.lineTo(7, -12);
      ctx.closePath();
      ctx.fill();

      // Gola Social Branca Estruturada com sombra
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.lineTo(-2, -6);
      ctx.lineTo(2, -12);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(9, -12);
      ctx.lineTo(6, -6);
      ctx.lineTo(3, -12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Botões da Camisa prateados
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Cinto Tático de Couro Escuro com Fivela Prateada detalhada
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, 2, 18, 5);
      // Fivela com brilho metálico
      const buckleGrad = ctx.createLinearGradient(-1, 2, 4, 7);
      buckleGrad.addColorStop(0, '#e2e8f0');
      buckleGrad.addColorStop(0.5, '#94a3b8');
      buckleGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = buckleGrad;
      ctx.fillRect(-1, 2, 6, 5);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(-1, 2, 6, 5);

    } else if (charId === 'marco') {
      // --- MARCO: Colete Vermelho Tático e Camiseta Branca ---
      ctx.fillStyle = '#303b26';
      ctx.fillRect(-15, -10, 8, 14);
      ctx.fillStyle = '#445336';
      ctx.fillRect(-14, -8, 6, 4);

      ctx.fillStyle = '#d92626';
      ctx.fillRect(-8, -12, 18, 16);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(-2, -12, 8, 5);
      ctx.fillStyle = '#222';
      ctx.fillRect(-8, 2, 18, 4);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-1, 2, 5, 4);

    } else if (charId === 'tarma') {
      // --- TARMA: Jaqueta Marrom de Couro de Piloto ---
      ctx.fillStyle = '#4a2f16';
      ctx.fillRect(-14, -10, 7, 14);
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(-8, -12, 18, 16);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-2, -12, 6, 6);
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(-8, 2, 18, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-1, 2, 5, 4);

    } else if (charId === 'fio') {
      // --- FIO: Camisa Bege Tática com Suspensórios ---
      ctx.fillStyle = '#3a2818';
      ctx.fillRect(-13, -9, 6, 12);
      ctx.fillStyle = '#d7c4a8';
      ctx.fillRect(-8, -12, 18, 16);
      // Suspensórios Pretos
      ctx.fillStyle = '#2b2319';
      ctx.fillRect(-5, -12, 3, 14);
      ctx.fillRect(4, -12, 3, 14);
      ctx.fillRect(-8, 2, 18, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-1, 2, 4, 4);
    }

    // 3. Cabeça, Cabelo, Face e Acessórios
    ctx.fillStyle = skinColor;
    ctx.fillRect(-4, -22, 12, 10); // Rosto Base

    if (charId === 'claudio') {
      // === CLAUDIO: CABELO FADE DE ALTA DEFINIÇÃO, BIGODE, CAVANHAQUE, BRINCO DE DIAMANTE E PINTURA DE GUERRA ===
      // Cabelo Escuro com Topete e Fade Gradual Suave
      ctx.fillStyle = '#171412';
      ctx.fillRect(-5, -25, 14, 5); // Topo do cabelo volumoso
      ctx.fillRect(-6, -23, 3, 4); // Lateral fade

      // Linha do Cabelo / Pezinho Alinhado e Definido
      ctx.fillStyle = '#261f1a';
      ctx.fillRect(-3, -24, 11, 2);

      // Olhos Expressivos e Vivos
      ctx.fillStyle = '#14100e';
      ctx.fillRect(3, -19, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, -19, 1, 1); // Brilho no olhar

      // Sobrancelha estilosa e delineada
      ctx.fillStyle = '#181412';
      ctx.fillRect(2, -21, 5, 1.5);

      // Bigode Aparado Fiel à Foto
      ctx.fillStyle = '#181412';
      ctx.fillRect(3, -15, 6, 1.5);

      // Cavanhaque / Barbicha no Queixo Fiel à Foto
      ctx.fillStyle = '#181412';
      ctx.fillRect(3, -13, 4, 2.5);

      // --- PINTURA DE GUERRA VERMELHA PASSANDO PELO OLHO (NORDIC WAR STRIPE) ---
      if (p.hasWarPaint || p.weapon === 'AXE' || charId === 'claudio') {
        ctx.save();
        ctx.fillStyle = '#dc2626'; // Vermelho Sangue / Guerra
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 4;
        // Listra vertical da testa até a bochecha passando pelo olho
        ctx.fillRect(4, -24, 2.5, 12);
        // Ponto de brilho de energia no olho
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(4, -19, 2, 2);
        ctx.restore();
      }

      // Orelha e Brinco de Diamante Brilhante com Efeito Shimmer
      ctx.fillStyle = skinColor;
      ctx.fillRect(-6, -19, 3, 4); // Orelha

      // Brinco de Diamante com Brilho Realista
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(-6, -17, 2, 2);

      // Brilho pulsante / Sparkle no brinco de diamante
      const glint = Math.abs(Math.sin(this.time * 8));
      if (glint > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(-7, -18, 3, 3);
        ctx.shadowBlur = 0;
      }

    } else if (charId === 'marco') {
      // === MARCO: BANDANA VERMELHA E CABELO LOIRO ===
      ctx.fillStyle = '#111';
      ctx.fillRect(4, -19, 3, 2);
      ctx.fillStyle = '#d9aa38';
      ctx.fillRect(-6, -24, 14, 4);
      ctx.fillStyle = '#ff1a1a';
      ctx.fillRect(-6, -22, 15, 4);

      const bandanaWave1 = Math.sin(this.time * 22) * 5;
      const bandanaWave2 = Math.cos(this.time * 18) * 6;
      ctx.beginPath();
      ctx.moveTo(-6, -20);
      ctx.quadraticCurveTo(-14, -20 + bandanaWave1, -22, -18 + bandanaWave2);
      ctx.lineTo(-20, -15 + bandanaWave2);
      ctx.quadraticCurveTo(-12, -17 + bandanaWave1, -6, -17);
      ctx.fill();

    } else if (charId === 'tarma') {
      // === TARMA: ÓCULOS ESCUROS E CABELO ESPETADO ===
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-6, -26, 14, 6);
      ctx.beginPath();
      ctx.moveTo(-3, -26);
      ctx.lineTo(0, -29);
      ctx.lineTo(3, -26);
      ctx.fill();

      // Óculos Escuros Aviador com Reflexo Neon
      ctx.fillStyle = '#09090b';
      ctx.fillRect(1, -19, 8, 4);
      ctx.fillStyle = '#00d9ff';
      ctx.fillRect(2, -18, 3, 1.5);

    } else if (charId === 'fio') {
      // === FIO: BOINA MILITAR VERDE E ÓCULOS ===
      ctx.fillStyle = '#452b1b';
      ctx.fillRect(-5, -23, 12, 5); // Cabelo Castanho

      // Boina Verde
      ctx.fillStyle = '#3f5734';
      ctx.beginPath();
      ctx.ellipse(0, -23, 10, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcc00'; // Emblema
      ctx.fillRect(2, -25, 2, 2);

      // Óculos Redondos Táticos
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(3, -19, 5, 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(4, -18, 3, 2);
    }

    // 4. Braços e Arma com Rotação de Mira (8 Direções) + ANIMAÇÃO DE ATAQUE VERTICAL/SPIN
    let aimAngle = 0;
    if (p.aimY < 0) {
      aimAngle = p.aimX !== 0 ? -Math.PI / 4 : -Math.PI / 2;
    } else if (p.aimY > 0 && !p.onGround) {
      aimAngle = Math.PI / 2;
    }

    // ANIMAÇÃO ESPECIAL DO MACHADO
    let axeSwingAngle = 0;
    
    if (p.isSpinning && p.weapon === 'AXE') {
      // SPIN 360° - Girar o braço completamente
      axeSwingAngle = p.spinAngle;
      aimAngle = axeSwingAngle;
      
      // Efeito de blur/rastro durante spin
      ctx.globalAlpha = 0.7 + Math.sin(p.spinAngle * 4) * 0.3;
    } else if (p.isAttacking && p.weapon === 'AXE') {
      // ATAQUE VERTICAL ESTILO DARIUS - De CIMA para BAIXO
      const attackProgress = 1 - (p.meleeAttackTime / 0.4);
      
      // Movimento de -90° (topo) até +90° (chão) em arco vertical
      axeSwingAngle = -Math.PI / 2 + (attackProgress * Math.PI); // -90° até +90°
      aimAngle = axeSwingAngle;
    }

    ctx.save();
    ctx.translate(4, -3);
    ctx.rotate(aimAngle);

    // Recoil da Arma quando atira
    const recoil = p.shootRecoil ? -5 : 0;
    ctx.translate(recoil, 0);

    // Desenhar a Arma Atual Segurada
    this.drawWeaponSprite(ctx, p.weapon, p.isAttacking || p.isSpinning, p.meleeAttackTime, p.isSpinning);

    ctx.globalAlpha = 1.0; // Restaurar alpha

    // Manga da Roupa do Braço (MELHORADA)
    if (charId === 'claudio') {
      // Manga branca arregaçada com sombra
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 2;
      ctx.fillRect(-6, -5, 7, 7);
      ctx.shadowBlur = 0;
      
      // Antebraço com tom de pele melhorado
      ctx.fillStyle = skinColor;
      ctx.fillRect(-1, -4, 7, 6);
      
      // Relógio Tático no Pulso (detalhado)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -5, 3, 7);
      ctx.fillStyle = '#00d9ff';
      ctx.fillRect(2.5, -4, 2, 2);
      
      // Luva tática sem dedos
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, -2, 5, 5);
      ctx.fillStyle = skinColor;
      ctx.fillRect(5, -1, 3, 2); // Dedos visíveis
    } else {
      ctx.fillStyle = skinColor;
      ctx.fillRect(-4, -3, 8, 5);
      ctx.fillStyle = '#222';
      ctx.fillRect(2, -2, 5, 5);
    }

    // Muzzle Flash / Clarão do Tiro
    if (p.shootFlashTimer > 0) {
      this.drawMuzzleFlash(ctx, 22, -2, p.weapon);
    }

    ctx.restore(); // Fim do braço/arma

    // 5. Ataque Corpo a Corpo (Faca Tática ou Machado Nórdico)
    if (p.meleeTimer > 0) {
      this.drawMeleeSlash(ctx, p.meleeTimer, charId, p.weapon === 'AXE');
    }

    ctx.restore(); // Fim do torso

    // 6. Tag Flutuante do Jogador (1P / 2P)
    if (p.playerIndex !== undefined) {
      ctx.fillStyle = p.playerIndex === 0 ? '#00d9ff' : '#ffaa00';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(p.playerIndex === 0 ? '1P' : '2P', 0, -32);
      ctx.shadowBlur = 0;
    }

    ctx.restore(); // Fim do player
  }

  // Desenho dos Sprites de Armas (MACHADO MELHORADO)
  drawWeaponSprite(ctx, weapon, isAttacking = false, attackTime = 0, isSpinning = false) {
    switch (weapon) {
      case 'AXE':
        // --- MACHADO NÓRDICO LEVIATHAN (DOURADO E PRETO COM RUNAS DETALHADAS) ---
        ctx.save();
        
        // Efeito de brilho pulsante durante ataque ou spin
        if (isAttacking || isSpinning) {
          ctx.shadowColor = isSpinning ? '#ff3300' : '#ffd700';
          ctx.shadowBlur = isSpinning ? 25 : 15 + Math.sin(this.time * 40) * 5;
        }

        ctx.translate(6, -8);
        
        // Cabo de Madeira Entalhada Nórdica (textura melhorada)
        const handleGrad = ctx.createLinearGradient(0, 8, 0, 12);
        handleGrad.addColorStop(0, '#2d1f0c');
        handleGrad.addColorStop(0.5, '#3d2f1f');
        handleGrad.addColorStop(1, '#1a1816');
        ctx.fillStyle = handleGrad;
        ctx.fillRect(-10, 8, 24, 5);
        
        // Entalhes no cabo
        ctx.strokeStyle = '#4a3625';
        ctx.lineWidth = 1;
        for (let x = -8; x < 14; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, 8);
          ctx.lineTo(x, 13);
          ctx.stroke();
        }
        
        // Detalhes Dourados no cabo (grip rúnico)
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(-7, 9, 5, 3);
        ctx.fillRect(0, 9, 5, 3);
        ctx.fillRect(7, 9, 5, 3);
        
        // Círculos rúnicos no grip
        ctx.fillStyle = '#ffd700';
        for (let x = -5; x <= 9; x += 7) {
          ctx.beginPath();
          ctx.arc(x, 10.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Anel de Fixação Dourado no Topo (mais detalhado)
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(12, 6, 6, 9);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(13, 7, 4, 1);
        ctx.fillRect(13, 13, 4, 1);

        // Lâmina Negra Larga (forma mais agressiva)
        ctx.fillStyle = '#0d1117';
        ctx.beginPath();
        ctx.moveTo(15, 7);
        ctx.lineTo(30, -8);
        ctx.quadraticCurveTo(36, 11, 30, 26);
        ctx.lineTo(15, 13);
        ctx.closePath();
        ctx.fill();

        // Fio da Lâmina em Prata Polida (mais brilhante)
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(30, -8);
        ctx.quadraticCurveTo(36, 11, 30, 26);
        ctx.stroke();

        // Entalhes Rúnicos Dourados BRILHANTES na Lâmina
        ctx.fillStyle = '#ffee00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 8;
        
        // Runas nórdicas estilizadas
        ctx.fillRect(19, 5, 8, 2);
        ctx.fillRect(21, 9, 5, 2);
        ctx.fillRect(20, 13, 6, 2);
        
        // Símbolos rúnicos
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 6);
        ctx.lineTo(24, 6);
        ctx.lineTo(22, 4);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Espigão Traseiro pontiagudo
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.moveTo(10, 4);
        ctx.lineTo(12, 6);
        ctx.lineTo(12, 14);
        ctx.lineTo(10, 16);
        ctx.fill();

        // Ponta Superior da lâmina (spike)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(27, -9);
        ctx.lineTo(30, -8);
        ctx.lineTo(29, -6);
        ctx.fill();

        // Trilha de energia dourada durante ataque/spin
        if (isAttacking || isSpinning) {
          const trailCount = isSpinning ? 12 : 5; // Mais trilhas no spin!
          for (let i = 0; i < trailCount; i++) {
            ctx.fillStyle = isSpinning ? 
              `rgba(255, 100, 0, ${0.9 - i * 0.06})` : // Laranja intenso no spin
              `rgba(255, 215, 0, ${0.6 - i * 0.1})`;
            ctx.fillRect(25 + i * 3, 6 - i * 1.5, 4, 10 + i * 0.5);
          }
          
          // Círculo de energia no spin
          if (isSpinning) {
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.8 - Math.sin(this.time * 30) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(30, 10, 15 + Math.sin(this.time * 20) * 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.restore();
        break;

      case 'HMG':
        // Heavy Machine Gun: Corpo robusto cinza chumbo com tambor de munição e cano duplo
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, -5, 18, 7);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(4, 2, 8, 7); // Tambor redondo
        ctx.fillStyle = '#718096';
        ctx.fillRect(18, -4, 6, 4); // Cano
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(6, -7, 4, 2); // Mira ótica
        break;

      case 'SHOTGUN':
        // Shotgun: Escopeta de cano serrado com coronha de madeira e cano duplo grosso
        ctx.fillStyle = '#61482b'; // Madeira
        ctx.fillRect(-2, -3, 8, 6);
        ctx.fillStyle = '#2d3748'; // Aço
        ctx.fillRect(6, -5, 16, 7);
        ctx.fillStyle = '#111';
        ctx.fillRect(20, -5, 4, 3);
        ctx.fillRect(20, -1, 4, 3);
        break;

      case 'ROCKET':
        // Rocket Launcher / Bazooka militar verde com ogiva
        ctx.fillStyle = '#3b4a2c';
        ctx.fillRect(-6, -7, 26, 9);
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(20, -6, 5, 7); // Ponta do míssil
        ctx.fillStyle = '#111';
        ctx.fillRect(2, -10, 4, 3); // Mira
        break;

      case 'FLAME':
        // Flame Shot: Tanque pressurizado e bico de ignição com chama piloto
        ctx.fillStyle = '#c53030';
        ctx.fillRect(0, -6, 16, 8);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(16, -4, 6, 4);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(22, -3, 2, 2); // Piloto azul
        break;

      case 'LASER':
        // Laser Gun: Futurista branca/ciano com bobinas de energia
        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(0, -5, 18, 7);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(4, -3, 10, 3); // Núcleo brilhante
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(18, -4, 5, 5);
        break;

      default:
        // Pistola Padrão Semi-Automática Metal Slug
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, -4, 12, 5);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(-2, 0, 5, 6);
        break;
    }
  }

  // Clarão de Tiro (Muzzle Flash)
  drawMuzzleFlash(ctx, x, y, weapon) {
    ctx.save();
    ctx.translate(x, y);

    const size = weapon === 'SHOTGUN' ? 24 : (weapon === 'HMG' ? 16 : 10);
    const colorCore = weapon === 'LASER' ? '#00ffff' : (weapon === 'FLAME' ? '#ff3300' : '#ffffff');
    const colorOuter = weapon === 'LASER' ? '#0088ff' : (weapon === 'FLAME' ? '#ffaa00' : '#ff9900');

    // Espículas de fogo
    ctx.fillStyle = colorOuter;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, -size * 0.6);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(size * 1.3, 0);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(size, size * 0.6);
    ctx.closePath();
    ctx.fill();

    // Núcleo branco incandescente
    ctx.fillStyle = colorCore;
    ctx.beginPath();
    ctx.arc(4, 0, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Efeito de Corte de Faca ou Machado Nórdico (Melee Attack)
  drawMeleeSlash(ctx, timer, charId = 'claudio', isAxe = false) {
    ctx.save();
    
    if (isAxe || charId === 'claudio') {
      // --- CORTE ÉPICO DO MACHADO NÓRDICO (ONDA DOURADA MASSIVA EM ARCO LARGO) ---
      const progress = 1 - (timer / 0.4); // Normalizar de 0 a 1
      const startAngle = -Math.PI * 0.7 + progress * 1.2;
      const endAngle = Math.PI * 0.7 + progress * 1.2;

      // Arco externo dourado brilhante
      ctx.strokeStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 8;

      ctx.beginPath();
      ctx.arc(18, 0, 50, startAngle, endAngle);
      ctx.stroke();

      // Arco médio branco incandescente
      ctx.strokeStyle = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(18, 0, 48, startAngle, endAngle);
      ctx.stroke();

      // Arco interno com efeito de energia rúnica
      ctx.strokeStyle = '#ffee00';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(18, 0, 45, startAngle, endAngle);
      ctx.stroke();

      // Desenhar o machado físico em movimento no arco
      const midAngle = (startAngle + endAngle) / 2;
      const axeX = 18 + Math.cos(midAngle) * 45;
      const axeY = Math.sin(midAngle) * 45;

      ctx.save();
      ctx.translate(axeX, axeY);
      ctx.rotate(midAngle + Math.PI / 2);

      // Lâmina preta do machado
      ctx.fillStyle = '#11161d';
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(8, -12);
      ctx.lineTo(12, 0);
      ctx.lineTo(8, 12);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();

      // Detalhes dourados na lâmina
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-4, -8, 10, 3);
      ctx.fillRect(-4, 5, 10, 3);

      // Cabo do machado
      ctx.fillStyle = '#3d2f1f';
      ctx.fillRect(-12, -2, 8, 4);

      ctx.restore();

      // Partículas de energia ao longo do arco
      for (let a = startAngle; a < endAngle; a += 0.3) {
        const px = 18 + Math.cos(a) * (45 + Math.random() * 8);
        const py = Math.sin(a) * (45 + Math.random() * 8);
        ctx.fillStyle = Math.random() > 0.5 ? '#ffcc00' : '#ffffff';
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }

    } else {
      // Corte padrão de facão
      const slashColor = '#00d9ff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = slashColor;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 4;

      const progress = 1 - timer;
      const startAngle = -Math.PI / 3 + progress * 0.5;
      const endAngle = Math.PI / 3 + progress * 0.5;

      ctx.beginPath();
      ctx.arc(10, 0, 30, startAngle, endAngle);
      ctx.stroke();

      // Lâmina de aço
      ctx.fillStyle = '#cbd5e0';
      ctx.fillRect(14, -2, 16, 4);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(10, -3, 4, 6);
    }

    ctx.restore();
  }

  // --- RENDERIZAÇÃO DO VEÍCULO PILOTÁVEL (THE CYBER SLUG - MINI TANK) ---
  drawSlug(ctx, camera, slug, driverChar = 'claudio') {
    ctx.save();
    ctx.translate(slug.x - camera.x + slug.width / 2, slug.y - camera.y + slug.height / 2);
    ctx.scale(slug.facing, 1);

    const bounce = Math.sin(this.time * 12) * (Math.abs(slug.vx) > 0.1 ? 2 : 0.5);

    // 1. Esteiras e Rodas de Trator Bouncing
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.roundRect(-30, 10, 60, 16, 8);
    ctx.fill();

    // Rodas giratórias com detalhes
    ctx.fillStyle = '#4a5568';
    for (let wx = -20; wx <= 20; wx += 13) {
      ctx.beginPath();
      ctx.arc(wx, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(wx, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a5568';
    }

    // 2. Chassis Blindado Azul/Cinza Militar (Dourado se for Tarma Buffed)
    ctx.save();
    ctx.translate(0, bounce);

    const chassisGrad = ctx.createLinearGradient(0, -18, 0, 10);
    if (slug.tarmaBuffed) {
      chassisGrad.addColorStop(0, '#785b2e');
      chassisGrad.addColorStop(0.6, '#4f3b1b');
      chassisGrad.addColorStop(1, '#2d1f0c');
    } else {
      chassisGrad.addColorStop(0, '#4a658a');
      chassisGrad.addColorStop(0.6, '#2e4361');
      chassisGrad.addColorStop(1, '#1b2a3f');
    }
    ctx.fillStyle = chassisGrad;

    // Formato arredondado icônico do Metal Slug Tank
    ctx.beginPath();
    ctx.moveTo(-26, 10);
    ctx.lineTo(26, 10);
    ctx.lineTo(22, -10);
    ctx.lineTo(-20, -10);
    ctx.closePath();
    ctx.fill();

    // Rebites e Emblema de Estrela
    ctx.fillStyle = slug.tarmaBuffed ? '#ffcc00' : '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText('★', -4, 4);

    // Escapamento com fumaça
    ctx.fillStyle = '#718096';
    ctx.fillRect(-28, -6, 6, 6);
    if (Math.random() < 0.3) {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.beginPath();
      ctx.arc(-32 - Math.random() * 6, -6 - Math.random() * 4, 4 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Torreta Superior com Canhão e Metralhadoras Vulcan
    ctx.fillStyle = slug.tarmaBuffed ? '#5c4520' : '#3b5373';
    ctx.beginPath();
    ctx.arc(0, -12, 14, Math.PI, 0);
    ctx.fill();

    // Escotilha do Comandante
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(-8, -16, 16, 4);

    // Se o jogador estiver dentro, desenhar o herói selecionado aparecendo na escotilha
    if (slug.isOccupied) {
      const dChar = slug.driverCharacterId || driverChar;
      if (dChar === 'claudio') {
        // Claudio no cockpit do tanque com fade, brinco, camisa branca e pintura de guerra
        ctx.fillStyle = '#dfad88';
        ctx.fillRect(-4, -24, 8, 8); // Rosto
        ctx.fillStyle = '#171412';
        ctx.fillRect(-5, -26, 10, 4); // Cabelo Fade
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, -25, 2, 8); // Listra de guerra
        ctx.fillStyle = '#181412';
        ctx.fillRect(0, -18, 4, 2); // Bigode/Cavanhaque
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -20, 2, 2); // Brinco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -16, 12, 4); // Camisa branca
      } else if (dChar === 'tarma') {
        ctx.fillStyle = '#e6b280';
        ctx.fillRect(-4, -24, 8, 8);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-5, -26, 10, 4);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-1, -21, 6, 3);
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(-6, -16, 12, 4);
      } else if (dChar === 'fio') {
        ctx.fillStyle = '#f5c6a5';
        ctx.fillRect(-4, -24, 8, 8);
        ctx.fillStyle = '#3f5734';
        ctx.fillRect(-5, -26, 10, 4);
        ctx.fillStyle = '#222';
        ctx.strokeRect(0, -21, 4, 3);
        ctx.fillStyle = '#d7c4a8';
        ctx.fillRect(-6, -16, 12, 4);
      } else {
        ctx.fillStyle = '#f0be8b';
        ctx.fillRect(-4, -24, 8, 8);
        ctx.fillStyle = '#ff1a1a';
        ctx.fillRect(-5, -24, 10, 3);
        ctx.fillStyle = '#d92626';
        ctx.fillRect(-6, -16, 12, 4);
      }
    }

    // Canhão Principal de 120mm
    ctx.save();
    ctx.translate(4, -10);
    ctx.rotate(slug.cannonAngle || 0);
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, -4, 26, 8);
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(22, -5, 6, 10); // Boca do canhão
    ctx.restore();

    // Metralhadora Vulcan Giratória Inferior
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(12, 0, 14, 4);
    ctx.fillRect(14, 4, 12, 4);

    ctx.restore(); // Fim do chassis
    ctx.restore(); // Fim do slug
  }

  // --- INIMIGOS VARIADOS E DETALHADOS ---
  drawEnemy(ctx, camera, e) {
    ctx.save();
    ctx.translate(e.x - camera.x + e.width / 2, e.y - camera.y + e.height / 2);
    ctx.scale(e.facing, 1);

    if (e.flashTimer > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, e.height / 2 - 1, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e.type === 'soldier') {
      const walk = Math.sin(this.time * 12 + e.id) * 0.4;
      ctx.fillStyle = '#3d4b31';
      ctx.fillRect(-6 + walk * 4, 4, 5, 12);
      ctx.fillRect(2 - walk * 4, 4, 5, 12);
      ctx.fillStyle = '#15171a';
      ctx.fillRect(-7 + walk * 4, 12, 7, 5);
      ctx.fillRect(1 - walk * 4, 12, 7, 5);

      ctx.fillStyle = '#4c5e3d';
      ctx.fillRect(-7, -8, 14, 14);
      ctx.fillStyle = '#2b2317';
      ctx.fillRect(-7, 0, 14, 3);

      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-3, -16, 8, 8);
      ctx.fillStyle = '#39462e';
      ctx.beginPath();
      ctx.arc(1, -16, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-5, -16, 12, 3);

      ctx.fillStyle = '#1a202c';
      ctx.fillRect(2, -4, 16, 4);
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(-2, -3, 6, 4);

    } else if (e.type === 'shield') {
      ctx.fillStyle = '#222831';
      ctx.fillRect(-6, 2, 12, 14);
      ctx.fillStyle = '#393e46';
      ctx.fillRect(-8, -10, 14, 14);

      ctx.fillStyle = '#111';
      ctx.fillRect(-4, -18, 10, 9);
      ctx.fillStyle = '#ff2a2a';
      ctx.fillRect(1, -15, 5, 2);

      const shieldGrad = ctx.createLinearGradient(6, -18, 14, 16);
      shieldGrad.addColorStop(0, '#50637f');
      shieldGrad.addColorStop(0.5, '#788fae');
      shieldGrad.addColorStop(1, '#334155');
      ctx.fillStyle = shieldGrad;
      ctx.fillRect(6, -18, 8, 34);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(6, -18, 8, 34);

      ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
      ctx.fillRect(8, -14, 4, 6);

    } else if (e.type === 'rocket_trooper') {
      ctx.fillStyle = '#5c4d3c';
      ctx.fillRect(-6, 4, 12, 12);
      ctx.fillRect(-8, -8, 14, 14);

      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-3, -16, 8, 8);
      ctx.fillStyle = '#3d3429';
      ctx.fillRect(-5, -18, 12, 6);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(1, -15, 4, 3);

      ctx.fillStyle = '#2a3b22';
      ctx.fillRect(-8, -14, 28, 7);
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(18, -13, 4, 5);

    } else if (e.type === 'drone') {
      const hover = Math.sin(this.time * 8 + e.id) * 3;
      ctx.translate(0, hover);

      ctx.fillStyle = 'rgba(200, 240, 255, 0.6)';
      const propW = Math.abs(Math.sin(this.time * 30)) * 36;
      ctx.fillRect(-propW / 2, -16, propW, 3);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, -6, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(6, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, 8, 4);
    }

    ctx.restore();
  }

  // --- REFÉM / POW (PRISONER OF WAR) RESGATÁVEL ---
  drawPOW(ctx, camera, pow) {
    ctx.save();
    ctx.translate(pow.x - camera.x + pow.width / 2, pow.y - camera.y + pow.height / 2);
    ctx.scale(pow.facing, 1);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, pow.height / 2 - 1, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!pow.rescued) {
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-6, -6, 12, 10);
      ctx.strokeStyle = '#8c6239';
      ctx.lineWidth = 2;
      ctx.strokeRect(-7, -4, 14, 6);

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.lineTo(5, -12);
      ctx.lineTo(3, 2);
      ctx.lineTo(-3, 2);
      ctx.fill();

      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-3, -16, 7, 6);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-6, -20, 13, 5);

    } else {
      const salute = pow.saluteTimer > 0;
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-6, -8, 12, 12);

      ctx.fillStyle = '#f0be8b';
      ctx.fillRect(-3, -18, 7, 7);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-6, -22, 13, 6);
      ctx.fillRect(-4, -14, 8, 8);

      if (salute) {
        ctx.fillStyle = '#f0be8b';
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.lineTo(8, -16);
        ctx.lineTo(5, -18);
        ctx.lineTo(0, -6);
        ctx.fill();

        ctx.fillStyle = '#ffee00';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('THANK YOU!', 0, -28);
      }
    }

    ctx.restore();
  }

  // --- CHEFÃO GIGANTE (GOLIATH MEGA-TANK / MECH BOSS) ---
  drawBoss(ctx, camera, boss) {
    ctx.save();
    ctx.translate(boss.x - camera.x + boss.width / 2, boss.y - camera.y + boss.height / 2);

    if (boss.flashTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, boss.height / 2 - 4, boss.width / 2 + 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const treadGrad = ctx.createLinearGradient(0, boss.height / 2 - 30, 0, boss.height / 2);
    treadGrad.addColorStop(0, '#1a1f2c');
    treadGrad.addColorStop(1, '#0b0e14');
    ctx.fillStyle = treadGrad;
    ctx.beginPath();
    ctx.roundRect(-boss.width / 2, boss.height / 2 - 32, boss.width, 32, 10);
    ctx.fill();

    ctx.fillStyle = '#374151';
    for (let wx = -boss.width / 2 + 25; wx <= boss.width / 2 - 25; wx += 38) {
      ctx.beginPath();
      ctx.arc(wx, boss.height / 2 - 16, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.arc(wx, boss.height / 2 - 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
    }

    const bodyGrad = ctx.createLinearGradient(0, -boss.height / 2, 0, boss.height / 2 - 20);
    bodyGrad.addColorStop(0, '#7f1d1d');
    bodyGrad.addColorStop(0.5, '#450a0a');
    bodyGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-boss.width / 2 + 20, boss.height / 2 - 25);
    ctx.lineTo(boss.width / 2 - 10, boss.height / 2 - 25);
    ctx.lineTo(boss.width / 2 - 30, -boss.height / 2 + 30);
    ctx.lineTo(-boss.width / 2 + 30, -boss.height / 2 + 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.fillRect(-boss.width / 2 + 10, boss.height / 2 - 40, boss.width - 20, 8);

    const hpRatio = boss.hp / boss.maxHp;
    const coreColor = hpRatio > 0.5 ? '#00d9ff' : (hpRatio > 0.25 ? '#ffaa00' : '#ff0033');
    const pulse = 12 + Math.sin(this.time * 10) * 3;

    ctx.fillStyle = coreColor;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-boss.width / 2 + 40, -boss.height / 2 + 10, 45, 25);
    for (let mx = -boss.width / 2 + 45; mx <= -boss.width / 2 + 75; mx += 15) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(mx, -boss.height / 2 + 5, 8, 10);
    }

    ctx.save();
    ctx.translate(boss.width / 2 - 40, 5);
    ctx.rotate(boss.cannonAngle || 0);
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, -10, 70, 20);
    ctx.fillStyle = '#374151';
    ctx.fillRect(10, -12, 16, 24);
    ctx.fillStyle = coreColor;
    ctx.fillRect(60, -8, 10, 16);
    ctx.restore();

    if (hpRatio < 0.5) {
      ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(-20 + Math.sin(this.time * 15) * 6, -20, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(-25, -35 - (this.time * 20 % 30), 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- PROJÉTEIS E TIROS CINEMÁTICOS ---
  drawProjectiles(ctx, camera, projectiles) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'bullet') {
        // Bala Normal / HMG: Traçante Dourado Incandescente
        ctx.fillStyle = '#ffe600';
        ctx.shadowColor = '#ff7700';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius || 4, (p.radius || 4) * 0.6, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'shotgun') {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius || 5, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'rocket') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        ctx.fillStyle = '#374151';
        ctx.fillRect(-10, -4, 20, 8);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.lineTo(16, 0);
        ctx.lineTo(10, 4);
        ctx.fill();

        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.moveTo(-10, -3);
        ctx.lineTo(-18 - Math.random() * 6, 0);
        ctx.lineTo(-10, 3);
        ctx.fill();

      } else if (p.type === 'laser') {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 14;
        ctx.fillRect(-12, -3, 24, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -1.5, 20, 3);

      } else if (p.type === 'flame') {
        const flameGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.radius);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#ffcc00');
        flameGrad.addColorStop(0.7, '#ff3300');
        flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'grenade') {
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = '#3f4f2c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.fillRect(-2, -6, 4, 3);

        if (Math.floor(this.time * 25) % 2 === 0) {
          ctx.fillStyle = '#ff0033';
          ctx.shadowColor = '#ff0033';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (p.type === 'slug_cannon') {
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ff3300';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  // --- EXPLOSÕES ARCADE MULTI-CAMADA ---
  drawExplosions(ctx, camera, explosions) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    explosions.forEach(exp => {
      ctx.save();
      ctx.translate(exp.x, exp.y);

      const progress = exp.life / exp.maxLife; // 1 (início) até 0 (fim)
      const currentRadius = exp.radius * (1 - progress * 0.3);

      // 1. Onda de Choque Externa (Shockwave Ring)
      ctx.strokeStyle = `rgba(255, 200, 100, ${progress * 0.7})`;
      ctx.lineWidth = 4 * progress;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius * 1.3 * (1 - progress), 0, Math.PI * 2);
      ctx.stroke();

      // 2. Bolhas de Fogo e Fumaça Volumétrica
      exp.blobs.forEach(b => {
        const bx = b.x * (1 - progress);
        const by = b.y * (1 - progress);
        const br = b.r * progress;

        const fireGrad = ctx.createRadialGradient(bx, by, br * 0.1, bx, by, br);
        if (progress > 0.5) {
          fireGrad.addColorStop(0, '#ffffff');
          fireGrad.addColorStop(0.3, '#ffee00');
          fireGrad.addColorStop(0.7, '#ff3b00');
          fireGrad.addColorStop(1, 'rgba(100, 20, 0, 0)');
        } else {
          fireGrad.addColorStop(0, '#ff4400');
          fireGrad.addColorStop(0.5, '#4a4a4a');
          fireGrad.addColorStop(1, 'rgba(20, 20, 20, 0)');
        }

        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Núcleo Incandescente
      if (progress > 0.6) {
        ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  // --- PARTÍCULAS (CARTUCHOS, FAÍSCAS, FUMAÇA, SANGUE/ÓLEO) ---
  drawParticles(ctx, camera, particles) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'casing') {
        // Cartucho de Latão Dourado Ejetado
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-2, -1, 4, 2);

      } else if (p.type === 'spark') {
        // Faísca Brilhante
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#ff7700';
        ctx.shadowBlur = 4;
        ctx.fillRect(-1.5, -1.5, 3, 3);

      } else if (p.type === 'smoke') {
        // Fumaça Translúcida
        ctx.fillStyle = `rgba(180, 190, 200, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'blood') {
        // Sangue / Óleo
        ctx.fillStyle = p.color || '#b91c1c';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius || 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  // --- ITENS COLETÁVEIS E CAIXAS DE SUPRIMENTOS ---
  drawPickups(ctx, camera, pickups) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    pickups.forEach(item => {
      ctx.save();
      const bob = Math.sin(this.time * 6 + item.x) * 4;
      ctx.translate(item.x, item.y + bob);

      // Aura de Brilho
      ctx.fillStyle = 'rgba(255, 200, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(14, 14, 18, 0, Math.PI * 2);
      ctx.fill();

      // Caixa Metálica com Letra da Arma Estilo Metal Slug
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 28, 28);
      ctx.strokeStyle = item.color || '#ffaa00';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, 28, 28);

      // Letra do Ícone [H], [S], [R], [F], [L], [B]
      ctx.fillStyle = item.color || '#ffea00';
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, 14, 15);

      ctx.restore();
    });

    ctx.restore();
  }

  // --- TEXTOS FLUTUANTES (SCORE, WEAPON PICKUP) ---
  drawFloatingTexts(ctx, camera, texts) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    texts.forEach(t => {
      ctx.save();
      ctx.fillStyle = t.color || '#ffee00';
      ctx.font = `${t.size || 11}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    ctx.restore();
  }
}

// Instância global do renderizador
const renderer = new GameRenderer();
