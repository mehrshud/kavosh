// File: /api/enhanceAI.js

/**
 * Vercel Serverless Function to provide AI-powered analysis of search results.
 * It acts as a secure gateway to both OpenAI and Google Gemini, based on the
 * provider specified in the request body.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { prompt, provider } = req.body;

    if (!prompt || !provider) {
      return res
        .status(400)
        .json({ message: 'Missing "prompt" or "provider" in request body.' });
    }

    let analysisText = "";

    // --- OpenAI Logic ---
    if (provider === "openai") {
      const openAIApiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!openAIApiKey) {
        return res
          .status(500)
          .json({ message: "OpenAI API key is not configured." });
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API request failed with status ${response.status}`
        );
      }
      const data = await response.json();
      analysisText = data.choices[0]?.message?.content || "";
    }
    // --- Gemini Logic ---
    else if (provider === "gemini") {
      const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res
          .status(500)
          .json({ message: "Gemini API key is not configured." });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gemini API request failed with status ${response.status}`
        );
      }
      const data = await response.json();
      analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    // --- Unknown Provider ---
    else {
      return res
        .status(400)
        .json({ message: `Unsupported AI provider: ${provider}` });
    }

    // Send the final analysis back to the client.
    res.status(200).json({ analysis: analysisText });
  } catch (error) {
    console.error("Internal Server Error in enhanceAI:", error);
    res
      .status(500)
      .json({
        message: "An internal server error occurred during AI enhancement.",
      });
  }
}
