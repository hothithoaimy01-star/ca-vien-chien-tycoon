export interface IngredientConfig {
  id: string;
  name: string;
  type: 'fryable' | 'sauce' | 'topping';
  image: string;
  cookingTime: number; // in seconds
  perfectWindow: number; // in seconds
  burntTime: number; // in seconds
  cost: number; // in VND
  sellPrice: number; // in VND
  unlockDay: number;
  description: string;
}

export const INGREDIENTS: Record<string, IngredientConfig> = {
  fish_ball: {
    id: 'fish_ball',
    name: 'Cá Viên',
    type: 'fryable',
    image: 'assets/ingredients/fish_ball.png',
    cookingTime: 2.8,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 1000,
    sellPrice: 5000,
    unlockDay: 1,
    description: 'Cá viên truyền thống thơm ngon, dai giòn sần sật.'
  },
  fried_fish_ball: {
    id: 'fried_fish_ball',
    name: 'Cá Viên Chiên Nước',
    type: 'fryable',
    image: 'assets/ingredients/fried_fish_ball.png',
    cookingTime: 3.0,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 1500,
    sellPrice: 6000,
    unlockDay: 1,
    description: 'Cá viên tẩm sốt đậm đà, chiên phồng thơm nức mũi.'
  },
  beef_ball: {
    id: 'beef_ball',
    name: 'Bò Viên',
    type: 'fryable',
    image: 'assets/ingredients/beef_ball.png',
    cookingTime: 3.2,
    perfectWindow: 2.2,
    burntTime: 2.5,
    cost: 2000,
    sellPrice: 7000,
    unlockDay: 2,
    description: 'Bò viên gân tiêu đen giòn sần sật, khách mê tít.'
  },
  shrimp_ball: {
    id: 'shrimp_ball',
    name: 'Tôm Viên',
    type: 'fryable',
    image: 'assets/ingredients/shrimp_ball.png',
    cookingTime: 3.0,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 2000,
    sellPrice: 7000,
    unlockDay: 2,
    description: 'Tôm viên ngọt thanh, đỏ au bắt mắt.'
  },
  salted_egg_ball: {
    id: 'salted_egg_ball',
    name: 'Cá Viên Trứng Muối',
    type: 'fryable',
    image: 'assets/ingredients/salted_egg_ball.png',
    cookingTime: 3.5,
    perfectWindow: 2.2,
    burntTime: 2.5,
    cost: 3000,
    sellPrice: 10000,
    unlockDay: 3,
    description: 'Nhân trứng muối tan chảy béo ngậy siêu hot.'
  },
  cheese_ball: {
    id: 'cheese_ball',
    name: 'Cá Viên Phô Mai',
    type: 'fryable',
    image: 'assets/ingredients/cheese_ball.png',
    cookingTime: 3.4,
    perfectWindow: 2.2,
    burntTime: 2.5,
    cost: 3000,
    sellPrice: 10000,
    unlockDay: 3,
    description: 'Phô mai kéo sợi thơm phức, học sinh cực thích.'
  },
  fish_tofu: {
    id: 'fish_tofu',
    name: 'Đậu Hũ Cá',
    type: 'fryable',
    image: 'assets/ingredients/fish_tofu.png',
    cookingTime: 3.2,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 2500,
    sellPrice: 8000,
    unlockDay: 4,
    description: 'Đậu hũ cá mềm mịn, chiên vàng ươm.'
  },
  tofu: {
    id: 'tofu',
    name: 'Đậu Hũ Giòn',
    type: 'fryable',
    image: 'assets/ingredients/tofu.png',
    cookingTime: 2.8,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 1500,
    sellPrice: 6000,
    unlockDay: 4,
    description: 'Đậu hũ non cắt quân cờ giòn rụm bên ngoài.'
  },
  fish_cake_strip: {
    id: 'fish_cake_strip',
    name: 'Chả Cá Sợi',
    type: 'fryable',
    image: 'assets/ingredients/fish_cake_strip.png',
    cookingTime: 3.0,
    perfectWindow: 2.0,
    burntTime: 2.5,
    cost: 2500,
    sellPrice: 9000,
    unlockDay: 5,
    description: 'Chả cá Nha Trang cắt sợi chiên phồng giòn tan.'
  },
  // Sauces & Side dishes
  sauce_chili: {
    id: 'sauce_chili',
    name: 'Tương Ớt',
    type: 'sauce',
    image: 'assets/sauces/sauce_chili.png',
    cookingTime: 0,
    perfectWindow: 0,
    burntTime: 0,
    cost: 500,
    sellPrice: 2000,
    unlockDay: 1,
    description: 'Tương ớt cay nồng chuẩn vị cá viên chiên.'
  },
  sauce_tomato: {
    id: 'sauce_tomato',
    name: 'Tương Cà',
    type: 'sauce',
    image: 'assets/sauces/sauce_tomato.png',
    cookingTime: 0,
    perfectWindow: 0,
    burntTime: 0,
    cost: 500,
    sellPrice: 2000,
    unlockDay: 1,
    description: 'Tương cà chua chua ngọt ngọt cho các bé học sinh.'
  },
  sauce_black_soy: {
    id: 'sauce_black_soy',
    name: 'Tương Đen Ngọt',
    type: 'sauce',
    image: 'assets/sauces/sauce_black_soy.png',
    cookingTime: 0,
    perfectWindow: 0,
    burntTime: 0,
    cost: 500,
    sellPrice: 2000,
    unlockDay: 2,
    description: 'Sốt tương đen thơm đậu phộng đặc trưng Sài Gòn.'
  },
  pickled_greens: {
    id: 'pickled_greens',
    name: 'Đồ Chua Giòn',
    type: 'topping',
    image: 'assets/ingredients/pickled_greens.png',
    cookingTime: 0,
    perfectWindow: 0,
    burntTime: 0,
    cost: 500,
    sellPrice: 2000,
    unlockDay: 2,
    description: 'Rau củ đồ chua chống ngấy siêu ngon.'
  },
  toppings_side: {
    id: 'toppings_side',
    name: 'Hành Phi Đậu Phộng',
    type: 'topping',
    image: 'assets/ingredients/toppings_side.png',
    cookingTime: 0,
    perfectWindow: 0,
    burntTime: 0,
    cost: 500,
    sellPrice: 3000,
    unlockDay: 3,
    description: 'Topping rắc thơm lừng, giòn béo ngậy.'
  }
};
