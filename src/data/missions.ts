export interface MissionConfig {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardMoney: number;
  rewardGems: number;
  type: 'serve_count' | 'perfect_count' | 'earn_money' | 'serve_vip' | 'combo_streak';
}

export const DAILY_MISSIONS: MissionConfig[] = [
  {
    id: 'm_serve_10',
    title: 'Bán Nhanh Tay',
    description: 'Phục vụ thành công 8 khách hàng',
    target: 8,
    rewardMoney: 15000,
    rewardGems: 1,
    type: 'serve_count'
  },
  {
    id: 'm_perfect_5',
    title: 'Đầu Bếp Vàng',
    description: 'Đạt PERFECT khi vớt đồ chiên 6 lần',
    target: 6,
    rewardMoney: 20000,
    rewardGems: 2,
    type: 'perfect_count'
  },
  {
    id: 'm_earn_50k',
    title: 'Thu Nhập Khá',
    description: 'Kiếm được 50.000 VNĐ trong ngày',
    target: 50000,
    rewardMoney: 10000,
    rewardGems: 1,
    type: 'earn_money'
  },
  {
    id: 'm_vip_1',
    title: 'Khách VIP Sành Ăn',
    description: 'Phục vụ thành công 1 khách VIP',
    target: 1,
    rewardMoney: 25000,
    rewardGems: 2,
    type: 'serve_vip'
  }
];

export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardGems: number;
  type: 'total_served' | 'total_earned' | 'total_perfect' | 'max_combo' | 'upgrades_bought';
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'ach_first_customer',
    title: 'Xiên Đầu Tiên',
    description: 'Phục vụ thành công vị khách đầu tiên',
    icon: '🍢',
    target: 1,
    rewardGems: 1,
    type: 'total_served'
  },
  {
    id: 'ach_serve_30',
    title: 'Quán Cá Viên Đắt Khách',
    description: 'Phục vụ tổng cộng 30 khách hàng',
    icon: '👥',
    target: 30,
    rewardGems: 3,
    type: 'total_served'
  },
  {
    id: 'ach_perfect_20',
    title: 'Bậc Thầy Canh Lửa',
    description: 'Đạt 20 lần chiên PERFECT',
    icon: '⭐',
    target: 20,
    rewardGems: 3,
    type: 'total_perfect'
  },
  {
    id: 'ach_combo_5',
    title: 'Chiên Liền Tay',
    description: 'Đạt chuỗi COMBO x5 liên tiếp',
    icon: '🔥',
    target: 5,
    rewardGems: 4,
    type: 'max_combo'
  },
  {
    id: 'ach_rich_100k',
    title: 'Triệu Phú Vỉa Hè',
    description: 'Tích lũy tổng doanh thu 200.000 VNĐ',
    icon: '💰',
    target: 200000,
    rewardGems: 5,
    type: 'total_earned'
  },
  {
    id: 'ach_upgrade_3',
    title: 'Đầu Tư Làm Ăn',
    description: 'Nâng cấp 3 trang thiết bị quán',
    icon: '🍳',
    target: 3,
    rewardGems: 4,
    type: 'upgrades_bought'
  }
];
