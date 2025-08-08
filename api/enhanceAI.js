export default async function handler(req, res) {
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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { prompt, provider } = req.body;

    if (!prompt || !provider) {
      return res.status(400).json({
        message: "Missing prompt or provider in request body",
      });
    }

    let analysisText = "";

    if (provider === "openai") {
      // IMPORTANT: Remove REACT_APP_ prefix
      const openAIApiKey = process.env.OPENAI_API_KEY;

      if (!openAIApiKey) {
        analysisText = generateFallbackAnalysis(prompt);
      } else {
        try {
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

          if (!response.ok) {
            console.error("OpenAI API Error:", await response.text());
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
    } else if (provider === "gemini") {
      // IMPORTANT: Remove REACT_APP_ prefix
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        analysisText = generateFallbackAnalysis(prompt);
      } else {
        try {
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
            console.error("Gemini API Error:", await response.text());
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
    } else {
      return res.status(400).json({
        message: `Unsupported AI provider: ${provider}`,
      });
    }

    res.status(200).json({ analysis: analysisText });
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    const fallbackAnalysis = generateFallbackAnalysis(
      req.body?.prompt || "جستجو"
    );
    res.status(200).json({ analysis: fallbackAnalysis });
  }
}

function generateFallbackAnalysis(prompt) {
  return `## تحلیل خودکار نتایج

### 📊 خلاصه
تحلیل بر اساس سیستم داخلی انجام شده است.

### 🎯 نکات کلیدی
- جستجو با موفقیت انجام شد
- نتایج آماده نمایش هستند
- سیستم در حالت عادی عمل می‌کند

### 💡 توصیه‌ها
1. بررسی کلیدهای API برای تحلیل دقیق‌تر
2. استفاده از فیلترهای پیشرفته
3. صادرات نتایج برای تحلیل بیشتر

*این تحلیل به صورت خودکار تولید شده است.*`;
}
