export type Category = {
  name: string;
  options: string[];
};

export type ConstraintType = 'EQUAL' | 'NEXT_TO' | 'RIGHT_OF' | 'POSITION' | 'MIDDLE';

export type Constraint = {
  type: ConstraintType;
  var1: string;
  var2?: string;
  value?: number;
};

export type Puzzle = {
  id: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  houses: number;
  categories: Category[];
  clues: string[];
  constraints: Constraint[];
  solution: Record<string, string>[];
};

export const puzzles: Puzzle[] = [
  {
    id: 'easy-1',
    difficulty: 'Easy',
    title: 'The Simple Street',
    houses: 3,
    categories: [
      { name: 'Color', options: ['Red', 'Blue', 'Green'] },
      { name: 'Pet', options: ['Dog', 'Cat', 'Bird'] },
      { name: 'Drink', options: ['Tea', 'Milk', 'Water'] }
    ],
    clues: [
      "The person in the Red house drinks Tea.",
      "The Cat is in the middle house.",
      "The Bird is in the house next to the Blue house.",
      "The Green house is immediately to the right of the Blue house.",
      "The person who drinks Water has a Bird."
    ],
    constraints: [
      { type: 'EQUAL', var1: 'Red', var2: 'Tea' },
      { type: 'MIDDLE', var1: 'Cat' },
      { type: 'NEXT_TO', var1: 'Bird', var2: 'Blue' },
      { type: 'RIGHT_OF', var1: 'Green', var2: 'Blue' },
      { type: 'EQUAL', var1: 'Water', var2: 'Bird' }
    ],
    solution: [
      { Color: 'Red', Pet: 'Dog', Drink: 'Tea' },
      { Color: 'Blue', Pet: 'Cat', Drink: 'Milk' },
      { Color: 'Green', Pet: 'Bird', Drink: 'Water' }
    ]
  },
  {
    id: 'medium-1',
    difficulty: 'Medium',
    title: 'The Four Friends',
    houses: 4,
    categories: [
      { name: 'Color', options: ['Yellow', 'Blue', 'Red', 'Green'] },
      { name: 'Nationality', options: ['Norwegian', 'Dane', 'Brit', 'Swede'] },
      { name: 'Drink', options: ['Water', 'Tea', 'Milk', 'Coffee'] },
      { name: 'Pet', options: ['Cat', 'Horse', 'Bird', 'Dog'] }
    ],
    clues: [
      "The Brit lives in the Red house.",
      "The Swede keeps Dogs as pets.",
      "The Dane drinks Tea.",
      "The Green house is exactly to the right of the Red house.",
      "The owner of the Green house drinks Coffee.",
      "The person who drinks Milk lives in the 3rd house.",
      "The Norwegian lives in the first house.",
      "The Norwegian lives next to the Blue house.",
      "The person in the Yellow house has a Cat.",
      "The person with the Horse lives next to the Yellow house.",
      "The person who has a Bird drinks Milk."
    ],
    constraints: [
      { type: 'EQUAL', var1: 'Brit', var2: 'Red' },
      { type: 'EQUAL', var1: 'Swede', var2: 'Dog' },
      { type: 'EQUAL', var1: 'Dane', var2: 'Tea' },
      { type: 'RIGHT_OF', var1: 'Green', var2: 'Red' },
      { type: 'EQUAL', var1: 'Green', var2: 'Coffee' },
      { type: 'POSITION', var1: 'Milk', value: 2 }, // 0-indexed, so 3rd house is 2
      { type: 'POSITION', var1: 'Norwegian', value: 0 },
      { type: 'NEXT_TO', var1: 'Norwegian', var2: 'Blue' },
      { type: 'EQUAL', var1: 'Yellow', var2: 'Cat' },
      { type: 'NEXT_TO', var1: 'Horse', var2: 'Yellow' },
      { type: 'EQUAL', var1: 'Bird', var2: 'Milk' }
    ],
    solution: [
      { Color: 'Yellow', Nationality: 'Norwegian', Drink: 'Water', Pet: 'Cat' },
      { Color: 'Blue', Nationality: 'Dane', Drink: 'Tea', Pet: 'Horse' },
      { Color: 'Red', Nationality: 'Brit', Drink: 'Milk', Pet: 'Bird' },
      { Color: 'Green', Nationality: 'Swede', Drink: 'Coffee', Pet: 'Dog' }
    ]
  },
  {
    id: 'hard-1',
    difficulty: 'Hard',
    title: 'Einstein\'s Riddle',
    houses: 5,
    categories: [
      { name: 'Color', options: ['Red', 'Green', 'Ivory', 'Yellow', 'Blue'] },
      { name: 'Nationality', options: ['Englishman', 'Spaniard', 'Ukrainian', 'Norwegian', 'Japanese'] },
      { name: 'Drink', options: ['Coffee', 'Tea', 'Milk', 'Orange Juice', 'Water'] },
      { name: 'Smoke', options: ['Old Gold', 'Kools', 'Chesterfields', 'Lucky Strike', 'Parliaments'] },
      { name: 'Pet', options: ['Dog', 'Snails', 'Fox', 'Horse', 'Zebra'] }
    ],
    clues: [
      "There are five houses.",
      "The Englishman lives in the red house.",
      "The Spaniard owns the dog.",
      "Coffee is drunk in the green house.",
      "The Ukrainian drinks tea.",
      "The green house is immediately to the right of the ivory house.",
      "The Old Gold smoker owns snails.",
      "Kools are smoked in the yellow house.",
      "Milk is drunk in the middle house.",
      "The Norwegian lives in the first house.",
      "The man who smokes Chesterfields lives in the house next to the man with the fox.",
      "Kools are smoked in the house next to the house where the horse is kept.",
      "The Lucky Strike smoker drinks orange juice.",
      "The Japanese smokes Parliaments.",
      "The Norwegian lives next to the blue house."
    ],
    constraints: [
      { type: 'EQUAL', var1: 'Englishman', var2: 'Red' },
      { type: 'EQUAL', var1: 'Spaniard', var2: 'Dog' },
      { type: 'EQUAL', var1: 'Coffee', var2: 'Green' },
      { type: 'EQUAL', var1: 'Ukrainian', var2: 'Tea' },
      { type: 'RIGHT_OF', var1: 'Green', var2: 'Ivory' },
      { type: 'EQUAL', var1: 'Old Gold', var2: 'Snails' },
      { type: 'EQUAL', var1: 'Kools', var2: 'Yellow' },
      { type: 'MIDDLE', var1: 'Milk' },
      { type: 'POSITION', var1: 'Norwegian', value: 0 },
      { type: 'NEXT_TO', var1: 'Chesterfields', var2: 'Fox' },
      { type: 'NEXT_TO', var1: 'Kools', var2: 'Horse' },
      { type: 'EQUAL', var1: 'Lucky Strike', var2: 'Orange Juice' },
      { type: 'EQUAL', var1: 'Japanese', var2: 'Parliaments' },
      { type: 'NEXT_TO', var1: 'Norwegian', var2: 'Blue' }
    ],
    solution: [
      { Color: 'Yellow', Nationality: 'Norwegian', Drink: 'Water', Smoke: 'Kools', Pet: 'Fox' },
      { Color: 'Blue', Nationality: 'Ukrainian', Drink: 'Tea', Smoke: 'Chesterfields', Pet: 'Horse' },
      { Color: 'Red', Nationality: 'Englishman', Drink: 'Milk', Smoke: 'Old Gold', Pet: 'Snails' },
      { Color: 'Ivory', Nationality: 'Spaniard', Drink: 'Orange Juice', Smoke: 'Lucky Strike', Pet: 'Dog' },
      { Color: 'Green', Nationality: 'Japanese', Drink: 'Coffee', Smoke: 'Parliaments', Pet: 'Zebra' }
    ]
  },
  {
    id: 'hard-2',
    difficulty: 'Hard',
    title: 'Zebra Puzzle (VN)',
    houses: 5,
    categories: [
      { name: 'Màu sắc', options: ['Đỏ', 'Xanh lá', 'Trắng', 'Vàng', 'Xanh dương'] },
      { name: 'Quốc tịch', options: ['Anh', 'Thụy Điển', 'Đan Mạch', 'Na Uy', 'Đức'] },
      { name: 'Đồ uống', options: ['Trà', 'Cà phê', 'Sữa', 'Bia', 'Nước'] },
      { name: 'Thuốc lá', options: ['Pall Mall', 'Dunhill', 'Blend', 'Bluemaster', 'Prince'] },
      { name: 'Thú cưng', options: ['Chó', 'Chim', 'Mèo', 'Ngựa', 'Cá'] }
    ],
    clues: [
      "Người Anh sống trong nhà màu đỏ",
      "Người Thụy Điển có một con chó cưng",
      "Người Đan mạch uống trà",
      "Ngôi nhà màu xanh lá cây nằm bên trái ngôi nhà màu trắng",
      "Chủ của ngồi nhà màu xanh lá cây uống cà phê",
      "Người hút thuốc lá Pall Mall có một con chim",
      "Chủ của ngôi nhà màu vàng hút thuốc lá Dunhill",
      "Người Na Uy sống trong ngôi nhà đầu tiên",
      "Người hút thuốc lá Blend sống cạnh ngôi nhà có một con mèo",
      "Người có một con ngựa sống cạnh ngôi nhà có người hút thuốc lá Dunhill",
      "Người hút thuốc lá Bluemaster uống bia",
      "Người Đức hút thuốc lá Prince",
      "Người Na Uy sống cạnh ngôi nhà có màu xanh da trời",
      "Người hút thuốc lá Blend là hàng xóm của người uống nước",
      "Người sống ở ngôi nhà chính giữa uống sữa"
    ],
    constraints: [
      { type: 'EQUAL', var1: 'Anh', var2: 'Đỏ' },
      { type: 'EQUAL', var1: 'Thụy Điển', var2: 'Chó' },
      { type: 'EQUAL', var1: 'Đan Mạch', var2: 'Trà' },
      { type: 'RIGHT_OF', var1: 'Trắng', var2: 'Xanh lá' },
      { type: 'EQUAL', var1: 'Xanh lá', var2: 'Cà phê' },
      { type: 'EQUAL', var1: 'Pall Mall', var2: 'Chim' },
      { type: 'EQUAL', var1: 'Vàng', var2: 'Dunhill' },
      { type: 'POSITION', var1: 'Na Uy', value: 0 },
      { type: 'NEXT_TO', var1: 'Blend', var2: 'Mèo' },
      { type: 'NEXT_TO', var1: 'Ngựa', var2: 'Dunhill' },
      { type: 'EQUAL', var1: 'Bluemaster', var2: 'Bia' },
      { type: 'EQUAL', var1: 'Đức', var2: 'Prince' },
      { type: 'NEXT_TO', var1: 'Na Uy', var2: 'Xanh dương' },
      { type: 'NEXT_TO', var1: 'Blend', var2: 'Nước' },
      { type: 'MIDDLE', var1: 'Sữa' }
    ],
    solution: [
      { 'Màu sắc': 'Vàng', 'Quốc tịch': 'Na Uy', 'Đồ uống': 'Nước', 'Thuốc lá': 'Dunhill', 'Thú cưng': 'Mèo' },
      { 'Màu sắc': 'Xanh dương', 'Quốc tịch': 'Đan Mạch', 'Đồ uống': 'Trà', 'Thuốc lá': 'Blend', 'Thú cưng': 'Ngựa' },
      { 'Màu sắc': 'Đỏ', 'Quốc tịch': 'Anh', 'Đồ uống': 'Sữa', 'Thuốc lá': 'Pall Mall', 'Thú cưng': 'Chim' },
      { 'Màu sắc': 'Xanh lá', 'Quốc tịch': 'Đức', 'Đồ uống': 'Cà phê', 'Thuốc lá': 'Prince', 'Thú cưng': 'Cá' },
      { 'Màu sắc': 'Trắng', 'Quốc tịch': 'Thụy Điển', 'Đồ uống': 'Bia', 'Thuốc lá': 'Bluemaster', 'Thú cưng': 'Chó' }
    ]
  }
];
