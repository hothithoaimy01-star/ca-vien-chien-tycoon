import { EventBus } from '../core/EventBus';
import { Storage } from '../systems/SaveManager';
import { UPGRADES } from '../data/upgrades';
import { DAILY_MISSIONS, ACHIEVEMENTS } from '../data/missions';
import { AudioManager } from '../core/AudioSynthesizer';
import { DaySummary } from '../systems/ProgressionSystem';
import confetti from 'canvas-confetti';

export class ModalsManager {
  private overlayContainer!: HTMLElement;

  constructor() {
    this.createOverlayDOM();
    this.bindEvents();
  }

  private createOverlayDOM(): void {
    let existing = document.getElementById('game-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'game-modal-overlay';
      existing.className = 'modal-overlay hidden';
      document.body.appendChild(existing);
    }
    this.overlayContainer = existing;
  }

  private bindEvents(): void {
    EventBus.on('OPEN_UPGRADE_MODAL', () => this.showUpgradeModal());
    EventBus.on('OPEN_MISSIONS_MODAL', () => this.showMissionsModal());
    EventBus.on('OPEN_MENU_INFOGRAPHIC', () => this.showMenuInfographicModal());
    EventBus.on('OPEN_PAUSE_MODAL', () => this.showPauseModal());
    EventBus.on('OPEN_DAY_SUMMARY_MODAL', (summary: DaySummary) => this.showDaySummaryModal(summary));
  }

  public hide(): void {
    this.overlayContainer.className = 'modal-overlay hidden';
    this.overlayContainer.innerHTML = '';
  }

  // 1. UPGRADE MODAL
  public showUpgradeModal(): void {
    const save = Storage.getData();
    this.overlayContainer.className = 'modal-overlay';
    
    let upgradesHtml = '';
    Object.values(UPGRADES).forEach(u => {
      const currentLvl = save.upgrades[u.id] || (u.category === 'staff' ? 0 : 1);
      const isMax = currentLvl >= u.maxLevel;
      const nextConfig = u.levels.find(l => l.level === (currentLvl === 0 ? 1 : currentLvl + 1));
      const currentConfig = u.levels.find(l => l.level === currentLvl);

      const canAfford = nextConfig ? (save.money >= nextConfig.cost && (!nextConfig.gemsCost || save.gems >= nextConfig.gemsCost)) : false;

      upgradesHtml += `
        <div class="upgrade-card">
          <div class="upgrade-header">
            <span class="upgrade-icon">${u.icon}</span>
            <div class="upgrade-title-box">
              <div class="upgrade-name">${u.name}</div>
              <div class="upgrade-level">Cấp: ${currentLvl} / ${u.maxLevel}</div>
            </div>
          </div>
          <div class="upgrade-desc">${currentConfig ? currentConfig.description : 'Chưa sở hữu'}</div>
          ${!isMax && nextConfig ? `
            <div class="upgrade-next">👉 Cấp tiếp: ${nextConfig.description}</div>
            <div class="upgrade-footer">
              <div class="upgrade-cost">
                ${nextConfig.cost > 0 ? `💰 ${nextConfig.cost.toLocaleString('vi-VN')} đ ` : ''}
                ${nextConfig.gemsCost ? `💎 ${nextConfig.gemsCost}` : ''}
              </div>
              <button class="btn-upgrade ${canAfford ? 'btn-active' : 'btn-disabled'}" data-id="${u.id}">
                ${canAfford ? 'NÂNG CẤP' : 'CHƯA ĐỦ TIỀN'}
              </button>
            </div>
          ` : `
            <div class="upgrade-max">⭐ ĐÃ ĐẠT CẤP TỐI ĐA</div>
          `}
        </div>
      `;
    });

    this.overlayContainer.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>🍳 NÂNG CẤP QUÁN ĂN</h2>
          <button class="modal-close-btn" id="modal-close">✕</button>
        </div>
        <div class="modal-wallet">
          <span>💰 ${save.money.toLocaleString('vi-VN')} đ</span>
          <span>💎 ${save.gems} Kim Cương</span>
        </div>
        <div class="modal-body scrollable">
          ${upgradesHtml}
        </div>
      </div>
    `;

    document.getElementById('modal-close')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
    });

    this.overlayContainer.querySelectorAll('.btn-upgrade.btn-active').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (!id) return;
        this.purchaseUpgrade(id);
      });
    });
  }

  private purchaseUpgrade(upgradeId: string): void {
    const save = Storage.getData();
    const u = UPGRADES[upgradeId];
    if (!u) return;

    const currentLvl = save.upgrades[upgradeId] || (u.category === 'staff' ? 0 : 1);
    const nextConfig = u.levels.find(l => l.level === (currentLvl === 0 ? 1 : currentLvl + 1));
    if (!nextConfig) return;

    if (save.money >= nextConfig.cost && (!nextConfig.gemsCost || save.gems >= nextConfig.gemsCost)) {
      Storage.spendMoney(nextConfig.cost);
      if (nextConfig.gemsCost) {
        Storage.spendGems(nextConfig.gemsCost);
      }
      Storage.setUpgradeLevel(upgradeId, nextConfig.level);
      AudioManager.playUpgrade();
      this.showUpgradeModal(); // Refresh modal
    }
  }

  // 2. MISSIONS & ACHIEVEMENTS MODAL
  public showMissionsModal(): void {
    const save = Storage.getData();
    this.overlayContainer.className = 'modal-overlay';

    let missionsHtml = '';
    DAILY_MISSIONS.forEach(m => {
      const prog = save.missionProgress[m.id] || { current: 0, claimed: false };
      const isCompleted = prog.current >= m.target;
      const isClaimed = prog.claimed;

      missionsHtml += `
        <div class="mission-card">
          <div class="mission-info">
            <div class="mission-title">${m.title}</div>
            <div class="mission-desc">${m.description}</div>
            <div class="mission-progress-bar">
              <div class="mission-bar-fill" style="width: ${Math.min(100, (prog.current / m.target) * 100)}%"></div>
            </div>
            <div class="mission-progress-text">${Math.min(prog.current, m.target)} / ${m.target}</div>
          </div>
          <div class="mission-action">
            <div class="mission-reward">💰 ${m.rewardMoney.toLocaleString('vi-VN')} đ<br>💎 +${m.rewardGems}</div>
            <button class="btn-claim ${isCompleted && !isClaimed ? 'btn-active' : 'btn-disabled'}" data-id="${m.id}" data-type="mission">
              ${isClaimed ? 'ĐÃ NHẬN' : isCompleted ? 'NHẬN' : 'CHƯA ĐẠT'}
            </button>
          </div>
        </div>
      `;
    });

    let achHtml = '';
    ACHIEVEMENTS.forEach(a => {
      const prog = save.achievementProgress[a.id] || { current: 0, claimed: false };
      const isCompleted = prog.current >= a.target;
      const isClaimed = prog.claimed;

      achHtml += `
        <div class="mission-card">
          <div class="mission-info">
            <div class="mission-title">${a.icon} ${a.title}</div>
            <div class="mission-desc">${a.description}</div>
            <div class="mission-progress-bar">
              <div class="mission-bar-fill" style="width: ${Math.min(100, (prog.current / a.target) * 100)}%"></div>
            </div>
            <div class="mission-progress-text">${Math.min(prog.current, a.target)} / ${a.target}</div>
          </div>
          <div class="mission-action">
            <div class="mission-reward">💎 +${a.rewardGems} Kim Cương</div>
            <button class="btn-claim ${isCompleted && !isClaimed ? 'btn-active' : 'btn-disabled'}" data-id="${a.id}" data-type="ach">
              ${isClaimed ? 'ĐÃ NHẬN' : isCompleted ? 'NHẬN' : 'CHƯA ĐẠT'}
            </button>
          </div>
        </div>
      `;
    });

    this.overlayContainer.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>🏆 NHIỆM VỤ & THÀNH TÍCH</h2>
          <button class="modal-close-btn" id="modal-close">✕</button>
        </div>
        <div class="modal-body scrollable">
          <h3 class="section-title">📋 Nhiệm Vụ Hôm Nay</h3>
          ${missionsHtml}
          <h3 class="section-title" style="margin-top: 20px;">⭐ Thành Tích Kinh Doanh</h3>
          ${achHtml}
        </div>
      </div>
    `;

    document.getElementById('modal-close')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
    });

    this.overlayContainer.querySelectorAll('.btn-claim.btn-active').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const type = (e.currentTarget as HTMLElement).getAttribute('data-type');
        if (!id) return;
        this.claimReward(id, type as 'mission' | 'ach');
      });
    });
  }

  private claimReward(id: string, type: 'mission' | 'ach'): void {
    const save = Storage.getData();
    if (type === 'mission') {
      const m = DAILY_MISSIONS.find(item => item.id === id);
      if (m && save.missionProgress[id] && !save.missionProgress[id].claimed) {
        save.missionProgress[id].claimed = true;
        Storage.addMoney(m.rewardMoney);
        Storage.addGems(m.rewardGems);
        AudioManager.playCoin();
        this.showMissionsModal();
      }
    } else {
      const a = ACHIEVEMENTS.find(item => item.id === id);
      if (a && save.achievementProgress[id] && !save.achievementProgress[id].claimed) {
        save.achievementProgress[id].claimed = true;
        Storage.addGems(a.rewardGems);
        AudioManager.playCoin();
        this.showMissionsModal();
      }
    }
  }

  // 3. MENU INFOGRAPHIC
  public showMenuInfographicModal(): void {
    this.overlayContainer.className = 'modal-overlay';
    this.overlayContainer.innerHTML = `
      <div class="modal-box infographic-box">
        <div class="modal-header">
          <h2>📜 THỰC ĐƠN ĐƯỜNG PHỐ VIỆT NAM</h2>
          <button class="modal-close-btn" id="modal-close">✕</button>
        </div>
        <div class="modal-body scrollable center-content">
          <img src="assets/ui/menu_infographic.png" class="img-infographic" alt="Menu Cá Viên" />
        </div>
      </div>
    `;

    document.getElementById('modal-close')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
    });
  }

  // 4. PAUSE MODAL
  public showPauseModal(): void {
    this.overlayContainer.className = 'modal-overlay';
    this.overlayContainer.innerHTML = `
      <div class="modal-box pause-box">
        <div class="modal-header">
          <h2>⏸️ TẠM DỪNG</h2>
        </div>
        <div class="modal-body center-buttons">
          <button class="btn-modal btn-primary" id="btn-resume">▶ TIẾP TỤC</button>
          <button class="btn-modal btn-secondary" id="btn-sound-toggle">
            ${AudioManager.isSoundOn() ? '🔊 Âm thanh: BẬT' : '🔇 Âm thanh: TẮT'}
          </button>
          <button class="btn-modal btn-secondary" id="btn-restart-day">🔄 Chơi lại ngày này</button>
          <button class="btn-modal btn-danger" id="btn-quit-menu">🏠 Về Trang Chủ</button>
        </div>
      </div>
    `;

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('RESUME_GAME');
    });

    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      const next = !AudioManager.isSoundOn();
      AudioManager.setSoundEnabled(next);
      AudioManager.setMusicEnabled(next);
      const btn = document.getElementById('btn-sound-toggle');
      if (btn) btn.innerText = next ? '🔊 Âm thanh: BẬT' : '🔇 Âm thanh: TẮT';
    });

    document.getElementById('btn-restart-day')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('RESTART_DAY');
    });

    document.getElementById('btn-quit-menu')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('RETURN_TO_MAIN_MENU');
    });
  }

  // 5. DAY SUMMARY MODAL
  public showDaySummaryModal(summary: DaySummary): void {
    this.overlayContainer.className = 'modal-overlay';

    if (summary.isVictory) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.overlayContainer.innerHTML = `
      <div class="modal-box summary-box ${summary.isVictory ? 'victory-box' : 'fail-box'}">
        <div class="summary-header">
          <h2>${summary.isVictory ? '🎉 HOÀN THÀNH NGÀY ' + summary.day + '!' : '😢 NGÀY HÔM NAY CHƯA ĐẠT!'}</h2>
          <div class="summary-subtitle">${summary.isVictory ? 'Quán bán đắt như tôm tươi, khách khen nức nở!' : 'Doanh thu chưa đạt mục tiêu đề ra!'}</div>
        </div>
        <div class="summary-stats">
          <div class="stat-row">
            <span>💰 Tổng Doanh Thu:</span>
            <span class="stat-value ${summary.revenue >= summary.targetRevenue ? 'green' : 'red'}">
              ${summary.revenue.toLocaleString('vi-VN')} đ / ${summary.targetRevenue.toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div class="stat-row">
            <span>👥 Khách Phục Vụ:</span>
            <span class="stat-value">${summary.servedCount} / ${summary.totalCustomers} Khách</span>
          </div>
          <div class="stat-row">
            <span>⭐ Số Lần PERFECT:</span>
            <span class="stat-value gold">${summary.perfectCount} lần</span>
          </div>
          ${summary.bonusGems > 0 ? `
            <div class="stat-row">
              <span>💎 Thưởng Kim Cương:</span>
              <span class="stat-value cyan">+${summary.bonusGems} Kim Cương</span>
            </div>
          ` : ''}
        </div>
        <div class="summary-actions">
          ${summary.isVictory ? `
            <button class="btn-modal btn-primary" id="btn-next-day">🍢 TIẾP TỤC NGÀY MỚI</button>
            <button class="btn-modal btn-secondary" id="btn-open-upgrade">🍳 NÂNG CẤP QUÁN</button>
          ` : `
            <button class="btn-modal btn-primary" id="btn-retry-day">🔄 CHƠI LẠI NGÀY NÀY</button>
            <button class="btn-modal btn-secondary" id="btn-open-upgrade">🍳 NÂNG CẤP ĐỂ DỄ BÁN HƠN</button>
          `}
          <button class="btn-modal btn-outline" id="btn-back-home">🏠 Về Trang Chủ</button>
        </div>
      </div>
    `;

    document.getElementById('btn-next-day')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('NEXT_DAY');
    });

    document.getElementById('btn-retry-day')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('RESTART_DAY');
    });

    document.getElementById('btn-open-upgrade')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.showUpgradeModal();
    });

    document.getElementById('btn-back-home')?.addEventListener('click', () => {
      AudioManager.playTap();
      this.hide();
      EventBus.emit('RETURN_TO_MAIN_MENU');
    });
  }
}

export const Modals = new ModalsManager();
