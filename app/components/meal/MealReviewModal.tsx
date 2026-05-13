import * as React from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { CheckCircle, Refresh } from '@mui/icons-material';
import { useMealImage } from '../../hooks/useMealImage';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import MealGridDisplay from './MealGridDisplay';

/**
 * Props for the MealReviewModal component
 */
interface MealReviewModalProps {
    /** Controls modal visibility */
    open: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** Array of suggested meals to review */
    meals: any[];
    /** Thread ID for the current meal plan session */
    threadId: string;
    /** Optional callback to regenerate meals with user feedback */
    onRegenerate?: (feedback: string) => Promise<void>;
    /** Flag to enable mock mode for testing */
    mockMode?: boolean;
    /** Mock approval handler for testing */
    onMockApprove?: () => void;
}

/**
 * MealReviewModal Component
 * 
 * Modal dialog for reviewing AI-suggested weekly meals before final approval
 * 
 * Features:
 * - Displays suggested meals in a grid layout with images
 * - Allows user to approve meals and continue to recipe generation
 * - Allows user to reject meals and provide feedback for regeneration
 * - Fetches meal images from Pexels API using useMealImage hook
 * - Integrates with SSE flow via onRegenerate callback
 * 
 * Flow:
 * 1. User reviews suggested meals
 * 2. User clicks "Yes, Approve" -> Calls /api/resumePlan with decision='yes'
 * 3. OR User clicks "No, Regenerate" -> Shows feedback form
 * 4. User provides feedback -> Calls onRegenerate -> Backend regenerates meals
 * 
 * @param props - Component props
 * @returns Modal dialog with meal review interface
 */
export default function MealReviewModal({ open, onClose, meals, threadId, onRegenerate, mockMode = false, onMockApprove }: MealReviewModalProps) {
    // Controls visibility of the feedback input form
    const [showFeedback, setShowFeedback] = React.useState(false);
    
    // User's feedback text for meal regeneration
    const [feedback, setFeedback] = React.useState('');
    
    // Loading state during API calls (approve/regenerate)
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    // Get meals from store to access updated imageUrls
    // The store is updated by useMealImage hook as images are fetched
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    const mealsWithImages = mealPlan?.meals || meals;

    // Fetch images for each meal using individual hook calls
    // Note: This assumes a maximum of 7 meals (one per day of the week)
    // Each hook call fetches an image from Pexels API and updates the store
    // The third parameter prevents re-fetching if image already exists
    useMealImage(meals[0]?.name || '', 0, meals[0]?.imageUrl);
    useMealImage(meals[1]?.name || '', 1, meals[1]?.imageUrl);
    useMealImage(meals[2]?.name || '', 2, meals[2]?.imageUrl);
    useMealImage(meals[3]?.name || '', 3, meals[3]?.imageUrl);
    useMealImage(meals[4]?.name || '', 4, meals[4]?.imageUrl);
    useMealImage(meals[5]?.name || '', 5, meals[5]?.imageUrl);
    useMealImage(meals[6]?.name || '', 6, meals[6]?.imageUrl);

    /**
     * Handles user approval of suggested meals
     * 
     * Flow:
     * 1. Close modal and reset feedback state
     * 2. If in mock mode, call mock handler and return
     * 3. Call /api/resumePlan with decision='yes' to approve meals
     * 4. Backend continues to recipe generation and grocery list creation
     * 5. EventSource (in useMealPlanSSE) receives 'complete' event with final plan
     * 
     * Note: Modal closes immediately for better UX, API call happens in background
     */
    const handleApprove = async () => {
        // Close modal immediately for better UX
        onClose();
        setShowFeedback(false);
        setFeedback('');
        
        // In mock mode, call the mock approve handler instead of real API
        if (mockMode && onMockApprove) {
            onMockApprove();
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Send approval to backend - decision='yes' means user approved the meals
            const response = await fetch('/api/resumePlan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: threadId,
                    decision: 'yes'
                })
            });

            if (!response.ok) {
                console.error('Error approving meals');
            }
        } catch (error) {
            console.error('Error approving meals:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handles meal regeneration with user feedback
     * 
     * Flow:
     * 1. Validate that feedback is provided
     * 2. Call onRegenerate callback (from useMealPlanSSE hook)
     * 3. onRegenerate calls /api/resumePlan with decision='no' and feedback
     * 4. Backend regenerates meals based on feedback
     * 5. EventSource receives new 'interrupt' event with updated meals
     * 6. This modal shows again with new meals for review
     * 
     * Note: The EventSource connection remains open throughout regeneration
     */
    const handleRegenerate = async () => {
        // Validate feedback is provided
        if (!feedback.trim()) {
            alert('Please provide feedback on what to change');
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the regenerate callback from useMealPlanSSE hook
            if (onRegenerate) {
                await onRegenerate(feedback);
                // Reset feedback form after successful regeneration
                setShowFeedback(false);
                setFeedback('');
            }
        } catch (error) {
            console.error('Error regenerating meals:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="meal-review-modal"
            aria-describedby="review-suggested-meals"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxWidth: 900,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {/* Modal Header */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Review Your Weekly Meal Plan
                </Typography>

                {/* Instruction text */}
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    We've selected {mealsWithImages.length} meals for your week. Review them below and let us know if you'd like to proceed or make changes.
                </Typography>

                {/* Meal grid display - shows all suggested meals with images */}
                <MealGridDisplay meals={mealsWithImages} />

                {/* Feedback section - shown when user clicks "No, Regenerate" */}
                {showFeedback && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            What would you like us to change?
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="E.g., 'I'd prefer more vegetarian options' or 'Add more variety in cuisines'"
                            variant="outlined"
                        />
                    </Box>
                )}

                {/* Action buttons - conditional rendering based on feedback state */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {!showFeedback ? (
                        // Initial state: Show Approve and Regenerate buttons
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={() => setShowFeedback(true)}
                                disabled={isSubmitting}
                            >
                                No, Regenerate
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={handleApprove}
                                disabled={isSubmitting}
                            >
                                Yes, Approve & Continue
                            </Button>
                        </>
                    ) : (
                        // Feedback state: Show Cancel and Submit Feedback buttons
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowFeedback(false);
                                    setFeedback('');
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={handleRegenerate}
                                disabled={isSubmitting || !feedback.trim()}
                            >
                                Regenerate with Feedback
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
