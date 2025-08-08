// File: /api/searchTwitter.js

/**
 * Vercel Serverless Function to securely proxy search requests to the Twitter v2 API.
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

    // Use environment variable without REACT_APP_ prefix for serverless functions
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!twitterBearerToken) {
      console.error("Twitter Bearer Token not found in environment variables");
      return res.status(500).json({
        message: "Twitter Bearer Token is not configured on the server.",
        error: "MISSING_TOKEN",
      });
    }

    // Construct the URL for the Twitter API's recent search endpoint.
    const searchParams = new URLSearchParams({
      query: query,
      "tweet.fields": "created_at,author_id,public_metrics,attachments",
      expansions: "author_id,attachments.media_keys",
      "media.fields": "url,preview_image_url",
      max_results: options?.max_results || "20",
    });

    const twitterApiUrl = `https://api.twitter.com/2/tweets/search/recent?${searchParams.toString()}`;
    console.log("Calling Twitter API:", twitterApiUrl);

    // Make the request to the Twitter API.
    const apiResponse = await fetch(twitterApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${twitterBearerToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Twitter API response status:", apiResponse.status);

    if (!apiResponse.ok) {
      let errorDetails;
      try {
        errorDetails = await apiResponse.json();
      } catch (e) {
        errorDetails = await apiResponse.text();
      }

      console.error("Twitter API Error:", errorDetails);
      return res.status(apiResponse.status).json({
        message: "Failed to fetch data from Twitter API.",
        details: errorDetails,
        status: apiResponse.status,
      });
    }

    const data = await apiResponse.json();
    console.log("Twitter API success, data length:", data.data?.length || 0);

    // Ensure we return valid JSON
    const responseData = {
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {},
    };

    // Send the successful response back to the frontend.
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Internal Server Error in searchTwitter:", error);
    res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
