// File: /api/searchTwitter.js

/**
 * Vercel Serverless Function to securely proxy search requests to the Twitter v2 API.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { query, options } = req.body;

    // Securely retrieve the Twitter Bearer Token from environment variables.
    const twitterBearerToken = process.env.REACT_APP_TWITTER_BEARER_TOKEN;

    if (!twitterBearerToken) {
      return res
        .status(500)
        .json({
          message: "Twitter Bearer Token is not configured on the server.",
        });
    }

    // Construct the URL for the Twitter API's recent search endpoint.
    const searchParams = new URLSearchParams({
      query: query,
      "tweet.fields": "created_at,author_id,public_metrics,attachments",
      expansions: "author_id,attachments.media_keys",
      "media.fields": "url,preview_image_url",
      max_results: "20",
    });
    const twitterApiUrl = `https://api.twitter.com/2/tweets/search/recent?${searchParams.toString()}`;

    // Make the request to the Twitter API.
    const apiResponse = await fetch(twitterApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${twitterBearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!apiResponse.ok) {
      const errorDetails = await apiResponse.text();
      console.error("Twitter API Error:", errorDetails);
      return res
        .status(apiResponse.status)
        .json({
          message: "Failed to fetch data from Twitter API.",
          details: errorDetails,
        });
    }

    const data = await apiResponse.json();

    // Send the successful response back to the frontend.
    res.status(200).json(data);
  } catch (error) {
    console.error("Internal Server Error in searchTwitter:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
}
