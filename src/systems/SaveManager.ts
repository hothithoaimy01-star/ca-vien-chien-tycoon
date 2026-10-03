export interface GameSaveData {
  money: number;
  gems: number;
  currentDay: number;
  unlockedDay: number;
  upgrades: Record<string, number>; // upgradeId -> level
  missionProgress: Record<string, { current: number; claimed: boolean }>;
  achievementProgress: Record<string, { current: number; claimed: boolean }>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  tutorialCompleted: boolean;
  totalServed: number;
  totalEarned: number;
  totalPerfect: number;
  maxCombo: number;
}

const DEFAULT_SAVE: GameSaveData = {
  money: 5000, // starting pocket money
  gems: 2,
  currentDay: 1,
  unlockedDay: 1,
  upgrades: {
    pan_slots: 1, // 3 slots default
    fry_speed: 1,
    queue_capacity: 1, // 2 queue capacity default
    sauce_station: 1,
    staff_fryer: 0,
    staff_waiter: 0
  },
  missionProgress: {},
  achievementProgress: {},
  soundEnabled: true,
  musicEnabled: true,
  tutorialCompleted: false,
  totalServed: 0,
  totalEarned: 0,
  totalPerfect: 0,
  maxCombo: 0
};

const STORAGE_KEY = 'CA_VIEN_CHIEN_TYCOON_SAVE_V1';

export class SaveManager {
  private static instance: SaveManager;
  private data: GameSaveData;

  private constructor() {
    this.data = this.load();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public getData(): GameSaveData {
    return this.data;
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public load(): GameSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades || {}) }
        };
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return { ...DEFAULT_SAVE };
  }

  public reset(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }

  public addMoney(amount: number): void {
    this.data.money += amount;
    this.data.totalEarned += Math.max(0, amount);
    this.save();
  }

  public spendMoney(amount: number): boolean {
    if (this.data.money >= amount) {
      this.data.money -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public addGems(amount: number): void {
    this.data.gems += amount;
    this.save();
  }

  public spendGems(amount: number): boolean {
    if (this.data.gems >= amount) {
      this.data.gems -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public setUpgradeLevel(upgradeId: string, level: number): void {
    this.data.upgrades[upgradeId] = level;
    this.save();
  }

  public getUpgradeLevel(upgradeId: string): number {
    return this.data.upgrades[upgradeId] || 0;
  }
}

export const Storage = SaveManager.getInstance();
