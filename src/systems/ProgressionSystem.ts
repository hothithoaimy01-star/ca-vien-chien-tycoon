import { LEVELS, LevelConfig } from '../data/levels';
import { DAILY_MISSIONS, ACHIEVEMENTS } from '../data/missions';
import { Storage } from './SaveManager';
import { EventBus } from '../core/EventBus';
import { AudioManager } from '../core/AudioSynthesizer';

export interface DaySummary {
  day: number;
  isVictory: boolean;
  revenue: number;
  targetRevenue: number;
  servedCount: number;
  totalCustomers: number;
  perfectCount: number;
  bonusGems: number;
}

export class ProgressionSystem {
  public currentLevelIndex: number = 0;

  constructor() {
    const save = Storage.getData();
    this.currentLevelIndex = Math.min(LEVELS.length - 1, Math.max(0, save.currentDay - 1));
  }

  public getCurrentLevel(): LevelConfig {
    const save = Storage.getData();
    const dayIdx = Math.min(LEVELS.length - 1, Math.max(0, save.currentDay - 1));
    return LEVELS[dayIdx];
  }

  public evaluateDayEnd(revenue: number, servedCount: number, perfectCount: number): DaySummary {
    const currentLevel = this.getCurrentLevel();
    const isVictory = revenue >= currentLevel.targetRevenue;

    const summary: DaySummary = {
      day: currentLevel.day,
      isVictory,
      revenue,
      targetRevenue: currentLevel.targetRevenue,
      servedCount,
      totalCustomers: currentLevel.totalCustomers,
      perfectCount,
      bonusGems: isVictory ? currentLevel.bonusGems : 0
    };

    const save = Storage.getData();
    save.totalServed += servedCount;
    save.totalPerfect += perfectCount;

    if (isVictory) {
      AudioManager.playWinFanfare();
      Storage.addGems(currentLevel.bonusGems);

      // Advance to next day if available
      if (save.currentDay < LEVELS.length) {
        save.currentDay++;
        save.unlockedDay = Math.max(save.unlockedDay, save.currentDay);
      }
    } else {
      AudioManager.playCustomerAngry();
    }

    Storage.save();
    this.checkMissionsAndAchievements(revenue, servedCount, perfectCount);

    EventBus.emit('DAY_ENDED', summary);
    return summary;
  }

  public checkMissionsAndAchievements(revenue: number, servedCount: number, perfectCount: number): void {
    const save = Storage.getData();

    // Check Daily missions
    DAILY_MISSIONS.forEach(m => {
      if (!save.missionProgress[m.id]) {
        save.missionProgress[m.id] = { current: 0, claimed: false };
      }
      const p = save.missionProgress[m.id];
      if (m.type === 'serve_count') p.current += servedCount;
      if (m.type === 'perfect_count') p.current += perfectCount;
      if (m.type === 'earn_money') p.current += revenue;
    });

    // Check Achievements
    ACHIEVEMENTS.forEach(a => {
      if (!save.achievementProgress[a.id]) {
        save.achievementProgress[a.id] = { current: 0, claimed: false };
      }
      const p = save.achievementProgress[a.id];
      if (a.type === 'total_served') p.current = save.totalServed;
      if (a.type === 'total_earned') p.current = save.totalEarned;
      if (a.type === 'total_perfect') p.current = save.totalPerfect;
      if (a.type === 'max_combo') p.current = save.maxCombo;
    });

    Storage.save();
  }
}
