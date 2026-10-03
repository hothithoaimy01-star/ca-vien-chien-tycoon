import Phaser from 'phaser';
import { Storage } from '../systems/SaveManager';
import { AudioManager } from '../core/AudioSynthesizer';
import { EventBus } from '../core/EventBus';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const save = Storage.getData();

    // Background Image
    const bg = this.add.image(width / 2, height / 2, 'bg_school_gate');
    bg.setDisplaySize(width, height);
    bg.setAlpha(0.65);

    // Dark gradient overlay
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x000000, 0x000000, 0x111122, 0x111122, 0.5, 0.5, 0.95, 0.95);
    overlay.fillRect(0, 0, width, height);

    // Top Currency Bar
    this.createTopBar(width, save);

    // Main Logo & Mascot
    const mascot = this.add.image(width / 2, height * 0.32, 'char_grandpa');
    mascot.setScale(0.7);
    this.tweens.add({
      targets: mascot,
      y: height * 0.32 - 10,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Skewer platter decor
    const platter = this.add.image(width / 2 + 100, height * 0.38, 'ui_platter');
    platter.setScale(0.28);
    platter.setAngle(12);

    // Game Title
    const titleContainer = this.add.container(width / 2, height * 0.16);
    
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xd32f2f, 0.95);
    titleBg.fillRoundedRect(-190, -38, 380, 76, 20);
    titleBg.lineStyle(4, 0xffd700, 1);
    titleBg.strokeRoundedRect(-190, -38, 380, 76, 20);

    const titleText = this.add.text(0, -6, '🔥 CÁ VIÊN CHIÊN 🔥\nTYCOON', {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#8b0000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const slogan = this.add.text(0, 52, '“Chiên ngon – Bán nhanh – Làm giàu!”', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#ffea00',
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    titleContainer.add([titleBg, titleText, slogan]);

    // Menu Buttons Container
    const btnYStart = height * 0.52;
    const btnGap = 58;

    // 1. PLAY BUTTON
    this.createButton(
      width / 2,
      btnYStart,
      '🍢 BẮT ĐẦU BÁN HÀNG (NGÀY ' + save.currentDay + ')',
      0xff9800,
      0xe65100,
      () => {
        AudioManager.playTap();
        this.scene.start('GameScene');
      },
      true
    );

    // 2. UPGRADE BUTTON
    this.createButton(
      width / 2,
      btnYStart + btnGap,
      '🍳 NÂNG CẤP QUÁN ĂN',
      0x1976d2,
      0x0d47a1,
      () => {
        AudioManager.playTap();
        EventBus.emit('OPEN_UPGRADE_MODAL');
      }
    );

    // 3. MISSIONS & ACHIEVEMENTS BUTTON
    this.createButton(
      width / 2,
      btnYStart + btnGap * 2,
      '🏆 NHIỆM VỤ & THÀNH TÍCH',
      0x388e3c,
      0x1b5e20,
      () => {
        AudioManager.playTap();
        EventBus.emit('OPEN_MISSIONS_MODAL');
      }
    );

    // 4. MENU BANNER INFOGRAPHIC BUTTON
    this.createButton(
      width / 2,
      btnYStart + btnGap * 3,
      '📜 THỰC ĐƠN ĐƯỜNG PHỐ',
      0x7b1fa2,
      0x4a148c,
      () => {
        AudioManager.playTap();
        EventBus.emit('OPEN_MENU_INFOGRAPHIC');
      }
    );

    // Footer Info
    this.add.text(width / 2, height - 25, 'Phiên bản Mobile v1.0 • Chơi ngay trên màn hình cảm ứng', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  private createTopBar(width: number, save: any): void {
    const topBar = this.add.container(0, 0);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x000000, 0.7);
    barBg.fillRect(0, 0, width, 54);

    // Money
    const moneyText = this.add.text(16, 17, `💰 ${save.money.toLocaleString('vi-VN')} đ`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold'
    });

    // Gems
    const gemsText = this.add.text(width - 120, 17, `💎 ${save.gems}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#00e5ff',
      fontStyle: 'bold'
    });

    // Sound toggle
    const soundBtn = this.add.text(width - 40, 15, AudioManager.isSoundOn() ? '🔊' : '🔇', {
      fontSize: '20px'
    }).setInteractive({ useHandCursor: true });

    soundBtn.on('pointerdown', () => {
      const newState = !AudioManager.isSoundOn();
      AudioManager.setSoundEnabled(newState);
      AudioManager.setMusicEnabled(newState);
      soundBtn.setText(newState ? '🔊' : '🔇');
    });

    topBar.add([barBg, moneyText, gemsText, soundBtn]);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    colorTop: number,
    colorBottom: number,
    onClick: () => void,
    isPrimary: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 320;
    const h = isPrimary ? 54 : 46;

    const bg = this.add.graphics();
    bg.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1, 1, 1, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, isPrimary ? 16 : 12);
    bg.lineStyle(2, 0xffffff, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, isPrimary ? 16 : 12);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: isPrimary ? '16px' : '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    if (isPrimary) {
      this.tweens.add({
        targets: container,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    container.on('pointerdown', () => {
      container.setScale(0.95);
    });

    container.on('pointerup', () => {
      container.setScale(isPrimary ? 1.04 : 1.0);
      onClick();
    });

    return container;
  }
}
