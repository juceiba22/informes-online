import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let ai = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Lista de candidatos ordenada de mayor a menor preferencia
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

export async function parseTextToReport(rawText) {
  if (!apiKey) {
    throw new Error('La API Key de Gemini (VITE_GEMINI_API_KEY) no está configurada.');
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`[Gemini Service] Intentando generar contenido con el modelo: ${modelName}`);
      
      const response = await ai.models.generateContent({
        model: modelName,
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

      if (response && response.text) {
        console.log(`[Gemini Service] Éxito con el modelo: ${modelName}`);
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn(`[Gemini Service] Falló el modelo ${modelName}:`, err.message || err);
      lastError = err;
      // Continúa el bucle hacia el siguiente modelo
    }
  }

  // Si ninguno funcionó
  throw new Error(`No se pudo procesar el informe con ningún modelo disponible. Último error: ${lastError?.message || 'Desconocido'}`);
}
