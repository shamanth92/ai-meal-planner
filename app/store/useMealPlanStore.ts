import { create } from 'zustand';
import { MealPlanResponse } from '../utils/types';

interface MealPlanStore {
    mealPlan: MealPlanResponse | null;
    saveMealPlan: (data: MealPlanResponse) => void;
    clearMealPlan: () => void;
}

export const useMealPlanStore = create<MealPlanStore>((set) => ({
    mealPlan: null,
    saveMealPlan: (data) => set({ mealPlan: data }),
    clearMealPlan: () => set({ mealPlan: null }),
}));
