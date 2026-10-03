import { Customer } from '../entities/Customer';
import { LevelConfig } from '../data/levels';
import { EventBus } from '../core/EventBus';
import { Storage } from './SaveManager';
import { UPGRADES } from '../data/upgrades';

export class CustomerSystem {
  public queue: Customer[] = [];
  public maxQueueCapacity: number = 2;
  public totalSpawnedInDay: number = 0;
  public totalServedInDay: number = 0;
  public totalLeftInDay: number = 0;
  public currentLevel: LevelConfig | null = null;
  private spawnTimer: number = 0;
  private nextSpawnDelay: number = 3.0;
  private isDayActive: boolean = false;

  constructor() {
    this.refreshCapacity();
  }

  public refreshCapacity(): void {
    const queueLevel = Storage.getUpgradeLevel('queue_capacity') || 1;
    const cfg = UPGRADES.queue_capacity.levels.find(l => l.level === queueLevel);
    this.maxQueueCapacity = cfg ? cfg.effectValue : 2;
  }

  public startDay(level: LevelConfig): void {
    this.currentLevel = level;
    this.queue = [];
    this.totalSpawnedInDay = 0;
    this.totalServedInDay = 0;
    this.totalLeftInDay = 0;
    this.isDayActive = true;
    this.spawnTimer = 1.0; // spawn first customer quickly
    this.nextSpawnDelay = 1.5;
    this.refreshCapacity();
    EventBus.emit('CUSTOMER_QUEUE_UPDATED', this.queue);
  }

  public update(deltaSeconds: number): void {
    if (!this.isDayActive || !this.currentLevel) return;

    // Update active customers in queue
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const cust = this.queue[i];
      cust.update(deltaSeconds);

      // Remove customer when completely left
      if (cust.state === 'LEAVING' && cust.alpha <= 0.05) {
        this.queue.splice(i, 1);
        this.recalculateQueuePositions();
        EventBus.emit('CUSTOMER_QUEUE_UPDATED', this.queue);
      }
    }

    // Spawn new customers if under limit
    if (this.totalSpawnedInDay < this.currentLevel.totalCustomers) {
      if (this.queue.length < this.maxQueueCapacity) {
        this.spawnTimer += deltaSeconds;
        if (this.spawnTimer >= this.nextSpawnDelay) {
          this.spawnCustomer();
          this.spawnTimer = 0;
          const [minD, maxD] = this.currentLevel.spawnInterval;
          this.nextSpawnDelay = minD + Math.random() * (maxD - minD);
        }
      }
    }
  }

  public spawnCustomer(): Customer | null {
    if (!this.currentLevel || this.queue.length >= this.maxQueueCapacity) return null;

    // Pick customer type (check VIP chance)
    let custId: string;
    const isVip = Math.random() < this.currentLevel.vipChance;
    if (isVip && this.currentLevel.allowedCustomers.includes('vip_lady')) {
      custId = 'vip_lady';
    } else {
      const regular = this.currentLevel.allowedCustomers.filter(id => id !== 'vip_lady');
      custId = regular[Math.floor(Math.random() * regular.length)] || 'student_boy';
    }

    const queueIdx = this.queue.length;
    const customer = new Customer(custId, queueIdx, this.currentLevel.allowedIngredients);

    // Initial position off screen right
    customer.x = 450;
    customer.y = 230;
    customer.scale = 0.85;

    this.queue.push(customer);
    this.totalSpawnedInDay++;
    this.recalculateQueuePositions();

    EventBus.emit('CUSTOMER_SPAWNED', customer);
    EventBus.emit('CUSTOMER_QUEUE_UPDATED', this.queue);
    return customer;
  }

  public getFrontCustomer(): Customer | null {
    if (this.queue.length === 0) return null;
    const front = this.queue[0];
    if (front.state === 'WAITING' || front.state === 'WALKING_IN') {
      return front;
    }
    return null;
  }

  public removeFrontCustomer(success: boolean): void {
    if (this.queue.length === 0) return;
    const front = this.queue[0];
    if (success) {
      this.totalServedInDay++;
    } else {
      this.totalLeftInDay++;
    }
  }

  public recalculateQueuePositions(): void {
    // Front customer is at center left (x: 180, y: 220)
    // Subsequent queue customers are spaced to the right
    const basePositions = [
      { x: 190, y: 230, scale: 0.95 },
      { x: 310, y: 220, scale: 0.85 },
      { x: 410, y: 215, scale: 0.75 },
      { x: 490, y: 210, scale: 0.65 }
    ];

    this.queue.forEach((cust, idx) => {
      cust.queueIndex = idx;
      if (cust.state !== 'LEAVING') {
        const pos = basePositions[Math.min(idx, basePositions.length - 1)];
        cust.targetX = pos.x;
        cust.targetY = pos.y;
        cust.scale = pos.scale;
      }
    });
  }

  public isDayFinished(): boolean {
    if (!this.currentLevel) return false;
    return (
      this.totalSpawnedInDay >= this.currentLevel.totalCustomers &&
      this.queue.length === 0
    );
  }
}
