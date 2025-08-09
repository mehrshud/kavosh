import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Instagram,
  Twitter,
  Facebook,
  Send,
  MessageCircle,
  MessageSquare,
  LogOut,
  Calendar,
  Filter,
  TrendingUp,
  Bot,
  CheckCircle,
  BarChart3,
  Globe,
  FileText,
  Image,
  Video,
  Link,
  MoreHorizontal,
  Zap,
  Sparkles,
  Download,
  Share2,
  Bookmark,
  ExternalLink,
  Heart,
  Repeat2,
  RefreshCw,
  Coins,
  Star,
  ChevronDown,
  AlertCircle,
  Clock,
} from "lucide-react";

// --- Mock API Service ---
// In a real application, this would make actual HTTP requests to your backend.
const apiService = {
  testConnection: async () => {
    // Simulate network delay and possible failure
    await new Promise((res) => setTimeout(res, 500));
    return Math.random() > 0.1; // 90% chance of success
  },
  getMockResults: (platform, query, count) => {
    const results = [];
    const sentiments = ["positive", "neutral", "negative"];
    const authors = [
      "خبرگزاری فارس",
      "کاربر فعال",
      "تحلیلگر سیاسی",
      "صفحه رسمی",
      "بلاگر معروف",
    ];
    for (let i = 0; i < count; i++) {
      results.push({
        id: `${platform}-${Date.now()}-${i}`,
        platform,
        author: authors[Math.floor(Math.random() * authors.length)],
        channelTitle: `کانال ${platform}`,
        content: `این یک نتیجه آزمایشی برای جستجوی "${query}" در ${platform} است. محتوای تولید شده برای نمایش قابلیت‌ها و ظاهر برنامه است.`,
        date: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("fa-IR"),
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        mediaType: i % 3 === 0 ? "image" : "text",
        media:
          i % 3 === 0
            ? `https://picsum.photos/seed/${query}${i}/400/200`
            : null,
        engagement: {
          likes: Math.floor(Math.random() * 2000),
          comments: Math.floor(Math.random() * 500),
          shares: Math.floor(Math.random() * 100),
        },
        originalUrl: "#",
      });
    }
    return results;
  },
  searchMultiPlatform: async (query, platforms, filters, useAI, aiProvider) => {
    console.log("Searching with:", { query, platforms, filters, useAI });
    await new Promise((res) => setTimeout(res, 1500)); // Simulate search time

    // Simulate backend failure to test fallback
    if (query.toLowerCase() === "fail") {
      throw new Error("Simulated multi-platform search failure.");
    }

    let allResults = [];
    platforms.forEach((p) => {
      allResults = [...allResults, ...apiService.getMockResults(p, query, 5)];
    });

    let aiInsight = null;
    if (useAI) {
      aiInsight = `تحلیل هوش مصنوعی (${aiProvider.toUpperCase()}):
- کلیدواژه "${query}" در پلتفرم‌های ${platforms.join(
        ", "
      )} به طور گسترده‌ای مورد بحث قرار گرفته است.
- احساسات غالب، خنثی با گرایش به مثبت است که نشان‌دهنده بحث‌های متعادل است.
- بیشترین تعامل در پلتفرم اینستاگرام مشاهده شده که عمدتا به دلیل محتوای تصویری است.
- پیشنهاد می‌شود برای تحلیل عمیق‌تر، روی ترندهای زمانی و جغرافیایی تمرکز شود.`;
    }

    return { results: allResults, aiInsight };
  },
  enhanceSearchWithAI: async (query, platforms, results, aiProvider) => {
    await new Promise((res) => setTimeout(res, 1000));
    return `تحلیل هوش مصنوعی (Fallback - ${aiProvider.toUpperCase()}):
- کلیدواژه "${query}" در پلتفرم‌های ${platforms} بحث‌برانگیز بوده.
- نتایج اولیه نشان‌دهنده اهمیت بالای محتوای تصویری در این موضوع است.`;
  },
  // Individual platform searches (used in fallback)
  searchInstagram: async (query, filters) =>
    apiService.getMockResults("instagram", query, 7),
  searchTwitter: async (query, filters) =>
    apiService.getMockResults("twitter", query, 7),
  searchEitaa: async (query, filters) =>
    apiService.getMockResults("eitaa", query, 7),

  exportResults: (results, format) => {
    const dataStr =
      `data:text/${format};charset=utf-8,` +
      encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `results.${format}`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    alert(`نتایج در فرمت ${format} دانلود شد.`);
  },
  shareResults: (results, query) => {
    const shareText = `نتایج جستجو برای "${query}":\n\nتعداد ${results.length} نتیجه یافت شد. برای مشاهده کامل، به اپلیکیشن کاوش مراجعه کنید.`;
    if (navigator.share) {
      navigator.share({
        title: `نتایج جستجو: ${query}`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      alert("قابلیت اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود.");
    }
  },
};

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  // In a real app, this would be determined by a token, session, etc.
  const [user, setUser] = useState({
    name: "علی رضایی",
    searches: 50,
    aiTokens: 1000,
    plan: "Free",
  });

  const logout = () => {
    setUser(null);
    // In a real app, you'd clear tokens and redirect to a login page
    alert("شما از حساب کاربری خود خارج شدید.");
  };

  const value = { user, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

// --- Custom Dropdown Component ---
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-persian" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Icon className="w-5 h-5 text-blue-300" />
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-blue-300 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg"
          >
            <ul className="py-2">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-white hover:bg-blue-500/30 cursor-pointer flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <option.icon className="w-5 h-5" />
                  <span>{option.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- The Dashboard Component (Provided by you) ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: "week",
    contentType: "all",
    language: "fa",
    sentiment: "all",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [loadedResults, setLoadedResults] = useState(7);
  const [useAI, setUseAI] = useState(false);
  const [aiProvider, setAiProvider] = useState("openai");
  const [aiInsight, setAiInsight] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [userStats, setUserStats] = useState({
    searches: user?.searches || 50,
    aiTokens: user?.aiTokens || 1000,
    plan: user?.plan || "Free",
  });

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      setConnectionStatus(isConnected ? "connected" : "disconnected");
    } catch (error) {
      setConnectionStatus("disconnected");
      console.error("Backend connection failed:", error);
    }
  };

  const platforms = [
    {
      id: "instagram",
      name: "اینستاگرام",
      icon: Instagram,
      color: "from-pink-500 to-purple-600",
      features: ["جستجو", "تحلیل کاربر", "آمار پست"],
    },
    {
      id: "twitter",
      name: "توییتر",
      icon: Twitter,
      color: "from-blue-400 to-blue-600",
      features: ["جستجو", "تحلیل ترند", "فالوور"],
    },
    {
      id: "facebook",
      name: "فیسبوک",
      icon: Facebook,
      color: "from-blue-600 to-blue-800",
      features: ["جستجو", "صفحات", "گروه‌ها"],
    },
    {
      id: "telegram",
      name: "تلگرام",
      icon: Send,
      color: "from-sky-400 to-sky-600",
      features: ["کانال‌ها", "گروه‌ها", "پیام‌ها"],
    },
    {
      id: "eitaa",
      name: "ایتا",
      icon: MessageCircle,
      color: "from-green-500 to-green-700",
      features: ["کانال‌ها", "محتوا", "آمار", "اعضا"],
    },
    {
      id: "rubika",
      name: "روبیکا",
      icon: MessageSquare,
      color: "from-red-500 to-red-700",
      features: ["کانال‌ها", "پیام‌ها", "فایل‌ها"],
    },
  ];

  const dateRangeOptions = [
    { value: "today", label: "امروز", icon: Clock },
    { value: "week", label: "یک هفته", icon: Calendar },
    { value: "month", label: "یک ماه", icon: Calendar },
    { value: "year", label: "یک سال", icon: Calendar },
    { value: "all", label: "همه", icon: Globe },
  ];

  const contentTypeOptions = [
    { value: "all", label: "همه", icon: Globe },
    { value: "text", label: "متن", icon: FileText },
    { value: "image", label: "تصویر", icon: Image },
    { value: "video", label: "ویدیو", icon: Video },
    { value: "link", label: "لینک", icon: Link },
  ];

  const sentimentOptions = [
    { value: "all", label: "همه", icon: MoreHorizontal },
    { value: "positive", label: "مثبت", icon: TrendingUp },
    { value: "neutral", label: "خنثی", icon: MoreHorizontal },
    { value: "negative", label: "منفی", icon: TrendingUp },
  ];

  const aiProviderOptions = [
    { value: "openai", label: "OpenAI GPT", icon: Bot },
    { value: "gemini", label: "Google Gemini", icon: Zap },
  ];

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedPlatforms.length === 0) return;
    if (userStats.searches <= 0) {
      alert("تعداد جستجوهای شما تمام شده است");
      return;
    }

    setIsSearching(true);
    setActiveTab("results");
    setLoadedResults(7);
    setAiInsight("");

    try {
      // Use the new multi-platform search endpoint
      const searchResponse = await apiService.searchMultiPlatform(
        searchQuery,
        selectedPlatforms,
        filters,
        useAI,
        aiProvider
      );

      setSearchResults(searchResponse.results || []);

      if (searchResponse.aiInsight) {
        setAiInsight(searchResponse.aiInsight);
        setUserStats((prev) => ({ ...prev, aiTokens: prev.aiTokens - 100 }));
      }

      setUserStats((prev) => ({ ...prev, searches: prev.searches - 1 }));
    } catch (error) {
      console.error("Search error:", error);

      // Fallback to individual platform searches if multi-search fails
      try {
        let allResults = [];

        for (const platform of selectedPlatforms) {
          let platformResults = [];

          switch (platform) {
            case "instagram":
              platformResults = await apiService.searchInstagram(
                searchQuery,
                filters
              );
              break;
            case "twitter":
              platformResults = await apiService.searchTwitter(
                searchQuery,
                filters
              );
              break;
            case "eitaa":
              platformResults = await apiService.searchEitaa(
                searchQuery,
                filters
              );
              break;
            default:
              platformResults = apiService.getMockResults(
                platform,
                searchQuery,
                7
              );
          }

          allResults = [...allResults, ...platformResults];
        }

        setSearchResults(allResults);

        // Try AI Enhancement separately if backend multi-search failed
        if (useAI && userStats.aiTokens > 0 && allResults.length > 0) {
          try {
            const insight = await apiService.enhanceSearchWithAI(
              searchQuery,
              selectedPlatforms.join(", "),
              allResults,
              aiProvider
            );
            setAiInsight(insight);
            setUserStats((prev) => ({
              ...prev,
              aiTokens: prev.aiTokens - 100,
            }));
          } catch (aiError) {
            console.error("AI Enhancement failed:", aiError);
          }
        }

        setUserStats((prev) => ({ ...prev, searches: prev.searches - 1 }));
      } catch (fallbackError) {
        console.error("Fallback search failed:", fallbackError);
        // Final fallback to mock data
        const mockResults = apiService.getMockResults(
          "instagram",
          searchQuery,
          7
        );
        setSearchResults(mockResults);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = async () => {
    try {
      // Try to load more from backend first
      const additionalResults = await apiService.searchMultiPlatform(
        searchQuery,
        selectedPlatforms,
        { ...filters, offset: loadedResults, limit: 5 }
      );

      if (additionalResults.results?.length > 0) {
        setSearchResults((prev) => [...prev, ...additionalResults.results]);
      } else {
        // Fallback to mock data
        const mockResults = apiService.getMockResults(
          "instagram",
          searchQuery,
          5
        );
        setSearchResults((prev) => [...prev, ...mockResults]);
      }
    } catch (error) {
      console.error("Load more error:", error);
      // Fallback to mock data
      const mockResults = apiService.getMockResults(
        "instagram",
        searchQuery,
        5
      );
      setSearchResults((prev) => [...prev, ...mockResults]);
    }

    setLoadedResults((prev) => prev + 5);
  };

  const handleExport = (format = "json") => {
    apiService.exportResults(searchResults, format);
  };

  const handleShare = () => {
    apiService.shareResults(searchResults, searchQuery);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getSentimentLabel = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "مثبت";
      case "negative":
        return "منفی";
      default:
        return "خنثی";
    }
  };

  const getPlatformIcon = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform ? platform.icon : MessageCircle;
  };

  const getMediaTypeIcon = (mediaType) => {
    switch (mediaType) {
      case "video":
        return Video;
      case "image":
        return Image;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <motion.div
                className="flex items-center space-x-3 rtl:space-x-reverse"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-persian">
                    کاوش
                  </h1>
                  <p className="text-xs text-blue-300 font-persian">
                    نسخه پیشرفته
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Backend Connection Status */}
              <div
                className={`bg-white/10 rounded-xl px-3 py-2 border border-white/20 flex items-center space-x-2 rtl:space-x-reverse ${
                  connectionStatus === "connected"
                    ? "border-green-400/50"
                    : connectionStatus === "disconnected"
                    ? "border-red-400/50"
                    : "border-yellow-400/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-400"
                      : connectionStatus === "disconnected"
                      ? "bg-red-400"
                      : "bg-yellow-400 animate-pulse"
                  }`}
                />
                <span className="text-sm text-white font-persian">
                  {connectionStatus === "connected"
                    ? "متصل"
                    : connectionStatus === "disconnected"
                    ? "قطع"
                    : "در حال بررسی..."}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/20">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white font-persian">
                    {userStats.searches} جستجو
                  </span>
                </div>
              </div>

              {useAI && (
                <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/20">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white font-persian">
                      {userStats.aiTokens} توکن
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/20">
                <span className="text-sm text-green-400 font-persian">
                  {userStats.plan}
                </span>
              </div>

              <motion.button
                onClick={logout}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 font-persian">
            خوش آمدید {user?.name}
          </h2>
          <p className="text-xl text-blue-200 font-persian">
            با هوش مصنوعی در شبکه‌های اجتماعی جستجو کنید
          </p>
          {connectionStatus === "disconnected" && (
            <motion.div
              className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 text-sm font-persian mr-2">
                  اتصال به سرور قطع است - از داده‌های آزمایشی استفاده می‌شود
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
            <div className="flex space-x-2 rtl:space-x-reverse">
              {[
                { id: "search", label: "جستجو", icon: Search },
                { id: "results", label: "نتایج", icon: BarChart3 },
                { id: "analytics", label: "آمار", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-xl font-persian font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Search Form Container */}
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl relative z-10"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-white mb-3 font-persian">
                    جستجوی هوشمند
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="متن یا موضوع مورد نظر خود را وارد کنید..."
                      className="w-full px-6 py-4 pl-24 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-persian text-right text-lg"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <motion.button
                      onClick={handleSearch}
                      disabled={
                        !searchQuery.trim() ||
                        selectedPlatforms.length === 0 ||
                        isSearching ||
                        userStats.searches <= 0
                      }
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-persian font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSearching ? (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span className="mr-2">جستجو...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Sparkles className="w-4 h-4" />
                          <span className="mr-1">جستجو</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-white mb-4 font-persian">
                    انتخاب پلتفرم‌ها
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {platforms.map((platform) => (
                      <motion.div
                        key={platform.id}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 ${
                          selectedPlatforms.includes(platform.id)
                            ? "border-blue-400 bg-blue-500/20"
                            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                        }`}
                        onClick={() => handlePlatformToggle(platform.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${platform.color}`}
                          >
                            <platform.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white font-persian">
                              {platform.name}
                            </h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {platform.features
                                .slice(0, 2)
                                .map((feature, i) => (
                                  <span
                                    key={i}
                                    className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-lg"
                                  >
                                    {feature}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        {selectedPlatforms.includes(platform.id) && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 font-persian">
                      بازه زمانی
                    </label>
                    <CustomDropdown
                      value={filters.dateRange}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, dateRange: value }))
                      }
                      options={dateRangeOptions}
                      placeholder="انتخاب بازه"
                      icon={Calendar}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 font-persian">
                      نوع محتوا
                    </label>
                    <CustomDropdown
                      value={filters.contentType}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, contentType: value }))
                      }
                      options={contentTypeOptions}
                      placeholder="انتخاب نوع"
                      icon={Filter}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 font-persian">
                      احساسات
                    </label>
                    <CustomDropdown
                      value={filters.sentiment}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, sentiment: value }))
                      }
                      options={sentimentOptions}
                      placeholder="انتخاب احساس"
                      icon={TrendingUp}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 font-persian">
                      زبان
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          language: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian"
                    >
                      <option value="fa" className="bg-gray-800">
                        فارسی
                      </option>
                      <option value="en" className="bg-gray-800">
                        انگلیسی
                      </option>
                      <option value="ar" className="bg-gray-800">
                        عربی
                      </option>
                    </select>
                  </div>
                </div>

                {/* AI Enhancement Toggle */}
                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        useAI
                          ? "bg-gradient-to-r from-purple-500 to-pink-600"
                          : "bg-white/20"
                      }`}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-persian">
                        تحلیل هوش مصنوعی
                      </h3>
                      <p className="text-sm text-blue-200 font-persian">
                        بینش‌های پیشرفته از نتایج (100 توکن)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {useAI && (
                      <CustomDropdown
                        value={aiProvider}
                        onChange={setAiProvider}
                        options={aiProviderOptions}
                        placeholder="انتخاب AI"
                        icon={Zap}
                      />
                    )}
                    <motion.button
                      onClick={() => setUseAI(!useAI)}
                      className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                        useAI ? "bg-blue-500" : "bg-white/20"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: useAI ? 32 : 4 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {searchResults.length > 0 ? (
                <>
                  {/* Search Summary */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-blue-500/20 rounded-xl p-3">
                          <Search className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white font-persian">
                            نتایج جستجو برای "{searchQuery}"
                          </h3>
                          <p className="text-blue-200 font-persian">
                            {searchResults.length} نتیجه یافت شد از{" "}
                            {selectedPlatforms.length} پلتفرم
                            {connectionStatus === "disconnected" &&
                              " (آزمایشی)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <motion.button
                          onClick={() => handleExport("json")}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          <span className="font-persian mr-2">دانلود</span>
                        </motion.button>
                        <motion.button
                          onClick={handleShare}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="font-persian mr-2">اشتراک</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Insight */}
                  {aiInsight && (
                    <motion.div
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-purple-400/30"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div className="bg-purple-500/30 rounded-xl p-3">
                          <Bot className="w-6 h-6 text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-3 font-persian">
                            تحلیل هوش مصنوعی ({aiProvider.toUpperCase()})
                          </h3>
                          <div className="text-purple-100 leading-relaxed font-persian whitespace-pre-wrap">
                            {aiInsight}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Results List */}
                  <div className="space-y-4">
                    {searchResults
                      .slice(0, loadedResults)
                      .map((result, index) => {
                        const PlatformIcon = getPlatformIcon(result.platform);
                        const MediaIcon = getMediaTypeIcon(result.mediaType);

                        return (
                          <motion.div
                            key={result.id}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                              {/* Platform Icon */}
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                                  platforms.find(
                                    (p) => p.id === result.platform
                                  )?.color || "from-gray-500 to-gray-700"
                                }`}
                              >
                                <PlatformIcon className="w-6 h-6 text-white" />
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <span className="font-semibold text-white font-persian">
                                      {result.author}
                                    </span>
                                    {result.channelTitle && (
                                      <span className="text-blue-300 font-persian text-sm">
                                        از {result.channelTitle}
                                      </span>
                                    )}
                                    <span className="text-gray-400 text-sm">
                                      {result.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <MediaIcon className="w-4 h-4 text-blue-300" />
                                    <span
                                      className={`text-sm font-persian ${getSentimentColor(
                                        result.sentiment
                                      )}`}
                                    >
                                      {getSentimentLabel(result.sentiment)}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-white leading-relaxed mb-4 font-persian">
                                  {result.content}
                                </p>

                                {/* Media Preview */}
                                {result.media && (
                                  <div className="mb-4">
                                    {result.mediaType === "image" ? (
                                      <img
                                        src={result.media}
                                        alt="Content media"
                                        className="w-full h-48 object-cover rounded-xl"
                                        loading="lazy"
                                      />
                                    ) : result.mediaType === "video" ? (
                                      <div className="w-full h-48 bg-black/50 rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                          <Video className="w-12 h-12 text-white mx-auto mb-2" />
                                          <p className="text-white font-persian">
                                            ویدیو
                                          </p>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                )}

                                {/* Engagement Stats */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <Heart className="w-4 h-4 text-red-400" />
                                      <span className="text-sm text-gray-300">
                                        {result.engagement?.likes?.toLocaleString() ||
                                          result.engagement?.views?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <MessageSquare className="w-4 h-4 text-blue-400" />
                                      <span className="text-sm text-gray-300">
                                        {result.engagement?.comments?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <Repeat2 className="w-4 h-4 text-green-400" />
                                      <span className="text-sm text-gray-300">
                                        {result.engagement?.shares?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <motion.button
                                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Bookmark className="w-4 h-4" />
                                    </motion.button>
                                    <motion.a
                                      href={result.originalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </motion.a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Load More Button */}
                  {loadedResults < searchResults.length && (
                    <motion.div
                      className="text-center mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        onClick={loadMoreResults}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-persian font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <RefreshCw className="w-5 h-5" />
                          <span className="mr-2">نمایش بیشتر</span>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md mx-auto">
                    <Search className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2 font-persian">
                      هنوز جستجویی انجام نشده
                    </h3>
                    <p className="text-blue-200 font-persian">
                      از تب جستجو برای یافتن محتوا استفاده کنید
                    </p>
                    <motion.button
                      onClick={() => setActiveTab("search")}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-persian font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      شروع جستجو
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Search Stats */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-persian">
                        جستجوهای انجام شده
                      </h3>
                      <p className="text-2xl font-bold text-blue-400">
                        {50 - userStats.searches}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* AI Usage */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-persian">
                        توکن‌های مصرفی
                      </h3>
                      <p className="text-2xl font-bold text-purple-400">
                        {1000 - userStats.aiTokens}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Results Found */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-persian">
                        نتایج یافت شده
                      </h3>
                      <p className="text-2xl font-bold text-green-400">
                        {searchResults.length}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Backend Status */}
                <motion.div
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border ${
                    connectionStatus === "connected"
                      ? "border-green-400/30"
                      : "border-red-400/30"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${
                        connectionStatus === "connected"
                          ? "from-green-500 to-emerald-600"
                          : "from-red-500 to-red-700"
                      } rounded-xl flex items-center justify-center`}
                    >
                      {connectionStatus === "connected" ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-persian">
                        وضعیت سرور
                      </h3>
                      <p
                        className={`text-xl font-bold ${
                          connectionStatus === "connected"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {connectionStatus === "connected" ? "متصل" : "قطع"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Platform Usage Chart */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 font-persian">
                    استفاده از پلتفرم‌ها
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {platforms.map((platform, index) => (
                      <motion.div
                        key={platform.id}
                        className="bg-white/5 rounded-xl p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${platform.color}`}
                          >
                            <platform.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-persian">
                            {platform.name}
                          </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${platform.color}`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                selectedPlatforms.includes(platform.id) &&
                                searchResults.length > 0
                                  ? Math.floor(Math.random() * 50) + 30
                                  : Math.floor(Math.random() * 20) + 5
                              }%`,
                            }}
                            transition={{
                              delay: index * 0.2,
                              duration: 0.8,
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Account Plan */}
                <motion.div
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white font-persian">
                          حساب کاربری {userStats.plan}
                        </h3>
                        <p className="text-yellow-200 font-persian">
                          {userStats.searches} جستجو و {userStats.aiTokens} توکن
                          باقی‌مانده
                        </p>
                      </div>
                    </div>
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-persian font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ارتقاء حساب
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
