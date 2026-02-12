import { GoogleGenAI } from "@google/genai";
import { Workout, Food, Goal } from "../types.ts";

export const getGeminiAdvice = async (workouts: Workout[], foods: Food[], goals: Goal[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const recentWorkouts = workouts.slice(0, 5).map(w => `${w.name}: ${w.reps} reps @ ${w.weight}kg`).join(', ');
  const recentFoods = foods.slice(0, 5).map(f => `${f.name} (${f.calories} cal)`).join(', ');
  const currentGoals = goals.map(g => `${g.name}: ${g.current}/${g.target} ${g.unit}`).join(', ');

  const prompt = `
    Act as a world-class professional fitness coach and nutritionist. 
    Analyze the following user data and provide 3-4 concise, highly actionable pieces of advice. 
    Focus on balancing their workout intensity with their nutrition.
    
    Data Summary:
    Recent Workouts: ${recentWorkouts || 'No data yet'}
    Recent Nutrition: ${recentFoods || 'No data yet'}
    Active Goals: ${currentGoals || 'No data yet'}

    Format your response in Markdown with bullet points. Be encouraging but scientific.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "I'm having trouble analyzing your data right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I couldn't reach your AI coach.";
  }
};