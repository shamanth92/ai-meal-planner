import { Box, Typography } from '@mui/material';

/**
 * Props for the MealGridDisplay component
 */
interface MealGridDisplayProps {
    /** Array of meals to display in the grid */
    meals: any[];
    /** Optional custom day labels (defaults to Mon-Sun) */
    dayLabels?: string[];
    /** Optional click handler for when a meal card is clicked */
    onMealClick?: (meal: any, index: number) => void;
}

/**
 * Reusable meal grid display component
 * 
 * Displays meals in a responsive grid layout with circular images,
 * day labels, meal names, and descriptions. Used in both the review
 * modal and the weekly plan page.
 * 
 * Features:
 * - Responsive grid layout (auto-fill with min 140px columns)
 * - Circular meal images with loading state
 * - Day labels (Mon-Sun by default)
 * - Meal names and descriptions (2-line clamp)
 * 
 * @param meals - Array of meal objects with name, description, and imageUrl
 * @param dayLabels - Optional custom labels for each day
 */
export default function MealGridDisplay({ meals, dayLabels, onMealClick }: MealGridDisplayProps) {
    const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = dayLabels || defaultDays;

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: 3, 
            width: '100%'
        }}>
            {meals.map((meal, index) => {
                return (
                    <Box 
                        key={index}
                        onClick={() => onMealClick?.(meal, index)}
                        sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 2,
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2,
                            bgcolor: '#fafafa',
                            textAlign: 'center',
                            cursor: onMealClick ? 'pointer' : 'default',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#555' }}>
                            {days[index] || `Day ${index + 1}`}
                        </Typography>
                        
                        <Box sx={{ 
                            width: '100%', 
                            height: 160, 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: meal.imageUrl ? '#fff' : '#f5f5f5',
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {meal.imageUrl ? (
                                <img
                                    src={meal.imageUrl}
                                    alt={meal.name || 'Meal'}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                    }}
                                />
                            ) : (
                                <Typography variant="caption" sx={{ color: '#999' }}>
                                    Loading...
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                            {meal.name || 'Meal Name'}
                        </Typography>

                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {meal.description || ''}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
