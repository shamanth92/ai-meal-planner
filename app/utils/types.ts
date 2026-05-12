export type MealFormInputs = {
    mode: "daily" | "weekly";
    mealTime: string;
    goal: string;
    dietType: string;
    budget: number;
    dailyCuisine: string;
    weeklyCuisines: {
        Mon: string;
        Tue: string;
        Wed: string;
        Thu: string;
        Fri: string;
        Sat: string;
        Sun: string;
    };
};

export type RecipeQuery = {
    mode: "daily" | "weekly";
    cuisines: string[];
    goal: string;
    dietary: string;
    mealTime?: string;
    budget?: number;
};

export type Meal = {
    day: number;
    name: string;
    description: string;
    cuisine: string;
    keywords: string[];
    fallbackKeywords: string[];
    imageUrl?: string;
};

export type RecipeStep = {
    stepNumber: number;
    instruction: string;
};

export type Nutrition = {
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
};

export type Recipe = {
    mealName: string;
    ingredients: string[];
    steps: RecipeStep[];
    cookingTime: number;
    servings: number;
    nutrition: Nutrition;
};

export type GroceryItem = {
    mealName: string;
    groceryList: string[];
};

export type DailyNutrition = {
    day: number;
    calories: number;
    protein: number;
    carbs: number;
};

export type WeeklyNutrition = {
    totals: {
        calories: number;
        protein: number;
        carbs: number;
    };
    daily: DailyNutrition[];
    analysis: {
        summary: string;
        pros: string[];
        cons: string[];
        recommendations: string[];
    };
};

export type MealPlanResponse = {
    recipeQuery: RecipeQuery;
    meals: Meal[];
    recipes: Recipe[];
    groceryList: GroceryItem[];
    weeklyNutrition?: WeeklyNutrition;
};