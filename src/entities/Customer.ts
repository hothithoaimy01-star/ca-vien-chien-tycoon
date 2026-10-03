import { CUSTOMERS, CustomerConfig } from '../data/customers';
import { INGREDIENTS } from '../data/ingredients';
import { EventBus } from '../core/EventBus';
import { AudioManager } from '../core/AudioSynthesizer';
import { Storage } from '../systems/SaveManager';
import { UPGRADES } from '../data/upgrades';

export interface OrderItem {
  ingredientId: string;
  count: number;
}

export type CustomerState = 'WALKING_IN' | 'WAITING' | 'SERVED_HAPPY' | 'SERVED_ANGRY' | 'LEAVING';

export class Customer {
  public id: string;
  public instanceId: string;
  public config: CustomerConfig;
  public state: CustomerState = 'WALKING_IN';
  public queueIndex: number = 0;

  // Order details
  public orderItems: OrderItem[] = [];
  public orderSauces: string[] = [];
  public orderToppings: string[] = [];
  public baseBillTotal: number = 0;

  // Patience
  public maxPatience: number;
  public currentPatience: number;
  public patiencePercent: number = 1.0;

  // Dialogue
  public currentSpeech: string = '';
  public speechTimer: number = 0;

  // Animation values
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public scale: number = 1.0;
  public bounceOffset: number = 0;
  public rotation: number = 0;
  public alpha: number = 1.0;

  constructor(customerId: string, queueIndex: number, allowedIngredients: string[]) {
    this.config = CUSTOMERS[customerId] || CUSTOMERS.student_boy;
    this.id = customerId;
    this.instanceId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.queueIndex = queueIndex;

    // Calculate patience with upgrades
    const queueLevel = Storage.getUpgradeLevel('queue_capacity') || 1;
    const waiterLevel = Storage.getUpgradeLevel('staff_waiter') || 0;
    let patienceBoost = 1.0;
    if (queueLevel >= 3) patienceBoost += 0.2;
    if (waiterLevel >= 2) patienceBoost += 0.35;

    this.maxPatience = this.config.basePatience * patienceBoost;
    this.currentPatience = this.maxPatience;

    // Generate Order
    this.generateOrder(allowedIngredients);

    // Initial greeting
    const greetings = this.config.speechGreeting;
    this.currentSpeech = greetings[Math.floor(Math.random() * greetings.length)];
    this.speechTimer = 4.0;
  }

  private generateOrder(allowedIngredients: string[]): void {
    const fryables = allowedIngredients.filter(id => INGREDIENTS[id]?.type === 'fryable');
    const sauces = allowedIngredients.filter(id => INGREDIENTS[id]?.type === 'sauce');
    const toppings = allowedIngredients.filter(id => INGREDIENTS[id]?.type === 'topping');

    const countToPick = Math.floor(
      Math.random() * (this.config.maxOrderItems - this.config.minOrderItems + 1)
    ) + this.config.minOrderItems;

    const chosenItems: Record<string, number> = {};
    for (let i = 0; i < countToPick; i++) {
      const ingId = fryables[Math.floor(Math.random() * fryables.length)];
      if (ingId) {
        chosenItems[ingId] = (chosenItems[ingId] || 0) + 1;
      }
    }

    this.orderItems = Object.entries(chosenItems).map(([ingredientId, count]) => ({
      ingredientId,
      count
    }));

    // Optional Sauce (70% chance)
    if (sauces.length > 0 && Math.random() < 0.75) {
      const sauceId = sauces[Math.floor(Math.random() * sauces.length)];
      this.orderSauces.push(sauceId);
    }

    // Optional Topping / Side dish (50% chance if available)
    if (toppings.length > 0 && Math.random() < 0.55) {
      const topId = toppings[Math.floor(Math.random() * toppings.length)];
      this.orderToppings.push(topId);
    }

    // Calculate base bill total
    let total = 0;
    for (const item of this.orderItems) {
      const cfg = INGREDIENTS[item.ingredientId];
      if (cfg) total += cfg.sellPrice * item.count;
    }
    for (const s of this.orderSauces) {
      const cfg = INGREDIENTS[s];
      if (cfg) total += cfg.sellPrice;
    }
    for (const t of this.orderToppings) {
      const cfg = INGREDIENTS[t];
      if (cfg) total += cfg.sellPrice;
    }

    this.baseBillTotal = total;
  }

  public update(deltaSeconds: number): void {
    // Dialogue timer
    if (this.speechTimer > 0) {
      this.speechTimer -= deltaSeconds;
      if (this.speechTimer <= 0) {
        this.currentSpeech = '';
      }
    }

    // Move towards target position
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.x += dx * Math.min(1.0, deltaSeconds * 6);
    this.y += dy * Math.min(1.0, deltaSeconds * 6);

    // Walking animation
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      this.bounceOffset = Math.sin(Date.now() * 0.015) * 6;
      this.rotation = Math.sin(Date.now() * 0.01) * 0.05;
    } else {
      this.bounceOffset = Math.sin(Date.now() * 0.003 + this.queueIndex) * 2;
      this.rotation = 0;
      if (this.state === 'WALKING_IN') {
        this.state = 'WAITING';
      }
    }

    // Patience countdown when waiting at the counter
    if (this.state === 'WAITING') {
      this.currentPatience -= deltaSeconds;
      this.patiencePercent = Math.max(0, this.currentPatience / this.maxPatience);

      if (this.currentPatience <= 0) {
        this.onAngryLeave();
      }
    } else if (this.state === 'LEAVING') {
      this.alpha -= deltaSeconds * 1.5;
      this.scale = Math.max(0, this.scale - deltaSeconds * 0.5);
    }
  }

  public onAngryLeave(): void {
    if (this.state === 'SERVED_ANGRY' || this.state === 'LEAVING') return;
    this.state = 'SERVED_ANGRY';
    const angrySpeeches = this.config.speechAngry;
    this.currentSpeech = angrySpeeches[Math.floor(Math.random() * angrySpeeches.length)];
    this.speechTimer = 2.5;
    AudioManager.playCustomerAngry();
    EventBus.emit('CUSTOMER_LEFT_ANGRY', this);

    setTimeout(() => {
      this.state = 'LEAVING';
      this.targetX = -150;
    }, 1200);
  }

  public onServedHappy(feedbackSpeech?: string): void {
    this.state = 'SERVED_HAPPY';
    const happySpeeches = this.config.speechHappy;
    this.currentSpeech = feedbackSpeech || happySpeeches[Math.floor(Math.random() * happySpeeches.length)];
    this.speechTimer = 2.5;
    AudioManager.playCustomerHappy();

    setTimeout(() => {
      this.state = 'LEAVING';
      this.targetX = 600;
    }, 1500);
  }
}
