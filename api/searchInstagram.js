// File: /api/searchInstagram.js

/**
 * Vercel Serverless Function to handle Instagram search requests.
 * NOTE: The official Instagram API for public content search is heavily restricted.
 * This function returns a realistic MOCK response to simulate a successful search.
 * This is the recommended approach for development without a full business review from Meta.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { query } = req.body;

  // Helper function to generate a random Instagram-like ID.
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Create a realistic mock data structure.
  const mockResults = Array.from({ length: 8 }, (_, i) => ({
    id: generateId(),
    media_type: i % 4 === 0 ? "VIDEO" : "IMAGE",
    caption: `This is a great post about ${query}! #${query} #mockdata #development`,
    media_url: `https://picsum.photos/400/400?random=${i}`,
    permalink: `https://www.instagram.com/p/${generateId()}/`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    like_count: Math.floor(Math.random() * 2000),
    comments_count: Math.floor(Math.random() * 200),
  }));

  // Send the mock data as a successful API response.
  res.status(200).json(mockResults);
}
