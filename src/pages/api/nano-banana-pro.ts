import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API Key from environment variables
const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;

export const POST: APIRoute = async ({ request }) => {
  if (!GOOGLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Server Config Error: GOOGLE_API_KEY missing" }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { image, instruction } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image data" }), { status: 400 });
    }

    // Initialize Gemini and specifically target the nano-banana-pro-preview model
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" });

    // Ensure we format the base64 image data correctly, stripping the data URI scheme if present
    const base64Data = image.split(',')[1] || image;

    const defaultPrompt = "Process and render this image realistically.";
    const prompt = instruction || defaultPrompt;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };

    // Make the multi-modal request
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    const parts = response.candidates?.[0]?.content?.parts;
    
    // Instead of expecting text, we explicitly search for an inlineData payload
    // indicating a returned image from nano-banana
    const returnedImagePart = parts?.find((p: any) => p.inlineData);

    if (returnedImagePart && returnedImagePart.inlineData) {
      const mimeType = returnedImagePart.inlineData.mimeType;
      const data = returnedImagePart.inlineData.data;
      
      return new Response(JSON.stringify({
        generated_image: `data:${mimeType};base64,${data}`,
        message: "Image generated successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fallback: capture any generic output or inform the user it failed to return an image
    let textOut = "";
    try {
      textOut = response.text();
    } catch (e) {
       textOut = "No text returned.";
    }

    return new Response(JSON.stringify({
      generated_image: image, // Return original image as fallback
      note: `The model did not return a generated image stream. AI Text Response: ${textOut}`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Nano-Banana Pro API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
