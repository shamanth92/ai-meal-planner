"use client";
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import { useRouter, useParams } from 'next/navigation';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import MealCard from '../../components/meal/MealCard';
import GroceryListModal from '../../components/grocery/GroceryListModal';

export default function RecipePage() {
    const router = useRouter();
    const params = useParams();
    const day = parseInt(params.day as string);
    
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    const [showGroceryModal, setShowGroceryModal] = React.useState(false);

    if (!mealPlan || !mealPlan.meals) {

        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">No meal plan available</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Please create a meal plan first.
                </Typography>
            </Box>
        );
    }

    // Find meal by day number
    const mealIndex = mealPlan.meals.findIndex(m => m.day === day);
    const meal = mealPlan.meals[mealIndex];
    
    // Match recipe by index since API doesn't guarantee name matching
    const recipe = mealPlan.recipes[mealIndex];
    
    console.log('Found meal at index:', mealIndex, meal);
    console.log('Found recipe at index:', mealIndex, recipe);

    if (!meal || !recipe) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">Meal not found</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Could not find meal for day {day}.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Debug: Looking for day {day}, found {mealPlan.meals.length} meals
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Meal days: {mealPlan.meals.map(m => m.day).join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Meal names: {mealPlan.meals.map(m => m.name).join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Found meal: {meal ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Found recipe: {recipe ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Available recipes: {mealPlan.recipes.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Recipe names: {mealPlan.recipes.map(r => r.mealName).join(', ')}
                </Typography>
            </Box>
        );
    }

    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const headerText = `${dayLabels[day - 1]} - ${mealPlan.recipeQuery?.mealTime || 'Meal'}`;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <MealCard
                meal={meal}
                recipe={recipe}
                headerText={headerText}
                imageUrl={meal.imageUrl}
                onViewGroceryList={() => setShowGroceryModal(true)}
                showSaveToFavorites={true}
            />

            <GroceryListModal
                open={showGroceryModal}
                onClose={() => setShowGroceryModal(false)}
                groceryList={mealPlan?.groceryList || []}
                meal={meal}
            />
        </Box>
    );
}
