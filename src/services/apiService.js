// src/services/apiService.js

/**
 * Manages all API interactions by communicating with a secure serverless backend,
 * falling back to mock data upon failure.
 */
class APIService {
  /**
   * Performs a search by calling a dedicated serverless function on the backend.
   * This is a private helper method for internal use by the class.
   * @param {string} endpoint - The name of the serverless endpoint (e.g., 'searchTwitter').
   * @param {string} query - The user's search query.
   * @param {object} options - Additional search options.
   * @returns {Promise<any>} The JSON response from the backend.
   */
  async #search(endpoint, query, options) {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, options }),
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        console.error(
          `Error from /api/${endpoint}:`,
          errorInfo.message || errorInfo
        );
        throw new Error(`Backend error on endpoint: ${endpoint}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        `Failed to fetch from the /api/${endpoint} endpoint.`,
        error
      );
      // Re-throw the error to be caught by the public-facing search methods.
      throw error;
    }
  }

  // --- Platform-Specific Search Methods ---

  /**
   * Searches Eitaa by calling the 'searchEitaa' serverless function.
   * Falls back to mock data if the API call fails.
   */
  async searchEitaa(query, options = {}) {
    try {
      const results = await this.#search("searchEitaa", query, options);
      return this.formatEitaaResults(results, query);
    } catch (error) {
      console.log("Falling back to Eitaa mock data.");
      return this.getMockEitaaResults(query, 15);
    }
  }

  /**
   * Searches Twitter by calling the 'searchTwitter' serverless function.
   * Falls back to mock data if the API call fails.
   */
  async searchTwitter(query, options = {}) {
    try {
      // This is the correct call. It points to YOUR serverless function.
      const response = await fetch("/api/searchTwitter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, options }),
      });

      if (!response.ok) {
        throw new Error("Backend proxy for Twitter failed.");
      }

      const results = await response.json();
      return this.formatTwitterResults(results);
    } catch (error) {
      console.log("Falling back to Twitter mock data.");
      return this.getMockTwitterResults(query, 10);
    }
  }

  /**
   * Searches Instagram by calling the 'searchInstagram' serverless function.
   * Falls back to mock data if the API call fails.
   */
  async searchInstagram(query, options = {}) {
    try {
      const results = await this.#search("searchInstagram", query, options);
      return this.formatInstagramResults(results);
    } catch (error) {
      console.log("Falling back to Instagram mock data.");
      return this.getMockInstagramResults(query, 8);
    }
  }

  /**
   * Placeholder to search Telegram via a 'searchTelegram' serverless function.
   * Currently falls back to an empty array.
   */
  async searchTelegram(query, options = {}) {
    try {
      return await this.#search("searchTelegram", query, options);
    } catch (error) {
      console.log("Telegram API not implemented, returning empty array.");
      return [];
    }
  }

  /**
   * Placeholder to search Rubika via a 'searchRubika' serverless function.
   * Currently falls back to an empty array.
   */
  async searchRubika(query, options = {}) {
    try {
      return await this.#search("searchRubika", query, options);
    } catch (error) {
      console.log("Rubika API not implemented, returning empty array.");
      return [];
    }
  }

  // --- AI Enhancement ---

  /**
   * Enhances search results by calling a unified 'enhanceAI' serverless function.
   * The backend will handle routing to either OpenAI or Gemini.
   * Falls back to a basic local analysis if the API call fails.
   */
  async enhanceSearchWithAI(
    query,
    platform,
    results = [],
    aiProvider = "openai"
  ) {
    try {
      const resultsContext = results.slice(0, 5).map((r) => ({
        platform: r.platform,
        content: r.content.substring(0, 200),
        sentiment: r.sentiment,
        engagement: r.engagement,
      }));

      const prompt = `تحلیل نتایج جستجوی "${query}" در پلتفرم‌های ${platform}:\n\nنتایج نمونه:\n${JSON.stringify(
        resultsContext,
        null,
        2
      )}\n\nلطفاً تحلیل جامعی از موارد زیر ارائه دهید:\n\n1. **روند کلی محتوا:** تحلیل موضوعات اصلی و کلیدواژه‌های مهم\n2. **احساسات غالب:** تحلیل tone و نظرات کاربران\n3. **میزان تعامل:** بررسی آمار لایک، کامنت و share\n4. **توصیه‌های بهبود:** پیشنهادات برای جستجوهای بهتر\n5. **نکات مهم:** موارد قابل توجه در نتایج\n\nپاسخ را به زبان فارسی و با جزئیات مفید ارائه دهید.`;

      const response = await fetch("/api/enhanceAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          provider: aiProvider,
        }),
      });

      if (!response.ok) {
        throw new Error("AI backend endpoint returned an error.");
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error(
        "AI Enhancement failed, using local fallback analysis.",
        error
      );
      return this.getFallbackAIResponse(query, platform, results);
    }
  }

  // --- Mock Data, Formatters, and Utilities ---
  // The following methods are preserved from your original file to ensure
  // that fallbacks, formatting, and client-side helpers continue to work.

  getFallbackAIResponse(query, platform, results) {
    const totalResults = results.length;
    const sentiments = results.map((r) => r.sentiment);
    const positiveCount = sentiments.filter((s) => s === "positive").length;
    const negativeCount = sentiments.filter((s) => s === "negative").length;
    const neutralCount = sentiments.filter((s) => s === "neutral").length;

    const avgLikes =
      results.reduce((sum, r) => sum + (r.engagement.likes || 0), 0) /
      totalResults;
    const avgComments =
      results.reduce((sum, r) => sum + (r.engagement.comments || 0), 0) /
      totalResults;

    return `## تحلیل نتایج جستجو: "${query}"\n\n### 📊 خلاصه آماری\n- **تعداد کل نتایج:** ${totalResults}\n- **پلتفرم‌های جستجو شده:** ${platform}\n\n### 🎭 تحلیل احساسات\n- **مثبت:** ${positiveCount} (${Math.round(
      (positiveCount / totalResults) * 100
    )}%)\n- **منفی:** ${negativeCount} (${Math.round(
      (negativeCount / totalResults) * 100
    )}%)\n- **خنثی:** ${neutralCount} (${Math.round(
      (neutralCount / totalResults) * 100
    )}%)\n\n### 📈 آمار تعامل\n- **میانگین لایک:** ${Math.round(
      avgLikes
    )}\n- **میانگین کامنت:** ${Math.round(avgComments)}\n\n### 💡 نتیجه‌گیری\n${
      positiveCount > negativeCount
        ? "احساسات غالب نسبت به این موضوع مثبت است."
        : negativeCount > positiveCount
        ? "احساسات منفی درباره این موضوع غالب است."
        : "نظرات درباره این موضوع متعادل است."
    }\n\n### 🎯 توصیه‌های بهبود\n1. برای نتایج بیشتر، از کلیدواژه‌های مرتبط استفاده کنید\n2. جستجو در پلتفرم‌های مختلف برای دید کاملتر\n3. تحلیل بازه‌های زمانی مختلف برای درک روند\n\n*این تحلیل بر اساس الگوریتم‌های داخلی سیستم ارائه شده است.*`;
  }

  getMockTwitterResults(query, count = 10) {
    const twitterUsers = [
      { username: "tech_news_fa", name: "اخبار فناوری" },
      { username: "persian_blogger", name: "وبلاگ‌نویس فارسی" },
      { username: "social_media_expert", name: "متخصص شبکه‌های اجتماعی" },
      { username: "digital_marketing", name: "بازاریابی دیجیتال" },
      { username: "startup_iran", name: "استارتاپ ایران" },
    ];
    return Array.from({ length: count }, (_, i) => {
      const user =
        twitterUsers[Math.floor(Math.random() * twitterUsers.length)];
      const engagement = {
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 100) + 5,
        shares: Math.floor(Math.random() * 50) + 2,
      };
      return {
        id: `twitter_${i + 1}`,
        platform: "twitter",
        content: this.generateRealisticContent(query, "twitter"),
        author: `@${user.username}`,
        authorName: user.name,
        date: this.generateRecentDate(),
        engagement,
        sentiment: this.calculateSentiment(engagement),
        originalUrl: `https://twitter.com/${user.username}/status/${
          Date.now() + i
        }`,
        mediaType: i % 4 === 0 ? "image" : i % 7 === 0 ? "video" : "text",
        media: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : null,
        verified: Math.random() > 0.7,
        location: this.getRandomLocation(),
        hashtags: this.generateHashtags(query),
      };
    });
  }

  getMockEitaaResults(query, count = 15) {
    const eitaaChannels = [
      { username: "news_channel", title: "کانال خبری", members: 12500 },
      {
        username: "tech_updates",
        title: "به‌روزرسانی‌های فناوری",
        members: 8900,
      },
      { username: "persian_content", title: "محتوای فارسی", members: 15600 },
      { username: "educational_hub", title: "محتوای آموزشی", members: 6700 },
      {
        username: "business_insights",
        title: "بینش‌های کسب‌وکار",
        members: 4500,
      },
    ];
    return Array.from({ length: count }, (_, i) => {
      const channel =
        eitaaChannels[Math.floor(Math.random() * eitaaChannels.length)];
      const engagement = {
        views: Math.floor(Math.random() * 50000) + 5000,
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 200) + 20,
        shares: Math.floor(Math.random() * 100) + 10,
      };
      return {
        id: `eitaa_${i + 1}`,
        platform: "eitaa",
        content: this.generateRealisticContent(query, "eitaa"),
        author: `@${channel.username}`,
        channelTitle: channel.title,
        date: this.generateRecentDate(),
        engagement,
        sentiment: this.calculateSentiment(engagement),
        originalUrl: `https://eitaa.com/${channel.username}/${
          Math.floor(Math.random() * 1000) + 100
        }`,
        mediaType: i % 5 === 0 ? "video" : i % 3 === 0 ? "image" : "text",
        media:
          i % 3 === 0
            ? `https://picsum.photos/400/300?random=${i + 100}`
            : null,
        isChannel: true,
        channelInfo: {
          title: channel.title,
          username: channel.username,
          membersCount: channel.members,
          description: `کانال ${channel.title} با ${channel.members} عضو فعال`,
        },
        messageId: Math.floor(Math.random() * 1000) + 100,
        forwardedFrom: Math.random() > 0.7 ? "کانال دیگر" : null,
      };
    });
  }

  getMockInstagramResults(query, count = 8) {
    const instagramUsers = [
      { username: "persian_photographer", name: "عکاس ایرانی", verified: true },
      {
        username: "lifestyle_blogger",
        name: "وبلاگ‌نویس سبک زندگی",
        verified: false,
      },
      { username: "food_lover_iran", name: "علاقه‌مند به غذا", verified: true },
      { username: "travel_iran", name: "گردشگری ایران", verified: true },
      { username: "fashion_persian", name: "مد و پوشاک", verified: false },
    ];
    return Array.from({ length: count }, (_, i) => {
      const user =
        instagramUsers[Math.floor(Math.random() * instagramUsers.length)];
      const engagement = {
        likes: Math.floor(Math.random() * 5000) + 200,
        comments: Math.floor(Math.random() * 300) + 20,
        shares: Math.floor(Math.random() * 100) + 5,
      };
      return {
        id: `instagram_${i + 1}`,
        platform: "instagram",
        content: this.generateRealisticContent(query, "instagram"),
        author: `@${user.username}`,
        authorName: user.name,
        date: this.generateRecentDate(),
        engagement,
        sentiment: this.calculateSentiment(engagement),
        originalUrl: `https://instagram.com/p/${this.generateInstagramId()}`,
        mediaType: i % 6 === 0 ? "video" : "image",
        media: `https://picsum.photos/400/400?random=${i + 200}`,
        verified: user.verified,
        location: this.getRandomLocation(),
        hashtags: this.generateHashtags(query),
        stories: Math.random() > 0.6,
      };
    });
  }

  generateRealisticContent(query, platform) {
    const templates = {
      twitter: [
        `جالب بود که درباره ${query} بحث کردیم. نظر شما چیه؟ 🤔`,
        `آخرین اخبار مربوط به ${query} واقعاً قابل توجه است!`,
        `${query} موضوع داغ امروز بود. چه فکر می‌کنید؟`,
        `تحلیل جدید درباره ${query} منتشر شد. ارزش خواندن داره 📊`,
        `${query} یکی از مهم‌ترین موضوعات سال محسوب میشه`,
      ],
      instagram: [
        `امروز درباره ${query} یه پست جذاب دیدم! عکس‌هایی که اشتراک گذاشتم رو ببینید 📸`,
        `${query} همیشه یکی از علاقه‌مندی‌های من بوده. شما چطور؟`,
        `محتوای جدید درباره ${query} آماده شد! نظرتون رو بگید 💫`,
        `${query} موضوع امروز! با عکس‌های زیبا همراهتون هستم ✨`,
        `تجربه‌ام با ${query} رو باهاتون به اشتراک می‌ذارم 🌟`,
      ],
      eitaa: [
        `📢 گزارش کامل درباره ${query} در کانال ما منتشر شد. حتماً مطالعه کنید.`,
        `🔥 آخرین اخبار ${query}: بررسی کامل و تحلیل دقیق`,
        `💡 نکاتی درباره ${query} که حتماً باید بدانید`,
        `📊 آمار و ارقام جدید مربوط به ${query} منتشر شد`,
        `🎯 ${query} یکی از محورهای اصلی بحث امروز ما است`,
      ],
    };
    const platformTemplates = templates[platform] || templates.twitter;
    return platformTemplates[
      Math.floor(Math.random() * platformTemplates.length)
    ];
  }

  generateRecentDate() {
    const now = new Date();
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    if (hoursAgo < 24) {
      return `${hoursAgo} ساعت پیش`;
    }
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} روز پیش`;
  }

  calculateSentiment(engagement) {
    const ratio =
      engagement.likes / (engagement.likes + engagement.comments + 1);
    if (ratio > 0.7) return "positive";
    if (ratio < 0.3) return "negative";
    return "neutral";
  }

  getRandomLocation() {
    const locations = [
      "تهران، ایران",
      "اصفهان، ایران",
      "شیراز، ایران",
      "مشهد، ایران",
      "تبریز، ایران",
      "کرج، ایران",
    ];
    return Math.random() > 0.5
      ? locations[Math.floor(Math.random() * locations.length)]
      : null;
  }

  generateHashtags(query) {
    const hashtags = [
      `#${query.replace(/\s+/g, "_")}`,
      "#ایران",
      "#فارسی",
      "#اجتماعی",
      "#جالب",
      "#خبر",
    ];
    return hashtags.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  generateInstagramId() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    return Array.from({ length: 11 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  }

  formatTwitterResults(data) {
    if (!data.data) return [];
    const users = data.includes?.users || [];
    return data.data.map((tweet) => {
      const author = users.find((u) => u.id === tweet.author_id);
      return {
        id: tweet.id,
        platform: "twitter",
        content: tweet.text,
        author: `@${author?.username || "unknown"}`,
        authorName: author?.name || "Unknown User",
        date: new Date(tweet.created_at).toLocaleDateString("fa-IR"),
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
        },
        sentiment: this.analyzeSentiment(tweet.text),
        originalUrl: `https://twitter.com/${author?.username || "i"}/status/${
          tweet.id
        }`,
        mediaType: tweet.attachments ? "image" : "text",
        verified: author?.verified || false,
      };
    });
  }

  formatInstagramResults(posts) {
    return posts.map((post) => ({
      id: post.id,
      platform: "instagram",
      content: post.caption || "بدون توضیح",
      author: "@user_" + post.id.slice(-6),
      date: new Date(post.timestamp).toLocaleDateString("fa-IR"),
      engagement: {
        likes: post.like_count || Math.floor(Math.random() * 1000) + 100,
        comments: post.comments_count || Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
      },
      sentiment: this.analyzeSentiment(post.caption || ""),
      media: post.media_url,
      originalUrl: post.permalink,
      mediaType: post.media_type?.toLowerCase() || "image",
    }));
  }

  formatEitaaResults(messages, query) {
    if (!Array.isArray(messages)) return [];
    return messages.map((msg, index) => {
      const message = msg.message || msg;
      const text = message.text || message.caption || "";
      const date = message.date ? new Date(message.date * 1000) : new Date();
      return {
        id: `eitaa_${message.message_id || index}`,
        platform: "eitaa",
        content: text || "محتوای بدون متن",
        author: `@${message.chat?.username || `channel_${index}`}`,
        channelTitle: message.chat?.title || "کانال نامشخص",
        date: date.toLocaleDateString("fa-IR"),
        engagement: {
          views: message.views || Math.floor(Math.random() * 10000) + 1000,
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          shares: message.forwards || Math.floor(Math.random() * 50) + 5,
        },
        sentiment: this.analyzeSentiment(text),
        media: message.photo?.file_id || message.video?.file_id || null,
        originalUrl: `https://eitaa.com/${
          message.chat?.username || "channel"
        }/${message.message_id || index}`,
        mediaType: message.photo ? "image" : message.video ? "video" : "text",
        isChannel: true,
        channelInfo: message.chat,
      };
    });
  }

  analyzeSentiment(text) {
    if (!text) return "neutral";
    const positiveWords = [
      "عالی",
      "خوب",
      "بهترین",
      "موفق",
      "خوشحال",
      "عاشق",
      "فوق‌العاده",
      "باحال",
      "جذاب",
      "مفید",
      "ارزشمند",
      "قشنگ",
      "زیبا",
      "پسندیده",
    ];
    const negativeWords = [
      "بد",
      "ضعیف",
      "ناراحت",
      "مشکل",
      "غلط",
      "متنفر",
      "افتضاح",
      "کسل‌کننده",
      "نامناسب",
      "ناکارآمد",
      "مضر",
      "زشت",
      "بی‌کیفیت",
    ];
    const textLower = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    positiveWords.forEach((word) => {
      if (textLower.includes(word)) positiveScore++;
    });
    negativeWords.forEach((word) => {
      if (textLower.includes(word)) negativeScore++;
    });
    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }

  exportResults(results, format = "json") {
    try {
      let dataStr;
      let mimeType;
      let extension;
      if (format === "json") {
        dataStr = JSON.stringify(results, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else if (format === "csv") {
        dataStr = this.convertToCSV(results);
        mimeType = "text/csv";
        extension = "csv";
      } else {
        throw new Error("Unsupported format");
      }
      const dataBlob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kavosh-report-${
        new Date().toISOString().split("T")[0]
      }.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Export error:", error);
      return false;
    }
  }

  convertToCSV(results) {
    if (!results.length) return "";
    const headers = [
      "ID",
      "پلتفرم",
      "نویسنده",
      "محتوا",
      "تاریخ",
      "لایک‌ها",
      "نظرات",
      "اشتراک‌گذاری",
      "احساسات",
      "نوع رسانه",
      "لینک اصلی",
    ];
    const rows = results.map((r) => [
      r.id,
      r.platform,
      r.author,
      `"${r.content.replace(/"/g, '""')}"`,
      r.date,
      r.engagement.likes || 0,
      r.engagement.comments || 0,
      r.engagement.shares || 0,
      r.sentiment === "positive"
        ? "مثبت"
        : r.sentiment === "negative"
        ? "منفی"
        : "خنثی",
      r.mediaType,
      r.originalUrl,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  async shareResults(results, query) {
    try {
      const shareData = {
        title: `نتایج جستجو کاوش: ${query}`,
        text: `${results.length} نتیجه یافت شد برای "${query}" در شبکه‌های اجتماعی`,
        url: window.location.href,
      };
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return true;
      }
      const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      console.error("Share error:", error);
      return false;
    }
  }
}

export default APIService;
