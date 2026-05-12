import { Box } from "@mui/material";
import { Restaurant } from "@mui/icons-material";
import MealForm from "../components/meal/MealForm";

export default function Plan() {
  return (
    <Box className="flex">
        <Box className="w-1/4 h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex flex-col text-white">
            <Box className="flex items-center gap-2 mb-8">
                <Restaurant className="text-2xl" />
                <span className="text-sm font-medium">Meal Planner Agent</span>
            </Box>

            <h1 className="text-3xl font-bold leading-tight mb-6">
                Let's plan your <span className="text-purple-300">perfect meals</span> 🎉
            </h1>

            <p className="text-sm leading-relaxed opacity-90">
                Tell us your preferences and our AI agent will create the perfect meal plan for you.
            </p>
        </Box>

        <Box className="w-3/4">
            <MealForm />
        </Box>
    </Box>
  );
}
