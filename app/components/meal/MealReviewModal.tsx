import * as React from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { CheckCircle, Refresh } from '@mui/icons-material';
import { useMealImage } from '../../hooks/useMealImage';
import { useMealPlanStore } from '../../store/useMealPlanStore';
import MealGridDisplay from './MealGridDisplay';

interface MealReviewModalProps {
    open: boolean;
    onClose: () => void;
    meals: any[];
    threadId: string;
    onRegenerate?: (feedback: string) => Promise<void>;
    mockMode?: boolean;
    onMockApprove?: () => void;
}

export default function MealReviewModal({ open, onClose, meals, threadId, onRegenerate, mockMode = false, onMockApprove }: MealReviewModalProps) {
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedback, setFeedback] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    // Get meals from store to access updated imageUrls
    const mealPlan = useMealPlanStore(state => state.mealPlan);
    const mealsWithImages = mealPlan?.meals || meals;

    // Fetch images for each meal using individual hook calls
    // Note: This assumes a maximum of 7 meals (one per day of the week)
    useMealImage(meals[0]?.name || '', 0, meals[0]?.imageUrl);
    useMealImage(meals[1]?.name || '', 1, meals[1]?.imageUrl);
    useMealImage(meals[2]?.name || '', 2, meals[2]?.imageUrl);
    useMealImage(meals[3]?.name || '', 3, meals[3]?.imageUrl);
    useMealImage(meals[4]?.name || '', 4, meals[4]?.imageUrl);
    useMealImage(meals[5]?.name || '', 5, meals[5]?.imageUrl);
    useMealImage(meals[6]?.name || '', 6, meals[6]?.imageUrl);

    const handleApprove = async () => {
        // Close modal immediately
        onClose();
        setShowFeedback(false);
        setFeedback('');
        
        // In mock mode, call the mock approve handler
        if (mockMode && onMockApprove) {
            onMockApprove();
            return;
        }
        
        setIsSubmitting(true);
        try {
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

    const handleRegenerate = async () => {
        if (!feedback.trim()) {
            alert('Please provide feedback on what to change');
            return;
        }

        setIsSubmitting(true);

        try {
            if (onRegenerate) {
                await onRegenerate(feedback);
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
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Review Your Weekly Meal Plan
                </Typography>

                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    We've selected {mealsWithImages.length} meals for your week. Review them below and let us know if you'd like to proceed or make changes.
                </Typography>

                <MealGridDisplay meals={mealsWithImages} />

                {/* Feedback section - shown when user clicks No */}
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

                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {!showFeedback ? (
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
