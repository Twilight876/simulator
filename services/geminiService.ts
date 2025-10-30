import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SimulationState } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const simulationSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: 'A detailed description of the current state of the simulation.'
        },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 3-4 actions the user can take next. If the simulation is over, this can be an empty array.'
        },
        is_final_state: {
            type: Type.BOOLEAN,
            description: 'Set to true if the simulation has reached a conclusive end.'
        },
        image_prompt: {
            type: Type.STRING,
            description: 'A vivid, descriptive prompt for an image generation model that visually represents the current scene. This should be a concise but detailed phrase suitable for a text-to-image AI.'
        }
    },
    required: ['description', 'choices', 'is_final_state', 'image_prompt']
};

interface SimulationResponse {
    description: string;
    choices: string[];
    is_final_state: boolean;
    image_prompt: string;
}

export const generateInteractiveSimulation = async (prompt: string, history: { choice: string, description: string }[]): Promise<SimulationState> => {
    try {
        let fullPrompt: string;
        if (history.length === 0) {
            fullPrompt = `You are an expert educator and an interactive simulation engine. Your goal is to create an engaging, choice-based simulation to help a student learn.
Based on the user's prompt, provide an initial scenario description, 3-4 choices for the user to proceed, and a vivid, descriptive prompt for an image generation model to create a visual for this scene. The image prompt should be concise but detailed.

USER PROMPT: "${prompt}"

Your response MUST be a JSON object matching the provided schema. Provide only the JSON object.`;
        } else {
            const historyText = history.map(turn => `The scene was: "${turn.description}"\nThe user chose: "${turn.choice}"`).join('\n\n');
            const lastChoice = history[history.length - 1].choice;

            fullPrompt = `Continue the interactive simulation.
ORIGINAL PROMPT: "${prompt}"

SIMULATION HISTORY:
${historyText}

The user has just chosen: "${lastChoice}".

Describe what happens next as a result of this choice. Then, provide 3-4 new choices for the user to continue the simulation, and a new image generation prompt for the updated scene.
If this choice leads to a natural conclusion of the simulation, set "is_final_state" to true, provide a concluding description, an image prompt, and the choices array can be empty.

Your response MUST be a JSON object matching the provided schema. Provide only the JSON object.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: simulationSchema,
            }
        });

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        
        const simulationData = JSON.parse(jsonStr) as SimulationResponse;
        
        let imageUrl: string | undefined = undefined;
        if (simulationData.image_prompt) {
            try {
                const imageResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: simulationData.image_prompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                for (const part of imageResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        break;
                    }
                }
            } catch (imageError) {
                console.error("Error generating image for simulation:", imageError);
                // Continue without an image if generation fails
            }
        }

        return {
            description: simulationData.description,
            choices: simulationData.choices,
            is_final_state: simulationData.is_final_state,
            imageUrl: imageUrl
        };

    } catch (error) {
        console.error("Error generating interactive simulation:", error);
        throw new Error("Failed to generate simulation step. The model may have returned an invalid format.");
    }
};


export const generateStory = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are a creative storyteller. Write a short, engaging story for a student based on this idea: "${prompt}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story:", error);
        return "Failed to generate story. Please try again.";
    }
};

export const generateVocabularyHelp = async (word: string): Promise<string> => {
    try {
        const fullPrompt = `You are a helpful dictionary. For the word "${word}", provide its definition, part of speech, and three example sentences. Format the output clearly.`;
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt
        });
        return response.text;
    } catch (error) {
        console.error("Error generating vocabulary help:", error);
        return "Failed to get vocabulary help. Please try again.";
    }
};

export const correctGrammar = async (text: string): Promise<string> => {
    try {
        const fullPrompt = `You are an expert English teacher. Correct the grammar in the following text. Provide the corrected version and a brief, clear explanation of the changes made.
        
        TEXT: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt
        });
        return response.text;
    } catch (error) {
        console.error("Error correcting grammar:", error);
        return "Failed to correct grammar. Please try again.";
    }
};

export const analyzeText = async (text: string): Promise<string> => {
    try {
        const fullPrompt = `You are a literary analyst. Provide a brief analysis of the following text, focusing on its theme, tone, and any notable literary devices used.
        
        TEXT: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing text:", error);
        return "Failed to analyze text. Please try again.";
    }
};