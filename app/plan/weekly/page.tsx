"use client";
import * as React from 'react';
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useMealPlanStore } from '../../store/useMealPlanStore';
import MealGridDisplay from '../../components/MealGridDisplay';

export default function WeeklyPlan() {
    const mealPlan = useMealPlanStore(state => state.mealPlan);

    if (!mealPlan || !mealPlan.meals) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">No meal plan available</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Please create a weekly meal plan first.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <h1>
                    Your Weekly Meal Plan ({mealPlan?.recipeQuery?.mealTime?.toUpperCase()})
                </h1>
            </Box>
            <Box sx={{ padding: 8 }}>
                <Card>
                    <CardContent>
                        <MealGridDisplay meals={mealPlan?.meals || []} />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
