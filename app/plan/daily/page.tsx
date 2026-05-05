"use client";
import * as React from 'react';
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import FoodBankIcon from '@mui/icons-material/FoodBank';
import EggIcon from '@mui/icons-material/Egg';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import { nutritionNames } from '../../utils/data';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import { useEffect } from 'react';

type NutritionKey = keyof typeof nutritionNames;

const nutritionIconComponents: Record<NutritionKey, React.ComponentType> = {
    calories: FoodBankIcon,
    protein: EggIcon,
    carbs: RiceBowlIcon,
    fat: LocalPizzaIcon
};

export default function DailyPlan() {
    const mealPlan = useMealPlanStore(state => state.mealPlan);

    // Log the data to verify it's available
    useEffect(() => {
        console.log('Meal plan from store:', mealPlan);
    }, [mealPlan]);

    return (
        <div>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <h1>Your Daily Meal Plan ({mealPlan?.recipeQuery?.mealTime?.toUpperCase()})</h1>
            </Box>
            <Box sx={{ padding: 8 }}>
                <Card sx={{ padding: 2 }}>
                    <CardContent>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 2, alignItems: "center" }}>
                            <Box className="p-4" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1751560455942-f859f1215826?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFzYWxhJTIwZG9zYXxlbnwwfDF8MHx8fDA%3D"
                                    alt="Meal"
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="h4">{mealPlan?.recipeQuery?.mealTime?.toUpperCase()}</Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2
                                    }}>
                                        {(Object.keys(nutritionNames) as NutritionKey[]).map((key) => {
                                            const IconComponent = nutritionIconComponents[key];
                                            const nutritionValue = mealPlan?.recipes[0]?.nutrition?.[key] || 0;
                                            return (
                                                <Box key={key} sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    border: '1px solid #ccc',
                                                    padding: 2,
                                                    borderRadius: 1,
                                                    width: 100
                                                }}>
                                                    <Typography><IconComponent /> {nutritionValue}</Typography>
                                                    <Typography>{nutritionNames[key]}</Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {mealPlan?.meals[0]?.name}
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        height: '4px', 
                                        width: '100%', 
                                        bgcolor: 'black', 
                                        borderRadius: '2px',
                                        mb: 2 
                                    }} />
                                    
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                        {mealPlan?.meals[0]?.description}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#000' }}>
                                                Ingredients
                                            </Typography>
                                            <Box 
                                                component="ul" 
                                                sx={{ 
                                                    pl: 2.5, 
                                                    m: 0,
                                                    listStyleType: 'disc',
                                                    '& li::marker': {
                                                        color: '#000',
                                                        fontSize: '0.8em'
                                                    }
                                                }}
                                            >
                                                {mealPlan?.recipes[0]?.ingredients.map((ingredient, index) => (
                                                    <Typography 
                                                        component="li" 
                                                        key={index} 
                                                        variant="body2" 
                                                        sx={{ 
                                                            mb: 0.75,
                                                            color: '#333',
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        {ingredient}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                        
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#000' }}>
                                                Instructions
                                            </Typography>
                                            <Box 
                                                component="ol" 
                                                sx={{ 
                                                    pl: 2.5, 
                                                    m: 0,
                                                    listStyleType: 'decimal',
                                                    '& li::marker': {
                                                        color: '#000',
                                                        fontWeight: 'bold'
                                                    }
                                                }}
                                            >
                                                {mealPlan?.recipes[0]?.steps.map((step) => (
                                                    <Typography 
                                                        component="li" 
                                                        key={step.stepNumber} 
                                                        variant="body2" 
                                                        sx={{ 
                                                            mb: 0.75,
                                                            color: '#333',
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        {step.instruction}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button variant="outlined">Save to Favorites</Button>
                                    <Button variant="contained">View Grocery List</Button>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </div>
    );
}