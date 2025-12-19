
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMathProblem = async (problem: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Solve this math problem: "${problem}". Provide a structured response with the final answer, a brief explanation, and clear numbered steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            solution: { type: Type.STRING, description: "The final answer only" },
            explanation: { type: Type.STRING, description: "Brief conceptual explanation" },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Step-by-step list of instructions"
            }
          },
          required: ["solution", "explanation", "steps"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Math Solver Error:", error);
    throw error;
  }
};

export const explainConcept = async (expression: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the mathematical concept behind this expression: ${expression}. How would you solve it?`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "Could not generate explanation at this time.";
  }
};
