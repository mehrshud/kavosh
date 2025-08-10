// src/services/apiService.js - Enhanced version with better error handling
class ApiService {
  constructor() {
    // Use the correct Railway backend URL
    this.baseURL =
      process.env.REACT_APP_BACKEND_URL ||
      "https://kavosh-backend-production.up.railway.app";
    this.timeout = 30000; // 30 seconds timeout
    this.retryAttempts = 3; // Number of retry attempts
    this.retryDelay = 1000; // Initial retry delay in ms

    console.log("🚀 API Service initialized with baseURL:", this.baseURL);
  }

  // Enhanced retry mechanism
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generic API request method with enhanced error handling and retry logic
  async makeRequest(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Kavosh-Frontend/1.0",
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(
        `🚀 [Attempt ${retryCount + 1}] Making API request to: ${url}`
      );
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

      // Log response headers for debugging
      const headers = {};
      for (let [key, value] of response.headers.entries()) {
        headers[key] = value;
      }
      console.log("Response headers:", headers);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData = null;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
          console.error("❌ API Error Response:", errorData || errorMessage);
        } catch (parseError) {
          console.error("❌ Could not parse error response:", parseError);
        }

        // Retry logic for certain status codes
        if (
          retryCount < this.retryAttempts &&
          this.shouldRetry(response.status)
        ) {
          console.warn(
            `🔄 Retrying request (${retryCount + 1}/${this.retryAttempts}) after ${this.retryDelay}ms...`
          );
          await this.sleep(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API response from ${endpoint}:`, data);

      // Validate response structure
      if (!this.isValidResponse(data)) {
        console.warn("⚠️ Invalid response structure:", data);
        // Transform response to expected format if needed
        return this.normalizeResponse(data);
      }

      return data;
    } catch (error) {
      console.error(`💥 API request failed for ${endpoint}:`, error);

      if (error.name === "AbortError") {
        if (retryCount < this.retryAttempts) {
          console.warn(
            `🔄 Timeout retry (${retryCount + 1}/${this.retryAttempts})...`
          );
          await this.sleep(this.retryDelay * Math.pow(2, retryCount));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        throw new Error(
          "درخواست به دلیل طولانی بودن لغو شد. لطفاً دوباره تلاش کنید."
        );
      }

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("ERR_NETWORK")
      ) {
        if (retryCount < this.retryAttempts) {
          console.warn(
            `🔄 Network retry (${retryCount + 1}/${this.retryAttempts})...`
          );
          await this.sleep(this.retryDelay * Math.pow(2, retryCount));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        throw new Error(
          "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
        );
      }

      throw error;
    }
  }

  // Determine if request should be retried based on status code
  shouldRetry(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  // Validate API response structure
  isValidResponse(data) {
    return (
      data &&
      typeof data === "object" &&
      (data.hasOwnProperty("success") ||
        data.hasOwnProperty("data") ||
        data.hasOwnProperty("results"))
    );
  }

  // Normalize response to expected format
  normalizeResponse(data) {
    if (Array.isArray(data)) {
      return {
        success: true,
        data: { results: data, total: data.length },
        timestamp: new Date().toISOString(),
      };
    }

    if (data && typeof data === "object" && !data.success) {
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
      };
    }

    return data;
  }

  // Enhanced health check with detailed diagnostics
  async checkHealth() {
    try {
      console.log("🏥 Checking backend health...");
      const startTime = Date.now();

      const response = await this.makeRequest("/health");

      const responseTime = Date.now() - startTime;
      console.log(`✅ Health check successful in ${responseTime}ms:`, response);

      return {
        ...response,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("💔 Health check failed:", error);
      return {
        status: "unhealthy",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Enhanced test connection with comprehensive diagnostics
  async testConnection() {
    try {
      console.log("🔌 Testing API connection...");
      const startTime = Date.now();

      // Test both GET and POST endpoints
      const getTest = await this.makeRequest("/api/test");
      const postTest = await this.makeRequest("/api/test", {
        method: "POST",
        body: JSON.stringify({
          test: "connection",
          timestamp: new Date().toISOString(),
        }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`✅ Connection test successful in ${responseTime}ms`);

      return {
        success: true,
        get: getTest,
        post: postTest,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("🔌❌ Connection test failed:", error);
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Enhanced search methods with better data transformation
  async searchTwitter(query, count = 10, lang = "fa") {
    try {
      console.log("🐦 Searching Twitter for:", { query, count, lang });
      const response = await this.makeRequest("/api/search/twitter", {
        method: "POST",
        body: JSON.stringify({ query, count, lang }),
      });

      return this.transformSearchResponse(response, "twitter");
    } catch (error) {
      console.error("🐦❌ Twitter search failed:", error);
      return this.createErrorResponse(error, "twitter");
    }
  }

  async searchInstagram(query, count = 10) {
    try {
      console.log("📸 Searching Instagram for:", { query, count });
      const response = await this.makeRequest("/api/search/instagram", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return this.transformSearchResponse(response, "instagram");
    } catch (error) {
      console.error("📸❌ Instagram search failed:", error);
      return this.createErrorResponse(error, "instagram");
    }
  }

  async searchEitaa(query, count = 10) {
    try {
      console.log("💬 Searching Eitaa for:", { query, count });
      const response = await this.makeRequest("/api/search/eitaa", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return this.transformSearchResponse(response, "eitaa");
    } catch (error) {
      console.error("💬❌ Eitaa search failed:", error);
      return this.createErrorResponse(error, "eitaa");
    }
  }

  async searchFacebook(query, count = 10) {
    try {
      console.log("📘 Searching Facebook for:", { query, count });
      const response = await this.makeRequest("/api/search/facebook", {
        method: "POST",
        body: JSON.stringify({ query, count }),
      });

      return this.transformSearchResponse(response, "facebook");
    } catch (error) {
      console.error("📘❌ Facebook search failed:", error);
      return this.createErrorResponse(error, "facebook");
    }
  }

  async searchTelegram(query, count = 10) {
    try {
      console.log("✈️ Searching Telegram for:", { query, count });
      // Return empty results as Telegram API is not implemented
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
      return this.createErrorResponse(error, "telegram");
    }
  }

  async searchRubika(query, count = 10) {
    try {
      console.log("🔴 Searching Rubika for:", { query, count });
      // Return empty results as Rubika API is not implemented
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
      return this.createErrorResponse(error, "rubika");
    }
  }

  // Transform search response to consistent format
  transformSearchResponse(response, platform) {
    console.log(`🔄 Transforming ${platform} response:`, response);

    if (!response) {
      throw new Error(`No response received from ${platform} API`);
    }

    // Handle different response structures
    let transformedResponse = {
      success: response.success !== false,
      platform,
      timestamp: new Date().toISOString(),
    };

    if (response.data) {
      transformedResponse.data = response.data;
    } else if (response.results) {
      transformedResponse.data = {
        results: response.results,
        total: response.total || response.results.length,
        query: response.query,
      };
    } else {
      transformedResponse.data = response;
    }

    // Ensure results array exists and is properly formatted
    if (transformedResponse.data && !transformedResponse.data.results) {
      if (Array.isArray(transformedResponse.data)) {
        transformedResponse.data = {
          results: transformedResponse.data,
          total: transformedResponse.data.length,
        };
      } else {
        transformedResponse.data.results = [];
        transformedResponse.data.total = 0;
      }
    }

    console.log(`✅ Transformed ${platform} response:`, transformedResponse);
    return transformedResponse;
  }

  // Create consistent error response
  createErrorResponse(error, platform) {
    return {
      success: false,
      error: error.message,
      platform,
      timestamp: new Date().toISOString(),
    };
  }

  // Enhanced multi-platform search with better error handling
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

      return this.transformMultiSearchResponse(response);
    } catch (error) {
      console.error("🔍❌ Multi-platform search failed:", error);

      // Enhanced fallback with individual platform searches
      console.log("🔄 Falling back to individual platform searches...");
      return this.fallbackMultiSearch(query, platforms, count);
    }
  }

  // Transform multi-search response
  transformMultiSearchResponse(response) {
    console.log("🔄 Transforming multi-platform response:", response);

    if (!response || !response.success) {
      throw new Error(response?.message || "Multi-platform search failed");
    }

    return {
      success: true,
      data: response.data || response,
      platform: "multi",
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback multi-search using individual API calls
  async fallbackMultiSearch(query, platforms, count) {
    try {
      const perPlatformCount = Math.floor(count / platforms.length);
      const searchPromises = platforms.map((platform) => {
        switch (platform) {
          case "twitter":
            return this.searchTwitter(query, perPlatformCount);
          case "instagram":
            return this.searchInstagram(query, perPlatformCount);
          case "eitaa":
            return this.searchEitaa(query, perPlatformCount);
          case "facebook":
            return this.searchFacebook(query, perPlatformCount);
          case "telegram":
            return this.searchTelegram(query, perPlatformCount);
          case "rubika":
            return this.searchRubika(query, perPlatformCount);
          default:
            return Promise.resolve(
              this.createErrorResponse(
                new Error(`Platform ${platform} not supported`),
                platform
              )
            );
        }
      });

      const results = await Promise.allSettled(searchPromises);
      console.log("🔍 Individual platform results:", results);

      // Combine results
      const combinedData = {
        query,
        platforms: {},
        total: 0,
        timestamp: new Date().toISOString(),
      };

      results.forEach((result, index) => {
        const platform = platforms[index];

        if (result.status === "fulfilled" && result.value.success) {
          const platformData = result.value.data || {};
          combinedData.platforms[platform] = {
            success: true,
            results: platformData.results || [],
            total: platformData.total || 0,
          };
          combinedData.total += platformData.total || 0;
        } else {
          combinedData.platforms[platform] = {
            success: false,
            error:
              result.status === "rejected"
                ? result.reason?.message || "Unknown error"
                : result.value?.error || "Search failed",
            results: [],
          };
        }
      });

      console.log("🔍✅ Combined fallback results:", combinedData);

      return {
        success: true,
        data: combinedData,
        platform: "multi-fallback",
        timestamp: new Date().toISOString(),
      };
    } catch (fallbackError) {
      console.error("🔄❌ Fallback search also failed:", fallbackError);
      return this.createErrorResponse(fallbackError, "multi-fallback");
    }
  }

  // Enhanced AI enhancement with better error handling
  async enhanceWithAI(text, service = "openai", analysisType = "sentiment") {
    try {
      console.log("🤖 Enhancing with AI:", {
        service,
        analysisType,
        textLength: text?.length,
      });

      if (!text || text.trim().length === 0) {
        throw new Error("Text is required for AI analysis");
      }

      const response = await this.makeRequest("/api/ai/enhance", {
        method: "POST",
        body: JSON.stringify({ text, service, analysisType }),
      });

      return {
        success: true,
        data: response.data || response,
        service: service,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("🤖❌ AI enhancement failed:", error);
      return this.createErrorResponse(error, service);
    }
  }

  // Enhanced search with AI
  async searchWithAI(
    query,
    platforms = ["twitter", "eitaa"],
    count = 20,
    aiService = "openai"
  ) {
    try {
      console.log("🔍🤖 AI-enhanced search for:", {
        query,
        platforms,
        count,
        aiService,
      });

      // First, perform the search
      const searchResult = await this.searchMultiple(query, platforms, count);

      if (!searchResult.success) {
        return searchResult;
      }

      // Clone the result to avoid mutation
      const enhancedResults = JSON.parse(JSON.stringify(searchResult));

      // Then enhance results with AI if there are any results
      if (searchResult.data && searchResult.data.total > 0) {
        const allTexts = this.extractTextsForAI(searchResult.data);

        if (allTexts.length > 0) {
          console.log("🤖 Performing AI analysis on extracted texts...");

          const sampleTexts = allTexts
            .slice(0, 5) // Limit to 5 samples to avoid token limits
            .join("\n\n");

          const aiAnalysis = await this.enhanceWithAI(
            sampleTexts,
            aiService,
            "comprehensive"
          );

          if (aiAnalysis.success) {
            enhancedResults.aiAnalysis = aiAnalysis.data;
            console.log("🤖✅ AI analysis completed:", aiAnalysis.data);
          } else {
            console.warn("🤖⚠️ AI analysis failed:", aiAnalysis.error);
            enhancedResults.aiAnalysisError = aiAnalysis.error;
          }
        }
      }

      return {
        success: true,
        data: enhancedResults.data,
        aiAnalysis: enhancedResults.aiAnalysis,
        aiAnalysisError: enhancedResults.aiAnalysisError,
        platform: "multi-ai",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("🔍🤖❌ Search with AI enhancement failed:", error);
      return this.createErrorResponse(error, "multi-ai");
    }
  }

  // Extract texts for AI analysis from search results
  extractTextsForAI(searchData) {
    const texts = [];

    if (searchData.platforms) {
      Object.values(searchData.platforms).forEach((platformData) => {
        if (platformData.success && Array.isArray(platformData.results)) {
          platformData.results.forEach((item) => {
            const text = item.text || item.content;
            if (text && text.trim().length > 10) {
              texts.push(text.trim());
            }
          });
        }
      });
    } else if (Array.isArray(searchData.results)) {
      searchData.results.forEach((item) => {
        const text = item.text || item.content;
        if (text && text.trim().length > 10) {
          texts.push(text.trim());
        }
      });
    }

    return texts;
  }

  // Additional utility methods with better error handling
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
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("📈❌ Get trending topics failed:", error);
      return this.createErrorResponse(error, platform);
    }
  }

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
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("📤❌ Export results failed:", error);
      return this.createErrorResponse(error, format);
    }
  }

  // Configuration and debugging methods
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

  logConfig() {
    console.log("🔧 API Service Configuration:");
    console.log("  Base URL:", this.baseURL);
    console.log("  Timeout:", this.timeout + "ms");
    console.log("  Retry Attempts:", this.retryAttempts);
    console.log("  Retry Delay:", this.retryDelay + "ms");
    console.log("  Environment:", process.env.NODE_ENV);
    console.log("  Backend URL env var:", process.env.REACT_APP_BACKEND_URL);

    // Test URL reachability
    console.log("🌐 Testing URL reachability...");
    fetch(this.baseURL + "/health")
      .then((response) => {
        console.log(
          `✅ URL is reachable: ${response.status} ${response.statusText}`
        );
      })
      .catch((error) => {
        console.error("❌ URL is not reachable:", error.message);
      });
  }

  // Performance monitoring
  async performanceTest() {
    const tests = [];
    const startTime = Date.now();

    try {
      console.log("🏃‍♂️ Starting performance tests...");

      // Test health endpoint
      const healthStart = Date.now();
      await this.checkHealth();
      tests.push({ endpoint: "/health", time: Date.now() - healthStart });

      // Test API endpoint
      const apiStart = Date.now();
      await this.testConnection();
      tests.push({ endpoint: "/api/test", time: Date.now() - apiStart });

      const totalTime = Date.now() - startTime;

      console.log("🏁 Performance test results:", {
        totalTime,
        tests,
        averageTime:
          tests.reduce((acc, test) => acc + test.time, 0) / tests.length,
      });

      return {
        success: true,
        totalTime,
        tests,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("🏃‍♂️❌ Performance test failed:", error);
      return this.createErrorResponse(error, "performance-test");
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Log configuration on initialization
apiService.logConfig();

// Perform initial performance test in development
if (process.env.NODE_ENV === "development") {
  setTimeout(() => {
    apiService.performanceTest();
  }, 2000);
}

export default apiService;
