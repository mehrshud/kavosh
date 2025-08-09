// src/services/apiService.js
class ApiService {
  constructor() {
    // Use your Railway backend URL
    this.baseURL =
      process.env.REACT_APP_API_URL ||
      "https://kavosh-backend-production.up.railway.app";
    this.timeout = 15000; // 15 seconds timeout
  }

  // Generic API request method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);

      if (error.name === "AbortError") {
        throw new Error("Request timeout - please try again");
      }

      throw new Error(`API Error: ${error.message}`);
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.makeRequest("/health");
      return response;
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error", message: error.message };
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.makeRequest("/api/test");
      return response;
    } catch (error) {
      console.error("Connection test failed:", error);
      return { success: false, message: error.message };
    }
  }

  // Twitter Search
  async searchTwitter(query, count = 10, lang = "fa") {
    try {
      const response = await this.makeRequest("/api/search/twitter", {
        method: "POST",
        body: JSON.stringify({ query, count, lang }),
      });

      return {
        success: true,
        data: response.data || {},
        platform: "twitter",
      };
    } catch (error) {
      console.error("Twitter search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "twitter",
      };
    }
  }

  // Instagram Search
  async searchInstagram(query, count = 10) {
    try {
      const response = await this.makeRequest("/api/search/instagram", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return {
        success: true,
        data: response.data || {},
        platform: "instagram",
      };
    } catch (error) {
      console.error("Instagram search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "instagram",
      };
    }
  }

  // Eitaa Search
  async searchEitaa(query, count = 10) {
    try {
      const response = await this.makeRequest("/api/search/eitaa", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return {
        success: true,
        data: response.data || {},
        platform: "eitaa",
      };
    } catch (error) {
      console.error("Eitaa search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "eitaa",
      };
    }
  }

  // Multi-Platform Search
  async searchMultiple(query, platforms = ["twitter", "eitaa"], count = 20) {
    try {
      const response = await this.makeRequest("/api/search/multi", {
        method: "POST",
        body: JSON.stringify({ query, platforms, count }),
      });

      return {
        success: true,
        data: response.data || {},
        platform: "multi",
      };
    } catch (error) {
      console.error("Multi-platform search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "multi",
      };
    }
  }

  // AI Text Enhancement
  async enhanceWithAI(text, service = "openai", analysisType = "sentiment") {
    try {
      const response = await this.makeRequest("/api/ai/enhance", {
        method: "POST",
        body: JSON.stringify({ text, service, analysisType }),
      });

      return {
        success: true,
        data: response.data || {},
        service: service,
      };
    } catch (error) {
      console.error("AI enhancement failed:", error);
      return {
        success: false,
        error: error.message,
        service: service,
      };
    }
  }

  // Search with AI Enhancement
  async searchWithAI(
    query,
    platforms = ["twitter", "eitaa"],
    count = 20,
    aiService = "openai"
  ) {
    try {
      // First, perform the search
      const searchResult = await this.searchMultiple(query, platforms, count);

      if (!searchResult.success) {
        return searchResult;
      }

      // Then enhance results with AI if there are any results
      const enhancedResults = { ...searchResult };

      if (searchResult.data && searchResult.data.total > 0) {
        // Get a sample of texts for AI analysis
        const allResults = [];

        // Collect all results from different platforms
        Object.values(searchResult.data).forEach((platformData) => {
          if (Array.isArray(platformData)) {
            allResults.push(...platformData);
          } else if (
            platformData &&
            platformData.results &&
            Array.isArray(platformData.results)
          ) {
            allResults.push(...platformData.results);
          }
        });

        // Get sample texts for AI analysis (limit to avoid API limits)
        const sampleTexts = allResults
          .filter((result) => result && (result.text || result.content))
          .slice(0, 10) // Limit to 10 samples
          .map((result) => result.text || result.content)
          .join("\n\n");

        if (sampleTexts) {
          // Perform AI analysis on sample texts
          const aiAnalysis = await this.enhanceWithAI(
            sampleTexts,
            aiService,
            "comprehensive"
          );

          if (aiAnalysis.success) {
            enhancedResults.aiAnalysis = aiAnalysis.data;
          }
        }
      }

      return {
        success: true,
        data: enhancedResults.data,
        aiAnalysis: enhancedResults.aiAnalysis,
        platform: "multi-ai",
      };
    } catch (error) {
      console.error("Search with AI enhancement failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "multi-ai",
      };
    }
  }

  // Batch AI Analysis for multiple texts
  async batchAnalyzeWithAI(
    texts,
    service = "openai",
    analysisType = "sentiment"
  ) {
    try {
      const response = await this.makeRequest("/api/ai/batch-analyze", {
        method: "POST",
        body: JSON.stringify({ texts, service, analysisType }),
      });

      return {
        success: true,
        data: response.data || {},
        service: service,
      };
    } catch (error) {
      console.error("Batch AI analysis failed:", error);
      return {
        success: false,
        error: error.message,
        service: service,
      };
    }
  }

  // Get trending topics from a platform
  async getTrendingTopics(platform = "twitter", lang = "fa") {
    try {
      const response = await this.makeRequest("/api/trends", {
        method: "POST",
        body: JSON.stringify({ platform, lang }),
      });

      return {
        success: true,
        data: response.data || {},
        platform: platform,
      };
    } catch (error) {
      console.error("Get trending topics failed:", error);
      return {
        success: false,
        error: error.message,
        platform: platform,
      };
    }
  }

  // Export search results
  async exportResults(data, format = "json") {
    try {
      const response = await this.makeRequest("/api/export", {
        method: "POST",
        body: JSON.stringify({ data, format }),
      });

      return {
        success: true,
        data: response.data || {},
        format: format,
      };
    } catch (error) {
      console.error("Export results failed:", error);
      return {
        success: false,
        error: error.message,
        format: format,
      };
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const response = await this.makeRequest(`/api/stats/user/${userId}`);

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Get user stats failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get search history
  async getSearchHistory(userId, limit = 50) {
    try {
      const response = await this.makeRequest(
        `/api/history/${userId}?limit=${limit}`
      );

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Get search history failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Save search query
  async saveSearch(userId, query, platforms, results) {
    try {
      const response = await this.makeRequest("/api/search/save", {
        method: "POST",
        body: JSON.stringify({ userId, query, platforms, results }),
      });

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Save search failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete saved search
  async deleteSearch(userId, searchId) {
    try {
      const response = await this.makeRequest(`/api/search/${searchId}`, {
        method: "DELETE",
        headers: {
          "User-ID": userId,
        },
      });

      return {
        success: true,
        data: response.data || {},
      };
    } catch (error) {
      console.error("Delete search failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
