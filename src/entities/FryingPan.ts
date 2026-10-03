import { INGREDIENTS, IngredientConfig } from '../data/ingredients';
import { EventBus } from '../core/EventBus';
import { AudioManager } from '../core/AudioSynthesizer';
import { Storage } from '../systems/SaveManager';
import { UPGRADES } from '../data/upgrades';

export type CookingState = 'RAW' | 'FRYING' | 'PERFECT' | 'BURNT';

export interface PanSlot {
  index: number;
  ingredientId: string | null;
  config: IngredientConfig | null;
  state: CookingState;
  progress: number; // 0.0 to 1.0
  elapsedTime: number; // seconds
  totalFryTime: number;
  perfectStartTime: number;
  burntStartTime: number;
  isAutoScooped?: boolean;
}

export class FryingPan {
  public maxSlots: number = 3;
  public slots: PanSlot[] = [];
  public speedMultiplier: number = 1.0;
  public autoHelperLevel: number = 0;

  constructor() {
    this.refreshUpgrades();
  }

  public refreshUpgrades(): void {
    const slotLevel = Storage.getUpgradeLevel('pan_slots') || 1;
    const slotConfig = UPGRADES.pan_slots.levels.find(l => l.level === slotLevel);
    this.maxSlots = slotConfig ? slotConfig.effectValue : 3;

    const speedLevel = Storage.getUpgradeLevel('fry_speed') || 1;
    const speedConfig = UPGRADES.fry_speed.levels.find(l => l.level === speedLevel);
    this.speedMultiplier = speedConfig ? speedConfig.effectValue : 1.0;

    this.autoHelperLevel = Storage.getUpgradeLevel('staff_fryer') || 0;

    // Adjust slots array
    while (this.slots.length < this.maxSlots) {
      this.slots.push({
        index: this.slots.length,
        ingredientId: null,
        config: null,
        state: 'RAW',
        progress: 0,
        elapsedTime: 0,
        totalFryTime: 0,
        perfectStartTime: 0,
        burntStartTime: 0
      });
    }
  }

  public getAvailableSlotIndex(): number {
    return this.slots.findIndex(s => s.ingredientId === null);
  }

  public addIngredient(ingredientId: string): number {
    const slotIdx = this.getAvailableSlotIndex();
    if (slotIdx === -1) return -1;

    const config = INGREDIENTS[ingredientId];
    if (!config || config.type !== 'fryable') return -1;

    const baseCook = config.cookingTime / this.speedMultiplier;
    const perfectWin = config.perfectWindow;
    const burntWin = config.burntTime;

    this.slots[slotIdx] = {
      index: slotIdx,
      ingredientId,
      config,
      state: 'RAW',
      progress: 0,
      elapsedTime: 0,
      totalFryTime: baseCook,
      perfectStartTime: baseCook,
      burntStartTime: baseCook + perfectWin,
      isAutoScooped: false
    };

    AudioManager.playDrop();
    this.updateActiveSizzle();
    EventBus.emit('PAN_UPDATED', this);
    return slotIdx;
  }

  public update(deltaSeconds: number): void {
    let changed = false;
    let activeFrying = 0;

    for (const slot of this.slots) {
      if (!slot.ingredientId || !slot.config) continue;

      slot.elapsedTime += deltaSeconds;
      activeFrying++;

      const totalCycle = slot.burntStartTime + slot.config.burntTime;
      slot.progress = Math.min(1.0, slot.elapsedTime / totalCycle);

      const oldState = slot.state;

      if (slot.elapsedTime < slot.perfectStartTime * 0.3) {
        slot.state = 'RAW';
      } else if (slot.elapsedTime < slot.perfectStartTime) {
        slot.state = 'FRYING';
      } else if (slot.elapsedTime < slot.burntStartTime) {
        slot.state = 'PERFECT';

        // Auto-scoop helper staff skill
        if (this.autoHelperLevel > 0 && !slot.isAutoScooped) {
          slot.isAutoScooped = true;
          EventBus.emit('STAFF_AUTO_SCOOP', slot.index);
        }
      } else {
        slot.state = 'BURNT';
      }

      if (oldState !== slot.state) {
        changed = true;
        if (slot.state === 'PERFECT') {
          AudioManager.playPerfect();
          EventBus.emit('COOKING_PERFECT', slot);
        } else if (slot.state === 'BURNT') {
          AudioManager.playBurnt();
          EventBus.emit('COOKING_BURNT', slot);
        }
      }
    }

    AudioManager.updateSizzle(activeFrying);

    if (changed || activeFrying > 0) {
      EventBus.emit('PAN_UPDATED', this);
    }
  }

  public takeSlot(slotIndex: number): PanSlot | null {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    const slot = this.slots[slotIndex];
    if (!slot.ingredientId) return null;

    const result = { ...slot };
    this.slots[slotIndex] = {
      index: slotIndex,
      ingredientId: null,
      config: null,
      state: 'RAW',
      progress: 0,
      elapsedTime: 0,
      totalFryTime: 0,
      perfectStartTime: 0,
      burntStartTime: 0
    };

    this.updateActiveSizzle();
    EventBus.emit('PAN_UPDATED', this);
    return result;
  }

  public clear(): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = {
        index: i,
        ingredientId: null,
        config: null,
        state: 'RAW',
        progress: 0,
        elapsedTime: 0,
        totalFryTime: 0,
        perfectStartTime: 0,
        burntStartTime: 0
      };
    }
    this.updateActiveSizzle();
    EventBus.emit('PAN_UPDATED', this);
  }

  private updateActiveSizzle(): void {
    const active = this.slots.filter(s => s.ingredientId !== null).length;
    AudioManager.updateSizzle(active);
  }
}
