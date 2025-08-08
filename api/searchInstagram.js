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

    const generateId = () => Math.random().toString(36).substring(2, 15);

    const mockResults = Array.from({ length: options?.limit || 8 }, (_, i) => ({
      id: generateId(),
      media_type: i % 4 === 0 ? "VIDEO" : "IMAGE",
      caption: `محتوای جذاب درباره ${query}! این پست واقعاً جذاب است و مخاطبان زیادی را به خود جلب کرده. #${query.replace(
        /\s+/g,
        ""
      )} #اینستاگرام #محتوا`,
      media_url: `https://picsum.photos/400/400?random=${i + Date.now()}`,
      permalink: `https://www.instagram.com/p/${generateId()}/`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      like_count: Math.floor(Math.random() * 2000) + 100,
      comments_count: Math.floor(Math.random() * 200) + 10,
      user: {
        id: generateId(),
        username: `user_${generateId().substring(0, 8)}`,
        profile_picture_url: `https://picsum.photos/150/150?random=${i + 50}`,
      },
    }));

    res.status(200).json(mockResults);
  } catch (error) {
    console.error("Instagram API Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
