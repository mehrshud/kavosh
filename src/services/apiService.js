// src/services/apiService.js
class ApiService {
  constructor() {
    // Use the correct Railway backend URL
    this.baseURL =
      process.env.REACT_APP_BACKEND_URL ||
      "https://kavosh-backend-production.up.railway.app";
    this.timeout = 30000; // 30 seconds timeout

    console.log("API Service initialized with baseURL:", this.baseURL);
  }

  // Generic API request method with better error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(`🚀 Making API request to: ${url}`);
      console.log("Request options:", defaultOptions);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ Request timeout reached, aborting...");
        controller.abort();
      }, this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("❌ API Error Response:", errorData);
        } catch (parseError) {
          console.error("❌ Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`💥 API request failed for ${endpoint}:`, error);

      if (error.name === "AbortError") {
        throw new Error(
          "درخواست به دلیل طولانی بودن لغو شد. لطفاً دوباره تلاش کنید."
        );
      }

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
        );
      }

      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      console.log("🏥 Checking backend health...");
      const response = await this.makeRequest("/health");
      console.log("✅ Health check successful:", response);
      return response;
    } catch (error) {
      console.error("💔 Health check failed:", error);
      return { status: "unhealthy", message: error.message };
    }
  }

  // Test API connection
  async testConnection() {
    try {
      console.log("🔌 Testing API connection...");
      const response = await this.makeRequest("/api/test");
      console.log("✅ Connection test successful:", response);
      return response;
    } catch (error) {
      console.error("🔌❌ Connection test failed:", error);
      return { success: false, message: error.message };
    }
  }

  // Twitter Search
  async searchTwitter(query, count = 10, lang = "fa") {
    try {
      console.log("🐦 Searching Twitter for:", query);
      const response = await this.makeRequest("/api/search/twitter", {
        method: "POST",
        body: JSON.stringify({ query, count, lang }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: "twitter",
      };
    } catch (error) {
      console.error("🐦❌ Twitter search failed:", error);
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
      console.log("📸 Searching Instagram for:", query);
      const response = await this.makeRequest("/api/search/instagram", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: "instagram",
      };
    } catch (error) {
      console.error("📸❌ Instagram search failed:", error);
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
      console.log("💬 Searching Eitaa for:", query);
      const response = await this.makeRequest("/api/search/eitaa", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: "eitaa",
      };
    } catch (error) {
      console.error("💬❌ Eitaa search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "eitaa",
      };
    }
  }

  // Facebook Search
  async searchFacebook(query, count = 10) {
    try {
      console.log("📘 Searching Facebook for:", query);
      const response = await this.makeRequest("/api/search/facebook", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: "facebook",
      };
    } catch (error) {
      console.error("📘❌ Facebook search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "facebook",
      };
    }
  }

  // Telegram Search (placeholder)
  async searchTelegram(query, count = 10) {
    try {
      console.log("✈️ Searching Telegram for:", query);
      // For now, return empty results as Telegram API is not implemented
      return {
        success: true,
        data: {
          results: [],
          total: 0,
          query,
          platform: "telegram",
          message: "Telegram search is not yet implemented",
        },
        platform: "telegram",
      };
    } catch (error) {
      console.error("✈️❌ Telegram search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "telegram",
      };
    }
  }

  // Rubika Search (placeholder)
  async searchRubika(query, count = 10) {
    try {
      console.log("🔴 Searching Rubika for:", query);
      // For now, return empty results as Rubika API is not implemented
      return {
        success: true,
        data: {
          results: [],
          total: 0,
          query,
          platform: "rubika",
          message: "Rubika search is not yet implemented",
        },
        platform: "rubika",
      };
    } catch (error) {
      console.error("🔴❌ Rubika search failed:", error);
      return {
        success: false,
        error: error.message,
        platform: "rubika",
      };
    }
  }

  // Multi-Platform Search
  async searchMultiple(query, platforms = ["twitter", "eitaa"], count = 20) {
    try {
      console.log(
        "🔍 Multi-platform search for:",
        query,
        "on platforms:",
        platforms
      );

      const response = await this.makeRequest("/api/search/multi", {
        method: "POST",
        body: JSON.stringify({ query, platforms, count }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: "multi",
      };
    } catch (error) {
      console.error("🔍❌ Multi-platform search failed:", error);

      // Fallback: try individual platform searches
      console.log("🔄 Falling back to individual platform searches...");
      try {
        const searchPromises = platforms.map((platform) => {
          switch (platform) {
            case "twitter":
              return this.searchTwitter(
                query,
                Math.floor(count / platforms.length)
              );
            case "instagram":
              return this.searchInstagram(
                query,
                Math.floor(count / platforms.length)
              );
            case "eitaa":
              return this.searchEitaa(
                query,
                Math.floor(count / platforms.length)
              );
            case "facebook":
              return this.searchFacebook(
                query,
                Math.floor(count / platforms.length)
              );
            case "telegram":
              return this.searchTelegram(
                query,
                Math.floor(count / platforms.length)
              );
            case "rubika":
              return this.searchRubika(
                query,
                Math.floor(count / platforms.length)
              );
            default:
              return Promise.resolve({
                success: false,
                error: `Platform ${platform} not supported`,
                platform,
              });
          }
        });

        const results = await Promise.all(searchPromises);

        // Combine results
        const combinedData = {
          query,
          platforms: {},
          total: 0,
          timestamp: new Date().toISOString(),
        };

        results.forEach((result) => {
          if (result.success) {
            combinedData.platforms[result.platform] = {
              success: true,
              results: result.data.results || [],
              total: result.data.total || 0,
            };
            combinedData.total += result.data.total || 0;
          } else {
            combinedData.platforms[result.platform] = {
              success: false,
              error: result.error,
              results: [],
            };
          }
        });

        return {
          success: true,
          data: combinedData,
          platform: "multi-fallback",
        };
      } catch (fallbackError) {
        console.error("🔄❌ Fallback search also failed:", fallbackError);
        return {
          success: false,
          error: error.message,
          platform: "multi",
        };
      }
    }
  }

  // AI Text Enhancement
  async enhanceWithAI(text, service = "openai", analysisType = "sentiment") {
    try {
      console.log("🤖 Enhancing with AI:", service, analysisType);
      const response = await this.makeRequest("/api/ai/enhance", {
        method: "POST",
        body: JSON.stringify({ text, service, analysisType }),
      });

      return {
        success: true,
        data: response.data || response,
        service: service,
      };
    } catch (error) {
      console.error("🤖❌ AI enhancement failed:", error);
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
      console.log("🔍🤖 AI-enhanced search for:", query);

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
        if (searchResult.data.platforms) {
          Object.values(searchResult.data.platforms).forEach((platformData) => {
            if (platformData.success && Array.isArray(platformData.results)) {
              allResults.push(...platformData.results);
            }
          });
        }

        // Get sample texts for AI analysis (limit to avoid API limits)
        if (allResults.length > 0) {
          const sampleTexts = allResults
            .filter((result) => result && (result.text || result.content))
            .slice(0, 5) // Limit to 5 samples to avoid token limits
            .map((result) => result.text || result.content)
            .join("\n\n");

          if (sampleTexts) {
            console.log("🤖 Performing AI analysis on sample texts...");
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
      }

      return {
        success: true,
        data: enhancedResults.data,
        aiAnalysis: enhancedResults.aiAnalysis,
        platform: "multi-ai",
      };
    } catch (error) {
      console.error("🔍🤖❌ Search with AI enhancement failed:", error);
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
      console.log("🤖📊 Batch AI analysis for", texts.length, "texts");
      const response = await this.makeRequest("/api/ai/batch-analyze", {
        method: "POST",
        body: JSON.stringify({ texts, service, analysisType }),
      });

      return {
        success: true,
        data: response.data || response,
        service: service,
      };
    } catch (error) {
      console.error("🤖📊❌ Batch AI analysis failed:", error);
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
      console.log("📈 Getting trending topics for:", platform);
      const response = await this.makeRequest("/api/trends", {
        method: "POST",
        body: JSON.stringify({ platform, lang }),
      });

      return {
        success: true,
        data: response.data || response,
        platform: platform,
      };
    } catch (error) {
      console.error("📈❌ Get trending topics failed:", error);
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
      console.log("📤 Exporting results in format:", format);
      const response = await this.makeRequest("/api/export", {
        method: "POST",
        body: JSON.stringify({ data, format }),
      });

      return {
        success: true,
        data: response.data || response,
        format: format,
      };
    } catch (error) {
      console.error("📤❌ Export results failed:", error);
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
      console.log("📊 Getting user stats for:", userId);
      const response = await this.makeRequest(`/api/stats/user/${userId}`);

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("📊❌ Get user stats failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get search history
  async getSearchHistory(userId, limit = 50) {
    try {
      console.log("📚 Getting search history for:", userId);
      const response = await this.makeRequest(
        `/api/history/${userId}?limit=${limit}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("📚❌ Get search history failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Save search query
  async saveSearch(userId, query, platforms, results) {
    try {
      console.log("💾 Saving search for user:", userId);
      const response = await this.makeRequest("/api/search/save", {
        method: "POST",
        body: JSON.stringify({ userId, query, platforms, results }),
      });

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("💾❌ Save search failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete saved search
  async deleteSearch(userId, searchId) {
    try {
      console.log("🗑️ Deleting search:", searchId, "for user:", userId);
      const response = await this.makeRequest(`/api/search/${searchId}`, {
        method: "DELETE",
        headers: {
          "User-ID": userId,
        },
      });

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("🗑️❌ Delete search failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Debug: Get API configuration status
  async getApiStatus() {
    try {
      console.log("🔧 Getting API status...");
      const response = await this.makeRequest("/api/test");
      return response;
    } catch (error) {
      console.error("🔧❌ Get API status failed:", error);
      throw error;
    }
  }

  // Method to log current configuration
  logConfig() {
    console.log("🔧 API Service Configuration:");
    console.log("  Base URL:", this.baseURL);
    console.log("  Timeout:", this.timeout + "ms");
    console.log("  Environment:", process.env.NODE_ENV);
    console.log("  Backend URL env var:", process.env.REACT_APP_BACKEND_URL);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Log configuration on initialization
apiService.logConfig();

export default apiService;
