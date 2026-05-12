"use client";
import * as React from 'react';
import { useForm, Controller } from "react-hook-form";
import {
    Box,
    Button,
    FormControl,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import { CalendarMonth, WbSunny, Restaurant, Refresh, Info, Lightbulb, ArrowForward } from '@mui/icons-material';
import { countryFlagsCode, cuisines, daysOfWeek } from '../utils/data';
import { MealFormInputs } from '../utils/types';
import Loading from './loading';
import MealReviewModal from './mealReviewModal';
import { useRouter } from 'next/navigation';
import { useMealPlanStore } from '../store/useMealPlanStore';

export default function MealForm() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);
    const [showModal, setShowModal] = React.useState(false);
    const [suggestedMeals, setSuggestedMeals] = React.useState<any[]>([]);
    const [currentThreadId, setCurrentThreadId] = React.useState<string>("");
    const [isRegenerating, setIsRegenerating] = React.useState(false);
    const [currentEventSource, setCurrentEventSource] = React.useState<EventSource | null>(null);
    const router = useRouter();
    const saveMealPlan = useMealPlanStore(state => state.saveMealPlan);

    const { control, handleSubmit, watch, reset, setValue } = useForm<MealFormInputs>({
        defaultValues: {
            mode: "daily",
            mealTime: "",
            goal: "",
            dietType: "",
            budget: undefined,
            dailyCuisine: "",
            weeklyCuisines: {
                Mon: "",
                Tue: "",
                Wed: "",
                Thu: "",
                Fri: "",
                Sat: "",
                Sun: ""
            }
        }
    });

    const mode = watch("mode");

    const submitForm = async (data: MealFormInputs) => {
        setIsLoading(true);
        setCurrentStep(0);

        const cuisines = data.mode === 'daily' 
            ? [data.dailyCuisine]
            : Object.values(data.weeklyCuisines || {});

        const response = await fetch('http://localhost:3000/api/startPlan', {
            method: 'POST',
            body: JSON.stringify({
                mode: data.mode,
                cuisines: cuisines,
                goal: data.goal,
                dietary: data.dietType,
                budget: data.budget,
                mealTime: data.mealTime       // Required for daily mode
            })
        });

        const { threadId, sseUrl } = await response.json();
        console.log("Response:", threadId, sseUrl);
        setCurrentThreadId(threadId);

        const eventSource = new EventSource(`http://localhost:5000${sseUrl}`);
        setCurrentEventSource(eventSource);

        eventSource.addEventListener('node_complete', (event) => {
            const data = JSON.parse(event.data);
            console.log(`Node completed: ${data.node}`);
            if (data.node === "mealSuggester") {
                setCurrentStep(1);
            }
            if (data.node === "mealPicker") {
                setCurrentStep(2);
            }
            if (data.node === "recipeFetcher") {
                setCurrentStep(3);
            }
        });

        if (data.mode === "weekly") {
            eventSource.addEventListener('interrupt', (event) => {
                const eventData = JSON.parse(event.data);
                console.log('⏸️ Interrupt:', eventData.question);
                console.log('Meals:', eventData.meals);

                const meals = eventData.meals || [];
                setSuggestedMeals(meals);
                
                // Save meals to store so useMealImage can update them with imageUrls
                // Create a temporary meal plan structure for the store
                saveMealPlan({
                    meals: meals,
                    recipes: [], // Will be populated later
                    groceryList: [],
                    recipeQuery: {
                        mode: data.mode,
                        mealTime: data.mealTime || '',
                        cuisines: cuisines,
                        goal: data.goal || '',
                        dietary: data.dietType || '',
                        budget: data.budget
                    }
                });
                
                setShowModal(true);
                setIsRegenerating(false); // Reset regenerating state when new meals arrive
            });
        }

        eventSource.addEventListener('complete', (event) => {
            const responseData = JSON.parse(event.data);
            console.log('Final results:', responseData.finalState);

            // Preserve imageUrls from current store state
            const currentMealPlan = useMealPlanStore.getState().mealPlan;
            const finalState = responseData.finalState;
            
            // Merge imageUrls from current meals into final state meals
            if (currentMealPlan?.meals && finalState.meals) {
                finalState.meals = finalState.meals.map((meal: any, index: number) => ({
                    ...meal,
                    imageUrl: currentMealPlan.meals[index]?.imageUrl || meal.imageUrl
                }));
            }

            // Save the API response to store with preserved images
            saveMealPlan(finalState);

            eventSource.close();
            setCurrentEventSource(null);
            router.push(`/plan/${data.mode}`);
        });
        // } else {

        // }
    };

    const handleRegenerate = async (feedback: string) => {
        // Close existing EventSource if any
        if (currentEventSource) {
            currentEventSource.close();
            setCurrentEventSource(null);
        }

        setIsRegenerating(true);
        setShowModal(false);
        setCurrentStep(1);

        try {
            const response = await fetch('/api/resumePlan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: currentThreadId,
                    decision: 'no',
                    feedback: feedback
                })
            });

            const responseData = await response.json();
            console.log("Regenerate Response (full):", responseData);
            const { threadId, sseUrl, message, decision } = responseData;
            console.log("Extracted values:", { threadId, sseUrl, message, decision });

            const eventSource = new EventSource(`http://localhost:5000${sseUrl}`);
            setCurrentEventSource(eventSource);

            eventSource.addEventListener('node_complete', (event) => {
                const data = JSON.parse(event.data);
                console.log(`Node completed: ${data.node}`);
                if (data.node === "mealSuggester") {
                    setCurrentStep(1);
                }
                if (data.node === "mealPicker") {
                    setCurrentStep(2);
                }
                if (data.node === "recipeFetcher") {
                    setCurrentStep(3);
                }
            });

            eventSource.addEventListener('interrupt', (event) => {
                const eventData = JSON.parse(event.data);
                console.log('⏸️ Second Interrupt:', eventData.question);
                console.log('Meals:', eventData.meals);

                const meals = eventData.meals || [];
                setSuggestedMeals(meals);
                
                // Save meals to store so useMealImage can update them with imageUrls
                saveMealPlan({
                    meals: meals,
                    recipes: [],
                    groceryList: [],
                    recipeQuery: {
                        mode: mode,
                        mealTime: watch('mealTime') || '',
                        cuisines: Object.values(watch('weeklyCuisines') || {}),
                        goal: watch('goal') || '',
                        dietary: watch('dietType') || '',
                        budget: watch('budget')
                    }
                });
                
                setShowModal(true);
                setIsRegenerating(false);
            });

            eventSource.addEventListener('complete', (event) => {
                const responseData = JSON.parse(event.data);
                console.log('Final results after regeneration:', responseData.finalState);

                // Preserve imageUrls from current store state
                const currentMealPlan = useMealPlanStore.getState().mealPlan;
                const finalState = responseData.finalState;
                
                // Merge imageUrls from current meals into final state meals
                if (currentMealPlan?.meals && finalState.meals) {
                    finalState.meals = finalState.meals.map((meal: any, index: number) => ({
                        ...meal,
                        imageUrl: currentMealPlan.meals[index]?.imageUrl || meal.imageUrl
                    }));
                }

                // Save the API response to store with preserved images
                saveMealPlan(finalState);

                eventSource.close();
                setCurrentEventSource(null);
                router.push(`/plan/${mode}`);
            });
        } catch (error) {
            console.error('Error regenerating meals:', error);
            setIsRegenerating(false);
        }
    };

    const resetForm = () => {
        reset();
    };

    if (isLoading && !showModal) {
        return (
            <Loading 
                currentStep={currentStep} 
                showRegenerating={mode === "weekly" && isRegenerating} 
                mode={mode}
            />
        );
    }

    if (showModal) {
        return (
            <MealReviewModal
                open={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (isRegenerating) {
                        setCurrentStep(2);
                    }
                }}
                meals={suggestedMeals}
                threadId={currentThreadId}
                onRegenerate={handleRegenerate}
            />
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 3, maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Plan Mode</Typography>
                    <Controller
                        name="mode"
                        control={control}
                        render={({ field }) => (
                            <ToggleButtonGroup
                                value={field.value}
                                exclusive
                                onChange={(e, newValue) => {
                                    if (newValue !== null) {
                                        field.onChange(newValue);
                                    }
                                }}
                                fullWidth
                                sx={{ height: 48 }}
                            >
                                <ToggleButton value="daily" sx={{ textTransform: 'none' }}>
                                    <WbSunny sx={{ mr: 1, fontSize: 20 }} />
                                    Daily
                                </ToggleButton>
                                <ToggleButton value="weekly" sx={{ textTransform: 'none' }}>
                                    <CalendarMonth sx={{ mr: 1, fontSize: 20 }} />
                                    Weekly
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    />
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Meal Time</Typography>
                    <Controller
                        name="mealTime"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <Select
                                    {...field}
                                    startAdornment={<Restaurant sx={{ mr: 1, color: 'text.secondary' }} />}
                                >
                                    <MenuItem value="breakfast">Breakfast</MenuItem>
                                    <MenuItem value="lunch">Lunch</MenuItem>
                                    <MenuItem value="dinner">Dinner</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Goal</Typography>
                    <Controller
                        name="goal"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <Select {...field}>
                                    <MenuItem value="balanced">Balanced</MenuItem>
                                    <MenuItem value="weight_loss">Weight Loss</MenuItem>
                                    <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                                    <MenuItem value="high_protein">High Protein</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Diet Type</Typography>
                    <Controller
                        name="dietType"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <Select {...field}>
                                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                                    <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                                    <MenuItem value="vegan">Vegan</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Budget</Typography>
                <Controller
                    name="budget"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="number"
                            placeholder="Enter your budget"
                            fullWidth
                            slotProps={{
                                htmlInput: { min: 0 }
                            }}
                        />
                    )}
                />
            </Box>

            {mode === "weekly" ? (
                <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Cuisines for Each Day
                        </Typography>
                        <Info sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                        Select a cuisine for each day of the week (up to 7).
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {daysOfWeek.map((day) => (
                            <Box key={day}>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
                                    {day}
                                </Typography>
                                <Controller
                                    name={`weeklyCuisines.${day}` as any}
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth size="small">
                                            <Select {...field}>
                                                {cuisines.map((cuisine, index) => (
                                                    <MenuItem key={cuisine} value={cuisine.toLowerCase()}>
                                                        <img src={`https://flagsapi.com/${countryFlagsCode[index]}/flat/64.png`} alt={cuisine} style={{ width: '20px', height: '15px', marginRight: '8px' }} /> {cuisine}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                        <Lightbulb sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            You can change cuisines for any day to match your preference.
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Cuisine</Typography>
                    <Controller
                        name="dailyCuisine"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <Select {...field}>
                                    {cuisines.map((cuisine, index) => (
                                        <MenuItem key={cuisine} value={cuisine.toLowerCase()}>
                                            <img src={`https://flagsapi.com/${countryFlagsCode[index]}/flat/64.png`} alt={cuisine} style={{ width: '20px', height: '15px', marginRight: '8px' }} /> {cuisine}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={resetForm}
                    sx={{ textTransform: 'none' }}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                        textTransform: 'none',
                        bgcolor: 'success.main',
                        '&:hover': { bgcolor: 'success.dark' }
                    }}
                >
                    Generate Meal Plan
                </Button>
            </Box>
        </Box>
    );
}
