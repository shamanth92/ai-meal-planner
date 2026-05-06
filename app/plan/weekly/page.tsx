"use client";
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import { useMealPlanStore } from '../../store/useMealPlanStore';
import { useEffect } from 'react';

export default function WeeklyPlan() {
    const mealPlan = useMealPlanStore(state => state.mealPlan);

    useEffect(() => {
        console.log('Weekly meal plan from store:', mealPlan);
    }, [mealPlan]);

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
            <Typography variant="h4" sx={{ mb: 4 }}>Your Weekly Meal Plan</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {mealPlan.meals.map((meal, index) => (
                    <Box 
                        key={index}
                        sx={{ 
                            p: 3, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2 
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Day {index + 1}: {meal.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {meal.description}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
