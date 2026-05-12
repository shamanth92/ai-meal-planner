import { Box, Button, Modal, Typography } from "@mui/material";
import { GroceryItem, Meal } from "../../types";

/**
 * Props for the GroceryListModal component
 */
interface GroceryListModalProps {
    /** Controls modal visibility */
    open: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** Array of grocery items grouped by meal */
    groceryList: GroceryItem[];
    /** Meal data containing name and description */
    meal: Meal;
}

/**
 * Modal component to display grocery list for meal plans
 * 
 * Displays a categorized list of groceries grouped by meal name.
 * Each grocery item's first letter is capitalized for better readability.
 * 
 * @param open - Whether the modal is visible
 * @param onClose - Function to call when closing the modal
 * @param groceryList - Array of grocery items to display
 * @param meal - Meal data containing name and description
 */
export default function GroceryListModal({ open, onClose, groceryList, meal }: GroceryListModalProps) {
    console.log('GroceryList: ', groceryList, meal.name)
    const groceryForMeal = groceryList.filter(item => item.mealName === meal.name);
    return (
        <Modal open={open} onClose={onClose}>
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

                {groceryForMeal && groceryForMeal.length > 0 ? (
                    <Box>
                        {groceryForMeal.map((item, index) => (
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
                    <Button variant="contained" onClick={onClose}>
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
