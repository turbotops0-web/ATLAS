import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const sendChatMessage = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `Eres "Atlas Bot", el asistente virtual avanzado de "Atlas Automatizaciones".
    Tu tono es profesional, futurista, conciso y amable.
    La empresa se especializa en automatización de procesos, chatbots con IA, y soluciones tecnológicas para escalar negocios.
    El correo de contacto es atlasautomatizaciones540@gmail.com.
    Responde preguntas sobre cómo la automatización puede ayudar a los negocios del usuario.
    Si te preguntan por precios o proyectos específicos, invítalos a contactar al correo.
    Mantén las respuestas cortas (máximo 3 oraciones).`;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "Lo siento, hubo un error procesando tu solicitud.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Nuestros sistemas están experimentando una alta demanda. Por favor intenta de nuevo o contáctanos por correo.";
  }
};

export const analyzeMeetingAudio = async (base64Audio: string, mimeType: string = 'audio/webm'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Actúa como un Secretario Ejecutivo de IA experto en gestión de proyectos y minutas de reuniones de alto nivel.
      He grabado una reunión extensa y necesito que la proceses con máxima precisión.
      
      IMPORTANTE: Tu respuesta debe estar estructurada internamente para ser mostrada en secciones. 
      Usa exactamente estos identificadores de sección para que mi interfaz pueda separarlos:

      [TRANSCRIPCION_INICIO]
      (Aquí escribe la transcripción fiel y completa de la reunión. Si es muy larga, captura todos los diálogos y puntos clave detalladamente).
      [TRANSCRIPCION_FIN]

      [RESUMEN_INICIO]
      (Genera un resumen ejecutivo de alto nivel, identificando el objetivo de la reunión, los problemas planteados y el tono de la conversación).
      [RESUMEN_FIN]

      [TAREAS_INICIO]
      (Crea una lista clara de próximos pasos, tareas asignadas, responsables mencionados y fechas límite si las hubo).
      [TAREAS_FIN]
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "No se pudo generar la transcripción.";
  } catch (error) {
    console.error("Error analyzing meeting audio:", error);
    return "Hubo un error procesando el audio. Es posible que el archivo sea demasiado pesado o el formato no sea compatible.";
  }
};