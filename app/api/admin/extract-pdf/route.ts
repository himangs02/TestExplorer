import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Increase Vercel timeout for AI processing
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in environment variables. Please add it to your .env file.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageParts = images.map((img: string) => {
      const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
      return {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };
    });

    const prompt = `
      You are an expert educational content extractor. Look at the provided images of exam pages (such as JEE Advanced).
      Extract ALL multiple-choice questions found in these pages. 
      For each question, return a JSON object containing:
      - question: The full text of the question (use LaTeX for math equations, e.g., $E = mc^2$ or $$ \\int $$).
      - options: An array of exact 4 options (strings, using LaTeX for math).
      - answer: The correct option string, or leave empty string if unknown.
      - explanation: An empty string (or extract it if a solution is present).
      
      Respond ONLY with a valid JSON array of these objects, enclosed in \`\`\`json ... \`\`\`. Do not include any other text.
      Format example:
      [
        {
          "question": "What is the integral of $x^2$?",
          "options": ["$x^3/3$", "$2x$", "$x^2$", "$x$"],
          "answer": "$x^3/3$",
          "explanation": ""
        }
      ]
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON array from the markdown block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    
    let parsedQuestions = [];
    if (jsonMatch && jsonMatch[1]) {
      parsedQuestions = JSON.parse(jsonMatch[1]);
    } else {
      // Fallback in case it didn't use markdown ticks
      try {
        parsedQuestions = JSON.parse(text);
      } catch (e) {
        // Extreme fallback if LLM returned text before/after JSON
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          parsedQuestions = JSON.parse(text.substring(start, end + 1));
        } else {
          throw new Error("Could not parse JSON from AI response.");
        }
      }
    }

    return NextResponse.json({ questions: parsedQuestions });

  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract questions' }, { status: 500 });
  }
}
