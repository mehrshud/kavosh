// src/services/apiService.js - Improved version with better error handling
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://kavosh-backend-production.up.railway.app";

// Alternative API URLs for backend fallback
const FALLBACK_URLS = [
  "https://kavosh-backend-production.up.railway.app",
  "https://web-production-a1b2.up.railway.app",
  // Add your actual Railway URLs here
];

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 45000; // 45 seconds - increased for better reliability
    this.retryAttempts = 2; // Reduced to prevent too many attempts
    this.retryDelay = 2000; // 2 seconds
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

      const requestOptions = {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      // Handle different response types
      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message || errorData.error || `HTTP ${response.status}`;
          } catch (parseError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } else {
          const errorText = await response.text();
          errorMessage =
            errorText || `HTTP ${response.status}: ${response.statusText}`;
        }

        // Try fallback URL for server errors or network issues
        if (
          (response.status >= 500 || response.status === 0) &&
          retryCount < this.retryAttempts
        ) {
          console.log(`🔄 Server error ${response.status}, trying fallback...`);
          return this.tryFallbackUrl(endpoint, options, retryCount);
        }

        throw new Error(errorMessage);
      }

      // Parse JSON response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("✅ Response received successfully");
        return data;
      } else {
        const text = await response.text();
        console.log("✅ Text response received");
        return { success: true, data: text };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("💥 Request Failed:", error.message);

      // Handle network errors, timeouts, or CORS issues
      if (
        error.name === "AbortError" ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("CORS")
      ) {
        if (retryCount < this.retryAttempts) {
          console.log(
            `🔄 Network error, trying fallback... (attempt ${retryCount + 1})`
          );
          return this.tryFallbackUrl(endpoint, options, retryCount);
        }
      }

      // Enhance error message for user
      let userFriendlyMessage = error.message;
      if (error.message.includes("Failed to fetch")) {
        userFriendlyMessage =
          "خطای اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
      } else if (error.message.includes("NetworkError")) {
        userFriendlyMessage = "خطای شبکه. لطفاً مجدداً تلاش کنید.";
      } else if (error.name === "AbortError") {
        userFriendlyMessage = "درخواست منقضی شد. لطفاً مجدداً تلاش کنید.";
      }

      const enhancedError = new Error(userFriendlyMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  // Switches to the next backend URL and retries
  async tryFallbackUrl(endpoint, options, retryCount) {
    console.log(`🔄 Trying fallback backend URL...`);

    // Only try each fallback URL once
    if (retryCount >= FALLBACK_URLS.length) {
      throw new Error("تمامی سرورها در دسترس نیستند. لطفاً بعداً تلاش کنید.");
    }

    const originalBaseURL = this.baseURL;
    this.currentUrlIndex = (this.currentUrlIndex + 1) % FALLBACK_URLS.length;
    this.baseURL = FALLBACK_URLS[this.currentUrlIndex];
    console.log(`   New Base URL: ${this.baseURL}`);

    try {
      await this.sleep(this.retryDelay);
      return await this.makeRequest(endpoint, options, retryCount + 1);
    } catch (fallbackError) {
      // If this was the last fallback attempt, restore original URL
      if (retryCount + 1 >= this.retryAttempts) {
        this.baseURL = originalBaseURL;
      }
      throw fallbackError;
    }
  }

  // Check if backend is healthy
  async checkHealth() {
    try {
      const response = await this.makeRequest("/health", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "unhealthy", error: error.message };
    }
  }

  // Multi-platform search
  async searchMultiple(query, platforms, count = 20) {
    if (!query || !query.trim()) {
      throw new Error("عبارت جستجو نمی‌تواند خالی باشد");
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      throw new Error("حداقل یک پلتفرم باید انتخاب شود");
    }

    try {
      const requestBody = {
        query: query.trim(),
        platforms: platforms,
        count: Math.min(count, 50),
      };

      console.log("🔍 Searching with params:", requestBody);

      const response = await this.makeRequest("/api/search/multi", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response.success) {
        throw new Error(response.message || "جستجو ناموفق بود");
      }

      return response;
    } catch (error) {
      console.error("Search failed:", error);
      throw new Error(`خطا در جستجو: ${error.message}`);
    }
  }

  // AI-enhanced search
  async searchWithAI(query, platforms, count = 20, aiProvider = "openai") {
    try {
      // First, get regular search results
      console.log("🤖 Starting AI-enhanced search...");
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
          console.log("🧠 Requesting AI analysis...");
          const aiResponse = await this.makeRequest("/api/ai/enhance", {
            method: "POST",
            body: JSON.stringify({
              text: textForAnalysis,
              query: query,
              service: aiProvider,
            }),
          });

          if (
            aiResponse.success &&
            aiResponse.data &&
            aiResponse.data.analysis
          ) {
            aiAnalysis = aiResponse.data.analysis;
            console.log("✅ AI analysis completed");
          } else {
            console.log("⚠️ AI analysis returned but with no content");
          }
        } catch (aiError) {
          console.error("AI analysis failed, proceeding without it:", aiError);
          // Don't throw here, just continue without AI analysis
        }
      }

      return {
        ...searchResponse,
        aiAnalysis: aiAnalysis || "تحلیل هوش مصنوعی در حال حاضر در دسترس نیست.",
      };
    } catch (error) {
      console.error("💥 AI-enhanced search failed:", error);
      throw new Error(`خطا در جستجوی هوشمند: ${error.message}`);
    }
  }

  // Generic API call method for future endpoints
  async apiCall(endpoint, method = "GET", data = null) {
    const options = {
      method: method.toUpperCase(),
    };

    if (
      data &&
      (method.toUpperCase() === "POST" || method.toUpperCase() === "PUT")
    ) {
      options.body = JSON.stringify(data);
    }

    return this.makeRequest(endpoint, options);
  }

  // Get service status
  async getStatus() {
    try {
      const health = await this.checkHealth();
      return {
        online: health.status === "healthy",
        services: health.services || {},
        timestamp: health.timestamp,
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

const apiService = new ApiService();
export default apiService;
