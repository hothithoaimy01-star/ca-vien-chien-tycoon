export interface LevelConfig {
  day: number;
  name: string;
  location: string;
  background: string;
  targetRevenue: number;
  totalCustomers: number;
  spawnInterval: [number, number]; // min and max seconds between spawns
  allowedCustomers: string[];
  allowedIngredients: string[];
  vipChance: number; // 0.0 - 1.0
  bonusGems: number;
  description: string;
}

export const LEVELS: LevelConfig[] = [
  {
    day: 1,
    name: 'Ngày 1: Khởi Nghiệp Vỉa Hè',
    location: 'Cổng Trường Giờ Tan Học',
    background: 'assets/backgrounds/bg_school_gate.png',
    targetRevenue: 60000,
    totalCustomers: 6,
    spawnInterval: [4, 7],
    allowedCustomers: ['student_boy', 'student_girl', 'grandma'],
    allowedIngredients: ['fish_ball', 'fried_fish_ball', 'sauce_chili', 'sauce_tomato'],
    vipChance: 0.1,
    bonusGems: 2,
    description: 'Bán những xiên cá viên đầu tiên cho các bạn học sinh giờ tan trường.'
  },
  {
    day: 2,
    name: 'Ngày 2: Quán Quen Nổi Tiếng',
    location: 'Mặt Tiền Vỉa Hè Sao Việt',
    background: 'assets/backgrounds/bg_street_shop.png',
    targetRevenue: 120000,
    totalCustomers: 8,
    spawnInterval: [3.5, 6],
    allowedCustomers: ['student_boy', 'student_girl', 'grandma', 'grandpa'],
    allowedIngredients: ['fish_ball', 'fried_fish_ball', 'beef_ball', 'shrimp_ball', 'sauce_chili', 'sauce_tomato', 'sauce_black_soy', 'pickled_greens'],
    vipChance: 0.2,
    bonusGems: 3,
    description: 'Khách đến đông hơn, phục vụ thêm bò viên, tôm viên và đồ chua giòn cay.'
  },
  {
    day: 3,
    name: 'Ngày 3: Món Độc Trứng Muối & Phô Mai',
    location: 'Góc Phố Ẩm Thực',
    background: 'assets/backgrounds/bg_street_shop.png',
    targetRevenue: 200000,
    totalCustomers: 10,
    spawnInterval: [3, 5.5],
    allowedCustomers: ['student_boy', 'student_girl', 'grandma', 'grandpa', 'vip_lady'],
    allowedIngredients: ['fish_ball', 'fried_fish_ball', 'beef_ball', 'shrimp_ball', 'salted_egg_ball', 'cheese_ball', 'sauce_chili', 'sauce_tomato', 'sauce_black_soy', 'pickled_greens', 'toppings_side'],
    vipChance: 0.35,
    bonusGems: 4,
    description: 'Ra mắt siêu phẩm cá viên trứng muối tan chảy và phô mai kéo sợi siêu hút khách VIP!'
  },
  {
    day: 4,
    name: 'Ngày 4: Khách Đông Như Hội',
    location: 'Đại Lộ Ăn Vặt',
    background: 'assets/backgrounds/bg_street_shop.png',
    targetRevenue: 300000,
    totalCustomers: 12,
    spawnInterval: [2.5, 5],
    allowedCustomers: ['student_boy', 'student_girl', 'grandma', 'grandpa', 'vip_lady'],
    allowedIngredients: ['fish_ball', 'fried_fish_ball', 'beef_ball', 'shrimp_ball', 'salted_egg_ball', 'cheese_ball', 'fish_tofu', 'tofu', 'sauce_chili', 'sauce_tomato', 'sauce_black_soy', 'pickled_greens', 'toppings_side'],
    vipChance: 0.4,
    bonusGems: 5,
    description: 'Khách xếp hàng dài dằng dặc. Đòi hỏi tốc độ chiên tay thoăn thoắt!'
  },
  {
    day: 5,
    name: 'Ngày 5: Vua Cá Viên Chiên Đường Phố',
    location: 'Đêm Hội Ẩm Thực Sài Gòn',
    background: 'assets/backgrounds/bg_street_shop.png',
    targetRevenue: 450000,
    totalCustomers: 15,
    spawnInterval: [2, 4.5],
    allowedCustomers: ['student_boy', 'student_girl', 'grandma', 'grandpa', 'vip_lady'],
    allowedIngredients: ['fish_ball', 'fried_fish_ball', 'beef_ball', 'shrimp_ball', 'salted_egg_ball', 'cheese_ball', 'fish_tofu', 'tofu', 'fish_cake_strip', 'sauce_chili', 'sauce_tomato', 'sauce_black_soy', 'pickled_greens', 'toppings_side'],
    vipChance: 0.5,
    bonusGems: 8,
    description: 'Thử thách đỉnh cao với thực đơn trọn vẹn 9 loại đồ chiên và 5 loại sốt topping đặc biệt!'
  }
];
