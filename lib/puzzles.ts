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
  }
];
