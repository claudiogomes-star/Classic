// Sistema de Mapa de Fase, Plataformas e Obstáculos de Guerra

class LevelMap {
  constructor(canvasWidth, canvasHeight) {
    this.width = 4200; // Fase longa com múltiplos setores e arena de chefe
    this.height = canvasHeight || 600;

    this.platforms = [];
    this.destructibles = [];
    this.enemySpawners = [];
    this.powSpawns = [];
    this.slugSpawns = [];
    this.bossSpawn = null;

    this.initLevel();
  }

  initLevel() {
    const H = this.height;

    // --- 1. CHÃO PRINCIPAL COM TRINCHEIRAS E BURACOS ---
    // Setor 1: Entrada da Base Inimiga
    this.platforms.push({ x: 0, y: H - 80, width: 900, height: 80, isGround: true });
    // Trincheira 1 (vão de 80px)
    this.platforms.push({ x: 980, y: H - 80, width: 850, height: 80, isGround: true });
    // Trincheira 2 (vão de 100px)
    this.platforms.push({ x: 1930, y: H - 80, width: 1100, height: 80, isGround: true });
    // Arena Final do Chefão (Goliath Arena)
    this.platforms.push({ x: 3100, y: H - 80, width: 1100, height: 80, isGround: true });

    // --- 2. PLATAFORMAS ELEVADAS E PASSARELAS SUSPENSAS ---
    // Passarela Setor 1
    this.platforms.push({ x: 260, y: H - 180, width: 220, height: 18, isGround: false });
    this.platforms.push({ x: 550, y: H - 240, width: 260, height: 18, isGround: false });

    // Passarela sobre a primeira trincheira
    this.platforms.push({ x: 880, y: H - 190, width: 220, height: 18, isGround: false });
    this.platforms.push({ x: 1200, y: H - 250, width: 300, height: 18, isGround: false });
    this.platforms.push({ x: 1350, y: H - 160, width: 240, height: 18, isGround: false });

    // Complexo Industrial Central
    this.platforms.push({ x: 1700, y: H - 210, width: 200, height: 18, isGround: false });
    this.platforms.push({ x: 2050, y: H - 170, width: 280, height: 18, isGround: false });
    this.platforms.push({ x: 2400, y: H - 260, width: 320, height: 18, isGround: false });
    this.platforms.push({ x: 2550, y: H - 160, width: 220, height: 18, isGround: false });

    // Passarelas na Arena do Chefe
    this.platforms.push({ x: 3200, y: H - 200, width: 240, height: 18, isGround: false });
    this.platforms.push({ x: 3550, y: H - 220, width: 260, height: 18, isGround: false });

    // --- 3. OBSTÁCULOS DESTRUTÍVEIS (BARRIS EXPLOSIVOS E CAIXAS) ---
    // Barris vermelhos explosivos (causam explosão em área quando alvejados)
    this.destructibles = [
      { id: 1, x: 420, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },
      { id: 2, x: 740, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },
      { id: 3, x: 1100, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },
      { id: 4, x: 1450, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },
      { id: 5, x: 2200, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },
      { id: 6, x: 2750, y: H - 116, width: 24, height: 36, type: 'barrel', hp: 20, destroyed: false },

      // Caixas de madeira
      { id: 7, x: 300, y: H - 112, width: 32, height: 32, type: 'crate', hp: 30, destroyed: false },
      { id: 8, x: 600, y: H - 272, width: 32, height: 32, type: 'crate', hp: 30, destroyed: false },
      { id: 9, x: 1600, y: H - 112, width: 32, height: 32, type: 'crate', hp: 30, destroyed: false },
      { id: 10, x: 2150, y: H - 202, width: 32, height: 32, type: 'crate', hp: 30, destroyed: false }
    ];

    // --- 4. REFÉNS / POWs ESPALHADOS NA FASE ---
    this.powSpawns = [
      { x: 340, y: H - 222, reward: 'HMG' },
      { x: 1250, y: H - 292, reward: 'SHOTGUN' },
      { x: 1800, y: H - 122, reward: 'ROCKET' },
      { x: 2480, y: H - 302, reward: 'FLAME' },
      { x: 2900, y: H - 122, reward: 'LASER' }
    ];

    // --- 5. THE CYBER SLUG (VEÍCULO ESTACIONADO) ---
    // Um tanque estacionado estrategicamente antes da área mais perigosa
    this.slugSpawns = [
      { x: 1650, y: H - 140 }
    ];

    // --- 6. CHECKPOINTS DE SPAWN DE INIMIGOS ---
    this.enemySpawners = [
      // Zona 1
      { x: 450, y: H - 130, type: 'soldier', triggerX: 100 },
      { x: 600, y: H - 130, type: 'soldier', triggerX: 150 },
      { x: 700, y: H - 286, type: 'soldier', triggerX: 250 },
      { x: 800, y: H - 130, type: 'shield', triggerX: 350 },
      { x: 850, y: 120, type: 'drone', triggerX: 450 },

      // Zona 2 (Trincheiras)
      { x: 1150, y: H - 130, type: 'soldier', triggerX: 750 },
      { x: 1300, y: H - 296, type: 'rocket_trooper', triggerX: 850 },
      { x: 1400, y: H - 130, type: 'shield', triggerX: 950 },
      { x: 1550, y: 130, type: 'drone', triggerX: 1100 },
      { x: 1600, y: H - 130, type: 'soldier', triggerX: 1200 },

      // Zona 3 (Complexo Industrial)
      { x: 2100, y: H - 130, type: 'shield', triggerX: 1600 },
      { x: 2250, y: H - 216, type: 'soldier', triggerX: 1700 },
      { x: 2400, y: H - 130, type: 'rocket_trooper', triggerX: 1850 },
      { x: 2600, y: 140, type: 'drone', triggerX: 2000 },
      { x: 2700, y: H - 306, type: 'soldier', triggerX: 2150 },
      { x: 2850, y: H - 130, type: 'shield', triggerX: 2300 },
      { x: 2950, y: H - 130, type: 'rocket_trooper', triggerX: 2400 }
    ];

    // --- 7. CHEFÃO GOLIATH MEGA-TANK ---
    this.bossSpawn = { x: 3700, y: H - 220, triggerX: 3050 };
  }
}
