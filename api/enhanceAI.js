// File: /api/enhanceAI.js

/**
 * Vercel Serverless Function to provide AI-powered analysis of search results.
 * It acts as a secure gateway to both OpenAI and Google Gemini, based on the
 * provider specified in the request body.
 */
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { prompt, provider } = req.body;

    if (!prompt || !provider) {
      return res.status(400).json({
        message: 'Missing "prompt" or "provider" in request body.',
      });
    }

    let analysisText = "";

    // --- OpenAI Logic ---
    if (provider === "openai") {
      // Use environment variable without REACT_APP_ prefix
      const openAIApiKey = process.env.OPENAI_API_KEY;

      if (!openAIApiKey) {
        console.error("OpenAI API key not found");
        // Return fallback analysis instead of error
        analysisText = generateFallbackAnalysis(prompt);
      } else {
        try {
          console.log("Calling OpenAI API");

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
                max_tokens: 1500,
              }),
            }
          );

          console.log("OpenAI API response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenAI API Error:", errorData);
            analysisText = generateFallbackAnalysis(prompt);
          } else {
            const data = await response.json();
            analysisText =
              data.choices[0]?.message?.content ||
              generateFallbackAnalysis(prompt);
          }
        } catch (error) {
          console.error("OpenAI request error:", error);
          analysisText = generateFallbackAnalysis(prompt);
        }
      }
    }
    // --- Gemini Logic ---
    else if (provider === "gemini") {
      // Use environment variable without REACT_APP_ prefix
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        console.error("Gemini API key not found");
        analysisText = generateFallbackAnalysis(prompt);
      } else {
        try {
          console.log("Calling Gemini API");

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

          console.log("Gemini API response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Gemini API Error:", errorData);
            analysisText = generateFallbackAnalysis(prompt);
          } else {
            const data = await response.json();
            analysisText =
              data.candidates?.[0]?.content?.parts?.[0]?.text ||
              generateFallbackAnalysis(prompt);
          }
        } catch (error) {
          console.error("Gemini request error:", error);
          analysisText = generateFallbackAnalysis(prompt);
        }
      }
    }
    // --- Unknown Provider ---
    else {
      return res.status(400).json({
        message: `Unsupported AI provider: ${provider}. Supported providers: openai, gemini`,
      });
    }

    // Send the final analysis back to the client.
    res.status(200).json({ analysis: analysisText });
  } catch (error) {
    console.error("Internal Server Error in enhanceAI:", error);

    // Return fallback analysis instead of error
    const fallbackAnalysis = generateFallbackAnalysis(
      req.body?.prompt || "جستجو"
    );
    res.status(200).json({ analysis: fallbackAnalysis });
  }
}

// Helper function to generate fallback analysis
function generateFallbackAnalysis(prompt) {
  return `## تحلیل خودکار

### 📊 خلاصه
این تحلیل بر اساس سیستم داخلی ارائه شده است زیرا سرویس هوش مصنوعی در دسترس نیست.

### 🎯 نکات کلیدی
- جستجو انجام شده و نتایج آماده نمایش است
- برای تحلیل دقیق‌تر، لطفاً کلیدهای API را پیکربندی کنید
- سیستم به طور خودکار به حالت آفلاین تغییر کرده است

### 💡 توصیه‌ها
1. بررسی تنظیمات متغیرهای محیطی در Vercel
2. اطمینان از صحت کلیدهای API
3. استفاده از نتایج موجود برای تحلیل اولیه

*این پیام خودکار تولید شده است.*`;
}
