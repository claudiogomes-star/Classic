// Sistema de Mapa de Fase: Volta ao Mundo (Tóquio, Brasil, Europa e Egito - Arena MechaGodzilla)

class LevelMap {
  constructor(canvasWidth, canvasHeight) {
    this.width = 5200; // Grande jornada mundial dividida em 4 países e culturas
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

    // --- 1. CHÃO PRINCIPAL POR BIOMAS MUNDIAIS ---
    // Os setores se encostam: as antigas frestas entre biomas pareciam buracos
    // aleatórios e interrompiam o ritmo da corrida.
    // Zona 1: TÓQUIO / JAPÃO (0 -> 1280px)
    this.platforms.push({ x: 0, y: H - 80, width: 1280, height: 80, isGround: true, biome: 'tokyo' });

    // Zona 2: BRASIL / AMAZÔNIA TROPICAL (1280 -> 2530px)
    this.platforms.push({ x: 1280, y: H - 80, width: 1250, height: 80, isGround: true, biome: 'brazil' });

    // Zona 3: EUROPA / CASTELO MEDIEVAL & PARIS (2530 -> 3750px)
    this.platforms.push({ x: 2530, y: H - 80, width: 1220, height: 80, isGround: true, biome: 'europe' });

    // Zona 4: EGITO / DESERTO DE GIZÉ & PIRÂMIDES (3750 -> 5200px) - ARENA DO MECHAGODZILLA
    this.platforms.push({ x: 3750, y: H - 80, width: 1450, height: 80, isGround: true, biome: 'egypt' });

    // --- 2. PLATAFORMAS ELEVADAS TEMÁTICAS ---
    // [TÓQUIO] Telhados com telhas orientais e passarelas neon
    this.platforms.push({ x: 250, y: H - 180, width: 220, height: 18, isGround: false, biome: 'tokyo' });
    this.platforms.push({ x: 550, y: H - 240, width: 260, height: 18, isGround: false, biome: 'tokyo' });
    this.platforms.push({ x: 880, y: H - 190, width: 240, height: 18, isGround: false, biome: 'tokyo' });
    this.platforms.push({ x: 1080, y: H - 280, width: 140, height: 18, isGround: false, biome: 'tokyo' });

    // [BRASIL] Pontes de madeira suspensas e ruínas de pedra na selva
    this.platforms.push({ x: 1400, y: H - 180, width: 240, height: 18, isGround: false, biome: 'brazil' });
    this.platforms.push({ x: 1700, y: H - 240, width: 280, height: 18, isGround: false, biome: 'brazil' });
    this.platforms.push({ x: 2050, y: H - 180, width: 260, height: 18, isGround: false, biome: 'brazil' });
    this.platforms.push({ x: 2240, y: H - 275, width: 150, height: 18, isGround: false, biome: 'brazil' });

    // [EUROPA] Arcos de pedra gótica e muralhas medievais
    this.platforms.push({ x: 2650, y: H - 190, width: 240, height: 18, isGround: false, biome: 'europe' });
    this.platforms.push({ x: 2950, y: H - 260, width: 300, height: 18, isGround: false, biome: 'europe' });
    this.platforms.push({ x: 3320, y: H - 190, width: 240, height: 18, isGround: false, biome: 'europe' });
    this.platforms.push({ x: 3500, y: H - 275, width: 150, height: 18, isGround: false, biome: 'europe' });

    // [EGITO] Passarela suspensa de arenito dourado com hieróglifos na entrada da arena das pirâmides
    this.platforms.push({ x: 3850, y: H - 210, width: 260, height: 20, isGround: false, biome: 'egypt' });
    this.platforms.push({ x: 4180, y: H - 260, width: 210, height: 20, isGround: false, biome: 'egypt' });
    this.platforms.push({ x: 4480, y: H - 190, width: 180, height: 20, isGround: false, biome: 'egypt' });

    // --- 3. OBSTÁCULOS DESTRUTÍVEIS TEMÁTICOS ---
    this.destructibles = [
      // Tóquio: Barris de neon e caixas de alta tecnologia
      { id: 1, x: 420, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'tokyo', hp: 20, destroyed: false },
      { id: 2, x: 740, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'tokyo', hp: 20, destroyed: false },
      { id: 3, x: 300, y: H - 112, width: 32, height: 32, type: 'crate', biome: 'tokyo', hp: 30, destroyed: false },
      { id: 4, x: 620, y: H - 272, width: 32, height: 32, type: 'crate', biome: 'tokyo', hp: 30, destroyed: false },

      // Brasil: Caixas de suprimentos na selva e barris de combustível
      { id: 5, x: 1550, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'brazil', hp: 20, destroyed: false },
      { id: 6, x: 1850, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'brazil', hp: 20, destroyed: false },
      { id: 7, x: 1480, y: H - 212, width: 32, height: 32, type: 'crate', biome: 'brazil', hp: 30, destroyed: false },

      // Europa: Barris de pólvora do castelo e caixas de ferro
      { id: 8, x: 2750, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'europe', hp: 20, destroyed: false },
      { id: 9, x: 3100, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'europe', hp: 20, destroyed: false },
      { id: 10, x: 3450, y: H - 112, width: 32, height: 32, type: 'crate', biome: 'europe', hp: 30, destroyed: false },

      // Egito: vasos canópicos energizados e caixas de relíquias antes da arena
      { id: 11, x: 4020, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'egypt', hp: 20, destroyed: false },
      { id: 12, x: 4330, y: H - 116, width: 24, height: 36, type: 'barrel', biome: 'egypt', hp: 20, destroyed: false },
      { id: 13, x: 4210, y: H - 292, width: 32, height: 32, type: 'crate', biome: 'egypt', hp: 30, destroyed: false }
    ];

    // --- 4. REFÉNS / POWs ESPALHADOS PELO MUNDO ---
    this.powSpawns = [
      { x: 340, y: H - 222, reward: 'HMG' },         // Tóquio
      { x: 1050, y: H - 122, reward: 'SHOTGUN' },     // Fim de Tóquio
      { x: 1750, y: H - 282, reward: 'ROCKET' },      // Selva Brasil
      { x: 2850, y: H - 122, reward: 'FLAME' },       // Europa
      { x: 3500, y: H - 122, reward: 'LASER' }        // Entrada do Egito
    ];

    // --- 5. THE CYBER SLUG (TANQUES ESTACIONADOS) ---
    this.slugSpawns = [
      { x: 1600, y: H - 140 }, // Slug 1: Selva Brasileira
      { x: 3350, y: H - 140 }  // Slug 2: Entrada do Deserto do Egito
    ];

    // --- 6. CHECKPOINTS DE SPAWN DE INIMIGOS POR BIOMA ---
    this.enemySpawners = [
      // Zona 1: Tóquio (Cyber-Soldiers, Cyber-Shields, Drones)
      { x: 450, y: H - 130, type: 'soldier', biome: 'tokyo', triggerX: 100 },
      { x: 600, y: H - 130, type: 'soldier', biome: 'tokyo', triggerX: 150 },
      { x: 700, y: H - 286, type: 'soldier', biome: 'tokyo', triggerX: 250 },
      { x: 800, y: H - 130, type: 'shield', biome: 'tokyo', triggerX: 350 },
      { x: 950, y: 120, type: 'drone', biome: 'tokyo', triggerX: 500 },

      // Zona 2: Brasil / Selva (Guerrilheiros, Tropas Camufladas e Lança-Foguetes da Floresta)
      { x: 1450, y: H - 130, type: 'soldier', biome: 'brazil', triggerX: 1100 },
      { x: 1600, y: H - 130, type: 'rocket_trooper', biome: 'brazil', triggerX: 1250 },
      { x: 1800, y: H - 286, type: 'soldier', biome: 'brazil', triggerX: 1450 },
      { x: 1950, y: H - 130, type: 'shield', biome: 'brazil', triggerX: 1600 },
      { x: 2150, y: 130, type: 'drone', biome: 'brazil', triggerX: 1800 },
      { x: 2350, y: H - 130, type: 'rocket_trooper', biome: 'brazil', triggerX: 2000 },

      // Zona 3: Europa / Castelo (Cavaleiros Góticos, Sentinelas e Drones Steampunk)
      { x: 2680, y: H - 130, type: 'soldier', biome: 'europe', triggerX: 2350 },
      { x: 2850, y: H - 130, type: 'shield', biome: 'europe', triggerX: 2500 },
      { x: 3050, y: H - 306, type: 'soldier', biome: 'europe', triggerX: 2700 },
      { x: 3200, y: H - 130, type: 'rocket_trooper', biome: 'europe', triggerX: 2850 },
      { x: 3400, y: 130, type: 'drone', biome: 'europe', triggerX: 3050 },
      { x: 3600, y: H - 130, type: 'shield', biome: 'europe', triggerX: 3250 },

      // Zona 4: Egito (Guardiões dos Faraós, Defensores de Anúbis e Escaravelhos de Plasma) - DIFICULDADE AUMENTADA!
      { x: 3850, y: H - 130, type: 'soldier', biome: 'egypt', triggerX: 3450 },
      { x: 3900, y: H - 130, type: 'shield', biome: 'egypt', triggerX: 3500 },
      { x: 4000, y: H - 286, type: 'soldier', biome: 'egypt', triggerX: 3580 },
      { x: 4050, y: H - 130, type: 'soldier', biome: 'egypt', triggerX: 3650 },
      { x: 4150, y: H - 130, type: 'shield', biome: 'egypt', triggerX: 3700 },
      { x: 4200, y: 120, type: 'drone', biome: 'egypt', triggerX: 3750 },
      { x: 4280, y: H - 130, type: 'rocket_trooper', biome: 'egypt', triggerX: 3800 },
      { x: 4350, y: H - 286, type: 'soldier', biome: 'egypt', triggerX: 3850 },
      { x: 4450, y: H - 130, type: 'shield', biome: 'egypt', triggerX: 3900 },
      { x: 4550, y: 120, type: 'drone', biome: 'egypt', triggerX: 3950 },
      { x: 4650, y: H - 130, type: 'rocket_trooper', biome: 'egypt', triggerX: 4000 },
      { x: 4750, y: H - 130, type: 'soldier', biome: 'egypt', triggerX: 4050 }
    ];

    // --- 7. CHEFÃO TITÃ MECHAGODZILLA (ARENA DO EGITO / PIRÂMIDES DE GIZÉ) ---
    this.bossSpawn = { x: 4600, y: H - 320, triggerX: 3950 };
  }
}
