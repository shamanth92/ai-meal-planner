import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMealPlanStore } from '../store/useMealPlanStore';
import { MealFormInputs } from '../types';
import { transformFormData, preserveMealImages, createTemporaryMealPlan } from '../lib/mealPlanHelpers';

/**
 * Return type for the useMealPlanSSE hook
 * Provides all necessary state and functions for meal plan SSE operations
 */
interface UseMealPlanSSEReturn {
    submitPlan: (data: MealFormInputs) => Promise<void>;
    regeneratePlan: (feedback: string) => Promise<void>;
    currentStep: number;
    isLoading: boolean;
    suggestedMeals: any[];
    showModal: boolean;
    isRegenerating: boolean;
    currentThreadId: string;
    closeModal: () => void;
}

/**
 * Custom hook for managing meal plan submission and Server-Sent Events (SSE) connection
 * 
 * This hook encapsulates all the complex logic for:
 * - Submitting meal plan requests to the backend
 * - Managing EventSource connection lifecycle
 * - Handling SSE events (node_complete, interrupt, complete)
 * - Managing meal plan regeneration flow
 * - Preserving meal images during state updates
 * 
 * @returns Object containing state and functions for meal plan operations
 * 
 * @example
 * const { submitPlan, regeneratePlan, isLoading, showModal } = useMealPlanSSE();
 */
export function useMealPlanSSE(): UseMealPlanSSEReturn {
    // Loading state - true when API call is in progress
    const [isLoading, setIsLoading] = useState(false);
    
    // Current step in the meal plan generation process (0-3)
    // 0: Initial, 1: Meal Suggester, 2: Meal Picker, 3: Recipe Fetcher
    const [currentStep, setCurrentStep] = useState(0);
    
    // Controls visibility of the meal review modal
    const [showModal, setShowModal] = useState(false);
    
    // Array of suggested meals received from the interrupt event
    const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
    
    // Thread ID for the current meal plan session (used for regeneration)
    const [currentThreadId, setCurrentThreadId] = useState<string>("");
    
    // Flag indicating if a regeneration is in progress
    const [isRegenerating, setIsRegenerating] = useState(false);
    
    // Ref to store the EventSource connection (persists across re-renders)
    const eventSourceRef = useRef<EventSource | null>(null);
    
    const router = useRouter();
    const saveMealPlan = useMealPlanStore(state => state.saveMealPlan);

    /**
     * Sets up all EventSource event listeners for the meal plan generation process
     * 
     * Handles three types of events:
     * 1. node_complete - Updates progress as each backend node completes
     * 2. interrupt - Receives suggested meals for user review (weekly mode only)
     * 3. complete - Receives final meal plan and navigates to results page
     * 
     * @param eventSource - The EventSource connection to attach listeners to
     * @param mode - Plan mode ('daily' or 'weekly')
     * @param formData - Original form data for context preservation
     */
    const setupEventListeners = useCallback((
        eventSource: EventSource,
        mode: string,
        formData: MealFormInputs
    ) => {
        // Handle node completion events - tracks progress through the backend workflow
        eventSource.addEventListener('node_complete', (event) => {
            const data = JSON.parse(event.data);
            
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

        // Handle interrupt events (only for weekly mode)
        // The backend pauses to show suggested meals and ask for user approval
        if (mode === "weekly") {
            eventSource.addEventListener('interrupt', (event) => {
                const eventData = JSON.parse(event.data);

                const meals = eventData.meals || [];
                setSuggestedMeals(meals);
                
                // Create temporary plan and save to store
                // This allows useMealImage hook to fetch images for the suggested meals
                const temporaryPlan = createTemporaryMealPlan(meals, formData);
                saveMealPlan(temporaryPlan);
                
                // Show modal for user to review and approve/regenerate meals
                setShowModal(true);
                setIsRegenerating(false);
            });
        }

        // Handle completion event - final meal plan is ready
        eventSource.addEventListener('complete', (event) => {
            const responseData = JSON.parse(event.data);

            // Preserve imageUrls from current store state
            // Images may have been fetched during the review process, so we merge them
            const currentMealPlan = useMealPlanStore.getState().mealPlan;
            const finalStateWithImages = preserveMealImages(currentMealPlan, responseData.finalState);

            // Save the complete meal plan to store with preserved images
            saveMealPlan(finalStateWithImages);

            // Clean up: close EventSource connection and navigate to results page
            eventSource.close();
            eventSourceRef.current = null;
            router.push(`/plan/${formData.mode}`);
        });
    }, [router, saveMealPlan]);

    /**
     * Submits a new meal plan request to the backend
     * 
     * Flow:
     * 1. Transform form data to API payload
     * 2. Call /api/startPlan to initiate the meal plan generation
     * 3. Receive threadId and sseUrl from the response
     * 4. Create EventSource connection to receive real-time updates
     * 5. Set up event listeners to handle SSE events
     * 
     * @param data - Form inputs containing meal preferences
     */
    const submitPlan = useCallback(async (data: MealFormInputs) => {
        setIsLoading(true);
        setCurrentStep(0);

        try {
            // Transform form data to API payload format
            const payload = transformFormData(data);
            
            // Initiate meal plan generation on the backend
            const response = await fetch('/api/startPlan', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const { threadId, sseUrl } = await response.json();
            setCurrentThreadId(threadId);

            // Create EventSource connection for real-time updates
            // NEXT_PUBLIC_ prefix is required because EventSource runs in the browser
            const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:5000';
            const eventSource = new EventSource(`${agentUrl}${sseUrl}`);
            eventSourceRef.current = eventSource;
            
            // Attach event listeners to handle SSE events
            setupEventListeners(eventSource, data.mode, data);
        } catch (error) {
            console.error('Error submitting plan:', error);
            setIsLoading(false);
        }
    }, [setupEventListeners]);

    /**
     * Regenerates the meal plan with user feedback
     * 
     * Important: This does NOT close the existing EventSource connection.
     * The same EventSource will receive new events (interrupt/complete) after regeneration.
     * 
     * Flow:
     * 1. Call /api/resumePlan with user feedback and decision='no'
     * 2. Backend regenerates meals based on feedback
     * 3. Existing EventSource receives new interrupt event with updated meals
     * 4. User can review again or approve
     * 
     * @param feedback - User's feedback on why they want to regenerate
     */
    const regeneratePlan = useCallback(async (feedback: string) => {
        // CRITICAL: Keep EventSource open - it will receive continued events
        setIsRegenerating(true);
        setShowModal(false);
        setCurrentStep(1); // Reset to meal suggester step

        try {
            // Send regeneration request to backend
            await fetch('/api/resumePlan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: currentThreadId,
                    decision: 'no', // 'no' means regenerate, 'yes' means approve
                    feedback: feedback
                })
            });

            // The existing EventSource will now receive:
            // 1. node_complete events as the graph continues
            // 2. interrupt event with new meals
            // 3. complete event when user approves
        } catch (error) {
            console.error('Error regenerating meals:', error);
            setIsRegenerating(false);
        }
    }, [currentThreadId]);

    /**
     * Closes the meal review modal
     * 
     * If regeneration is in progress, updates the step to show meal picker progress
     * 
     * @callback
     */
    const closeModal = useCallback(() => {
        setShowModal(false);
        if (isRegenerating) {
            setCurrentStep(2); // Show meal picker step during regeneration
        }
    }, [isRegenerating]);

    return {
        submitPlan,
        regeneratePlan,
        currentStep,
        isLoading,
        suggestedMeals,
        showModal,
        isRegenerating,
        currentThreadId,
        closeModal
    };
}
