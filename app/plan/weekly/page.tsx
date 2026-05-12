"use client";
import * as React from 'react';
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import MealGridDisplay from '../../components/meal/MealGridDisplay';

export default function WeeklyPlan() {
    const router = useRouter();
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    console.log(mealPlan);

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

    const weeklyNutrition = mealPlan?.weeklyNutrition;

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h5">
                    Your Weekly Meal Plan ({mealPlan?.recipeQuery?.mealTime?.toUpperCase()})
                </Typography>
            </Box>
            


            {/* Meals Grid */}
            <Box sx={{ padding: 8 }}>
                <Card sx={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
                    <CardContent>
                        <MealGridDisplay 
                            meals={mealPlan?.meals || []} 
                            onMealClick={(meal, index) => {
                                router.push(`/recipe/${meal.day}`);
                            }}
                        />
                    </CardContent>
                </Card>
            </Box>

                        {/* Nutrition Summary Section */}
            {weeklyNutrition && (
                <Box sx={{ padding: 8, paddingTop: 4 }}>
                    <Card sx={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, mb: 4 }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ mb: 3, color: '#6366f1', fontWeight: 600 }}>
                                Weekly Nutrition Insights ({mealPlan?.recipeQuery?.mealTime || 'Meal'})
                            </Typography>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                                {/* Summary */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                                            <Typography sx={{ fontSize: 14, color: '#6366f1' }}>📊</Typography>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Summary</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                        {weeklyNutrition.analysis.summary}
                                    </Typography>
                                </Box>

                                {/* Pros */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                                            <Typography sx={{ fontSize: 14, color: '#16a34a' }}>✓</Typography>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pros</Typography>
                                    </Box>
                                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {weeklyNutrition.analysis.pros.map((pro, index) => (
                                            <Typography component="li" key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5, lineHeight: 1.6 }}>
                                                {pro}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Cons */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                                            <Typography sx={{ fontSize: 14, color: '#dc2626' }}>⚠</Typography>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Cons</Typography>
                                    </Box>
                                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {weeklyNutrition.analysis.cons.map((con, index) => (
                                            <Typography component="li" key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5, lineHeight: 1.6 }}>
                                                {con}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Recommendations */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                                            <Typography sx={{ fontSize: 14, color: '#7c3aed' }}>💡</Typography>
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recommendations</Typography>
                                    </Box>
                                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {weeklyNutrition.analysis.recommendations.map((rec, index) => (
                                            <Typography component="li" key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5, lineHeight: 1.6 }}>
                                                {rec}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
}
