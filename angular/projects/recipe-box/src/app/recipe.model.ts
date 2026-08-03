export type RecipeCourse = 'mains' | 'breakfast' | 'sides';

export type RecipeRow = {
  id: string;
  name: string;
  summary?: string;
  minutes: number;
  featured?: boolean;
  course: RecipeCourse;
  cost: number;
  updatedAt: Date;
};

export const SEED_RECIPES: RecipeRow[] = [
  {
    id: 'pasta',
    name: 'Weeknight Pasta',
    summary: '  Garlic, olive oil, chili.  ',
    minutes: 20,
    featured: true,
    course: 'mains',
    cost: 8.5,
    updatedAt: new Date('2026-07-12'),
  },
  {
    id: 'shakshuka',
    name: 'Shakshuka',
    minutes: 25,
    course: 'breakfast',
    cost: 6.25,
    updatedAt: new Date('2026-07-28'),
  },
  {
    id: 'salad',
    name: 'Lifecycle Demo Salad',
    summary: 'Hide me to run DestroyRef cleanup.',
    minutes: 10,
    course: 'sides',
    cost: 4,
    updatedAt: new Date('2026-07-30'),
  },
];
