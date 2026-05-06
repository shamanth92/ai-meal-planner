import * as React from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { CheckCircle, Refresh } from '@mui/icons-material';

interface MealReviewModalProps {
    open: boolean;
    onClose: () => void;
    meals: any[];
    threadId: string;
    onRegenerateComplete?: () => void;
}

export default function MealReviewModal({ open, onClose, meals, threadId, onRegenerateComplete }: MealReviewModalProps) {
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedback, setFeedback] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleApprove = async () => {
        // Close modal immediately
        onClose();
        setShowFeedback(false);
        setFeedback('');
        
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
            const response = await fetch('/api/resumePlan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: threadId,
                    decision: 'no',
                    feedback: feedback
                })
            });

            if (response.ok) {
                // Trigger regenerating state before closing modal
                if (onRegenerateComplete) {
                    onRegenerateComplete();
                }
                // Close modal and go back to loading screen
                onClose();
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
                    We've selected {meals.length} meals for your week. Review them below and let us know if you'd like to proceed or make changes.
                </Typography>

                {/* Meal cards will be displayed here */}
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: 2, 
                    mb: 4 
                }}>
                    {meals.map((meal, index) => {
                        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        return (
                            <Box 
                                key={index} 
                                sx={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 1.5,
                                    border: '1px solid #e0e0e0', 
                                    borderRadius: 2,
                                    bgcolor: '#fafafa',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {days[index] || `Day ${index + 1}`}
                                </Typography>
                                
                                <Box sx={{ 
                                    width: '100%', 
                                    height: 100, 
                                    borderRadius: '50%', 
                                    overflow: 'hidden',
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#fff'
                                }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1751560455942-f859f1215826?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFzYWxhJTIwZG9zYXxlbnwwfDF8MHx8fDA%3D"
                                        alt={meal.name || 'Meal'}
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover' 
                                        }}
                                    />
                                </Box>

                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, lineHeight: 1.2 }}>
                                    {meal.name || 'Meal Name'}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    {meal.calories || 0} kcal
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    {meal.protein || 0}g Protein
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

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
