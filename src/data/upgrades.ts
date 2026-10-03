export interface UpgradeLevel {
  level: number;
  cost: number;
  gemsCost?: number;
  description: string;
  effectValue: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  category: 'equipment' | 'cart' | 'staff';
  icon: string;
  maxLevel: number;
  levels: UpgradeLevel[];
}

export const UPGRADES: Record<string, UpgradeConfig> = {
  pan_slots: {
    id: 'pan_slots',
    name: 'Mở Rộng Chảo Dầu',
    category: 'equipment',
    icon: '🍳',
    maxLevel: 4,
    levels: [
      { level: 1, cost: 0, description: 'Chảo cơ bản: 3 chỗ chiên cùng lúc', effectValue: 3 },
      { level: 2, cost: 25000, description: 'Chảo lớn: 4 chỗ chiên cùng lúc', effectValue: 4 },
      { level: 3, cost: 60000, description: 'Chảo đôi: 6 chỗ chiên cùng lúc', effectValue: 6 },
      { level: 4, cost: 150000, gemsCost: 5, description: 'Chảo công nghiệp: 8 chỗ chiên siêu tốc', effectValue: 8 }
    ]
  },
  fry_speed: {
    id: 'fry_speed',
    name: 'Bếp Khè Siêu Tốc',
    category: 'equipment',
    icon: '🔥',
    maxLevel: 3,
    levels: [
      { level: 1, cost: 0, description: 'Bếp ga du lịch tiêu chuẩn', effectValue: 1.0 },
      { level: 2, cost: 30000, description: 'Bếp khè lửa xanh: Chiên nhanh hơn 20%', effectValue: 1.2 },
      { level: 3, cost: 80000, description: 'Bếp áp suất cao cấp: Chiên nhanh hơn 40%', effectValue: 1.4 }
    ]
  },
  queue_capacity: {
    id: 'queue_capacity',
    name: 'Bàn Ghế Nhựa & Mái Che',
    category: 'cart',
    icon: '🪑',
    maxLevel: 3,
    levels: [
      { level: 1, cost: 0, description: 'Hàng chờ tối đa 2 khách', effectValue: 2 },
      { level: 2, cost: 35000, description: 'Thêm ghế nhựa: Hàng chờ 3 khách', effectValue: 3 },
      { level: 3, cost: 90000, description: 'Mái che mát rượi: Hàng chờ 4 khách + Khách kiên nhẫn hơn 20%', effectValue: 4 }
    ]
  },
  sauce_station: {
    id: 'sauce_station',
    name: 'Quầy Nước Chấm Hảo Hạng',
    category: 'cart',
    icon: '🌶️',
    maxLevel: 3,
    levels: [
      { level: 1, cost: 0, description: 'Khay sốt cơ bản', effectValue: 1.0 },
      { level: 2, cost: 40000, description: 'Sốt me tắc tự làm: Tăng 25% tiền Tip', effectValue: 1.25 },
      { level: 3, cost: 100000, description: 'Bộ sốt thượng hạng: Tăng 50% tiền Tip & +10% Combo XP', effectValue: 1.5 }
    ]
  },
  staff_fryer: {
    id: 'staff_fryer',
    name: 'Phụ Bếp Chiên Tự Động',
    category: 'staff',
    icon: '👨‍🍳',
    maxLevel: 2,
    levels: [
      { level: 0, cost: 0, description: 'Chưa thuê phụ bếp', effectValue: 0 },
      { level: 1, cost: 120000, gemsCost: 3, description: 'Thuê em Út phụ vớt đồ chiên khi đạt PERFECT (tránh bị cháy)', effectValue: 1 },
      { level: 2, cost: 250000, gemsCost: 8, description: 'Em Út lành nghề: Tự vớt ngay khi đạt PERFECT & cộng thêm 15% điểm', effectValue: 2 }
    ]
  },
  staff_waiter: {
    id: 'staff_waiter',
    name: 'Phục Vụ Bưng Bê',
    category: 'staff',
    icon: '🏃',
    maxLevel: 2,
    levels: [
      { level: 0, cost: 0, description: 'Chưa thuê phục vụ', effectValue: 0 },
      { level: 1, cost: 100000, gemsCost: 2, description: 'Thuê chú Tèo: Khách chờ không bị giảm kiên nhẫn trong 10s đầu', effectValue: 1 },
      { level: 2, cost: 200000, gemsCost: 6, description: 'Chú Tèo nhanh nhẹn: Tăng 35% toàn bộ lòng kiên nhẫn của khách', effectValue: 2 }
    ]
  }
};
