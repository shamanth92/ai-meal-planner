"use client";
import * as React from 'react';
import { Box, Button, Card, CardContent, Typography, Modal } from "@mui/material";
import FoodBankIcon from '@mui/icons-material/FoodBank';
import EggIcon from '@mui/icons-material/Egg';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import { nutritionNames } from '../../utils/data';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import { useEffect, useState } from 'react';

type NutritionKey = keyof typeof nutritionNames;

const nutritionIconComponents: Record<NutritionKey, React.ComponentType> = {
    calories: FoodBankIcon,
    protein: EggIcon,
    carbs: RiceBowlIcon,
    fat: LocalPizzaIcon
};

export default function DailyPlan() {
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    const updateMealImage = useMealPlanStore(state => state.updateMealImage);
    const [showGroceryModal, setShowGroceryModal] = useState(false);

    // Fetch meal image from Pexels API
    useEffect(() => {
        const fetchMealImage = async () => {
            console.log('Meal plan from store:', mealPlan);
            const mealName: string = mealPlan?.meals[0]?.name || '';
            
            // Skip if no meal name or image already exists
            if (!mealName || mealPlan?.meals[0]?.imageUrl) return;
            
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(mealName)}&per_page=1&orientation=portrait`,
                    {
                        headers: {
                            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || ''
                        }
                    }
                );
                const data = await response.json();
                console.log("Pexels API Response:", data);
                const imageUrl = data.photos[0]?.src.large || null;
                if (imageUrl) {
                    updateMealImage(0, imageUrl);
                }
            } catch (error) {
                console.error('Failed to fetch image:', error);
            }
        };

        fetchMealImage();
    }, [mealPlan, updateMealImage]);

    const handleViewGroceryList = () => {
        setShowGroceryModal(true);
    };

    return (
        <div>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <h1>Your Daily Meal Plan ({mealPlan?.recipeQuery?.mealTime?.toUpperCase()})</h1>
            </Box>
            <Box sx={{ padding: 8 }}>
                <Card sx={{ padding: 2 }}>
                    <CardContent>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 2, alignItems: "center" }}>
                            <Box className="p-4" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src={mealPlan?.meals[0]?.imageUrl}
                                    alt={mealPlan?.meals[0]?.name || "Meal"}
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                                <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                                    <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none' }}>
                                        Photos provided by Pexels
                                    </a>
                                </Typography>
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
                                    <Button variant="contained" onClick={handleViewGroceryList}>View Grocery List</Button>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Grocery List Modal */}
            <Modal
                open={showGroceryModal}
                onClose={() => setShowGroceryModal(false)}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Grocery List
                    </Typography>

                    {mealPlan?.groceryList && mealPlan.groceryList.length > 0 ? (
                        <Box>
                            {mealPlan.groceryList.map((item, index) => (
                                <Box key={index} sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#000' }}>
                                        {item.mealName}
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
                                        {item.groceryList.map((grocery, gIndex) => (
                                            <Typography
                                                component="li"
                                                key={gIndex}
                                                variant="body2"
                                                sx={{
                                                    mb: 0.5,
                                                    color: '#333',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {grocery.charAt(0).toUpperCase() + grocery.slice(1)}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No grocery list available
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button variant="contained" onClick={() => setShowGroceryModal(false)}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}