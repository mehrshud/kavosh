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
    const { query, options } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // IMPORTANT: Remove REACT_APP_ prefix
    const eitaaApiToken = process.env.EITAA_TOKEN;

    // Always return mock data for now since Eitaa API might be restrictive
    const mockData = Array.from({ length: 15 }, (_, i) => ({
      message_id: i + 1,
      text: `محتوای نمونه درباره ${query} - پیام شماره ${
        i + 1
      } که برای نمایش عملکرد سیستم استفاده می‌شود.`,
      date: Math.floor(Date.now() / 1000) - i * 3600,
      chat: {
        username: `channel_${i + 1}`,
        title: `کانال نمونه ${i + 1}`,
        type: "channel",
      },
      views: Math.floor(Math.random() * 10000) + 1000,
      forwards: Math.floor(Math.random() * 100) + 10,
      photo: i % 3 === 0 ? { file_id: `photo_${i}` } : null,
      video: i % 5 === 0 ? { file_id: `video_${i}` } : null,
    }));

    res.status(200).json(mockData);
  } catch (error) {
    console.error("Eitaa API Error:", error);
    const mockData = generateMockEitaaData(req.body?.query || "جستجو");
    res.status(200).json(mockData);
  }
}

function generateMockEitaaData(query) {
  return Array.from({ length: 15 }, (_, i) => ({
    message_id: i + 1,
    text: `محتوای آزمایشی درباره ${query}`,
    date: Math.floor(Date.now() / 1000) - i * 3600,
    chat: {
      username: `channel_${i + 1}`,
      title: `کانال ${i + 1}`,
      type: "channel",
    },
    views: Math.floor(Math.random() * 10000) + 1000,
    forwards: Math.floor(Math.random() * 100) + 10,
  }));
}
