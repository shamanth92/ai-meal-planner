"use client";
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
import { countryFlagsCode, cuisines, daysOfWeek } from '../../lib/constants';
import { MealFormInputs } from '../../types';
import Loading from '../ui/Loading';
import MealReviewModal from './MealReviewModal';
import { useMealPlanSSE } from '../../hooks/useMealPlanSSE';

/**
 * MealForm Component
 * 
 * Main form component for creating meal plans (daily or weekly)
 * 
 * Features:
 * - Toggle between daily and weekly meal planning modes
 * - Select meal time (breakfast, lunch, dinner)
 * - Choose dietary goals and restrictions
 * - Set budget constraints
 * - Select cuisines (single for daily, one per day for weekly)
 * - Real-time progress tracking via SSE
 * - Meal review and regeneration flow (weekly mode)
 * 
 * The component delegates SSE logic to useMealPlanSSE hook for better separation of concerns
 * 
 * @returns JSX.Element - Meal planning form with conditional rendering for loading/modal states
 */
export default function MealForm() {
    // SSE hook provides all meal plan submission and state management logic
    const {
        submitPlan,          // Function to submit meal plan request
        regeneratePlan,      // Function to regenerate meals with feedback
        currentStep,         // Current progress step (0-3)
        isLoading,           // Loading state during API calls
        suggestedMeals,      // Array of suggested meals from interrupt event
        showModal,           // Controls meal review modal visibility
        isRegenerating,      // Flag for regeneration in progress
        currentThreadId,     // Thread ID for current session
        closeModal           // Function to close the modal
    } = useMealPlanSSE();

    // React Hook Form setup for form state management and validation
    const { control, handleSubmit, watch, reset, setValue } = useForm<MealFormInputs>({
        defaultValues: {
            mode: "daily",              // Default to daily meal planning
            mealTime: "",               // Breakfast, lunch, or dinner
            goal: "",                   // Balanced, weight loss, muscle gain, etc.
            dietType: "",               // Vegetarian, non-veg, vegan
            budget: undefined,          // Optional budget constraint
            dailyCuisine: "",           // Single cuisine for daily mode
            weeklyCuisines: {           // One cuisine per day for weekly mode
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

    // Watch mode to conditionally render daily vs weekly cuisine selection
    const mode = watch("mode");

    /**
     * Resets the form to default values
     */
    const resetForm = () => {
        reset();
    };

    // Show loading screen while meal plan is being generated
    // Hide loading when modal is shown (during meal review)
    if (isLoading && !showModal) {
        return (
            <Loading 
                currentStep={currentStep} 
                showRegenerating={mode === "weekly" && isRegenerating} 
                mode={mode}
            />
        );
    }

    // Show meal review modal when meals are ready for user approval (weekly mode only)
    if (showModal) {
        return (
            <MealReviewModal
                open={showModal}
                onClose={closeModal}
                meals={suggestedMeals}
                threadId={currentThreadId}
                onRegenerate={regeneratePlan}
            />
        );
    }

    // Main form UI - only shown when not loading and modal is closed
    return (
        <Box component="form" onSubmit={handleSubmit(submitPlan)} sx={{ p: 3, maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            {/* Form fields are organized in a grid layout for better UX */}
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

            {/* Cuisine Selection - Conditional rendering based on mode */}
            {mode === "weekly" ? (
                // Weekly mode: Show 7 dropdowns (one for each day of the week)
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

                    {/* Grid layout for 7 days - each day gets its own cuisine selector */}
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
                                                    <MenuItem key={cuisine} value={cuisine}>
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
                // Daily mode: Show single cuisine dropdown
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Cuisine</Typography>
                    <Controller
                        name="dailyCuisine"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <Select {...field}>
                                    {cuisines.map((cuisine, index) => (
                                        <MenuItem key={cuisine} value={cuisine}>
                                            <img src={`https://flagsapi.com/${countryFlagsCode[index]}/flat/64.png`} alt={cuisine} style={{ width: '20px', height: '15px', marginRight: '8px' }} /> {cuisine}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                </Box>
            )}

            {/* Form Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                {/* Reset button - clears all form fields to default values */}
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={resetForm}
                    sx={{ textTransform: 'none' }}
                >
                    Reset
                </Button>
                {/* Submit button - triggers form submission and meal plan generation */}
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
