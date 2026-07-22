import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// We read the API key from Vite's env variables.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function parseTextToReport(rawText) {
  if (!apiKey) {
    throw new Error('La API Key de Gemini (VITE_GEMINI_API_KEY) no está configurada. Por favor, añádela a tu archivo .env.');
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Transforma el siguiente contenido en un informe ejecutivo perfectamente estructurado:\n\n${rawText}`,
      config: {
        systemInstruction: `Eres un sintetizador técnico y ejecutivo experto. Analiza el texto o código del usuario y organízalo dentro del esquema JSON especificado. Crea un título impactante, un subtítulo, un tag o badge corto, un resumen ejecutivo de un párrafo, y agrupa el contenido en secciones claras (usando tipos: 'table', 'cards', 'bullets' o 'code'). Si hay código o estructuras de carpetas/archivos, usa 'code'.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            subtitle: { type: 'STRING' },
            badge: { type: 'STRING' },
            summary: { type: 'STRING' },
            sections: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  icon: { type: 'STRING', description: "Un emoji relevante" },
                  contentType: { 
                    type: 'STRING', 
                    description: "Valores permitidos: 'table', 'cards', 'bullets', 'code'" 
                  },
                  codeOrTree: { type: 'STRING', description: "Opcional: Si el texto original contenía estructuras de archivos o fragmentos de código" },
                  items: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        label: { type: 'STRING' },
                        value: { type: 'STRING' },
                        tag: { type: 'STRING' },
                        description: { type: 'STRING' }
                      }
                    }
                  }
                },
                required: ["title", "contentType"]
              }
            }
          },
          required: ["title", "subtitle", "summary", "sections"]
        }
      }
    });

    if (!response.text) {
      throw new Error('No se recibió texto de respuesta de Gemini.');
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error al parsear el informe con Gemini:', error);
    throw new Error(`Error de IA: ${error.message || error}`);
  }
}
