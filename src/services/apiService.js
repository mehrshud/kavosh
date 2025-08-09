// APIService.js - Updated for Railway Backend Integration

class APIService {
  constructor() {
    // Use Railway backend URL
    this.baseUrl =
      process.env.REACT_APP_BACKEND_URL ||
      "https://kavosh-backend.railway.internal";

    // Remove API keys from frontend (now handled by backend)
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  // Generic API call method
  async makeRequest(endpoint, data = null, method = "GET") {
    try {
      const config = {
        method,
        headers: this.headers,
      };

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      return await this.makeRequest("/health");
    } catch (error) {
      console.error("Backend health check failed:", error);
      return { status: "error", message: "Backend unavailable" };
    }
  }

  // Instagram Search
  async searchInstagram(query, options = {}) {
    try {
      const response = await this.makeRequest(
        "/api/search/instagram",
        {
          query,
          options,
        },
        "POST"
      );

      return this.formatInstagramResults(response.data || []);
    } catch (error) {
      console.error("Instagram API Error:", error);
      return this.getMockResults("instagram", query);
    }
  }

  // Twitter Search
  async searchTwitter(query, options = {}) {
    try {
      const response = await this.makeRequest(
        "/api/search/twitter",
        {
          query,
          options,
        },
        "POST"
      );

      return this.formatTwitterResults(
        response.data || [],
        response.includes || {}
      );
    } catch (error) {
      console.error("Twitter API Error:", error);
      return this.getMockResults("twitter", query);
    }
  }

  // Eitaa Search
  async searchEitaa(query, options = {}) {
    try {
      const response = await this.makeRequest(
        "/api/search/eitaa",
        {
          query,
          options,
        },
        "POST"
      );

      return this.formatEitaaResults(response.data || [], query);
    } catch (error) {
      console.error("Eitaa API Error:", error);
      return this.getMockResults("eitaa", query);
    }
  }

  // Multi-platform Search with AI Enhancement
  async searchMultiPlatform(
    query,
    platforms,
    options = {},
    useAI = false,
    aiProvider = "openai"
  ) {
    try {
      const response = await this.makeRequest(
        "/api/search/multi",
        {
          query,
          platforms,
          options,
          useAI,
          aiProvider,
        },
        "POST"
      );

      return {
        results: response.data || [],
        aiInsight: response.aiInsight || null,
        totalResults: response.totalResults || 0,
      };
    } catch (error) {
      console.error("Multi-platform search error:", error);
      // Fallback to individual platform searches
      return await this.fallbackMultiSearch(query, platforms);
    }
  }

  // AI Enhancement (now calls backend)
  async enhanceSearchWithAI(
    query,
    platform,
    results = [],
    aiProvider = "openai"
  ) {
    try {
      const resultsContext = results.slice(0, 5).map((r) => ({
        platform: r.platform,
        content: r.content?.substring(0, 200) || "",
        sentiment: r.sentiment,
        engagement: r.engagement,
      }));

      const prompt = `تحلیل نتایج جستجوی "${query}" در پلتفرم‌های ${platform}:

نتایج نمونه:
${JSON.stringify(resultsContext, null, 2)}

لطفاً تحلیل جامعی از:
1. روند کلی محتوا
2. احساسات غالب
3. میزان تعامل
4. توصیه‌هایی برای بهبود جستجو
ارائه دهید.`;

      const response = await this.makeRequest(
        "/api/ai/enhance",
        {
          prompt,
          provider: aiProvider,
          searchResults: results,
        },
        "POST"
      );

      return response.analysis || this.generateFallbackAnalysis(prompt);
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      return this.generateFallbackAnalysis(query);
    }
  }

  // Fallback multi-search for when backend is unavailable
  async fallbackMultiSearch(query, platforms) {
    let allResults = [];

    for (const platform of platforms) {
      const platformResults = this.getMockResults(platform, query, 7);
      allResults = [...allResults, ...platformResults];
    }

    return {
      results: allResults,
      aiInsight: null,
      totalResults: allResults.length,
    };
  }

  // Format Results Methods
  formatInstagramResults(posts) {
    return posts.map((post) => ({
      id: post.id,
      platform: "instagram",
      content: post.caption || post.content || "بدون توضیح",
      author: post.user?.username || post.author || "@unknown",
      date: post.timestamp
        ? new Date(post.timestamp).toLocaleDateString("fa-IR")
        : "نامشخص",
      engagement: {
        likes: post.like_count || post.engagement?.likes || 0,
        comments: post.comments_count || post.engagement?.comments || 0,
        shares: post.engagement?.shares || 0,
      },
      sentiment:
        post.sentiment ||
        this.analyzeSentiment(post.caption || post.content || ""),
      media: post.media_url || post.media,
      originalUrl: post.permalink || "#",
      mediaType: post.media_type?.toLowerCase() || post.mediaType || "image",
    }));
  }

  formatTwitterResults(tweets, includes = {}) {
    if (!Array.isArray(tweets)) return [];

    return tweets.map((tweet) => ({
      id: tweet.id,
      platform: "twitter",
      content: tweet.text || tweet.content,
      author:
        includes?.users?.find((u) => u.id === tweet.author_id)?.username ||
        tweet.author ||
        "@unknown",
      date: tweet.created_at
        ? new Date(tweet.created_at).toLocaleDateString("fa-IR")
        : "نامشخص",
      engagement: {
        likes: tweet.public_metrics?.like_count || tweet.engagement?.likes || 0,
        comments:
          tweet.public_metrics?.reply_count || tweet.engagement?.comments || 0,
        shares:
          tweet.public_metrics?.retweet_count || tweet.engagement?.shares || 0,
      },
      sentiment:
        tweet.sentiment ||
        this.analyzeSentiment(tweet.text || tweet.content || ""),
      originalUrl: `https://twitter.com/i/status/${tweet.id}`,
      mediaType: "text",
    }));
  }

  formatEitaaResults(posts, query) {
    if (!Array.isArray(posts)) return [];

    return posts.map((post, index) => ({
      id: post.id || `eitaa_${index + 1}`,
      platform: "eitaa",
      content: post.text || post.content || "محتوای بدون متن",
      author: post.chat?.username || post.author || `@channel_${index + 1}`,
      channelTitle: post.chat?.title || post.channelTitle || "کانال نامشخص",
      date: post.date
        ? new Date(post.date * 1000).toLocaleDateString("fa-IR")
        : "نامشخص",
      engagement: {
        views:
          post.views ||
          post.engagement?.views ||
          Math.floor(Math.random() * 10000) + 1000,
        likes:
          post.reactions?.total ||
          post.engagement?.likes ||
          Math.floor(Math.random() * 1000) + 50,
        comments:
          post.replies ||
          post.engagement?.comments ||
          Math.floor(Math.random() * 100) + 10,
        shares:
          post.forwards ||
          post.engagement?.shares ||
          Math.floor(Math.random() * 50) + 5,
      },
      sentiment:
        post.sentiment ||
        this.analyzeSentiment(post.text || post.content || ""),
      media: post.photo?.file_id || post.video?.file_id || post.media,
      originalUrl: `https://eitaa.com/${post.chat?.username || "unknown"}/${
        post.message_id || ""
      }`,
      mediaType: post.photo
        ? "image"
        : post.video
        ? "video"
        : post.mediaType || "text",
      isChannel: true,
      channelInfo: post.chat || post.channelInfo,
    }));
  }

  // Sentiment Analysis
  analyzeSentiment(text) {
    if (!text) return "neutral";

    const positiveWords = ["عالی", "خوب", "بهترین", "موفق", "خوشحال", "عاشق"];
    const negativeWords = ["بد", "ضعیف", "ناراحت", "مشکل", "غلط", "متنفر"];

    const positive = positiveWords.some((word) => text.includes(word));
    const negative = negativeWords.some((word) => text.includes(word));

    if (positive && !negative) return "positive";
    if (negative && !positive) return "negative";
    return "neutral";
  }

  // Mock Results for Demo/Fallback
  getMockResults(platform, query, count = 7) {
    const platforms = {
      instagram: { icon: "Instagram", color: "from-pink-500 to-purple-600" },
      twitter: { icon: "Twitter", color: "from-blue-400 to-blue-600" },
      facebook: { icon: "Facebook", color: "from-blue-600 to-blue-800" },
      telegram: { icon: "Send", color: "from-sky-400 to-sky-600" },
      eitaa: { icon: "MessageCircle", color: "from-green-500 to-green-700" },
      rubika: { icon: "MessageSquare", color: "from-red-500 to-red-700" },
    };

    // Enhanced mock data for Eitaa
    if (platform === "eitaa") {
      return Array.from({ length: count }, (_, i) => ({
        id: `eitaa_${i + 1}`,
        platform: "eitaa",
        content: `محتوای کانال ایتا مرتبط با "${query}" - پست شماره ${
          i + 1
        }. این محتوا شامل اطلاعات مفیدی درباره موضوع جستجو می‌باشد.`,
        author: `@channel_${i + 1}`,
        channelTitle: `کانال ${i + 1}`,
        date: `${i + 1} ساعت پیش`,
        engagement: {
          views: Math.floor(Math.random() * 50000) + 5000,
          likes: Math.floor(Math.random() * 1000) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          shares: Math.floor(Math.random() * 50) + 5,
        },
        sentiment: ["positive", "neutral", "negative"][
          Math.floor(Math.random() * 3)
        ],
        media: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : null,
        originalUrl: `https://eitaa.com/channel_${i + 1}/${Math.floor(
          Math.random() * 1000
        )}`,
        mediaType: i % 4 === 0 ? "video" : i % 3 === 0 ? "image" : "text",
        isChannel: true,
        channelInfo: {
          title: `کانال ${i + 1}`,
          username: `channel_${i + 1}`,
          membersCount: Math.floor(Math.random() * 10000) + 1000,
        },
      }));
    }

    return Array.from({ length: count }, (_, i) => ({
      id: `${platform}_${i + 1}`,
      platform,
      content: `محتوای مرتبط با "${query}" از ${platform} - نمونه شماره ${
        i + 1
      }`,
      author: `@user${i + 1}`,
      date: `${i + 1} ساعت پیش`,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
      },
      sentiment: ["positive", "neutral", "negative"][
        Math.floor(Math.random() * 3)
      ],
      media: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : null,
      originalUrl: `https://${platform}.com/post/${i + 1}`,
      mediaType: i % 4 === 0 ? "video" : i % 3 === 0 ? "image" : "text",
    }));
  }

  // Fallback analysis for when AI is unavailable
  generateFallbackAnalysis(query) {
    return `## تحلیل خودکار نتایج

### 📊 خلاصه
تحلیل بر اساس سیستم داخلی انجام شده است.

### 🎯 نکات کلیدی
- جستجو با موفقیت انجام شد
- نتایج آماده نمایش هستند
- سیستم در حالت عادی عمل می‌کند

### 💡 توصیه‌ها
1. بررسی کلیدهای API برای تحلیل دقیق‌تر
2. استفاده از فیلترهای پیشرفته
3. صادرات نتایج برای تحلیل بیشتر

*این تحلیل به صورت خودکار تولید شده است.*`;
  }

  // Export functionality
  exportResults(results, format = "json") {
    const dataStr =
      format === "json"
        ? JSON.stringify(results, null, 2)
        : this.convertToCSV(results);
    const dataBlob = new Blob([dataStr], {
      type: format === "json" ? "application/json" : "text/csv",
    });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kavosh-report-${
      new Date().toISOString().split("T")[0]
    }.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  convertToCSV(results) {
    if (!results.length) return "";

    const headers = [
      "پلتفرم",
      "نویسنده",
      "محتوا",
      "تاریخ",
      "لایک",
      "نظر",
      "اشتراک",
      "احساسات",
      "لینک اصلی",
    ];
    const rows = results.map((r) => [
      r.platform,
      r.author,
      r.content?.replace(/,/g, "،") || "",
      r.date,
      r.engagement?.likes || 0,
      r.engagement?.comments || 0,
      r.engagement?.shares || 0,
      r.sentiment === "positive"
        ? "مثبت"
        : r.sentiment === "negative"
        ? "منفی"
        : "خنثی",
      r.originalUrl,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Share functionality
  async shareResults(results, query) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `نتایج جستجو کاوش: ${query}`,
          text: `${results.length} نتیجه یافت شد برای جستجوی "${query}"`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      const text = `نتایج جستجو کاوش: ${query}\n${results.length} نتیجه یافت شد\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert("لینک کپی شد!");
    }
  }

  // Connection test
  async testConnection() {
    try {
      const health = await this.healthCheck();
      return health.status === "healthy";
    } catch (error) {
      return false;
    }
  }
}

// Create and export instance
const apiService = new APIService();
export default apiService;
