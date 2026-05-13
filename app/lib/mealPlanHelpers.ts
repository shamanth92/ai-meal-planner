import { MealFormInputs, MealPlanResponse } from '../types';

/**
 * Transforms form data into the API payload format
 * Extracts cuisines based on mode (daily vs weekly) and prepares the request body
 * 
 * @param data - Form inputs from the meal plan form
 * @returns API payload object ready for submission
 */
export function transformFormData(data: MealFormInputs) {
    const cuisines = data.mode === 'daily' 
        ? [data.dailyCuisine]
        : Object.values(data.weeklyCuisines || {});

    return {
        mode: data.mode,
        cuisines: cuisines,
        goal: data.goal,
        dietary: data.dietType,
        budget: data.budget,
        mealTime: data.mealTime
    };
}

/**
 * Preserves meal images from the current plan when merging with final state
 * This ensures that images fetched during the meal review process are not lost
 * 
 * @param currentPlan - Current meal plan from the store (may have imageUrls)
 * @param finalState - Final state from the API (may not have imageUrls)
 * @returns Final state with preserved imageUrls
 */
export function preserveMealImages(
    currentPlan: MealPlanResponse | null,
    finalState: any
): any {
    // If no current plan or no meals in either, return finalState as-is
    if (!currentPlan?.meals || !finalState.meals) {
        return finalState;
    }

    // Merge imageUrls from current meals into final state meals
    const mealsWithImages = finalState.meals.map((meal: any, index: number) => ({
        ...meal,
        imageUrl: currentPlan.meals[index]?.imageUrl || meal.imageUrl
    }));

    return {
        ...finalState,
        meals: mealsWithImages
    };
}

/**
 * Creates a temporary meal plan structure for the store during interrupt
 * Used when meals are suggested but recipes haven't been fetched yet
 * 
 * @param meals - Array of suggested meals
 * @param formData - Original form data for context
 * @returns Partial meal plan response for store
 */
export function createTemporaryMealPlan(
    meals: any[],
    formData: MealFormInputs
): MealPlanResponse {
    const cuisines = formData.mode === 'daily' 
        ? [formData.dailyCuisine]
        : Object.values(formData.weeklyCuisines || {});

    return {
        meals: meals,
        recipes: [],
        groceryList: [],
        recipeQuery: {
            mode: formData.mode,
            mealTime: formData.mealTime || '',
            cuisines: cuisines,
            goal: formData.goal || '',
            dietary: formData.dietType || '',
            budget: formData.budget
        }
    };
}
