import { useEffect } from 'react';
import { useMealPlanStore } from '../store/useMealPlanStore';

/**
 * Custom hook to fetch meal images from Pexels API
 * 
 * @param mealName - Name of the meal to search for
 * @param mealIndex - Index of the meal in the meal plan array
 * @param existingImageUrl - Optional existing image URL to prevent refetching
 * 
 * This hook automatically fetches a portrait-oriented image from Pexels
 * based on the meal name and updates the meal plan store with the image URL.
 * It skips fetching if the meal already has an image or if no meal name is provided.
 */
export function useMealImage(mealName: string, mealIndex: number, existingImageUrl?: string) {
    const updateMealImage = useMealPlanStore(state => state.updateMealImage);

    useEffect(() => {
        const fetchMealImage = async () => {
            // Skip if no meal name or image already exists
            if (!mealName || existingImageUrl) return;
            
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
                const imageUrl = data.photos[0]?.src.large || null;
                if (imageUrl) {
                    updateMealImage(mealIndex, imageUrl);
                }
            } catch (error) {
                // Silently fail - meal will display without image
            }
        };

        fetchMealImage();
    }, [mealName, existingImageUrl, mealIndex, updateMealImage]);
}
