// Motor de Renderização Gráfica Estilizada para "Cyber Slug: Neon Front"
// Cenários da Volta ao Mundo (Tóquio, Brasil, Europa e Egito) & MechaGodzilla HD

class GameRenderer {
  constructor() {
    this.smokeParticles = [];
    this.time = 0;

    // Sprites Oficiais do MechaGodzilla em Alta Definição
    this.mechaSprites = {
      idle: new Image(),
      walk1: new Image(),
      walk2: new Image(),
      stance: new Image(),
      aim: new Image(),
      laser: new Image(),
      loaded: false
    };
    this.mechaSprites.idle.src = 'assets/mecha_idle.png';
    this.mechaSprites.walk1.src = 'assets/mecha_walk1.png';
    this.mechaSprites.walk2.src = 'assets/mecha_walk2.png';
    this.mechaSprites.stance.src = 'assets/mecha_stance.png';
    this.mechaSprites.aim.src = 'assets/mecha_aim.png';
    this.mechaSprites.laser.src = 'assets/mecha_laser.png';
    this.mechaSprites.laser.onload = () => {
      this.mechaSprites.loaded = true;
    };

    // Partículas ambientais (Pétalas de Sakura em Tóquio, Vaga-lumes no Brasil, Poeira/Areia no Egito)
    this.ambientParticles = [];
    for (let i = 0; i < 40; i++) {
      this.ambientParticles.push({
        x: Math.random() * 1000,
        y: Math.random() * 500,
        vx: 0.5 + Math.random() * 1.5,
        vy: 0.2 + Math.random() * 0.8,
        size: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt) {
    this.time += dt;

    // Atualizar partículas ambientais
    this.ambientParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += 0.05;
      if (p.x > 1000) p.x = -20;
      if (p.y > 540) p.y = -10;
    });
  }

  // --- CAPA ARCADE DA TELA INICIAL ---
  drawOdysseusCover(ctx, canvasWidth, canvasHeight, time) {
    const coverX = canvasWidth * 0.77;
    const coverY = canvasHeight * 0.57 + Math.sin(time * 1.3) * 4;
    const drawTrooper = (x, y, scale, color, pose) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = color;
      ctx.strokeStyle = '#101827';
      ctx.lineWidth = 3;
      ctx.fillRect(-10, -5, 20, 31);
      ctx.beginPath();
      ctx.arc(0, -16, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2b38d';
      ctx.fillRect(-6, -21, 12, 8);
      ctx.strokeStyle = '#c7efff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, 25);
      ctx.lineTo(-14 - pose, 46);
      ctx.moveTo(8, 25);
      ctx.lineTo(15 + pose, 46);
      ctx.moveTo(-9, 2);
      ctx.lineTo(-21, 14 + pose);
      ctx.moveTo(9, 2);
      ctx.lineTo(24, -7 + pose);
      ctx.stroke();
      ctx.restore();
    };

    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(coverX, coverY, 12, coverX, coverY, 260);
    glow.addColorStop(0, 'rgba(255, 175, 65, 0.42)');
    glow.addColorStop(0.54, 'rgba(63, 173, 255, 0.16)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(coverX - 270, coverY - 245, 540, 490);
    ctx.globalCompositeOperation = 'source-over';

    // Tropas em camadas: a diferença de altura e pose cria uma capa com
    // sensação de esquadrão, não uma fila rígida de bonecos.
    drawTrooper(coverX - 150, coverY + 53, 0.8, '#24567a', Math.sin(time * 2.1) * 3);
    drawTrooper(coverX - 80, coverY + 26, 0.98, '#61417c', Math.sin(time * 2.1 + 1) * 3);
    drawTrooper(coverX + 100, coverY + 35, 0.92, '#2d6a62', Math.sin(time * 2.1 + 2) * 3);
    drawTrooper(coverX + 160, coverY + 64, 0.76, '#7b3b35', Math.sin(time * 2.1 + 3) * 3);

    // Odisseu no primeiro plano: capacete, lança e escudo inspiram o tema
    // grego, preservando a leitura arcade e sem depender de arte licenciada.
    ctx.save();
    ctx.translate(coverX, coverY);
    const shieldPulse = Math.sin(time * 3) * 0.08;
    ctx.strokeStyle = '#e7c158';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#ffba43';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(42, -122);
    ctx.lineTo(42, 128);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#9e332f';
    ctx.strokeStyle = '#ffd36f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-35, 27, 42 + shieldPulse * 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ffe9a5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-35, 27, 21, 0, Math.PI * 2);
    ctx.moveTo(-56, 27);
    ctx.lineTo(-14, 27);
    ctx.moveTo(-35, 6);
    ctx.lineTo(-35, 48);
    ctx.stroke();
    ctx.fillStyle = '#26466f';
    ctx.strokeStyle = '#101827';
    ctx.lineWidth = 4;
    ctx.fillRect(-18, -13, 38, 66);
    ctx.strokeRect(-18, -13, 38, 66);
    ctx.fillStyle = '#e7b78e';
    ctx.beginPath();
    ctx.arc(1, -43, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#bc9b4f';
    ctx.beginPath();
    ctx.moveTo(-25, -49);
    ctx.lineTo(-13, -78);
    ctx.lineTo(12, -85);
    ctx.lineTo(29, -51);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff0a4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -84);
    ctx.quadraticCurveTo(7, -108, 21, -116);
    ctx.stroke();
    ctx.strokeStyle = '#c9efff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-9, 52);
    ctx.lineTo(-25, 96);
    ctx.moveTo(12, 52);
    ctx.lineTo(29, 96);
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe68a';
    ctx.shadowColor = '#ff8426';
    ctx.shadowBlur = 11;
    ctx.fillText('ODYSSEUS // TROJAN SQUAD', coverX, coverY + 132);
    ctx.restore();
  }

  // --- EASTER EGGS DA TELA INICIAL ---
  // Referências desenhadas no próprio Canvas para manter a abertura leve e
  // publicável no GitHub Pages, sem baixar imagens ou marcas externas.
  drawMenuEasterEggs(ctx, canvasWidth, canvasHeight, time) {
    this.drawOdysseusCover(ctx, canvasWidth, canvasHeight, time);
    const drawLabel = (text, x, y, color) => {
      ctx.save();
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    ctx.save();
    ctx.globalAlpha = 0.98;

    // Dois irmãos do britpop em uma plataforma voadora: cabelos, postura e
    // micro-movimento distintos evitam que a referência pareça estática.
    const britX = 142 + Math.sin(time * 0.8) * 50;
    const britY = 118 + Math.sin(time * 1.6) * 13;
    ctx.save();
    ctx.translate(britX, britY);
    ctx.rotate(Math.sin(time * 1.6) * 0.04);
    ctx.fillStyle = 'rgba(13, 24, 46, 0.92)';
    ctx.strokeStyle = '#61d8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 24, 74, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    [-24, 24].forEach((offset, index) => {
      const bob = Math.sin(time * 2.1 + index * 1.6) * 3;
      ctx.fillStyle = index === 0 ? '#1d2740' : '#41233d';
      ctx.fillRect(offset - 9, -2 + bob, 18, 29);
      ctx.fillStyle = '#f0be9b';
      ctx.beginPath();
      ctx.arc(offset, -11 + bob, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = index === 0 ? '#27242a' : '#6f432d';
      ctx.beginPath();
      ctx.arc(offset - 1, -17 + bob, 11, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d5f9ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(offset - 5, 27);
      ctx.lineTo(offset - 10, 42);
      ctx.moveTo(offset + 5, 27);
      ctx.lineTo(offset + 10, 42);
      ctx.stroke();
    });
    ctx.restore();
    drawLabel('BRITPOP BROS', britX, britY + 57, '#8defff');

    // Brasão azul com um galo pixelado: referência futebolística estilizada,
    // sem reproduzir o escudo oficial.
    const crestX = canvasWidth - 118 + Math.sin(time * 0.92 + 1) * 34;
    const crestY = 160 + Math.cos(time * 1.35) * 22;
    ctx.save();
    ctx.translate(crestX, crestY);
    ctx.rotate(Math.sin(time * 1.35) * 0.12);
    ctx.fillStyle = '#e9f5ff';
    ctx.strokeStyle = '#163f77';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(27, -25);
    ctx.lineTo(22, 27);
    ctx.lineTo(0, 43);
    ctx.lineTo(-22, 27);
    ctx.lineTo(-27, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#173f78';
    ctx.beginPath();
    ctx.arc(0, -7, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, 1, 6, 20);
    ctx.fillRect(-14, 17, 28, 4);
    ctx.beginPath();
    ctx.moveTo(5, -11);
    ctx.lineTo(15, -17);
    ctx.lineTo(9, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawLabel('N17 SKY CREST', crestX, crestY + 58, '#b9e7ff');

    // Corredor e banco flutuante, numa piscadela para filmes de estrada.
    const runnerX = 120 + Math.sin(time * 1.1 + 2) * 46;
    const runnerY = canvasHeight - 112 + Math.sin(time * 1.9 + 1) * 14;
    ctx.save();
    ctx.translate(runnerX, runnerY);
    ctx.rotate(Math.sin(time * 1.9 + 1) * 0.045);
    ctx.strokeStyle = '#ffd77a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-48, 20);
    ctx.lineTo(50, 20);
    ctx.moveTo(-40, 20);
    ctx.lineTo(-48, 36);
    ctx.moveTo(40, 20);
    ctx.lineTo(48, 36);
    ctx.stroke();
    const stride = Math.sin(time * 6) * 10;
    ctx.fillStyle = '#dceaff';
    ctx.fillRect(-6, -14, 13, 25);
    ctx.fillStyle = '#f2c39e';
    ctx.beginPath();
    ctx.arc(1, -25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e7f4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-2, 10);
    ctx.lineTo(-16, 27 + stride * 0.35);
    ctx.moveTo(4, 10);
    ctx.lineTo(18, 27 - stride * 0.35);
    ctx.moveTo(-5, -5);
    ctx.lineTo(-19, 5 - stride * 0.2);
    ctx.moveTo(7, -5);
    ctx.lineTo(22, 4 + stride * 0.2);
    ctx.stroke();
    ctx.restore();
    drawLabel('RUN, LEGEND, RUN', runnerX, runnerY + 56, '#ffe8a6');

    ctx.restore();
  }

  // --- CENÁRIO PARALLAX DINÂMICO MULTI-PAÍSES (TÓQUIO -> BRASIL -> EUROPA -> EGITO) ---
  drawParallaxBackground(ctx, camera, canvasWidth, canvasHeight, mapWidth) {
    ctx.save();
    const camX = camera.x;

    // Determinar bioma predominante pelo camX
    // 0 -> 1300: Tóquio | 1300 -> 2500: Brasil | 2500 -> 3700: Europa | 3700+: Egito (Pirâmides)
    let region = 'tokyo';
    if (camX > 3500) region = 'egypt';
    else if (camX > 2300) region = 'europe';
    else if (camX > 1100) region = 'brazil';

    // 1. CÉU E GRADIENTES POR PAÍS
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);

    if (region === 'tokyo') {
      // Tóquio: Crepúsculo Cyberpunk Magenta / Roxo
      skyGrad.addColorStop(0, '#0a091a');
      skyGrad.addColorStop(0.4, '#1b1233');
      skyGrad.addColorStop(0.7, '#3c184e');
      skyGrad.addColorStop(0.9, '#6d1b5b');
      skyGrad.addColorStop(1, '#ff3366');
    } else if (region === 'brazil') {
      // Brasil: Pôr-do-sol Tropical Dourado / Laranja
      skyGrad.addColorStop(0, '#0c1b24');
      skyGrad.addColorStop(0.35, '#193f40');
      skyGrad.addColorStop(0.65, '#5c481e');
      skyGrad.addColorStop(0.85, '#a6511b');
      skyGrad.addColorStop(1, '#ff8800');
    } else if (region === 'europe') {
      // Europa: Noite Gótica Azul Prateada sob a Lua Cheia
      skyGrad.addColorStop(0, '#050a14');
      skyGrad.addColorStop(0.4, '#0d1829');
      skyGrad.addColorStop(0.7, '#182b45');
      skyGrad.addColorStop(0.9, '#243e61');
      skyGrad.addColorStop(1, '#3a5d8c');
    } else {
      // Egito: MANHÃ DOURADA NO DESERTO com Sol Nascente
      skyGrad.addColorStop(0, '#ffd89b'); // Amarelo suave do amanhecer
      skyGrad.addColorStop(0.35, '#ff8a5a'); // Laranja do sol nascente
      skyGrad.addColorStop(0.65, '#ff6b45'); // Vermelho alaranjado
      skyGrad.addColorStop(0.85, '#d4855b'); // Tom quente de areia
      skyGrad.addColorStop(1, '#c49060'); // Areia dourada no horizonte
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. CORPO CELESTE (Sol de Tóquio, Pôr-do-sol no Brasil, Lua Cheia na Europa ou Lua de Ouro no Egito)
    const celX = canvasWidth * 0.7 - (camX % 1300) * 0.05;
    const celY = 95;

    if (region === 'tokyo') {
      // Sol Vermelho Neon com Monte Fuji
      const fujiGrad = ctx.createRadialGradient(celX, celY, 10, celX, celY, 65);
      fujiGrad.addColorStop(0, '#ffffff');
      fujiGrad.addColorStop(0.3, '#ff0055');
      fujiGrad.addColorStop(0.8, 'rgba(255, 0, 85, 0)');
      ctx.fillStyle = fujiGrad;
      ctx.beginPath();
      ctx.arc(celX, celY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Silhueta do Monte Fuji
      ctx.fillStyle = '#18122b';
      ctx.beginPath();
      ctx.moveTo(celX - 160, canvasHeight - 120);
      ctx.lineTo(celX - 25, celY + 30);
      ctx.lineTo(celX + 25, celY + 30);
      ctx.lineTo(celX + 160, canvasHeight - 120);
      ctx.closePath();
      ctx.fill();
      // Neve no topo do Monte Fuji
      ctx.fillStyle = '#ff66aa';
      ctx.beginPath();
      ctx.moveTo(celX - 35, celY + 45);
      ctx.lineTo(celX - 25, celY + 30);
      ctx.lineTo(celX + 25, celY + 30);
      ctx.lineTo(celX + 35, celY + 45);
      ctx.closePath();
      ctx.fill();

    } else if (region === 'brazil') {
      // Sol Tropical Dourado
      const sunGrad = ctx.createRadialGradient(celX, celY, 15, celX, celY, 80);
      sunGrad.addColorStop(0, '#fff4cc');
      sunGrad.addColorStop(0.3, '#ffaa00');
      sunGrad.addColorStop(0.7, '#ff4400');
      sunGrad.addColorStop(1, 'rgba(255, 68, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(celX, celY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Montanhas Tropicais (Perfil do Pão de Açúcar / Corcovado)
      ctx.fillStyle = '#0f241a';
      ctx.beginPath();
      ctx.arc(celX - 80, canvasHeight - 40, 130, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(celX + 70, canvasHeight - 20, 150, Math.PI, 0);
      ctx.fill();

    } else if (region === 'europe') {
      // Lua Cheia Prateada Gótica
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = '#00d9ff';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(celX, celY, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Silhueta da Torre Eiffel ao Fundo
      ctx.fillStyle = '#0d1522';
      ctx.beginPath();
      ctx.moveTo(celX - 45, canvasHeight - 110);
      ctx.lineTo(celX - 5, celY + 50);
      ctx.lineTo(celX, celY + 10); // Ponta da torre
      ctx.lineTo(celX + 5, celY + 50);
      ctx.lineTo(celX + 45, canvasHeight - 110);
      ctx.closePath();
      ctx.fill();

    } else {
      // Egito: SOL DOURADO DA MANHÃ com Brilho Intenso & Três Grandes Pirâmides de Gizé
      
      // SOL DOURADO BRILHANTE do amanhecer
      const sunGrad = ctx.createRadialGradient(celX, celY, 20, celX, celY, 80);
      sunGrad.addColorStop(0, '#ffffff'); // Centro branco brilhante
      sunGrad.addColorStop(0.3, '#ffeb3b'); // Amarelo intenso
      sunGrad.addColorStop(0.6, '#ff9800'); // Laranja
      sunGrad.addColorStop(1, 'rgba(255, 152, 0, 0)'); // Fade transparente
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(celX, celY, 80, 0, Math.PI * 2);
      ctx.fill();
      
      // Núcleo do sol
      ctx.fillStyle = '#fff9e6';
      ctx.beginPath();
      ctx.arc(celX, celY, 42, 0, Math.PI * 2);
      ctx.fill();

      // AS TRÊS GRANDES PIRÂMIDES DE GIZÉ (Quéops, Quéfren e Miquerinos) - MAIORES!
      const pyrParallax = (camX - 3500) * 0.15;

      // Pirâmide 1 (Grande Pirâmide de Quéops) - GIGANTE!
      const p1x = 240 - pyrParallax;
      ctx.fillStyle = '#2a1f15'; // Sombra mais escura
      ctx.beginPath();
      ctx.moveTo(p1x - 280, canvasHeight - 80); // Base mais larga
      ctx.lineTo(p1x, canvasHeight - 420); // Mais alta
      ctx.lineTo(p1x + 280, canvasHeight - 80);
      ctx.closePath();
      ctx.fill();
      // Face iluminada pelo SOL da manhã (dourado quente)
      ctx.fillStyle = '#d4a373';
      ctx.beginPath();
      ctx.moveTo(p1x, canvasHeight - 420);
      ctx.lineTo(p1x + 280, canvasHeight - 80);
      ctx.lineTo(p1x, canvasHeight - 80);
      ctx.closePath();
      ctx.fill();
      // Capstone Dourado Brilhante no Topo
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(p1x - 30, canvasHeight - 390);
      ctx.lineTo(p1x, canvasHeight - 420);
      ctx.lineTo(p1x + 30, canvasHeight - 390);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pirâmide 2 (Quéfren) - GRANDE!
      const p2x = 580 - pyrParallax;
      ctx.fillStyle = '#24190f';
      ctx.beginPath();
      ctx.moveTo(p2x - 230, canvasHeight - 80);
      ctx.lineTo(p2x, canvasHeight - 380);
      ctx.lineTo(p2x + 230, canvasHeight - 80);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c2956b';
      ctx.beginPath();
      ctx.moveTo(p2x, canvasHeight - 380);
      ctx.lineTo(p2x + 180, canvasHeight - 100);
      ctx.lineTo(p2x, canvasHeight - 100);
      ctx.closePath();
      ctx.fill();

      // A Grande Esfinge de Gizé esculpida no horizonte
      const spx = 760 - pyrParallax;
      ctx.fillStyle = '#2b1a0e';
      ctx.beginPath();
      // Corpo de leão e cabeça de faraó
      ctx.fillRect(spx - 70, canvasHeight - 190, 140, 90);
      ctx.arc(spx - 30, canvasHeight - 210, 32, 0, Math.PI * 2);
      ctx.fill();
      // Olhos dourados brilhantes da Esfinge
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(spx - 42, canvasHeight - 214, 5, 3);
    }

    // 3. CAMADA MIDGROUND DINÂMICA (Parallax 0.3)
    const midP = camX * 0.3;

    if (region === 'tokyo') {
      // Arranha-céus com Kanji Neon e Pagodes
      ctx.fillStyle = '#131124';
      for (let i = -100; i < canvasWidth + 200; i += 110) {
        const bx = ((i - midP) % (canvasWidth + 250) + canvasWidth + 250) % (canvasWidth + 250) - 100;
        const bh = 180 + Math.sin(i * 9) * 70;
        ctx.fillRect(bx, canvasHeight - bh - 100, 75, bh);

        // Telhado de pagode com beirais curvos
        if (i % 2 === 0) {
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.moveTo(bx - 12, canvasHeight - bh - 100);
          ctx.lineTo(bx + 37, canvasHeight - bh - 120);
          ctx.lineTo(bx + 87, canvasHeight - bh - 100);
          ctx.closePath();
          ctx.fill();
        }

        // Placas de Neon em Kanji (東京, 龍, サイバー)
        ctx.fillStyle = (i % 3 === 0) ? '#00d9ff' : ((i % 3 === 1) ? '#ff0055' : '#ffff00');
        ctx.font = '10px sans-serif';
        ctx.fillText(i % 2 === 0 ? '東京' : 'ネオン', bx + 18, canvasHeight - bh - 50);
        ctx.fillStyle = '#131124';
      }

    } else if (region === 'brazil') {
      // Palmeiras Tropicais, Folhagens da Selva & Cachoeiras
      ctx.fillStyle = '#12261a';
      for (let i = -100; i < canvasWidth + 200; i += 130) {
        const tx = ((i - midP) % (canvasWidth + 250) + canvasWidth + 250) % (canvasWidth + 250) - 100;
        const th = 150 + Math.sin(i * 11) * 50;

        // Tronco da palmeira
        ctx.fillRect(tx + 28, canvasHeight - th - 100, 14, th);

        // Copa de palmeira exuberante
        ctx.fillStyle = '#1b4028';
        ctx.beginPath();
        ctx.arc(tx + 35, canvasHeight - th - 105, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#12261a';
      }

    } else if (region === 'europe') {
      // Catedrais Góticas com Torres Pontiagudas & Vitrais
      ctx.fillStyle = '#181d2e';
      for (let i = -100; i < canvasWidth + 200; i += 140) {
        const cx = ((i - midP) % (canvasWidth + 250) + canvasWidth + 250) % (canvasWidth + 250) - 100;
        const ch = 160 + Math.sin(i * 5) * 60;
        ctx.fillRect(cx, canvasHeight - ch - 100, 90, ch);

        // Torre Gótica
        ctx.beginPath();
        ctx.moveTo(cx, canvasHeight - ch - 100);
        ctx.lineTo(cx + 45, canvasHeight - ch - 160);
        ctx.lineTo(cx + 90, canvasHeight - ch - 100);
        ctx.closePath();
        ctx.fill();

        // Vitral circular âmbar iluminado
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(cx + 45, canvasHeight - ch - 60, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#181d2e';
      }

    } else {
      // Egito: Dunas Onduladas de Areia Dourada & Pilares dos Faraós
      ctx.fillStyle = '#422814';
      for (let i = -100; i < canvasWidth + 200; i += 180) {
        const dx = ((i - midP) % (canvasWidth + 300) + canvasWidth + 300) % (canvasWidth + 300) - 100;
        // Dunas suaves
        ctx.beginPath();
        ctx.moveTo(dx, canvasHeight - 100);
        ctx.quadraticCurveTo(dx + 90, canvasHeight - 190, dx + 180, canvasHeight - 100);
        ctx.fill();

        // Obeliscos Egípcios no horizonte
        if (i % 2 === 0) {
          ctx.fillStyle = '#5c381c';
          ctx.beginPath();
          ctx.moveTo(dx + 75, canvasHeight - 100);
          ctx.lineTo(dx + 82, canvasHeight - 240);
          ctx.lineTo(dx + 85, canvasHeight - 255); // Ponta piramidal
          ctx.lineTo(dx + 88, canvasHeight - 240);
          ctx.lineTo(dx + 95, canvasHeight - 100);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#422814';
        }
      }
    }

    // 4. PARTÍCULAS AMBIENTAIS ESPECÍFICAS DA REGIÃO
    this.ambientParticles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (region === 'tokyo') {
        // Pétalas de Sakura Rosas
        ctx.fillStyle = 'rgba(255, 180, 210, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (region === 'brazil') {
        // Vaga-lumes Tropicais Verde-limão
        ctx.fillStyle = 'rgba(160, 255, 60, 0.85)';
        ctx.shadowColor = '#a0ff3c';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (region === 'europe') {
        // Névoa / Fagulhas de Tochas Medievais
        ctx.fillStyle = 'rgba(255, 180, 60, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Tempestade de Areia Dourada do Deserto do Egito
        ctx.fillStyle = 'rgba(255, 204, 102, 0.7)';
        ctx.fillRect(0, 0, p.size * 1.2, p.size * 0.8);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  // --- MAPA / PLATAFORMAS / CHÃO POR REGIÃO DO MUNDO ---
  drawMapElements(ctx, camera, map) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    map.platforms.forEach(plat => {
      const biome = plat.biome || 'tokyo';

      // Sombra projetada no chão
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(plat.x + 4, plat.y + 4, plat.width, plat.height);

      if (plat.isGround) {
        if (biome === 'tokyo') {
          // Asfalto Cyberpunk de Tóquio com faixas de neon
          const gGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
          gGrad.addColorStop(0, '#222538');
          gGrad.addColorStop(0.2, '#161928');
          gGrad.addColorStop(1, '#0d0f1a');
          ctx.fillStyle = gGrad;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Faixa de Neon Ciano e Rosa
          ctx.fillStyle = '#00d9ff';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          ctx.fillStyle = '#ff0055';
          for (let x = plat.x; x < plat.x + plat.width; x += 100) {
            ctx.fillRect(x + 20, plat.y + 12, 35, 3);
          }

        } else if (biome === 'brazil') {
          // Solo de Terra Tropical da Amazônia com Grama e Raízes
          const gGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
          gGrad.addColorStop(0, '#382212');
          gGrad.addColorStop(0.2, '#241408');
          gGrad.addColorStop(1, '#120903');
          ctx.fillStyle = gGrad;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Grama tropical exuberante no topo
          ctx.fillStyle = '#2d6a4f';
          ctx.fillRect(plat.x, plat.y, plat.width, 6);
          ctx.fillStyle = '#52b788';
          for (let x = plat.x; x < plat.x + plat.width; x += 12) {
            ctx.fillRect(x, plat.y - 2, 4, 4);
          }

        } else if (biome === 'europe') {
          // Calçada de Pedras Portuguesas / Paralelepípedos Medievais
          const gGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
          gGrad.addColorStop(0, '#3a4454');
          gGrad.addColorStop(0.2, '#272e3b');
          gGrad.addColorStop(1, '#151921');
          ctx.fillStyle = gGrad;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Padrão de pedras talhadas
          ctx.strokeStyle = '#1b2029';
          ctx.lineWidth = 2;
          for (let x = plat.x; x < plat.x + plat.width; x += 30) {
            ctx.strokeRect(x, plat.y, 30, 20);
            ctx.strokeRect(x + 15, plat.y + 20, 30, 20);
          }

        } else {
          // ARENA DO EGITO: Blocos Maciços de Calcário e Arenito Dourado das Pirâmides
          const gGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
          gGrad.addColorStop(0, '#d4a373');
          gGrad.addColorStop(0.15, '#b07d50');
          gGrad.addColorStop(1, '#4a2f16');
          ctx.fillStyle = gGrad;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Borda dourada polida com areia
          ctx.fillStyle = '#faedcd';
          ctx.fillRect(plat.x, plat.y, plat.width, 5);

          // Grandes lajes de pedra com juntas e relevos de hieróglifos
          ctx.strokeStyle = '#5e3c1e';
          ctx.lineWidth = 3;
          for (let x = plat.x; x < plat.x + plat.width; x += 85) {
            ctx.strokeRect(x, plat.y, 85, 40);
            // Símbolos de hieróglifos dourados entalhados nas pedras
            ctx.fillStyle = '#ffdf7a';
            ctx.font = '10px sans-serif';
            ctx.fillText('𓀀 𓃠 𓆃', x + 15, plat.y + 26);
          }

          // Tochas / Taças de Fogo Sagrado do Faraó iluminando a arena
          for (let tx = plat.x + 80; tx < plat.x + plat.width; tx += 360) {
            // Suporte de bronze dourado
            ctx.fillStyle = '#8f5c38';
            ctx.fillRect(tx - 6, plat.y - 45, 12, 45);
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(tx, plat.y - 45, 14, 0, Math.PI);
            ctx.fill();

            // Chamas ardentes animadas
            const flameH = 18 + Math.sin(this.time * 12 + tx) * 5;
            ctx.fillStyle = '#ff3300';
            ctx.beginPath();
            ctx.moveTo(tx - 12, plat.y - 48);
            ctx.lineTo(tx, plat.y - 48 - flameH);
            ctx.lineTo(tx + 12, plat.y - 48);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(tx, plat.y - 50, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else {
        // PLATAFORMAS SUSPENSAS POR BIOMA
        if (biome === 'tokyo') {
          // Telhado tradicional japonês com telhas vermelhas e lanternas
          ctx.fillStyle = '#8a1c1c';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#ff3344';
          ctx.fillRect(plat.x, plat.y, plat.width, 4);

          // Lanternas vermelhas de papel (Chōchin) penduradas
          ctx.fillStyle = '#ff0033';
          ctx.beginPath();
          ctx.arc(plat.x + 25, plat.y + plat.height + 12, 9, 0, Math.PI * 2);
          ctx.arc(plat.x + plat.width - 25, plat.y + plat.height + 12, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(plat.x + 23, plat.y + plat.height + 8, 4, 8);
          ctx.fillRect(plat.x + plat.width - 27, plat.y + plat.height + 8, 4, 8);

        } else if (biome === 'brazil') {
          // Ponte rústica de troncos de madeira e cipós
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.strokeStyle = '#2b7a4b'; // Cipós verdes
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(plat.x, plat.y);
          ctx.lineTo(plat.x + plat.width, plat.y);
          ctx.stroke();

        } else if (biome === 'europe') {
          // Passarela de pedra de castelo medieval com parapeito
          ctx.fillStyle = '#3f495a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#60728c';
          ctx.fillRect(plat.x, plat.y, plat.width, 4);

        } else {
          // Passarela sagrada de arenito egípcio com relevos
          ctx.fillStyle = '#c68b59';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#faedcd';
          ctx.fillRect(plat.x, plat.y, plat.width, 5);
          ctx.fillStyle = '#5e3c1e';
          ctx.font = '8px sans-serif';
          ctx.fillText('𓇯 𓈖 𓊪 𓋹', plat.x + 20, plat.y + 14);
        }
      }
    });

    // Obstáculos Destrutíveis
    if (map.destructibles) {
      map.destructibles.forEach(obj => {
        if (obj.destroyed) return;
        ctx.save();
        ctx.translate(obj.x, obj.y);

        const objectBiome = obj.biome || 'tokyo';
        if (obj.type === 'barrel') {
          const barrelColors = {
            tokyo: ['#4f107a', '#c026d3', '#240044'],
            brazil: ['#31572c', '#76a743', '#18351a'],
            europe: ['#475569', '#94a3b8', '#1e293b'],
            egypt: ['#8f5c38', '#f6bd60', '#4a2f16']
          }[objectBiome];
          const bGrad = ctx.createLinearGradient(0, 0, obj.width, 0);
          bGrad.addColorStop(0, barrelColors[0]);
          bGrad.addColorStop(0.5, barrelColors[1]);
          bGrad.addColorStop(1, barrelColors[2]);
          ctx.fillStyle = bGrad;
          ctx.fillRect(0, 0, obj.width, obj.height);
          ctx.fillStyle = '#222';
          ctx.fillRect(0, 6, obj.width, 4);
          ctx.fillRect(0, obj.height - 10, obj.width, 4);
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.arc(obj.width / 2, obj.height / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const crateColors = {
            tokyo: '#1e3a5f', brazil: '#61482b', europe: '#4a5568', egypt: '#a66a3f'
          };
          ctx.fillStyle = crateColors[objectBiome];
          ctx.fillRect(0, 0, obj.width, obj.height);
          ctx.strokeStyle = objectBiome === 'egypt' ? '#ffdf7a' : '#3d2b17';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, obj.width, obj.height);
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

    // Direção horizontal (1 = Direita, -1 = Esquerda). Fora do spin, a
    // direção do personagem precisa ser usada diretamente; o valor padrão 1
    // de spinScaleX era o que impedia Jessica de virar para a esquerda.
    const displayDirection = (p.isSpinning && p.weapon === 'AXE') ? spinScaleX : p.facing;
    const characterScale = 1.14;
    ctx.translate(0, -3);
    ctx.scale((displayDirection || p.facing) * characterScale, characterScale);

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

    // Inclinação dinâmica ao correr - MAIS FLUIDA!
    if (isRunning && !p.isAttacking) {
      ctx.rotate(runCycle * 0.08); // Aumento de 0.05 para 0.08 - mais dinâmico
    }

    // Pose de ataque com machado (inclinação para frente)
    if (p.isAttacking && charId === 'claudio') {
      ctx.rotate(p.facing * 0.15);
      ctx.translate(p.facing * 8, -3);
    }
    
    // Pose de arco para Jessica - MELHORADA!
    if (p.weapon === 'BOW' && charId === 'jessica' && isRunning) {
      ctx.rotate(p.facing * 0.06); // Leve inclinação ao correr com arco
    }

    // Definição de Cores Base por Personagem
    let skinColor = '#e8b896'; // Tom de pele natural de Claudio
    let pantsColor = '#0f172a'; // Calça preta tática para Claudio
    let bootsColor = '#05070a';
    
    if (charId === 'jessica') {
      skinColor = '#fcd5be'; // Tom de pele delicado e natural de Jessica
      pantsColor = '#64748b'; // Calça cargo cinza para Jessica
      bootsColor = '#0f172a'; // Tênis All Star preto e branco
    } else if (charId === 'marco') {
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

    // 1. Pernas & Calçados (Botas ou Tênis All Star)
    ctx.fillStyle = pantsColor;
    if (isCrouching) {
      // Agachado
      ctx.fillRect(-10, 8, 12, 10);
      ctx.fillRect(2, 10, 10, 8);
      // Calçados
      ctx.fillStyle = bootsColor;
      ctx.fillRect(-12, 16, 14, 6);
      ctx.fillRect(2, 16, 14, 6);
      if (charId === 'jessica') {
        // Biqueira e sola branca do All Star
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, 18, 5, 4);
        ctx.fillRect(11, 18, 5, 4);
        ctx.fillRect(-12, 21, 14, 2);
        ctx.fillRect(2, 21, 14, 2);
      }
    } else if (p.onGround) {
      // Correndo ou Parado
      const leg1Angle = runCycle * 0.6;
      const leg2Angle = -runCycle * 0.6;

      // Perna Esquerda / Trás
      ctx.save();
      ctx.translate(-4, hipY);
      ctx.rotate(leg2Angle);
      ctx.fillRect(-3, 0, 7, 14);
      if (charId === 'jessica') {
        // Bolsos da calça cargo cinza
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, 4, 2, 6);
        // Tênis All Star
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, 12, 10, 6);
        ctx.fillStyle = '#ffffff'; // Biqueira e sola branca
        ctx.fillRect(-4, 14, 3, 4);
        ctx.fillRect(-4, 17, 10, 2);
      } else {
        ctx.fillStyle = bootsColor; // Bota tática preta
        ctx.fillRect(-4, 12, 10, 6);
      }
      ctx.restore();

      // Perna Direita / Frente
      ctx.save();
      ctx.translate(4, hipY);
      ctx.rotate(leg1Angle);
      ctx.fillStyle = pantsColor;
      ctx.fillRect(-3, 0, 7, 14);
      if (charId === 'jessica') {
        // Bolsos da calça cargo cinza
        ctx.fillStyle = '#475569';
        ctx.fillRect(5, 4, 2, 6);
        // Tênis All Star
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, 12, 10, 6);
        ctx.fillStyle = '#ffffff'; // Biqueira e sola branca
        ctx.fillRect(3, 14, 3, 4);
        ctx.fillRect(-4, 17, 10, 2);
      } else {
        ctx.fillStyle = bootsColor; // Bota tática preta
        ctx.fillRect(-4, 12, 10, 6);
      }
      ctx.restore();
    } else {
      // No Ar / Pulando
      ctx.fillRect(-8, hipY, 7, 10);
      ctx.fillRect(2, hipY - 2, 7, 8);
      ctx.fillStyle = bootsColor;
      ctx.fillRect(-9, hipY + 8, 9, 6);
      ctx.fillRect(2, hipY + 5, 9, 6);
      if (charId === 'jessica') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9, hipY + 12, 9, 2);
        ctx.fillRect(2, hipY + 9, 9, 2);
      }
    }

    // 2. Torso e Vestimentas
    ctx.save();
    ctx.translate(0, torsoY);

    if (charId === 'claudio') {
      // --- CLAUDIO: Camisa Branca Social Tática com Gola Aberta e Calça Preta ---
      // Coldre tático nas costas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-15, -9, 8, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-14, -7, 6, 5);
      
      // Camisa Branca Social com Caimento Impecável
      const shirtGrad = ctx.createLinearGradient(-8, -12, 10, 4);
      shirtGrad.addColorStop(0, '#ffffff');
      shirtGrad.addColorStop(0.7, '#f8fafc');
      shirtGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = shirtGrad;
      ctx.fillRect(-8, -12, 18, 16);

      // Borda preta interna do decote / gola em V
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

      // Gola Social Branca Estruturada
      ctx.fillStyle = '#ffffff';
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

      // Botões da Camisa prateados
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Cinto Tático de Couro Escuro com Fivela Prateada
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, 2, 18, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-1, 2, 6, 5);

    } else if (charId === 'jessica') {
      // --- JESSICA: Roupa Preta Elegante, Aljava de Flechas e Correia Tática ---
      // Aljava de Flechas nas costas (Quiver)
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(-14, -14, 7, 18);
      ctx.fillStyle = '#b45309'; // Correias de couro da aljava
      ctx.fillRect(-14, -10, 7, 2);
      ctx.fillRect(-14, -2, 7, 2);
      // Penas das flechas saindo no topo da aljava
      ctx.fillStyle = '#00d9ff';
      ctx.fillRect(-13, -18, 2, 5);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-10, -19, 2, 6);
      ctx.fillStyle = '#00d9ff';
      ctx.fillRect(-7, -17, 2, 4);

      // Blusa Preta de Gola Alta / Manga Longa Ajustada
      const topGrad = ctx.createLinearGradient(-8, -12, 10, 4);
      topGrad.addColorStop(0, '#18181b');
      topGrad.addColorStop(0.5, '#09090b');
      topGrad.addColorStop(1, '#000000');
      ctx.fillStyle = topGrad;
      ctx.fillRect(-8, -12, 18, 16);

      // Gola Alta Preta Delicada
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-3, -14, 10, 4);

      // Correia Tática Transversal em Couro com Fivela de Prata
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(8, 2);
      ctx.lineTo(6, 4);
      ctx.lineTo(-8, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#00ffff'; // Broche / Emblema neon
      ctx.fillRect(-1, -5, 3, 3);

      // Cinto da Calça Cargo com fivela
      ctx.fillStyle = '#334155';
      ctx.fillRect(-8, 2, 18, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-1, 2, 5, 4);

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
      // Cabelo Escuro com Topete e Fade Gradual Suave Fiel à Foto
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
        ctx.fillRect(4, -24, 2.5, 12);
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

    } else if (charId === 'jessica') {
      // === JESSICA: CABELO LONGO CASTANHO ESCURO LISO, OLHOS EXPRESSIVOS E DETALHES FIÉIS À FOTO ===
      // Cabelo Longo Castanho Escuro Sedoso descendo pelas costas e ombros
      ctx.fillStyle = '#1e1510';
      // Parte de trás do cabelo longo
      ctx.fillRect(-7, -25, 16, 26);
      ctx.fillRect(-8, -18, 6, 20); // Mecha esquerda caindo pelas costas
      ctx.fillRect(5, -18, 6, 20); // Mecha direita caindo sobre o ombro

      // Topo e Franja do Cabelo
      ctx.fillStyle = '#2d1e17';
      ctx.fillRect(-5, -26, 14, 6);
      // Divisão do cabelo no meio/lateral e mechas frontais
      ctx.fillStyle = '#3a271e';
      ctx.fillRect(-4, -24, 5, 4);
      ctx.fillRect(2, -24, 6, 4);

      // Olhos Castanhos Expressivos e Bonitos
      ctx.fillStyle = '#1c130d';
      ctx.fillRect(3, -19, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, -19, 1, 1); // Brilho encantador no olhar

      // Sobrancelhas Arqueadas Delicadas e Delineadas
      ctx.fillStyle = '#261811';
      ctx.fillRect(2, -21, 5, 1.2);

      // Lábios Suaves com Leve Tom Rosado Natural
      ctx.fillStyle = '#e07a7a';
      ctx.fillRect(3, -14, 4, 1.5);

      // Brinco Discreto e Elegante
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-5, -17, 1.5, 1.5);

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

      case 'BOW':
        // --- ARCO TÁTICO CYBER DA JESSICA (CURVAS EM FIBRA DE CARBONO E CORDA DE ENERGIA CIANO) ---
        ctx.save();
        ctx.translate(6, -2);
        
        // Empunhadura Riser Central em Carbono
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, -6, 5, 12);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(1, -3, 3, 6); // Núcleo de energia ciano

        // Membros do Arco Recurvo (Laminas Superior e Inferior)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        // Membro Superior
        ctx.moveTo(2, -5);
        ctx.quadraticCurveTo(8, -16, 2, -24);
        ctx.stroke();
        // Membro Inferior
        ctx.beginPath();
        ctx.moveTo(2, 5);
        ctx.quadraticCurveTo(8, 16, 2, 24);
        ctx.stroke();

        // Linhas de Detalhe Neon nas Lâminas
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(3, -6);
        ctx.quadraticCurveTo(7, -15, 3, -22);
        ctx.moveTo(3, 6);
        ctx.quadraticCurveTo(7, 15, 3, 22);
        ctx.stroke();

        // Corda de Plasma / Energia Luminescente
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(2, -24);
        ctx.lineTo(-4, 0); // Ponto de tração
        ctx.lineTo(2, 24);
        ctx.stroke();

        // Flecha Encaixada Pronta para o Disparo (Nocked Arrow)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-6, -1, 24, 2); // Haste
        ctx.fillStyle = '#00ffff'; // Ponta de energia brilhante
        ctx.beginPath();
        ctx.moveTo(18, -3);
        ctx.lineTo(24, 0);
        ctx.lineTo(18, 3);
        ctx.closePath();
        ctx.fill();
        // Penas traseiras da flecha
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-6, -3, 3, 2);
        ctx.fillRect(-6, 1, 3, 2);

        ctx.shadowBlur = 0;
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

  // --- FRAGMENTOS DA EXECUÇÃO DO CLAUDIO ---
  drawExecutionEffects(ctx, camera, effects) {
    if (!effects || effects.length === 0) return;

    const palette = {
      tokyo: ['#1e293b', '#00d9ff'],
      brazil: ['#355e3b', '#a0ff3c'],
      europe: ['#475569', '#ffcc00'],
      egypt: ['#8f5c38', '#ffd700']
    };

    ctx.save();
    effects.forEach(effect => {
      const [armor, accent] = palette[effect.biome] || palette.tokyo;
      const progress = Math.max(0, effect.life / effect.maxLife);
      const split = effect.split * (effect.direction || 1);

      ctx.save();
      ctx.translate(effect.x - camera.x, effect.y - camera.y - effect.rise);
      ctx.globalAlpha = progress;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 14 * progress;

      // Metade esquerda do inimigo, arremessada para fora.
      ctx.save();
      ctx.translate(-split, -effect.split * 0.22);
      ctx.rotate(-0.18 * (effect.direction || 1));
      ctx.fillStyle = armor;
      ctx.beginPath();
      ctx.moveTo(-14, -22);
      ctx.lineTo(-1, -18);
      ctx.lineTo(-2, 19);
      ctx.lineTo(-15, 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(-12, -8, 9, 3);
      ctx.restore();

      // Metade direita, espelhada, deixando a divisão visual nítida.
      ctx.save();
      ctx.translate(split, effect.split * 0.22);
      ctx.rotate(0.18 * (effect.direction || 1));
      ctx.fillStyle = armor;
      ctx.beginPath();
      ctx.moveTo(14, -22);
      ctx.lineTo(1, -18);
      ctx.lineTo(2, 19);
      ctx.lineTo(15, 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(3, -8, 9, 3);
      ctx.restore();

      // Traço rúnico do machado no ponto da divisão.
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, -30);
      ctx.lineTo(4, 27);
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 7;
      ctx.globalAlpha = progress * 0.45;
      ctx.beginPath();
      ctx.moveTo(-3, -30);
      ctx.lineTo(4, 27);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  // --- INIMIGOS ADAPTADOS A CADA BIOMA COM IDENTIDADE VISUAL ÚNICA ---
  drawEnemy(ctx, camera, e) {
    ctx.save();
    ctx.translate(e.x - camera.x + e.width / 2, e.y - camera.y + e.height / 2);
    // Leve aumento visual para os inimigos não parecerem miniaturas perto do
    // cenário, sem alterar as hitboxes e o equilíbrio do combate.
    ctx.translate(0, -2);
    ctx.scale(e.facing * 1.1, 1.1);

    if (e.flashTimer > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    const biome = e.biome || 'tokyo';

    // Sombra projetada
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, e.height / 2 - 1, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (e.type === 'soldier') {
      const walk = Math.sin(this.time * 12 + e.id) * 0.4;

      if (biome === 'tokyo') {
        // [TÓQUIO] Soldado Cyberpunk Tático com Visor Neon e Exoesqueleto
        ctx.fillStyle = '#111424';
        ctx.fillRect(-6 + walk * 4, 4, 5, 12);
        ctx.fillRect(2 - walk * 4, 4, 5, 12);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(-6 + walk * 4, 8, 5, 2); // Linhas de neon nas pernas
        ctx.fillRect(2 - walk * 4, 8, 5, 2);

        ctx.fillStyle = '#1e243b';
        ctx.fillRect(-7, -8, 14, 14); // Colete blindado
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-7, -2, 14, 2); // Faixa de neon magenta

        // Capacete Cyber com Visor Ciano Brilhante
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(-4, -18, 10, 10);
        ctx.fillStyle = '#00d9ff';
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 6;
        ctx.fillRect(0, -15, 6, 3);
        ctx.shadowBlur = 0;

        // Rifle de Plasma Cyberpunk
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(2, -5, 18, 5);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(8, -4, 6, 2);

      } else if (biome === 'brazil') {
        // [BRASIL] Guerrilheiro da Selva com Camuflagem, Bandana Vermelha e Colete
        ctx.fillStyle = '#2d3b24'; // Calça camuflada
        ctx.fillRect(-6 + walk * 4, 4, 5, 12);
        ctx.fillRect(2 - walk * 4, 4, 5, 12);

        ctx.fillStyle = '#415233'; // Camisa militar
        ctx.fillRect(-7, -8, 14, 14);
        ctx.fillStyle = '#61472a'; // Coldre e canivete
        ctx.fillRect(-7, -1, 14, 3);

        // Cabeça com Bandana Vermelha
        ctx.fillStyle = '#e8a974';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#d91414'; // Bandana vermelha
        ctx.fillRect(-5, -17, 11, 4);
        ctx.fillRect(-7, -15, 3, 6); // Ponta da bandana ao vento

        // Fuzil com coronha de madeira
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(-2, -3, 6, 4);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(2, -4, 16, 4);

      } else if (biome === 'europe') {
        // [EUROPA] Guarda Real do Castelo com Sobretudo Azul-Marinho e Botões Dourados
        ctx.fillStyle = '#1c2233';
        ctx.fillRect(-6 + walk * 4, 4, 5, 12);
        ctx.fillRect(2 - walk * 4, 4, 5, 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(-7 + walk * 4, 12, 7, 5);
        ctx.fillRect(1 - walk * 4, 12, 7, 5);

        ctx.fillStyle = '#203254'; // Casaco clássico
        ctx.fillRect(-7, -8, 14, 14);
        ctx.fillStyle = '#ffcc00'; // Botões dourados
        ctx.fillRect(-1, -6, 2, 2);
        ctx.fillRect(-1, -2, 2, 2);

        // Quepe Militar com Insígnia
        ctx.fillStyle = '#f0be8b';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#152238';
        ctx.fillRect(-6, -19, 13, 5);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(0, -18, 3, 2);

        // Carabina Clássica
        ctx.fillStyle = '#4a2f1b';
        ctx.fillRect(-2, -4, 18, 4);
        ctx.fillStyle = '#8a99ad';
        ctx.fillRect(12, -4, 6, 3);

      } else {
        // [EGITO] Soldado dos Faraós com Armadura Dourada e Lápis-Lazúli
        ctx.fillStyle = '#2c1e13';
        ctx.fillRect(-6 + walk * 4, 4, 5, 12);
        ctx.fillRect(2 - walk * 4, 4, 5, 12);

        ctx.fillStyle = '#b07d50'; // Túnica do deserto
        ctx.fillRect(-7, -8, 14, 14);
        ctx.fillStyle = '#ffd700'; // Peitoral de ouro
        ctx.fillRect(-6, -8, 12, 6);
        ctx.fillStyle = '#0066cc'; // Lápis-lazúli
        ctx.fillRect(-3, -6, 6, 3);

        // Tocado Egípcio Nemes Dourado e Azul
        ctx.fillStyle = '#e8a974';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-5, -20, 11, 6);
        ctx.fillStyle = '#0066cc';
        ctx.fillRect(-5, -17, 11, 2);

        // Lança/Fuzil de Energia Dourada
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(2, -4, 18, 4);
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(16, -5, 4, 6);
      }

    } else if (e.type === 'shield') {
      if (biome === 'tokyo') {
        // [TÓQUIO] Tropa de Choque Cyber com Escudo de Barreira Holográfica
        ctx.fillStyle = '#111424';
        ctx.fillRect(-6, 2, 12, 14);
        ctx.fillStyle = '#1a2238';
        ctx.fillRect(-8, -10, 14, 14);

        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(-4, -18, 10, 9);
        ctx.fillStyle = '#ff0055'; // Visor neon rosa
        ctx.fillRect(1, -15, 5, 2);

        // Escudo Holográfico Neon Ciano
        ctx.fillStyle = 'rgba(0, 217, 255, 0.45)';
        ctx.fillRect(6, -20, 10, 36);
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, -20, 10, 36);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, -10, 4, 14); // Padrão hexagonal de energia

      } else if (biome === 'brazil') {
        // [BRASIL] Guardião Tribal com Escudo de Máscara de Madeira Rústica
        ctx.fillStyle = '#3d2514';
        ctx.fillRect(-6, 2, 12, 14);
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(-8, -10, 14, 14);

        ctx.fillStyle = '#e8a974';
        ctx.fillRect(-4, -18, 10, 9);
        ctx.fillStyle = '#2b7a4b'; // Pintura de guerra verde
        ctx.fillRect(1, -15, 5, 3);

        // Escudo de Máscara Tribal com Pintura Sagrada
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(6, -22, 12, 38);
        ctx.strokeStyle = '#a0ff3c'; // Olhos e boca esculpidos brilhantes
        ctx.lineWidth = 2;
        ctx.strokeRect(6, -22, 12, 38);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(9, -15, 6, 4); // Olhos da máscara
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(9, -2, 6, 6);  // Boca de guerra

      } else if (biome === 'europe') {
        // [EUROPA] Cavaleiro Gótico com Armadura de Placas de Aço e Escudo com Cruz
        ctx.fillStyle = '#334155';
        ctx.fillRect(-6, 2, 12, 14);
        ctx.fillStyle = '#64748b'; // Cota de malha e placas
        ctx.fillRect(-8, -10, 14, 14);

        // Elmo Medieval com Visor de Fenda
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -19, 11, 10);
        ctx.fillStyle = '#000';
        ctx.fillRect(1, -15, 5, 2);

        // Grande Escudo Torre com Cruz Vermelha
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(6, -22, 11, 38);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, -22, 11, 38);
        // Cruz Templária Vermelha
        ctx.fillStyle = '#d91414';
        ctx.fillRect(7, -6, 9, 4);
        ctx.fillRect(10, -16, 3, 24);

      } else {
        // [EGITO] Guardião de Anúbis com Cabeça de Chacal e Escudo de Ouro
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-6, 2, 12, 14);
        ctx.fillStyle = '#292524';
        ctx.fillRect(-8, -10, 14, 14);

        // Máscara de Chacal de Anúbis com Olhos Vermelhos
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-4, -20, 11, 11);
        ctx.beginPath(); // Orelhas pontiagudas de chacal
        ctx.moveTo(-3, -20);
        ctx.lineTo(-1, -26);
        ctx.lineTo(2, -20);
        ctx.moveTo(3, -20);
        ctx.lineTo(5, -26);
        ctx.lineTo(8, -20);
        ctx.fill();
        ctx.fillStyle = '#ff0033'; // Olhos vermelhos
        ctx.fillRect(2, -16, 4, 2);

        // Escudo de Ouro do Faraó com Escaravelho
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(6, -22, 12, 38);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, -22, 12, 38);
        ctx.fillStyle = '#0284c7'; // Escaravelho de lápis-lazúli
        ctx.beginPath();
        ctx.arc(12, -3, 4, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (e.type === 'rocket_trooper') {
      if (biome === 'tokyo') {
        ctx.fillStyle = '#111424';
        ctx.fillRect(-6, 4, 12, 12);
        ctx.fillRect(-8, -8, 14, 14);
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(1, -15, 4, 3);
        // Lançador de Mísseis Cyber
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -14, 28, 7);
        ctx.fillStyle = '#00d9ff';
        ctx.fillRect(18, -13, 4, 5);

      } else if (biome === 'brazil') {
        ctx.fillStyle = '#2d3b24';
        ctx.fillRect(-6, 4, 12, 12);
        ctx.fillRect(-8, -8, 14, 14);
        ctx.fillStyle = '#e8a974';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(-5, -18, 12, 5);
        // Bazuca Camuflada de Selva
        ctx.fillStyle = '#1e381f';
        ctx.fillRect(-8, -14, 28, 7);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(18, -13, 4, 5);

      } else if (biome === 'europe') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(-6, 4, 12, 12);
        ctx.fillRect(-8, -8, 14, 14);
        ctx.fillStyle = '#f0be8b';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#854d0e'; // Óculos de proteção steampunk
        ctx.fillRect(-4, -16, 10, 4);
        // Canhão de Mísseis de Latão Steampunk
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-8, -14, 28, 8);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(18, -14, 4, 8);

      } else {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-6, 4, 12, 12);
        ctx.fillRect(-8, -8, 14, 14);
        ctx.fillStyle = '#e8a974';
        ctx.fillRect(-3, -16, 8, 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-4, -18, 10, 6);
        // Canhão Solar de Rá
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-8, -14, 28, 7);
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(18, -14, 5, 7);
      }

    } else if (e.type === 'drone') {
      const hover = Math.sin(this.time * 8 + e.id) * 3;
      ctx.translate(0, hover);

      if (biome === 'tokyo') {
        // Drone Cyberpunk Quadricóptero com Holo-Scanner
        ctx.fillStyle = 'rgba(0, 217, 255, 0.7)';
        const propW = Math.abs(Math.sin(this.time * 30)) * 36;
        ctx.fillRect(-propW / 2, -16, propW, 3);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, -6, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00d9ff';
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(6, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (biome === 'brazil') {
        // Drone Camuflado da Selva
        ctx.fillStyle = 'rgba(160, 255, 60, 0.7)';
        const propW = Math.abs(Math.sin(this.time * 30)) * 36;
        ctx.fillRect(-propW / 2, -16, propW, 3);

        ctx.fillStyle = '#1e381f';
        ctx.beginPath();
        ctx.ellipse(0, -6, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(6, -6, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (biome === 'europe') {
        // Autômato Voador Steampunk de Latão com Engrenagens
        ctx.fillStyle = '#ca8a04';
        const propW = Math.abs(Math.sin(this.time * 25)) * 34;
        ctx.fillRect(-propW / 2, -16, propW, 4);

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b'; // Fornalha de vapor brilhante
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(5, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else {
        // Escaravelho Voador de Ouro do Egito
        ctx.fillStyle = '#ffd700'; // Asas douradas
        const wingFlap = Math.sin(this.time * 35) * 12;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-18, -16 + wingFlap);
        ctx.lineTo(-6, -6);
        ctx.moveTo(0, -6);
        ctx.lineTo(18, -16 + wingFlap);
        ctx.lineTo(6, -6);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, -6, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0033'; // Joia solar central
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(4, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
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

  // --- CHEFÃO TITÃ (MECHAGODZILLA DINÂMICO HD - APEX TITAN DO EGITO) ---
  drawBoss(ctx, camera, boss) {
    if (boss.hiddenByDragon) return;
    ctx.save();
    const renderX = boss.cinematicX ?? boss.x;
    const renderY = boss.cinematicY ?? boss.y;
    const posX = renderX - camera.x + boss.width / 2 + (boss.recoilX || 0);
    const posY = renderY - camera.y + boss.height / 2;
    ctx.translate(posX, posY);
    ctx.rotate(boss.cinematicTilt || 0);
    ctx.scale(boss.cinematicScale || 1, boss.cinematicScale || 1);
    ctx.globalAlpha = boss.cinematicOpacity ?? 1;

    if (boss.flashTimer > 0) {
      ctx.filter = 'brightness(2.6)';
    }

    const hpRatio = boss.hp / boss.maxHp;
    const isCharging = boss.state === 'PREPARE_LASER';
    const isFiring = boss.laserActive || boss.state === 'FIRE_LASER';
    const isWalking = boss.state === 'WALK' || boss.state === 'RUSH';
    const isStomping = boss.state === 'TITAN_STOMP';
    const isMissile = boss.state === 'MISSILE_SALVO';
    const isRecoil = boss.state === 'RECOIL_LASER';

    // 1. Sombra Gigantesca Dinâmica no Solo do Egito
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, boss.height / 2 - 6, boss.width / 2 + 35, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trilhas de plasma deixam o dash impossível de confundir com caminhada.
    if (boss.state === 'RUSH') {
      ctx.save();
      const trailDirection = -(boss.facing || -1);
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255, 45, 45, 0.78)';
      ctx.shadowColor = '#ff3b18';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 9;
      for (let trail = 0; trail < 5; trail++) {
        const y = -72 + trail * 30 + Math.sin(boss.animTime * 24 + trail) * 8;
        ctx.beginPath();
        ctx.moveTo(trailDirection * 24, y);
        ctx.lineTo(trailDirection * (150 + trail * 28), y + Math.sin(boss.animTime * 18 + trail) * 9);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Renderização Articulada do MechaGodzilla com Sprites HD
    if (this.mechaSprites && this.mechaSprites.loaded) {
      ctx.save();

      // Inverter horizontalmente com base na direção em que o Titã olha
      ctx.scale(boss.facing || -1, 1);

      // O micro-deslocamento contínuo impede que o sprite pareça preso a uma
      // grade: mesmo parado, o peso do reator e a respiração movem o corpo.
      const gaitSway = Math.sin(boss.animTime * (isWalking ? 7.2 : 3.4)) * (isWalking ? 2.4 : 0.9);
      const impactJitter = (boss.impactWobble || 0) * Math.sin(boss.animTime * 42) * 3;
      ctx.translate(gaitSway + impactJitter, (boss.bodyBob || 0) + (boss.impactOffsetY || 0));
      const totalLean = (boss.bodyLean || 0) + (boss.impactTilt || 0);
      if (totalLean) {
        ctx.rotate(totalLean * (boss.facing || -1));
      }

      // Escolher frame adequado de animação
      let currentSprite = this.mechaSprites.idle;

      if (isFiring) {
        currentSprite = this.mechaSprites.laser;
      } else if (isCharging || isStomping || isRecoil) {
        currentSprite = this.mechaSprites.stance;
      } else if (isWalking) {
        // Ciclo de caminhada com passos pesados
        const walkCycle = [
          this.mechaSprites.walk1,
          this.mechaSprites.stance,
          this.mechaSprites.walk2,
          this.mechaSprites.idle
        ];
        currentSprite = walkCycle[Math.floor(boss.animTime * 6) % 4] || this.mechaSprites.walk1;
      } else if (isMissile || Math.abs(boss.cannonAngle || 0) > 0.08) {
        // A mira só ganha prioridade quando parado. Durante a caminhada, o
        // ciclo de passadas precisa continuar visível para dar peso ao Titã.
        currentSprite = this.mechaSprites.aim;
      } else {
        currentSprite = this.mechaSprites.idle;
      }

      // Brilho pulsante nos espinhos dorsais de titânio
      const spineGlowIntensity = Math.min(45, (boss.spineGlow || 0.4) * 30);
      if (spineGlowIntensity > 5) {
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = spineGlowIntensity;
      }

      // Renderizar o Sprite Oficial
      const spriteW = 270;
      const spriteH = 250;
      ctx.drawImage(currentSprite, -spriteW / 2, -spriteH / 2, spriteW, spriteH);
      ctx.shadowBlur = 0;

      // 3. Olhos / Scanner Óptico Vermelho com Feixe de Mira
      const eyeX = 25;
      const eyeY = -72;
      const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 1, eyeX, eyeY, isCharging ? 22 : 12);
      eyeGlow.addColorStop(0, '#ffffff');
      eyeGlow.addColorStop(0.35, '#ff0033');
      eyeGlow.addColorStop(1, 'rgba(255, 0, 50, 0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, isCharging ? 22 : 12, 0, Math.PI * 2);
      ctx.fill();

      // Feixe de mira laser vermelho projetado nos olhos durante a carga
      if (isCharging) {
        ctx.strokeStyle = 'rgba(255, 0, 50, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(eyeX + 6, eyeY);
        ctx.lineTo(eyeX + 500, eyeY + (boss.headAngle || 0) * 200);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Arcos elétricos de sobrecarga quando HP < 50%
      if (hpRatio < 0.5) {
        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = 2;
        for (let arc = 0; arc < 4; arc++) {
          const ax = (Math.random() - 0.5) * 160;
          const ay = (Math.random() - 0.5) * 160;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + (Math.random() - 0.5) * 25, ay + (Math.random() - 0.5) * 25);
          ctx.lineTo(ax + (Math.random() - 0.5) * 40, ay + (Math.random() - 0.5) * 40);
          ctx.stroke();
        }
      }

      ctx.restore();

    } else {
      // Fallback Procedural
      ctx.fillStyle = '#334155';
      ctx.fillRect(-boss.width / 2, -boss.height / 2, boss.width, boss.height);
    }

    // 4. VÓRTICE DE CARREGAMENTO DE ENERGIA (ANTECIPAÇÃO ANTES DO LASER)
    if (isCharging && boss.chargeParticles) {
      ctx.save();
      const mouthX = (boss.facing === 1 ? 80 : -80);
      const mouthY = -42 + (boss.bodyBob || 0);

      // Núcleo de fusão brilhando intensamente na boca
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 16 + Math.sin(this.time * 25) * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Partículas convergindo para o centro da boca
      boss.chargeParticles.forEach(p => {
        const px = (p.curX || p.x) - (boss.x + boss.width / 2);
        const py = (p.curY || p.y) - (boss.y + boss.height / 2);
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 5. MEGA FEIXE LASER DE PRÓTONS (PROTON SCREAM) CORTANDO A ARENA DO EGITO
    if (isFiring) {
      ctx.save();
      const mouthX = (boss.facing === 1 ? 80 : -80);
      const mouthY = -42 + (boss.bodyBob || 0);

      // Núcleo atômico incandescente na boca do Titã
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Trajetória do Mega Raio Laser
      const beamLength = 1050;
      const beamHeight = 42 + Math.sin(this.time * 40) * 10;
      const startX = mouthX;
      const endX = mouthX + (boss.facing * beamLength);
      const drawStartX = Math.min(startX, endX);

      // Camada 1: Corona Externa de Plasma Vermelho
      ctx.fillStyle = 'rgba(255, 0, 50, 0.75)';
      ctx.fillRect(drawStartX, mouthY - beamHeight / 2, beamLength, beamHeight);

      // Camada 2: Chamas e Energia Alaranjada Incandescente
      ctx.fillStyle = 'rgba(255, 120, 0, 0.9)';
      ctx.fillRect(drawStartX, mouthY - beamHeight / 3, beamLength, beamHeight * 0.66);

      // Camada 3: Núcleo Dourado
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(drawStartX, mouthY - 8, beamLength, 16);

      // Camada 4: Núcleo Branco Puro de Energia Atômica
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawStartX, mouthY - 4, beamLength, 8);

      // Anéis de choque e distorção de onda gravitacional
      for (let r = 0; r < 8; r++) {
        const ringOffset = (r * 125 + ((this.time * 800) % 125));
        const ringX = startX + (boss.facing * ringOffset);
        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(ringX, mouthY, 16, beamHeight * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Arcos de raios no feixe
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let l = 0; l < 4; l++) {
        const lx = startX + (boss.facing * (l * 240 + Math.random() * 80));
        ctx.beginPath();
        ctx.moveTo(lx, mouthY - 10);
        ctx.lineTo(lx + boss.facing * 30, mouthY + (Math.random() - 0.5) * 20);
        ctx.lineTo(lx + boss.facing * 60, mouthY + 10);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.restore();
  }

  // --- DRAGÃO TRICÉFALO — CENA FINAL ORGÂNICA ---
  drawDragon(ctx, camera, dragon) {
    const flapIntensity = ['CARRY', 'RETURN', 'SWEEP', 'IMPACT'].includes(dragon.state) ? 34 : 20;
    const wingLift = Math.sin(dragon.wingPhase) * flapIntensity;
    const wingTwist = Math.cos(dragon.wingPhase * 0.72) * 16;
    const tailWave = Math.sin(dragon.tailPhase) * 16;
    const bodyBreath = Math.sin(dragon.totalTime * 3.3) * 2;

    ctx.save();
    ctx.translate(dragon.x - camera.x, dragon.y - camera.y);
    ctx.rotate(dragon.bank || 0);
    ctx.scale(dragon.facing * dragon.scale, dragon.scale);

    // Sombra ampla e pulsante dá peso ao voo e ao mergulho na câmera.
    ctx.fillStyle = `rgba(12, 7, 2, ${dragon.state === 'IMPACT' ? 0.5 : 0.27})`;
    ctx.beginPath();
    ctx.ellipse(0, 105, 155, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asa traseira: dobradiças e membrana respiram em ritmos diferentes.
    ctx.save();
    ctx.rotate(-0.1 + wingTwist * 0.006);
    ctx.fillStyle = '#6d4b1f';
    ctx.strokeStyle = '#2f1b0b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-25, -15);
    ctx.quadraticCurveTo(-100, -105 - wingLift, -195, -72 - wingLift * 0.55);
    ctx.quadraticCurveTo(-155, -16, -95, 22);
    ctx.lineTo(-34, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#b98c42';
    ctx.lineWidth = 2.5;
    for (let rib = 0; rib < 4; rib++) {
      const startY = -10 + rib * 9;
      ctx.beginPath();
      ctx.moveTo(-22, startY);
      ctx.quadraticCurveTo(-95, -68 - wingLift * 0.55 + rib * 18, -170, -66 - wingLift * 0.5 + rib * 12);
      ctx.stroke();
    }
    ctx.restore();

    // Asa frontal, com outra amplitude para quebrar a simetria mecânica.
    ctx.save();
    ctx.rotate(0.08 - wingTwist * 0.004);
    ctx.fillStyle = '#9a7131';
    ctx.strokeStyle = '#39220d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.quadraticCurveTo(10, -125 + wingLift, -112, -148 + wingLift * 0.7);
    ctx.quadraticCurveTo(-126, -38, -66, 16);
    ctx.lineTo(-12, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#e2bd63';
    ctx.lineWidth = 2.5;
    for (let rib = 0; rib < 4; rib++) {
      ctx.beginPath();
      ctx.moveTo(-4, -13 + rib * 8);
      ctx.quadraticCurveTo(-35, -96 + wingLift * 0.7 + rib * 18, -106, -135 + wingLift * 0.6 + rib * 13);
      ctx.stroke();
    }
    ctx.restore();

    // Cauda longa e flexível: três curvas conectadas simulam coluna e massa.
    ctx.strokeStyle = '#4a2d10';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-62, 20);
    ctx.bezierCurveTo(-122, 42 + tailWave, -165, -3 - tailWave, -226, 34 + tailWave * 0.6);
    ctx.stroke();
    ctx.strokeStyle = '#a87932';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(-64, 16);
    ctx.bezierCurveTo(-124, 37 + tailWave, -164, 2 - tailWave, -224, 31 + tailWave * 0.6);
    ctx.stroke();

    // Corpo oval, peito pesado e placas dorsais em arco.
    ctx.fillStyle = '#7d5926';
    ctx.strokeStyle = '#2e1c0b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(-3, 18 + bodyBreath, 78, 49, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c49a4b';
    ctx.beginPath();
    ctx.ellipse(12, 15 + bodyBreath, 46, 29, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(67, 39, 13, 0.7)';
    ctx.lineWidth = 2;
    for (let scale = -28; scale <= 34; scale += 16) {
      ctx.beginPath();
      ctx.arc(scale, 12 + bodyBreath, 12, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    // Patas articuladas, com atraso no joelho para sugerir peso e sustentação.
    const legSwing = Math.sin(dragon.wingPhase * 0.5) * 9;
    [[-36, 38, -1], [34, 38, 1]].forEach(([lx, ly, side]) => {
      ctx.strokeStyle = '#4b2d10';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + side * 14, 65 + legSwing * side, lx + side * 8, 88);
      ctx.stroke();
      ctx.fillStyle = '#a77830';
      ctx.beginPath();
      ctx.ellipse(lx + side * 11, 90, 20, 9, 0.15 * side, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2b1909';
      ctx.lineWidth = 2;
      for (let claw = -1; claw <= 1; claw++) {
        ctx.beginPath();
        ctx.moveTo(lx + side * (8 + claw * 6), 92);
        ctx.lineTo(lx + side * (21 + claw * 5), 99);
        ctx.stroke();
      }
    });

    // Durante o rasante, as garras entram primeiro e deixam rastros de luz.
    // Isso dá leitura clara de ataque sem redesenhar a identidade do dragão.
    if (dragon.state === 'SWEEP' || dragon.state === 'GRAB') {
      const swipe = Math.sin(dragon.wingPhase * 1.35) * 7;
      ctx.save();
      ctx.translate(48, 36);
      ctx.rotate(-0.42 + swipe * 0.012);
      ctx.strokeStyle = '#4b2d10';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      for (let claw = -1; claw <= 1; claw++) {
        ctx.beginPath();
        ctx.moveTo(claw * 9, 0);
        ctx.quadraticCurveTo(42 + claw * 9, -12, 70 + claw * 11, 11 + swipe * 0.15);
        ctx.stroke();
      }
      if (dragon.state === 'SWEEP') {
        ctx.strokeStyle = 'rgba(202, 248, 255, 0.75)';
        ctx.shadowColor = '#8defff';
        ctx.shadowBlur = 13;
        ctx.lineWidth = 3;
        for (let trail = 0; trail < 3; trail++) {
          ctx.beginPath();
          ctx.moveTo(18, -18 + trail * 14);
          ctx.quadraticCurveTo(67, -34 + trail * 16, 103, -8 + trail * 18);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Três pescoços independentes. Cada um usa fase diferente para evitar a
    // sincronia artificial e dar vida às cabeças do dragão.
    const heads = [-1, 0, 1];
    heads.forEach((head, index) => {
      const neckSway = Math.sin(dragon.headPhase + index * 1.8) * 10;
      const neckY = -20 + head * 20;
      const tipX = 86 + head * 7;
      const tipY = -58 + head * 28 + neckSway;

      ctx.strokeStyle = '#4b2d10';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(40, neckY);
      ctx.quadraticCurveTo(52 + index * 12, neckY - 36 + neckSway, tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = '#aa7b34';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(41, neckY - 1);
      ctx.quadraticCurveTo(56 + index * 10, neckY - 33 + neckSway, tipX, tipY);
      ctx.stroke();

      ctx.save();
      ctx.translate(tipX + 9, tipY);
      ctx.rotate(neckSway * 0.012 + head * 0.05);
      ctx.fillStyle = '#80591f';
      ctx.strokeStyle = '#2b1909';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(21, -8);
      ctx.lineTo(29, 0);
      ctx.lineTo(20, 10);
      ctx.lineTo(-10, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Chifres, olho elétrico e mandíbula independente.
      ctx.fillStyle = '#e8c36b';
      ctx.beginPath();
      ctx.moveTo(1, -10);
      ctx.lineTo(8, -24);
      ctx.lineTo(11, -9);
      ctx.moveTo(12, -9);
      ctx.lineTo(18, -21);
      ctx.lineTo(21, -7);
      ctx.fill();
      ctx.fillStyle = '#c8f7ff';
      ctx.shadowColor = '#7df9ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(16, -4, 7, 3);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#321b08';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(27, 7 + Math.sin(dragon.headPhase * 1.4 + index) * 2);
      ctx.stroke();
      ctx.restore();
    });

    // A aura branca/ciano no mergulho prepara visualmente o impacto.
    if (dragon.state === 'RETURN' || dragon.state === 'IMPACT') {
      const aura = ctx.createRadialGradient(0, 5, 10, 0, 5, 155);
      aura.addColorStop(0, 'rgba(255, 255, 220, 0.34)');
      aura.addColorStop(0.5, 'rgba(80, 220, 255, 0.14)');
      aura.addColorStop(1, 'rgba(80, 220, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 5, 155, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawLightningEffects(ctx, camera, bolts) {
    if (!bolts || bolts.length === 0) return;
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    bolts.forEach(bolt => {
      const alpha = Math.max(0, bolt.life / bolt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#4de8ff';
      ctx.shadowColor = '#baf7ff';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  drawCinematicFlash(ctx, intensity, color = '#ffffff') {
    if (!intensity) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(0.78, intensity);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  // --- PROJÉTEIS E TIROS CINEMÁTICOS ---
  drawProjectiles(ctx, camera, projectiles) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'arrow') {
        // --- FLECHA CYBER PERFURANTE DA JESSICA ---
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Haste da Flecha Prateada/Fibra
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-12, -1, 24, 2);

        // Ponta Perfurante de Energia Ciano / Brilhante
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(20, 0);
        ctx.lineTo(12, 4);
        ctx.closePath();
        ctx.fill();

        // Penas Traseiras da Flecha
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-16, -3);
        ctx.lineTo(-10, -1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-16, 3);
        ctx.lineTo(-10, 1);
        ctx.closePath();
        ctx.fill();

        // Rastro de Luz de Fótons
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-28 - Math.random() * 8, 0);
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (p.type === 'bomb_arrow') {
        // --- FLECHA EXPLOSIVA (BOMB ARROW) ---
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-12, -1.5, 24, 3);

        // Ogiva Explosiva Pulsante Vermelho/Laranja
        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff3300';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(14, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(14, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (p.type === 'bullet') {
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
        // Efeitos podem ser atualizados no mesmo quadro em que são removidos.
        // Clampar aqui evita que uma partícula residual interrompa o canvas.
        ctx.arc(0, 0, Math.max(0.1, p.radius || 0.1), 0, Math.PI * 2);
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
