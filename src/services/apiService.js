// src/services/apiService.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://kavosh-backend-production.up.railway.app";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 30000;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async makeRequest(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 [Attempt ${retryCount + 1}] Request to: ${url}`);
      console.log("🔧 Options:", options);

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

      console.log(`📡 Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error:", errorText);
        if (
          retryCount < this.retryAttempts &&
          [408, 429, 500, 502, 503, 504].includes(response.status)
        ) {
          console.warn(
            `🔄 Retrying after ${this.retryDelay * Math.pow(2, retryCount)}ms...`
          );
          await this.sleep(this.retryDelay * Math.pow(2, retryCount));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Data:", data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("💥 Failed:", error);
      if (error.name === "AbortError" && retryCount < this.retryAttempts) {
        await this.sleep(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      if (
        error.message.includes("Failed to fetch") &&
        retryCount < this.retryAttempts
      ) {
        await this.sleep(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw new Error(error.message || "درخواست ناموفق بود");
    }
  }

  async checkHealth() {
    try {
      return await this.makeRequest("/health");
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "unhealthy", error: error.message };
    }
  }

  async testConnection() {
    try {
      return await this.makeRequest("/api/test", {
        method: "POST",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      throw error;
    }
  }

  async searchMultiple(query, platforms, count = 20) {
    try {
      console.log("🔍 Multi-search:", { query, platforms, count });
      const response = await this.makeRequest("/api/search/multi", {
        method: "POST",
        body: JSON.stringify({
          query: query.trim(),
          platforms,
          count: Math.min(count, 50),
        }),
      });
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message || "جستجو ناموفق بود");
    } catch (error) {
      console.error("💥 Multi-search failed:", error);
      return { success: false, error: error.message, data: null };
    }
  }

  async searchWithAI(query, platforms, count = 20, aiProvider = "openai") {
    try {
      console.log("🤖 AI-search:", { query, platforms, count, aiProvider });
      const searchResponse = await this.searchMultiple(query, platforms, count);
      if (!searchResponse.success) throw new Error(searchResponse.error);

      const searchResults = this.extractResultsFromPlatforms(
        searchResponse.data
      );
      const textForAnalysis = searchResults
        .slice(0, 10)
        .map((result) => result.content || result.text)
        .join("\n\n");

      let aiAnalysis = null;
      if (textForAnalysis.trim()) {
        const aiResponse = await this.makeRequest("/api/ai/enhance", {
          method: "POST",
          body: JSON.stringify({
            text: textForAnalysis,
            service: aiProvider,
            analysisType: "summary",
          }),
        });
        if (aiResponse.success && aiResponse.data.analysis) {
          aiAnalysis = this.formatAIAnalysis(
            aiResponse.data.analysis,
            aiProvider
          );
        }
      }

      return { success: true, data: searchResponse.data, aiAnalysis };
    } catch (error) {
      console.error("💥 AI-search failed:", error);
      return { success: false, error: error.message, data: null };
    }
  }

  extractResultsFromPlatforms(platformsData) {
    const allResults = [];
    if (platformsData && platformsData.platforms) {
      Object.entries(platformsData.platforms).forEach(([platform, data]) => {
        if (data.success && Array.isArray(data.results)) {
          data.results.forEach((result) =>
            allResults.push({ ...result, platform })
          );
        }
      });
    }
    return allResults;
  }

  formatAIAnalysis(analysis, provider) {
    if (typeof analysis === "string") {
      return analysis;
    }

    if (analysis[provider]) {
      const providerAnalysis = analysis[provider];
      if (typeof providerAnalysis === "string") {
        return providerAnalysis;
      }
      if (providerAnalysis.summary) {
        return providerAnalysis.summary;
      }
      if (providerAnalysis.analysis) {
        return providerAnalysis.analysis;
      }
    }

    if (analysis.mock_openai) {
      return `${analysis.mock_openai.summary}\n\nموضوعات کلیدی: ${analysis.mock_openai.key_topics?.join("، ") || "نامشخص"}`;
    }

    if (analysis.basic) {
      return `تحلیل پایه: این محتوا دارای احساسات ${analysis.basic.sentiment} است و شامل ${analysis.basic.word_count} کلمه می‌باشد.`;
    }

    return "تحلیل هوش مصنوعی دریافت شد اما قابل نمایش نیست.";
  }

  async searchTwitter(query, count = 10) {
    return this.makeRequest("/api/search/twitter", {
      method: "POST",
      body: JSON.stringify({ query, count }),
    });
  }

  async searchInstagram(query, count = 10) {
    return this.makeRequest("/api/search/instagram", {
      method: "POST",
      body: JSON.stringify({ query, count }),
    });
  }

  async searchEitaa(query, count = 10) {
    return this.makeRequest("/api/search/eitaa", {
      method: "POST",
      body: JSON.stringify({ query, count }),
    });
  }

  async searchFacebook(query, count = 10) {
    return this.makeRequest("/api/search/facebook", {
      method: "POST",
      body: JSON.stringify({ query, count }),
    });
  }

  async getUserAnalytics() {
    try {
      return await this.makeRequest("/api/analytics");
    } catch (error) {
      console.error("Analytics fetch failed:", error);
      return {
        success: false,
        data: {
          total_searches: 0,
          popular_queries: [],
          platform_usage: {},
        },
      };
    }
  }

  async getSearchHistory() {
    try {
      return await this.makeRequest("/api/history");
    } catch (error) {
      console.error("History fetch failed:", error);
      return {
        success: false,
        data: { searches: [] },
      };
    }
  }
}

const apiService = new ApiService();
export default apiService;
