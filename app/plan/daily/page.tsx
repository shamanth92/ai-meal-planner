"use client";
import { Box } from "@mui/material";
import { useMealPlanStore } from '../../store/useMealPlanStore';
import { useState } from 'react';
import { useMealImage } from '../../hooks/useMealImage';
import GroceryListModal from '../../components/grocery/GroceryListModal';
import MealCard from '../../components/meal/MealCard';

/**
 * Daily Meal Plan Page Component
 * 
 * Displays a single meal plan for a specific meal time (breakfast, lunch, or dinner).
 * Features:
 * - Fetches and displays meal image from Pexels API
 * - Shows meal details using reusable MealCard component
 * - Provides grocery list modal for shopping convenience
 * - Integrates with Zustand store for global state management
 * 
 * The component is kept minimal and focused on orchestration, delegating
 * UI rendering to child components (MealCard, GroceryListModal).
 */
export default function DailyPlan() {
    // Get meal plan data from global store
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    
    // Local state for grocery list modal visibility
    const [showGroceryModal, setShowGroceryModal] = useState(false);

    // Fetch meal image from Pexels API using custom hook
    // Only fetches if image doesn't already exist in store
    useMealImage(
        mealPlan?.meals[0]?.name || '',
        0,
        mealPlan?.meals[0]?.imageUrl
    );

    /**
     * Opens the grocery list modal
     */
    const handleViewGroceryList = () => {
        setShowGroceryModal(true);
    };

    return (
        <div>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <h1>
                    {/* Display meal plan title with meal time */}
                    Your Daily Meal Plan ({mealPlan?.recipeQuery?.mealTime?.toUpperCase()})
                </h1>
            </Box>
            <Box sx={{ padding: 8 }}>
                {mealPlan?.meals[0] && mealPlan?.recipes[0] && (
                    <MealCard
                        meal={mealPlan.meals[0]}
                        recipe={mealPlan.recipes[0]}
                        headerText={mealPlan.recipeQuery?.mealTime?.toUpperCase()}
                        imageUrl={mealPlan.meals[0].imageUrl}
                        onViewGroceryList={handleViewGroceryList}
                        showSaveToFavorites={true}
                    />
                )}
            </Box>

            <GroceryListModal
                open={showGroceryModal}
                onClose={() => setShowGroceryModal(false)}
                groceryList={mealPlan?.groceryList || []}
                meal={mealPlan?.meals[0]!}
            />
        </div>
    );
}