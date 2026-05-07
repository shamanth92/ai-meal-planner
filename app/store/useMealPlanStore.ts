import { create } from 'zustand';
import { MealPlanResponse } from '../utils/types';

interface MealPlanStore {
    mealPlan: MealPlanResponse | null;
    saveMealPlan: (data: MealPlanResponse) => void;
    clearMealPlan: () => void;
    updateMealImage: (mealIndex: number, imageUrl: string) => void;
}

export const useMealPlanStore = create<MealPlanStore>((set) => ({
    mealPlan: null,
    saveMealPlan: (data) => set({ mealPlan: data }),
    clearMealPlan: () => set({ mealPlan: null }),
    updateMealImage: (mealIndex, imageUrl) => set((state) => {
        if (!state.mealPlan) return state;
        const updatedMeals = [...state.mealPlan.meals];
        updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], imageUrl };
        return {
            mealPlan: {
                ...state.mealPlan,
                meals: updatedMeals
            }
        };
    }),
}));
