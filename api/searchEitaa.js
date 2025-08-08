// File: /api/searchEitaa.js

/**
 * Vercel Serverless Function to securely proxy search requests to the Eitaa API.
 * This resolves CORS issues and protects the API token.
 */
export default async function handler(req, res) {
  // Ensure the request is a POST request, as expected by the frontend.
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { query, options } = req.body;

    // Securely retrieve the Eitaa API token from environment variables.
    // This MUST be set in your Vercel project settings.
    const eitaaApiToken = process.env.REACT_APP_EITAA_TOKEN;

    if (!eitaaApiToken) {
      return res
        .status(500)
        .json({ message: "Eitaa API token is not configured on the server." });
    }

    // Forward the search request to the actual Eitaa API.
    const apiResponse = await fetch("https://eitaayar.ir/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${eitaaApiToken}`,
      },
      body: JSON.stringify({
        q: query,
        limit: options?.limit || 20,
        type: options?.contentType || "all",
      }),
    });

    // If the Eitaa API returns an error, pass it back to the client.
    if (!apiResponse.ok) {
      const errorDetails = await apiResponse.text();
      console.error("Eitaa API Error:", errorDetails);
      return res
        .status(apiResponse.status)
        .json({
          message: "Failed to fetch data from Eitaa API.",
          details: errorDetails,
        });
    }

    const data = await apiResponse.json();

    // Send the successful response back to your React application.
    res.status(200).json(data.result || []);
  } catch (error) {
    console.error("Internal Server Error in searchEitaa:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
}
