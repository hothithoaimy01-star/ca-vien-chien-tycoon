import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading UI
    const loadingText = this.add.text(width / 2, height / 2 - 50, '🍢 ĐANG TẢI GAME...', {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 140, height / 2, 280, 24, 12);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffaa00, 1);
      progressBar.fillRoundedRect(width / 2 - 138, height / 2 + 2, 276 * value, 20, 10);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    const v = `?v=${Date.now()}`;

    // 1. Backgrounds
    this.load.image('bg_street_shop', `assets/backgrounds/bg_street_shop.png${v}`);
    this.load.image('bg_school_gate', `assets/backgrounds/bg_school_gate.png${v}`);

    // 2. Characters
    this.load.image('char_grandma', `assets/characters/grandma.png${v}`);
    this.load.image('char_student_boy', `assets/characters/student_boy.png${v}`);
    this.load.image('char_student_girl', `assets/characters/student_girl.png${v}`);
    this.load.image('char_vip_lady', `assets/characters/vip_lady.png${v}`);
    this.load.image('char_grandpa', `assets/characters/grandpa.png${v}`);

    // 3. Ingredients
    this.load.image('ing_fish_ball', `assets/ingredients/fish_ball.png${v}`);
    this.load.image('ing_fried_fish_ball', `assets/ingredients/fried_fish_ball.png${v}`);
    this.load.image('ing_beef_ball', `assets/ingredients/beef_ball.png${v}`);
    this.load.image('ing_shrimp_ball', `assets/ingredients/shrimp_ball.png${v}`);
    this.load.image('ing_salted_egg_ball', `assets/ingredients/salted_egg_ball.png${v}`);
    this.load.image('ing_cheese_ball', `assets/ingredients/cheese_ball.png${v}`);
    this.load.image('ing_fish_tofu', `assets/ingredients/fish_tofu.png${v}`);
    this.load.image('ing_tofu', `assets/ingredients/tofu.png${v}`);
    this.load.image('ing_fish_cake_strip', `assets/ingredients/fish_cake_strip.png${v}`);
    this.load.image('ing_veggies', `assets/ingredients/veggies.png${v}`);
    this.load.image('ing_pickled_greens', `assets/ingredients/pickled_greens.png${v}`);
    this.load.image('ing_toppings_side', `assets/ingredients/toppings_side.png${v}`);

    // 4. Sauces
    this.load.image('sauce_chili', `assets/sauces/sauce_chili.png${v}`);
    this.load.image('sauce_tomato', `assets/sauces/sauce_tomato.png${v}`);
    this.load.image('sauce_black_soy', `assets/sauces/sauce_black_soy.png${v}`);

    // 5. UI Elements
    this.load.image('ui_platter', `assets/ui/platter_basket.png${v}`);
    this.load.image('ui_menu_infographic', `assets/ui/menu_infographic.png${v}`);
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
