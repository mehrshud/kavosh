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

    // IMPORTANT: Remove REACT_APP_ prefix for serverless functions
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!twitterBearerToken) {
      console.error("Twitter Bearer Token not found");
      return res.status(500).json({
        message: "Twitter Bearer Token is not configured",
        debug: "Check TWITTER_BEARER_TOKEN in Vercel environment variables",
      });
    }

    const searchParams = new URLSearchParams({
      query: query,
      "tweet.fields": "created_at,author_id,public_metrics,attachments",
      expansions: "author_id,attachments.media_keys",
      "media.fields": "url,preview_image_url",
      max_results: options?.max_results || "20",
    });

    const twitterApiUrl = `https://api.twitter.com/2/tweets/search/recent?${searchParams.toString()}`;

    const apiResponse = await fetch(twitterApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${twitterBearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Twitter API Error:", errorText);
      return res.status(apiResponse.status).json({
        message: "Failed to fetch from Twitter API",
        details: errorText,
        status: apiResponse.status,
      });
    }

    const data = await apiResponse.json();

    const responseData = {
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {},
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Twitter API Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
