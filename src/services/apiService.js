// src/services/apiService.js - Simplified and Secured
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://kavosh-backend-production.up.railway.app";

// Alternative API URLs for backend fallback
const FALLBACK_URLS = [
  "https://kavosh-backend-production.up.railway.app",
  "https://web-production-a1b2.up.railway.app", // Example alternative
  "http://localhost:5000", // For local development
];

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.currentUrlIndex = 0;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Core request function with retry and fallback logic
  async makeRequest(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 [Attempt ${retryCount + 1}] Request to: ${url}`);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);
      console.log(`📡 Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error Response:", errorText);

        // Try fallback backend URL if current one has a server error (5xx)
        if (response.status >= 500 && retryCount < this.retryAttempts) {
          return this.tryFallbackUrl(endpoint, options, retryCount);
        }

        // Try to parse the error message from the server
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `API Error: ${response.status}`);
        } catch (e) {
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("✅ Response Data:", data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("💥 Request Failed:", error.message);

      // Handle network errors or timeouts by trying a fallback URL
      if (
        error.name === "AbortError" ||
        error.message.includes("Failed to fetch")
      ) {
        if (retryCount < this.retryAttempts) {
          return this.tryFallbackUrl(endpoint, options, retryCount);
        }
      }

      throw error; // Re-throw the final error
    }
  }

  // Switches to the next backend URL in the list and retries the request
  async tryFallbackUrl(endpoint, options, retryCount) {
    console.log(`🔄 Trying fallback backend URL...`);

    this.currentUrlIndex = (this.currentUrlIndex + 1) % FALLBACK_URLS.length;
    const originalBaseURL = this.baseURL;
    this.baseURL = FALLBACK_URLS[this.currentUrlIndex];
    console.log(`   New Base URL: ${this.baseURL}`);

    try {
      await this.sleep(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      return await this.makeRequest(endpoint, options, retryCount + 1);
    } catch (fallbackError) {
      this.baseURL = originalBaseURL; // Restore original URL on final failure
      throw fallbackError; // Throw the error from the fallback attempt
    }
  }

  async checkHealth() {
    return this.makeRequest("/health");
  }

  async searchMultiple(query, platforms, count = 20) {
    const requestBody = {
      query: query.trim(),
      platforms: Array.isArray(platforms) ? platforms : [platforms],
      count: Math.min(count, 50),
    };
    return this.makeRequest("/api/search/multi", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  }

  async searchWithAI(query, platforms, count = 20, aiProvider = "openai") {
    try {
      // First, get regular search results
      const searchResponse = await this.searchMultiple(query, platforms, count);
      if (!searchResponse.success) {
        throw new Error(searchResponse.message || "Initial search failed");
      }

      // Extract text content for AI analysis from successful results
      const allResults = [];
      if (searchResponse.data && searchResponse.data.platforms) {
        Object.values(searchResponse.data.platforms).forEach((platformData) => {
          if (
            platformData.success &&
            platformData.data &&
            platformData.data.results
          ) {
            allResults.push(...platformData.data.results);
          }
        });
      }

      const textForAnalysis = allResults
        .slice(0, 15) // Use up to 15 results for analysis
        .map((result) => result.text || result.content || "")
        .filter(Boolean)
        .join("\n\n");

      let aiAnalysis = null;
      if (textForAnalysis.trim()) {
        try {
          const aiResponse = await this.makeRequest("/api/ai/enhance", {
            method: "POST",
            body: JSON.stringify({
              text: textForAnalysis,
              query: query,
              service: aiProvider,
            }),
          });
          if (aiResponse.success && aiResponse.data) {
            aiAnalysis = aiResponse.data.analysis;
          }
        } catch (aiError) {
          console.error("AI analysis failed, proceeding without it:", aiError);
        }
      }

      return { ...searchResponse, aiAnalysis };
    } catch (error) {
      console.error("💥 AI-enhanced search failed:", error);
      // Return a failure response but with a clear error message
      return { success: false, error: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;
