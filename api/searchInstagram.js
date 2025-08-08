// File: /api/searchInstagram.js

/**
 * Vercel Serverless Function to handle Instagram search requests.
 * NOTE: The official Instagram API for public content search is heavily restricted.
 * This function returns a realistic MOCK response to simulate a successful search.
 * This is the recommended approach for development without a full business review from Meta.
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
    const { query, options } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    console.log("Instagram mock search for query:", query);

    // Helper function to generate a random Instagram-like ID.
    const generateId = () => Math.random().toString(36).substring(2, 15);

    // Create a realistic mock data structure.
    const mockResults = Array.from({ length: options?.limit || 8 }, (_, i) => ({
      id: generateId(),
      media_type: i % 4 === 0 ? "VIDEO" : "IMAGE",
      caption: `This is a great post about ${query}! Amazing content that really captures the essence of ${query}. #${query.replace(
        /\s+/g,
        ""
      )} #mockdata #development #socialmedia`,
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

    console.log("Generated mock Instagram results:", mockResults.length);

    // Send the mock data as a successful API response.
    res.status(200).json(mockResults);
  } catch (error) {
    console.error("Internal Server Error in searchInstagram:", error);
    res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
