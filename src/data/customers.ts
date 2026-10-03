export interface CustomerConfig {
  id: string;
  name: string;
  role: string;
  image: string;
  basePatience: number; // in seconds
  minOrderItems: number;
  maxOrderItems: number;
  tipMultiplier: number;
  favoredIngredients: string[];
  speechGreeting: string[];
  speechHappy: string[];
  speechAngry: string[];
  isVip?: boolean;
}

export const CUSTOMERS: Record<string, CustomerConfig> = {
  student_boy: {
    id: 'student_boy',
    name: 'Nam Sinh',
    role: 'Học sinh / Sinh viên',
    image: 'assets/characters/student_boy.png',
    basePatience: 35,
    minOrderItems: 1,
    maxOrderItems: 3,
    tipMultiplier: 1.0,
    favoredIngredients: ['fish_ball', 'fried_fish_ball', 'beef_ball', 'sauce_chili'],
    speechGreeting: [
      'Cho em xiên cá viên giòn rụm nha anh Ba!',
      'Tan học đói bụng quá, làm nhanh giúp em nghen!',
      'Xiên thêm tương ớt cay nhiều nha!'
    ],
    speechHappy: [
      'Ngon nhức nách luôn anh ơi!',
      'Giòn rụm đã quá, cảm ơn anh!',
      'Mai em lại ghé tiếp!'
    ],
    speechAngry: [
      'Lâu quá trời, em trễ giờ học rồi!',
      'Đợi muốn xỉu luôn á!',
      'Thôi em đi về đây!'
    ]
  },
  student_girl: {
    id: 'student_girl',
    name: 'Nữ Sinh',
    role: 'Nữ sinh Áo Dài',
    image: 'assets/characters/student_girl.png',
    basePatience: 35,
    minOrderItems: 2,
    maxOrderItems: 3,
    tipMultiplier: 1.2,
    favoredIngredients: ['cheese_ball', 'shrimp_ball', 'sauce_tomato', 'pickled_greens'],
    speechGreeting: [
      'Chú ơi, cho con xiên phô mai kéo sợi nha!',
      'Cho con nhiều đồ chua ăn kèm nghen chú!',
      'Chiên vừa tới giòn giòn nha chú!'
    ],
    speechHappy: [
      'Ngon quá chú ơi, chấm 10 điểm!',
      'Phô mai béo ngậy đã ghê!',
      'Con gửi thêm tiền boa nha chú!'
    ],
    speechAngry: [
      'Chú làm lâu quá à!',
      'Nóng ruột ghê á!',
      'Hic, con không đợi nữa đâu!'
    ]
  },
  grandma: {
    id: 'grandma',
    name: 'Bà Ba',
    role: 'Khách quen xóm',
    image: 'assets/characters/grandma.png',
    basePatience: 45,
    minOrderItems: 2,
    maxOrderItems: 4,
    tipMultiplier: 1.5,
    favoredIngredients: ['fish_ball', 'fish_tofu', 'tofu', 'pickled_greens'],
    speechGreeting: [
      'Bán cho bà vài xiên về cho mấy đứa cháu nghen con.',
      'Chiên mềm mềm giòn nhẹ thôi nghe bây.',
      'Hôm nay quán đông vui quá ta!'
    ],
    speechHappy: [
      'Khéo tay quá, thơm ngon lắm con!',
      'Bà gửi tiền nè, khỏi thối nghen!',
      'Cháu bà chắc thích mê cho coi.'
    ],
    speechAngry: [
      'Chân cẳng bà mỏi quá rồi con ơi...',
      'Lâu quá bà đứng không nổi...',
      'Thôi bà đi chợ về đây.'
    ]
  },
  grandpa: {
    id: 'grandpa',
    name: 'Ông Ba',
    role: 'Cao nhân đường phố',
    image: 'assets/characters/grandpa.png',
    basePatience: 40,
    minOrderItems: 2,
    maxOrderItems: 4,
    tipMultiplier: 1.3,
    favoredIngredients: ['beef_ball', 'fried_fish_ball', 'sauce_black_soy', 'fish_cake_strip'],
    speechGreeting: [
      'Làm cho chú dĩa thập cẩm nhâm nhi nghen!',
      'Nhớ rưới tương đen thơm thơm nha cháu.',
      'Cá viên chiên chú Ba luôn là số một!'
    ],
    speechHappy: [
      'Tuyệt vời! Đúng chuẩn vị đường phố!',
      'Tay nghề tiến bộ lắm chú em!',
      'Tiền nè, làm ăn phát tài nha!'
    ],
    speechAngry: [
      'Ủa sao lâu vậy chú em?',
      'Cháy hết cá viên của tôi rồi hả?',
      'Thôi tôi qua quán nước ngồi.'
    ]
  },
  vip_lady: {
    id: 'vip_lady',
    name: 'Quý Bà VIP',
    role: 'Khách VIP Sành Ăn',
    image: 'assets/characters/vip_lady.png',
    basePatience: 28,
    minOrderItems: 3,
    maxOrderItems: 5,
    tipMultiplier: 3.0,
    isVip: true,
    favoredIngredients: ['salted_egg_ball', 'cheese_ball', 'shrimp_ball', 'toppings_side', 'sauce_chili'],
    speechGreeting: [
      'Lấy cho chị mẹt thượng hạng đắt nhất quán nha cưng!',
      'Nhanh tay lên nha, chị đang vội đi tiệc!',
      'Làm ngon chị bo đậm cho nghen!'
    ],
    speechHappy: [
      'Xuất sắc! Quá xứng đáng điểm 10!',
      'Tiền boa của cưng đây, chiên đỉnh lắm!',
      'VIP là phải chuẩn vị thế này chứ!'
    ],
    speechAngry: [
      'Dịch vụ chậm quá, chị không hài lòng!',
      'Làm mất thời gian của người ta!',
      'Chị đi chỗ khác ăn đây!'
    ]
  }
};
