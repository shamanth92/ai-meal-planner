import { Box, Typography } from "@mui/material";
import { CheckCircle, RadioButtonUnchecked, SmartToy } from '@mui/icons-material';
import { steps } from '../utils/data';

interface LoadingProps {
    currentStep: number;
}

export default function Loading({ currentStep }: LoadingProps) {
    return (
        <Box className="flex flex-col items-center justify-center min-h-screen p-8 max-w-2xl mx-auto">
            <Box className="mb-8">
                <SmartToy className="text-8xl text-purple-600" />
            </Box>
            
            <Typography variant="h5" className="font-bold text-center mb-2">
                Creating your perfect meal plan...
            </Typography>
            
            <Typography variant="body2" className="text-gray-600 text-center mb-8">
                Our AI agent is analyzing recipes, nutrition and your preferences.
            </Typography>
            
            <Box className="w-full mb-8">
                <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <Box 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                        sx={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                </Box>
            </Box>
            
            <Box className="w-full space-y-3">
                {steps.map((step, index) => (
                    <Box key={index} className="flex items-center gap-3">
                        {index < currentStep ? (
                            <CheckCircle className="text-green-500" />
                        ) : (
                            <RadioButtonUnchecked className="text-gray-300" />
                        )}
                        <Typography 
                            className={index < currentStep ? "text-gray-900" : "text-gray-400"}
                        >
                            {step}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}