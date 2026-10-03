import { Plate } from '../entities/Plate';
import { Customer } from '../entities/Customer';
import { Storage } from './SaveManager';
import { EventBus } from '../core/EventBus';
import { AudioManager } from '../core/AudioSynthesizer';
import { UPGRADES } from '../data/upgrades';

export interface ServeResult {
  success: boolean;
  message: string;
  baseRevenue: number;
  tip: number;
  totalEarned: number;
  isPerfect: boolean;
  hasBurnt: boolean;
  comboCount: number;
  bonusGems: number;
}

export class EconomySystem {
  public comboStreak: number = 0;
  public totalDayRevenue: number = 0;
  public totalDayTips: number = 0;
  public perfectCountInDay: number = 0;

  constructor() {}

  public resetDay(): void {
    this.comboStreak = 0;
    this.totalDayRevenue = 0;
    this.totalDayTips = 0;
    this.perfectCountInDay = 0;
  }

  public evaluateServing(plate: Plate, customer: Customer): ServeResult {
    const plateCounts = plate.getItemCounts();

    // 1. Check for Burnt items
    const hasBurnt = plate.items.some(it => it.quality === 'burnt');
    if (hasBurnt) {
      this.comboStreak = 0;
      AudioManager.playBurnt();
      return {
        success: false,
        message: 'Đồ ăn bị cháy khét lẹt! Khách không nhận!',
        baseRevenue: 0,
        tip: 0,
        totalEarned: 0,
        isPerfect: false,
        hasBurnt: true,
        comboCount: 0,
        bonusGems: 0
      };
    }

    // 2. Check if customer's ordered ingredients are present
    let isMatch = true;
    for (const orderItem of customer.orderItems) {
      const providedCount = plateCounts[orderItem.ingredientId] || 0;
      if (providedCount < orderItem.count) {
        isMatch = false;
        break;
      }
    }

    // Check required sauces
    for (const s of customer.orderSauces) {
      if (!plate.sauces.includes(s)) {
        isMatch = false;
        break;
      }
    }

    // Check required toppings
    for (const t of customer.orderToppings) {
      if (!plate.toppings.includes(t)) {
        isMatch = false;
        break;
      }
    }

    if (!isMatch) {
      this.comboStreak = 0;
      return {
        success: false,
        message: 'Chưa đủ món hoặc giao sai đồ ăn của khách!',
        baseRevenue: 0,
        tip: 0,
        totalEarned: 0,
        isPerfect: false,
        hasBurnt: false,
        comboCount: 0,
        bonusGems: 0
      };
    }

    // 3. Match Succeeded! Calculate quality & Perfect check
    const fryableItems = plate.items.filter(it => it.config.type === 'fryable');
    const isPerfect = fryableItems.length > 0 && fryableItems.every(it => it.quality === 'perfect');

    if (isPerfect) {
      this.comboStreak++;
      this.perfectCountInDay++;
      AudioManager.playPerfect();
    } else {
      this.comboStreak = Math.max(1, this.comboStreak);
    }

    // Base Revenue
    let baseRevenue = customer.baseBillTotal;

    // Upgrades: Sauce upgrade boosts Tip
    const sauceLevel = Storage.getUpgradeLevel('sauce_station') || 1;
    const sauceCfg = UPGRADES.sauce_station.levels.find(l => l.level === sauceLevel);
    const sauceTipBoost = sauceCfg ? sauceCfg.effectValue : 1.0;

    // Tip Calculation: speed + patience + combo multiplier + VIP bonus
    const speedRatio = customer.patiencePercent; // 0.0 to 1.0
    let baseTip = Math.round(baseRevenue * 0.2 * speedRatio * customer.config.tipMultiplier * sauceTipBoost);

    if (isPerfect) {
      baseTip += Math.round(baseRevenue * 0.25);
    }

    // Combo bonus
    const comboBonus = Math.round((this.comboStreak - 1) * 2000);
    const totalTip = Math.max(0, baseTip + comboBonus);
    const totalEarned = baseRevenue + totalTip;

    // Gem reward chance on high combo or VIP perfect
    let bonusGems = 0;
    if (customer.config.isVip && isPerfect) {
      bonusGems += 1;
    }
    if (this.comboStreak >= 4 && this.comboStreak % 2 === 0) {
      bonusGems += 1;
    }

    this.totalDayRevenue += totalEarned;
    this.totalDayTips += totalTip;

    // Save progression
    Storage.addMoney(totalEarned);
    if (bonusGems > 0) {
      Storage.addGems(bonusGems);
    }

    AudioManager.playCoin();

    // Trigger celebration
    EventBus.emit('SERVING_SUCCESS', {
      customer,
      totalEarned,
      tip: totalTip,
      isPerfect,
      combo: this.comboStreak,
      bonusGems
    });

    return {
      success: true,
      message: isPerfect ? '⭐ PERFECT SERVICE! ⭐' : 'Phục vụ thành công!',
      baseRevenue,
      tip: totalTip,
      totalEarned,
      isPerfect,
      hasBurnt: false,
      comboCount: this.comboStreak,
      bonusGems
    };
  }
}
