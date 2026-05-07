import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import FoodBankIcon from '@mui/icons-material/FoodBank';
import EggIcon from '@mui/icons-material/Egg';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import { Meal, Recipe } from "../utils/types";
import { nutritionNames } from "../utils/data";

type NutritionKey = keyof typeof nutritionNames;

/**
 * Mapping of nutrition keys to their corresponding Material-UI icon components
 */
const nutritionIconComponents: Record<NutritionKey, React.ComponentType> = {
    calories: FoodBankIcon,
    protein: EggIcon,
    carbs: RiceBowlIcon,
    fat: LocalPizzaIcon
};

/**
 * Props for the MealCard component
 */
interface MealCardProps {
    /** Meal data containing name and description */
    meal: Meal;
    /** Recipe data containing ingredients, steps, and nutrition info */
    recipe: Recipe;
    /** Optional header text - "BREAKFAST" for daily view, "Monday" for weekly view */
    headerText?: string;
    /** Optional image URL for the meal (fetched from Pexels) */
    imageUrl?: string;
    /** Callback function when "View Grocery List" button is clicked */
    onViewGroceryList: () => void;
    /** Whether to show the "Save to Favorites" button (default: true) */
    showSaveToFavorites?: boolean;
}

/**
 * Reusable meal card component for displaying meal details
 * 
 * This component displays a meal with its image, nutrition information,
 * ingredients, cooking instructions, and action buttons. It's designed to be
 * flexible enough for both daily and weekly meal plan views.
 * 
 * Features:
 * - Meal image with Pexels attribution
 * - Nutrition stats with icons (calories, protein, carbs, fat)
 * - Ingredients list
 * - Step-by-step cooking instructions
 * - Optional "Save to Favorites" button
 * - "View Grocery List" button
 * 
 * @param meal - Meal data
 * @param recipe - Recipe data
 * @param headerText - Optional header (meal time or day of week)
 * @param imageUrl - Optional meal image URL
 * @param onViewGroceryList - Callback for grocery list button
 * @param showSaveToFavorites - Whether to show favorites button
 */
export default function MealCard({
    meal,
    recipe,
    headerText,
    imageUrl,
    onViewGroceryList,
    showSaveToFavorites = true
}: MealCardProps) {
    return (
        <Card sx={{ padding: 2 }}>
            <CardContent>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 2, alignItems: "center" }}>
                    <Box className="p-4" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={imageUrl}
                            alt={meal.name || "Meal"}
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
                            {headerText && <Typography variant="h4">{headerText}</Typography>}
                            <Box sx={{
                                display: 'flex',
                                gap: 2
                            }}>
                                {(Object.keys(nutritionNames) as NutritionKey[]).map((key) => {
                                    const IconComponent = nutritionIconComponents[key];
                                    const nutritionValue = recipe.nutrition?.[key] || 0;
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
                                {meal.name}
                            </Typography>

                            <Box sx={{
                                height: '4px',
                                width: '100%',
                                bgcolor: 'black',
                                borderRadius: '2px',
                                mb: 2
                            }} />

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                {meal.description}
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
                                        {recipe.ingredients.map((ingredient, index) => (
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
                                        {recipe.steps.map((step) => (
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
                            {showSaveToFavorites && <Button variant="outlined">Save to Favorites</Button>}
                            <Button variant="contained" onClick={onViewGroceryList}>View Grocery List</Button>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
