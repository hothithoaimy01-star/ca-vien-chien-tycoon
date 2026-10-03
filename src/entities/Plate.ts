import { INGREDIENTS, IngredientConfig } from '../data/ingredients';
import { EventBus } from '../core/EventBus';

export interface PlatterItem {
  id: string;
  config: IngredientConfig;
  quality: 'perfect' | 'normal' | 'burnt';
  addedAt: number;
}

export class Plate {
  public items: PlatterItem[] = [];
  public sauces: string[] = [];
  public toppings: string[] = [];

  constructor() {}

  public addItem(ingredientId: string, quality: 'perfect' | 'normal' | 'burnt'): void {
    const config = INGREDIENTS[ingredientId];
    if (!config) return;

    if (config.type === 'fryable') {
      this.items.push({
        id: ingredientId,
        config,
        quality,
        addedAt: Date.now()
      });
    } else if (config.type === 'sauce') {
      if (!this.sauces.includes(ingredientId)) {
        this.sauces.push(ingredientId);
      }
    } else if (config.type === 'topping') {
      if (!this.toppings.includes(ingredientId)) {
        this.toppings.push(ingredientId);
      }
    }

    EventBus.emit('PLATE_UPDATED', this);
  }

  public clear(): void {
    this.items = [];
    this.sauces = [];
    this.toppings = [];
    EventBus.emit('PLATE_UPDATED', this);
  }

  public isEmpty(): boolean {
    return this.items.length === 0 && this.sauces.length === 0 && this.toppings.length === 0;
  }

  public getItemCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of this.items) {
      counts[item.id] = (counts[item.id] || 0) + 1;
    }
    for (const s of this.sauces) {
      counts[s] = (counts[s] || 0) + 1;
    }
    for (const t of this.toppings) {
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }
}
