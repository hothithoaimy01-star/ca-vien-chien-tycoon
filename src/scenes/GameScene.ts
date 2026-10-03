import Phaser from 'phaser';
import { CustomerSystem } from '../systems/CustomerSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { ProgressionSystem, DaySummary } from '../systems/ProgressionSystem';
import { FryingPan } from '../entities/FryingPan';
import { Plate } from '../entities/Plate';
import { Customer } from '../entities/Customer';
import { INGREDIENTS, IngredientConfig } from '../data/ingredients';
import { Storage } from '../systems/SaveManager';
import { AudioManager } from '../core/AudioSynthesizer';
import { EventBus } from '../core/EventBus';

export class GameScene extends Phaser.Scene {
  private customerSystem!: CustomerSystem;
  private economySystem!: EconomySystem;
  private progressionSystem!: ProgressionSystem;
  private pan!: FryingPan;
  private plate!: Plate;

  // Visual display objects
  private customerContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private panSlotContainers: Phaser.GameObjects.Container[] = [];
  private platterContainer!: Phaser.GameObjects.Container;
  private hudMoneyText!: Phaser.GameObjects.Text;
  private hudTargetText!: Phaser.GameObjects.Text;
  private hudGemsText!: Phaser.GameObjects.Text;
  private hudComboText!: Phaser.GameObjects.Text;
  private trayContainer!: Phaser.GameObjects.Container;
  private tutorialPointer?: Phaser.GameObjects.Container;

  private isPaused: boolean = false;
  private isDayOver: boolean = false;
  private activeTrayTab: 'fryable' | 'sauce' = 'fryable';

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Reset systems
    this.customerSystem = new CustomerSystem();
    this.economySystem = new EconomySystem();
    this.progressionSystem = new ProgressionSystem();
    this.pan = new FryingPan();
    this.plate = new Plate();
    this.isPaused = false;
    this.isDayOver = false;

    const currentLevel = this.progressionSystem.getCurrentLevel();

    // 1. Background
    const bgKey = currentLevel.background.includes('school') ? 'bg_school_gate' : 'bg_street_shop';
    const bg = this.add.image(width / 2, height / 2, bgKey);
    bg.setDisplaySize(width, height);
    bg.setAlpha(0.9);

    // Vignette / street atmosphere shadow
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.35);
    vignette.fillRect(0, 0, width, height);

    // 2. Chef character on cart (Left)
    const chef = this.add.image(75, 235, 'char_grandpa');
    chef.setScale(0.55);
    chef.setFlipX(true);
    this.tweens.add({
      targets: chef,
      y: 230,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Customer Queue Area
    this.setupCustomerArea();

    // 4. Cart Counter & Frying Pan Area (Middle)
    this.setupCookingPan(width, height);

    // 5. Platter / Assembly Area (Center-Bottom)
    this.setupPlatterArea(width, height);

    // 6. Ingredients & Sauces Tray (Bottom)
    this.setupIngredientsTray(width, height);

    // 7. Top HUD Bar
    this.setupHUD(width);

    // 8. Event Listeners
    this.setupEvents();

    // Start Day & Music
    this.customerSystem.startDay(currentLevel);
    this.economySystem.resetDay();
    AudioManager.startBgm();

    // Show Day Start Announcement
    this.showDayAnnouncement(currentLevel.name, currentLevel.location);

    // Tutorial check for Day 1
    if (currentLevel.day === 1 && !Storage.getData().tutorialCompleted) {
      this.time.delayedCall(1200, () => this.showTutorialStep(1));
    }
  }

  private setupHUD(width: number): void {
    const save = Storage.getData();
    const currentLevel = this.progressionSystem.getCurrentLevel();

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x111122, 0.88);
    hudBg.fillRect(0, 0, width, 58);
    hudBg.lineStyle(2, 0xffaa00, 0.8);
    hudBg.lineBetween(0, 58, width, 58);

    // Revenue
    this.hudMoneyText = this.add.text(14, 10, `💰 0 đ`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#ffd700',
      fontStyle: 'bold'
    });

    this.hudTargetText = this.add.text(14, 32, `Mục tiêu: ${currentLevel.targetRevenue.toLocaleString('vi-VN')} đ`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#ffffff'
    });

    // Combo streak
    this.hudComboText = this.add.text(width / 2, 18, `⭐ ${currentLevel.name.split(':')[0]}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#ffea00',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Gems
    this.hudGemsText = this.add.text(width - 95, 18, `💎 ${save.gems}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#00e5ff',
      fontStyle: 'bold'
    });

    // Pause Button
    const pauseBtn = this.add.text(width - 34, 14, '⏸️', {
      fontSize: '22px'
    }).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => {
      AudioManager.playTap();
      this.isPaused = true;
      EventBus.emit('OPEN_PAUSE_MODAL');
    });
  }

  private setupCustomerArea(): void {
    // Customers are managed dynamically in update()
  }

  private setupCookingPan(width: number, height: number): void {
    const panY = height * 0.45;

    // Pan background container
    const panBg = this.add.graphics();
    panBg.fillStyle(0x2d3436, 0.95);
    panBg.fillRoundedRect(16, panY - 65, width - 32, 130, 20);
    panBg.lineStyle(4, 0x636e72, 1);
    panBg.strokeRoundedRect(16, panY - 65, width - 32, 130, 20);

    // Boiling oil surface
    const oilBg = this.add.graphics();
    oilBg.fillStyle(0xe17055, 0.85);
    oilBg.fillRoundedRect(24, panY - 57, width - 48, 114, 16);

    // Pan Header Label
    this.add.text(32, panY - 58, '🍳 CHẢO CHIÊN DẦU SÔI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#ffeaa7',
      fontStyle: 'bold'
    });

    // Create pan slot containers
    this.panSlotContainers = [];
    const maxSlots = this.pan.maxSlots;
    const slotSpacing = (width - 64) / Math.min(4, maxSlots);

    for (let i = 0; i < maxSlots; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const slotX = 52 + col * slotSpacing;
      const slotY = panY - 15 + row * 45;

      const slotCont = this.add.container(slotX, slotY);

      // Slot circle
      const slotCircle = this.add.graphics();
      slotCircle.fillStyle(0xd63031, 0.5);
      slotCircle.fillCircle(0, 0, 24);
      slotCircle.lineStyle(2, 0xfdcb6e, 0.8);
      slotCircle.strokeCircle(0, 0, 24);

      // Slot image placeholder
      const slotImg = this.add.image(0, 0, 'ing_fish_ball');
      slotImg.setDisplaySize(38, 38);
      slotImg.setVisible(false);

      // Progress bar graphics
      const progGfx = this.add.graphics();

      // State label
      const stateLabel = this.add.text(0, 28, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      slotCont.add([slotCircle, slotImg, progGfx, stateLabel]);
      slotCont.setSize(52, 52);
      slotCont.setInteractive({ useHandCursor: true });

      // Click to scoop or discard
      slotCont.on('pointerdown', () => {
        this.onPanSlotTapped(i);
      });

      this.panSlotContainers.push(slotCont);
    }
  }

  private setupPlatterArea(width: number, height: number): void {
    const platterY = height * 0.62;

    // Platter basket graphic
    const platterGfx = this.add.image(width / 2, platterY, 'ui_platter');
    platterGfx.setDisplaySize(width * 0.72, 100);

    this.platterContainer = this.add.container(width / 2, platterY);

    // Label
    this.add.text(26, platterY - 50, '🧺 MẸT TRE ĐÓNG GÓI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#ffeaa7',
      fontStyle: 'bold'
    });

    // SERVE BUTTON (Big golden button)
    const serveBtn = this.add.container(width - 80, platterY);
    const sBg = this.add.graphics();
    sBg.fillGradientStyle(0x00b894, 0x00b894, 0x00cec9, 0x00cec9, 1, 1, 1, 1);
    sBg.fillRoundedRect(-58, -26, 116, 52, 14);
    sBg.lineStyle(3, 0xffffff, 1);
    sBg.strokeRoundedRect(-58, -26, 116, 52, 14);

    const sLabel = this.add.text(0, 0, '🍢 GIAO\nMÓN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    serveBtn.add([sBg, sLabel]);
    serveBtn.setSize(116, 52);
    serveBtn.setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: serveBtn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    serveBtn.on('pointerdown', () => {
      AudioManager.playTap();
      this.serveCurrentCustomer();
    });

    // CLEAR / TRASH BUTTON
    const trashBtn = this.add.text(32, platterY + 22, '🗑️ Đổ mẹt', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#ff7675'
    }).setInteractive({ useHandCursor: true });

    trashBtn.on('pointerdown', () => {
      AudioManager.playTap();
      this.plate.clear();
      this.updatePlatterVisuals();
    });
  }

  private setupIngredientsTray(width: number, height: number): void {
    const trayY = height * 0.74;
    const trayHeight = height - trayY;

    const trayBg = this.add.graphics();
    trayBg.fillStyle(0x1e272e, 0.97);
    trayBg.fillRect(0, trayY, width, trayHeight);
    trayBg.lineStyle(3, 0xf39c12, 1);
    trayBg.lineBetween(0, trayY, width, trayY);

    // Tab buttons
    const tabFry = this.add.text(20, trayY + 8, '🍢 ĐỒ CHIÊN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setInteractive({ useHandCursor: true });

    const tabSauce = this.add.text(120, trayY + 8, '🌶️ SỐT & TOPPING', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#bdc3c7',
      fontStyle: 'bold'
    }).setInteractive({ useHandCursor: true });

    tabFry.on('pointerdown', () => {
      this.activeTrayTab = 'fryable';
      tabFry.setColor('#f1c40f');
      tabSauce.setColor('#bdc3c7');
      this.renderTrayItems(width, trayY + 32);
    });

    tabSauce.on('pointerdown', () => {
      this.activeTrayTab = 'sauce';
      tabSauce.setColor('#f1c40f');
      tabFry.setColor('#bdc3c7');
      this.renderTrayItems(width, trayY + 32);
    });

    this.trayContainer = this.add.container(0, 0);
    this.renderTrayItems(width, trayY + 32);
  }

  private renderTrayItems(width: number, startY: number): void {
    this.trayContainer.removeAll(true);
    const currentLevel = this.progressionSystem.getCurrentLevel();
    const allowed = currentLevel.allowedIngredients;

    const filtered = Object.values(INGREDIENTS).filter(ing => {
      if (this.activeTrayTab === 'fryable') {
        return ing.type === 'fryable' && allowed.includes(ing.id);
      } else {
        return (ing.type === 'sauce' || ing.type === 'topping') && allowed.includes(ing.id);
      }
    });

    const itemWidth = 72;
    const startX = 14;

    filtered.forEach((ing, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const x = startX + col * itemWidth + itemWidth / 2;
      const y = startY + row * 76 + 32;

      const card = this.add.container(x, y);

      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x2f3640, 0.9);
      cardBg.fillRoundedRect(-32, -32, 64, 64, 10);
      cardBg.lineStyle(1.5, 0x718093, 0.8);
      cardBg.strokeRoundedRect(-32, -32, 64, 64, 10);

      // Texture key
      let texKey = `ing_${ing.id}`;
      if (ing.id.startsWith('sauce_')) texKey = ing.id;

      const img = this.add.image(0, -8, this.textures.exists(texKey) ? texKey : 'ing_fish_ball');
      img.setDisplaySize(44, 44);

      const nameLabel = this.add.text(0, 20, ing.name.split(' ')[0], {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '9px',
        color: '#f5f6fa',
        align: 'center'
      }).setOrigin(0.5);

      card.add([cardBg, img, nameLabel]);
      card.setSize(64, 64);
      card.setInteractive({ useHandCursor: true });

      card.on('pointerdown', () => {
        card.setScale(0.92);
      });

      card.on('pointerup', () => {
        card.setScale(1.0);
        this.onIngredientTrayTapped(ing);
      });

      this.trayContainer.add(card);
    });
  }

  private onIngredientTrayTapped(ing: IngredientConfig): void {
    AudioManager.playTap();

    if (ing.type === 'fryable') {
      const slotIdx = this.pan.addIngredient(ing.id);
      if (slotIdx === -1) {
        this.showFloatingText(this.cameras.main.width / 2, this.cameras.main.height * 0.45, 'Chảo đã đầy!', '#e74c3c');
      }
    } else {
      // Direct sauce or topping onto platter
      this.plate.addItem(ing.id, 'normal');
      this.updatePlatterVisuals();
      this.showFloatingText(this.cameras.main.width / 2, this.cameras.main.height * 0.62, `+ ${ing.name}`, '#f1c40f');
    }
  }

  private onPanSlotTapped(slotIndex: number): void {
    const slot = this.pan.slots[slotIndex];
    if (!slot || !slot.ingredientId) return;

    if (slot.state === 'BURNT') {
      // Discard burnt food
      this.pan.takeSlot(slotIndex);
      this.showFloatingText(this.cameras.main.width / 2, this.cameras.main.height * 0.45, 'Đã đổ đồ cháy! 🗑️', '#ff7675');
      return;
    }

    if (slot.state === 'PERFECT' || slot.state === 'FRYING' || slot.state === 'RAW') {
      const taken = this.pan.takeSlot(slotIndex);
      if (taken && taken.ingredientId) {
        const quality = taken.state === 'PERFECT' ? 'perfect' : 'normal';
        this.plate.addItem(taken.ingredientId, quality);
        this.updatePlatterVisuals();

        if (quality === 'perfect') {
          this.showFloatingText(this.cameras.main.width / 2, this.cameras.main.height * 0.6, '⭐ PERFECT! +Thơm giòn', '#f1c40f');
        }
      }
    }
  }

  private updatePlatterVisuals(): void {
    this.platterContainer.removeAll(true);

    const items = this.plate.items;
    const startX = -70;
    const spacing = 35;

    items.forEach((it, idx) => {
      if (idx >= 6) return;
      let texKey = `ing_${it.id}`;
      if (!this.textures.exists(texKey)) texKey = 'ing_fish_ball';

      const img = this.add.image(startX + idx * spacing, 0, texKey);
      img.setDisplaySize(34, 34);

      if (it.quality === 'perfect') {
        const star = this.add.text(startX + idx * spacing + 10, -12, '⭐', { fontSize: '12px' });
        this.platterContainer.add(star);
      }

      this.platterContainer.add(img);
    });

    // Sauces display
    let sauceOffset = 0;
    this.plate.sauces.forEach((s) => {
      const sTex = s;
      if (this.textures.exists(sTex)) {
        const sImg = this.add.image(60 + sauceOffset, -5, sTex);
        sImg.setDisplaySize(24, 24);
        this.platterContainer.add(sImg);
        sauceOffset += 18;
      }
    });

    // Toppings display
    this.plate.toppings.forEach((t) => {
      const tImg = this.add.image(60 + sauceOffset, 8, `ing_${t}`);
      if (this.textures.exists(`ing_${t}`)) {
        tImg.setDisplaySize(22, 22);
        this.platterContainer.add(tImg);
        sauceOffset += 18;
      }
    });
  }

  private serveCurrentCustomer(): void {
    const frontCustomer = this.customerSystem.getFrontCustomer();
    if (!frontCustomer) {
      this.showFloatingText(this.cameras.main.width / 2, 200, 'Không có khách nào đang chờ!', '#e74c3c');
      return;
    }

    if (this.plate.isEmpty()) {
      this.showFloatingText(this.cameras.main.width / 2, this.cameras.main.height * 0.6, 'Mẹt đồ ăn đang trống!', '#e74c3c');
      return;
    }

    const result = this.economySystem.evaluateServing(this.plate, frontCustomer);

    if (result.success) {
      frontCustomer.onServedHappy();
      this.customerSystem.removeFrontCustomer(true);
      this.plate.clear();
      this.updatePlatterVisuals();

      // Show Earned Banner
      this.showFloatingMoney(frontCustomer.x, frontCustomer.y - 40, result.totalEarned, result.tip, result.isPerfect);
      this.updateHUD();

      // Check if Day completed
      if (this.customerSystem.isDayFinished()) {
        this.time.delayedCall(1500, () => this.handleDayEnd());
      }
    } else {
      this.showFloatingText(frontCustomer.x, frontCustomer.y - 30, result.message, '#e74c3c');
    }
  }

  private handleDayEnd(): void {
    if (this.isDayOver) return;
    this.isDayOver = true;

    const summary = this.progressionSystem.evaluateDayEnd(
      this.economySystem.totalDayRevenue,
      this.customerSystem.totalServedInDay,
      this.economySystem.perfectCountInDay
    );

    EventBus.emit('OPEN_DAY_SUMMARY_MODAL', summary);
  }

  update(time: number, delta: number): void {
    if (this.isPaused || this.isDayOver) return;

    const deltaSeconds = delta / 1000;

    // 1. Update Customer System
    this.customerSystem.update(deltaSeconds);
    this.updateCustomerVisuals();

    // 2. Update Frying Pan
    this.pan.update(deltaSeconds);
    this.updatePanVisuals();

    // 3. Check if all customers left and day finished
    if (this.customerSystem.isDayFinished() && !this.isDayOver) {
      this.time.delayedCall(1200, () => this.handleDayEnd());
    }
  }

  private updateCustomerVisuals(): void {
    const queue = this.customerSystem.queue;

    // Track active ids
    const activeIds = new Set(queue.map(c => c.instanceId));

    // Destroy left containers
    for (const [id, cont] of this.customerContainers.entries()) {
      if (!activeIds.has(id)) {
        cont.destroy();
        this.customerContainers.delete(id);
      }
    }

    // Update or create customer container
    queue.forEach((cust, idx) => {
      let cont = this.customerContainers.get(cust.instanceId);

      if (!cont) {
        cont = this.add.container(cust.x, cust.y);

        // Character Sprite
        const charKey = `char_${cust.id}`;
        const spr = this.add.image(0, 0, this.textures.exists(charKey) ? charKey : 'char_student_boy');
        spr.setDisplaySize(120, 190);
        spr.setOrigin(0.5, 0.85);

        // Patience Bar
        const pGfx = this.add.graphics();
        pGfx.setName('patienceGfx');

        // Speech Bubble container
        const bubble = this.add.container(0, -170);
        bubble.setName('bubble');
        const bBg = this.add.graphics();
        bBg.setName('bubbleBg');
        const bText = this.add.text(0, 0, '', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11px',
          color: '#2d3436',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: 150 }
        }).setOrigin(0.5);
        bText.setName('bubbleText');
        bubble.add([bBg, bText]);

        // Order Bubble
        const orderBubble = this.add.container(0, -85);
        orderBubble.setName('orderBubble');

        cont.add([spr, pGfx, bubble, orderBubble]);
        this.customerContainers.set(cust.instanceId, cont);
      }

      // Update position and visual state
      cont.setPosition(cust.x, cust.y + cust.bounceOffset);
      cont.setScale(cust.scale);
      cont.setAlpha(cust.alpha);
      cont.setRotation(cust.rotation);

      // Update Patience Bar
      const pGfx = cont.getByName('patienceGfx') as Phaser.GameObjects.Graphics;
      if (pGfx && cust.state === 'WAITING') {
        pGfx.clear();
        const bw = 64;
        const bh = 7;
        const bx = -bw / 2;
        const by = -155;

        // Background
        pGfx.fillStyle(0x2d3436, 0.8);
        pGfx.fillRoundedRect(bx, by, bw, bh, 3);

        // Progress color (Green -> Yellow -> Red)
        let barColor = 0x2ecc71;
        if (cust.patiencePercent < 0.3) barColor = 0xe74c3c;
        else if (cust.patiencePercent < 0.6) barColor = 0xf39c12;

        pGfx.fillStyle(barColor, 1);
        pGfx.fillRoundedRect(bx + 1, by + 1, (bw - 2) * cust.patiencePercent, bh - 2, 2);
      } else if (pGfx) {
        pGfx.clear();
      }

      // Update Speech Bubble
      const bubble = cont.getByName('bubble') as Phaser.GameObjects.Container;
      if (bubble) {
        const bText = bubble.getByName('bubbleText') as Phaser.GameObjects.Text;
        const bBg = bubble.getByName('bubbleBg') as Phaser.GameObjects.Graphics;

        if (cust.currentSpeech) {
          bubble.setVisible(true);
          bText.setText(cust.currentSpeech);
          const bound = bText.getBounds();
          bBg.clear();
          bBg.fillStyle(0xffffff, 0.95);
          bBg.fillRoundedRect(-bound.width / 2 - 8, -bound.height / 2 - 6, bound.width + 16, bound.height + 12, 10);
          bBg.lineStyle(2, 0x2d3436, 0.8);
          bBg.strokeRoundedRect(-bound.width / 2 - 8, -bound.height / 2 - 6, bound.width + 16, bound.height + 12, 10);
        } else {
          bubble.setVisible(false);
        }
      }

      // Update Order Display for front customer
      const orderBubble = cont.getByName('orderBubble') as Phaser.GameObjects.Container;
      if (orderBubble) {
        if (idx === 0 && cust.state === 'WAITING') {
          orderBubble.setVisible(true);
          orderBubble.removeAll(true);

          const oBg = this.add.graphics();
          oBg.fillStyle(0xfff9e6, 0.95);
          const boxW = Math.max(120, (cust.orderItems.length + cust.orderSauces.length) * 38 + 20);
          oBg.fillRoundedRect(-boxW / 2, -18, boxW, 36, 12);
          oBg.lineStyle(2, 0xe67e22, 1);
          oBg.strokeRoundedRect(-boxW / 2, -18, boxW, 36, 12);
          orderBubble.add(oBg);

          let oX = -boxW / 2 + 24;
          cust.orderItems.forEach(it => {
            let tKey = `ing_${it.ingredientId}`;
            if (!this.textures.exists(tKey)) tKey = 'ing_fish_ball';
            const itemImg = this.add.image(oX, 0, tKey);
            itemImg.setDisplaySize(24, 24);
            const countText = this.add.text(oX + 12, 4, `x${it.count}`, {
              fontSize: '10px',
              fontStyle: 'bold',
              color: '#d35400'
            });
            orderBubble.add([itemImg, countText]);
            oX += 36;
          });

          cust.orderSauces.forEach(s => {
            if (this.textures.exists(s)) {
              const sImg = this.add.image(oX, 0, s);
              sImg.setDisplaySize(20, 20);
              orderBubble.add(sImg);
              oX += 28;
            }
          });
        } else {
          orderBubble.setVisible(false);
        }
      }
    });
  }

  private updatePanVisuals(): void {
    this.pan.slots.forEach((slot, idx) => {
      if (idx >= this.panSlotContainers.length) return;
      const cont = this.panSlotContainers[idx];
      const img = cont.list[1] as Phaser.GameObjects.Image;
      const prog = cont.list[2] as Phaser.GameObjects.Graphics;
      const label = cont.list[3] as Phaser.GameObjects.Text;

      if (!slot.ingredientId || !slot.config) {
        img.setVisible(false);
        prog.clear();
        label.setText('');
        return;
      }

      img.setVisible(true);
      let texKey = `ing_${slot.ingredientId}`;
      if (this.textures.exists(texKey)) {
        img.setTexture(texKey);
      }

      // State label and color
      prog.clear();
      const radius = 24;

      if (slot.state === 'RAW') {
        img.setTint(0xffffff);
        label.setText('SỐNG');
        label.setColor('#ffffff');
      } else if (slot.state === 'FRYING') {
        img.setTint(0xffd32a);
        label.setText('CHIÊN...');
        label.setColor('#f1c40f');
        // Animated sizzle wiggle
        img.y = Math.sin(Date.now() * 0.03 + idx) * 2;
      } else if (slot.state === 'PERFECT') {
        img.setTint(0xfffa65);
        label.setText('⭐ VỚT NGAY!');
        label.setColor('#2ecc71');
        img.setScale(1.1 + Math.sin(Date.now() * 0.01) * 0.1);
      } else if (slot.state === 'BURNT') {
        img.setTint(0x2d3436);
        label.setText('🔥 CHÁY!');
        label.setColor('#e74c3c');
        img.setScale(0.9);
      }

      // Arc progress
      prog.lineStyle(3, slot.state === 'PERFECT' ? 0x2ecc71 : slot.state === 'BURNT' ? 0xe74c3c : 0xf39c12, 1);
      prog.beginPath();
      prog.arc(0, 0, radius + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * slot.progress, false);
      prog.strokePath();
    });
  }

  private updateHUD(): void {
    const save = Storage.getData();
    const currentLevel = this.progressionSystem.getCurrentLevel();

    this.hudMoneyText.setText(`💰 ${this.economySystem.totalDayRevenue.toLocaleString('vi-VN')} đ`);
    this.hudTargetText.setText(`Mục tiêu: ${currentLevel.targetRevenue.toLocaleString('vi-VN')} đ`);
    this.hudGemsText.setText(`💎 ${save.gems}`);

    if (this.economySystem.comboStreak > 1) {
      this.hudComboText.setText(`🔥 COMBO x${this.economySystem.comboStreak}`);
      this.hudComboText.setColor('#ff4757');
    } else {
      this.hudComboText.setText(`⭐ ${currentLevel.name.split(':')[0]}`);
      this.hudComboText.setColor('#ffea00');
    }
  }

  private showFloatingText(x: number, y: number, message: string, color: string): void {
    const text = this.add.text(x, y, message, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => text.destroy()
    });
  }

  private showFloatingMoney(x: number, y: number, total: number, tip: number, isPerfect: boolean): void {
    const str = tip > 0 ? `+${total.toLocaleString('vi-VN')}đ (Tip +${tip.toLocaleString('vi-VN')}đ)` : `+${total.toLocaleString('vi-VN')}đ`;
    const text = this.add.text(x, y, str, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: isPerfect ? '16px' : '14px',
      color: isPerfect ? '#ffd700' : '#2ecc71',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }

  private showDayAnnouncement(name: string, location: string): void {
    const { width, height } = this.cameras.main;
    const banner = this.add.container(width / 2, height * 0.38);

    const bBg = this.add.graphics();
    bBg.fillStyle(0x000000, 0.85);
    bBg.fillRoundedRect(-180, -40, 360, 80, 16);
    bBg.lineStyle(3, 0xf39c12, 1);
    bBg.strokeRoundedRect(-180, -40, 360, 80, 16);

    const t1 = this.add.text(0, -14, name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const t2 = this.add.text(0, 14, `📍 ${location}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    banner.add([bBg, t1, t2]);
    banner.setScale(0);

    this.tweens.add({
      targets: banner,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: height * 0.35,
            duration: 400,
            onComplete: () => banner.destroy()
          });
        });
      }
    });
  }

  private showTutorialStep(step: number): void {
    if (this.tutorialPointer) this.tutorialPointer.destroy();
    const { width, height } = this.cameras.main;

    if (step === 1) {
      // Step 1: Point to Cá viên tray
      this.tutorialPointer = this.add.container(50, height * 0.82);
      const hand = this.add.text(0, 0, '👆', { fontSize: '32px' }).setOrigin(0.5);
      const hint = this.add.text(45, -10, 'Nhấn chọn Cá Viên!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#ffea00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      });
      this.tutorialPointer.add([hand, hint]);
      this.tweens.add({
        targets: hand,
        y: -10,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private setupEvents(): void {
    EventBus.on('RESUME_GAME', () => {
      this.isPaused = false;
    });

    EventBus.on('RESTART_DAY', () => {
      this.scene.restart();
    });

    EventBus.on('NEXT_DAY', () => {
      this.scene.restart();
    });

    EventBus.on('RETURN_TO_MAIN_MENU', () => {
      this.scene.start('MainMenuScene');
    });

    EventBus.on('STAFF_AUTO_SCOOP', (slotIndex: number) => {
      this.onPanSlotTapped(slotIndex);
    });
  }

  shutdown(): void {
    AudioManager.stopSizzle();
    EventBus.off('RESUME_GAME', () => {});
    EventBus.off('RESTART_DAY', () => {});
    EventBus.off('NEXT_DAY', () => {});
    EventBus.off('RETURN_TO_MAIN_MENU', () => {});
  }
}
