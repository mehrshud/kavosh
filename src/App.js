import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Send,
  MessageSquare,
  LogOut,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  BarChart3,
  Globe,
  Star,
  Clock,
  Download,
  Share2,
  Heart,
  Repeat2,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Bot,
  Coins,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Link,
  Sparkles,
  UserCheck,
} from "lucide-react";

// Firebase Configuration
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Import the API service
import apiService from "./services/apiService";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- Authentication Context ---

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          // Create a new user doc if it doesn't exist (e.g., first Google login)
          const newUser = {
            name: firebaseUser.displayName || "کاربر جدید",
            email: firebaseUser.email,
            plan: "Free",
            searches: 50,
            aiTokens: 1000,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newUser);
          setUser({ uid: firebaseUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  };

  const logout = () => signOut(auth);

  const value = { user, login, loginWithGoogle, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- UI Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <motion.div
      className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative font-persian z-20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {Icon && <Icon className="w-5 h-5 text-blue-300" />}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-blue-300 transition-transform" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 w-full bg-slate-800/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
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
                  {option.icon && <option.icon className="w-5 h-5" />}
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

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async (action) => {
    setLoading(true);
    setError("");
    try {
      await action();
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError("ایمیل یا رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuthAction(() => login(formData.email, formData.password));
  };

  const handleGoogleLogin = () => {
    handleAuthAction(loginWithGoogle);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-500/30 border-2 border-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            <UserCheck className="w-10 h-10 text-green-300" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white font-persian">
            ورود موفق!
          </h2>
          <p className="text-blue-200 font-persian">
            در حال انتقال به داشبورد...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4">
            <Search className="w-12 h-12 text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold text-white font-persian">کاوش</h1>
          <p className="text-blue-200 font-persian mt-2">
            پلتفرم هوشمند جستجوی شبکه‌های اجتماعی
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center font-persian">
            ورود به حساب
          </h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 text-center text-red-200 text-sm font-persian">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="ایمیل"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian text-right"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian text-right"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-persian font-semibold disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </motion.button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-blue-200 text-sm font-persian">یا</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          <motion.button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-persian hover:bg-white/20 flex items-center justify-center space-x-3 rtl:space-x-reverse"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>ورود با گوگل</span>
          </motion.button>
          <div className="mt-6 text-center text-sm font-persian text-blue-300">
            برای تست: demo@kavosh.ir | رمز: demo123456
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Dashboard with real API integration
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
  const [loadedResults, setLoadedResults] = useState(10);
  const [useAI, setUseAI] = useState(false);
  const [aiProvider, setAiProvider] = useState("openai");
  const [aiInsight, setAiInsight] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [userStats, setUserStats] = useState({
    searches: user?.searches || 50,
    aiTokens: user?.aiTokens || 1000,
    plan: user?.plan || "Free",
  });
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    setUserStats({
      searches: user?.searches || 50,
      aiTokens: user?.aiTokens || 1000,
      plan: user?.plan || "Free",
    });
    checkBackendConnection();
  }, [user]);

  const checkBackendConnection = async () => {
    try {
      console.log("Checking backend connection...");
      const response = await apiService.checkHealth();
      console.log("Health check response:", response);
      setConnectionStatus(
        response.status === "healthy" ? "connected" : "disconnected"
      );
    } catch (error) {
      console.error("Backend connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const platforms = [
    {
      id: "instagram",
      name: "اینستاگرام",
      icon: Instagram,
      color: "from-pink-500 to-purple-600",
      features: ["پست‌ها", "کاربران", "هشتگ‌ها"],
    },
    {
      id: "twitter",
      name: "توییتر",
      icon: Twitter,
      color: "from-blue-400 to-blue-600",
      features: ["توییت‌ها", "ترندها", "کاربران"],
    },
    {
      id: "facebook",
      name: "فیسبوک",
      icon: Facebook,
      color: "from-blue-600 to-blue-800",
      features: ["پست‌ها", "صفحات", "گروه‌ها"],
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
      features: ["کانال‌ها", "محتوا", "آمار"],
    },
    {
      id: "rubika",
      name: "روبیکا",
      icon: MessageSquare,
      color: "from-red-500 to-red-700",
      features: ["کانال‌ها", "روبینو", "پیام‌ها"],
    },
  ];

  const dateRangeOptions = [
    { value: "today", label: "امروز", icon: Clock },
    { value: "week", label: "یک هفته", icon: Calendar },
    { value: "month", label: "یک ماه", icon: Calendar },
  ];

  const contentTypeOptions = [
    { value: "all", label: "همه", icon: Globe },
    { value: "text", label: "متن", icon: FileText },
    { value: "image", label: "تصویر", icon: Image },
    { value: "video", label: "ویدیو", icon: Video },
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

  // Transform API response to match UI format
  const transformApiResults = (apiResults) => {
    const results = [];

    if (apiResults.platforms) {
      Object.entries(apiResults.platforms).forEach(
        ([platform, platformData]) => {
          if (platformData.success && platformData.results) {
            platformData.results.forEach((item) => {
              results.push({
                id: item.id || `${platform}_${Date.now()}_${Math.random()}`,
                platform: platform,
                content: item.text || item.content || "",
                author:
                  typeof item.author === "object"
                    ? item.author.username || item.author.name || "Unknown"
                    : item.author || "Unknown",
                date:
                  item.created_at ||
                  item.date ||
                  new Date().toLocaleDateString("fa-IR"),
                engagement: {
                  likes: item.metrics?.likes || item.likes || 0,
                  comments: item.metrics?.replies || item.comments || 0,
                  shares: item.metrics?.retweets || item.shares || 0,
                  views: item.metrics?.views || item.views || 0,
                },
                sentiment: ["positive", "neutral", "negative"][
                  Math.floor(Math.random() * 3)
                ],
                media: item.media_url || null,
                originalUrl: item.url || "#",
                mediaType:
                  item.media_type || (item.media_url ? "image" : "text"),
              });
            });
          }
        }
      );
    }

    return results;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedPlatforms.length === 0) {
      setError("لطفاً عبارت جستجو و حداقل یک پلتفرم را انتخاب کنید.");
      return;
    }

    if (userStats.searches <= 0) {
      setError("تعداد جستجوهای شما به پایان رسیده است.");
      return;
    }

    setIsSearching(true);
    setActiveTab("results");
    setLoadedResults(10);
    setAiInsight("");
    setError("");

    try {
      console.log(
        "Starting search with query:",
        searchQuery,
        "platforms:",
        selectedPlatforms
      );

      let searchResult;

      if (useAI) {
        // Use AI-enhanced search
        searchResult = await apiService.searchWithAI(
          searchQuery,
          selectedPlatforms,
          20,
          aiProvider
        );

        if (searchResult.success && searchResult.aiAnalysis) {
          setAiInsight(
            typeof searchResult.aiAnalysis === "string"
              ? searchResult.aiAnalysis
              : JSON.stringify(searchResult.aiAnalysis, null, 2)
          );
          setUserStats((prev) => ({ ...prev, aiTokens: prev.aiTokens - 100 }));
        }
      } else {
        // Use regular multi-platform search
        searchResult = await apiService.searchMultiple(
          searchQuery,
          selectedPlatforms,
          20
        );
      }

      console.log("Search result:", searchResult);

      if (searchResult.success) {
        const transformedResults = transformApiResults(searchResult.data);
        setSearchResults(transformedResults);

        // Add to search history
        const newSearch = {
          id: Date.now(),
          query: searchQuery,
          platforms: selectedPlatforms,
          timestamp: new Date().toISOString(),
          resultsCount: transformedResults.length,
        };
        setSearchHistory((prev) => [newSearch, ...prev.slice(0, 9)]); // Keep last 10 searches

        setUserStats((prev) => ({ ...prev, searches: prev.searches - 1 }));
      } else {
        throw new Error(searchResult.error || "Search failed");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError(`خطا در جستجو: ${error.message}`);

      // Fallback to mock data for development
      console.log("Falling back to mock data due to API error");
      const mockResults = Array.from({ length: 5 }, (_, i) => ({
        id: `mock_${Date.now()}_${i}`,
        platform: selectedPlatforms[0] || "twitter",
        content: `محتوای آزمایشی مرتبط با "${searchQuery}" - نمونه شماره ${
          i + 1
        }`,
        author: `@user_${i + 1}`,
        date: new Date(Date.now() - i * 3600000).toLocaleDateString("fa-IR"),
        engagement: {
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 5000),
        },
        sentiment: ["positive", "neutral", "negative"][
          Math.floor(Math.random() * 3)
        ],
        media: i % 3 === 0 ? `https://picsum.photos/400/200?random=${i}` : null,
        originalUrl: "#",
        mediaType: i % 4 === 0 ? "video" : i % 3 === 0 ? "image" : "text",
      }));

      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = () => {
    setLoadedResults((prev) => prev + 5);
  };

  const getSentimentColor = (sentiment) =>
    ({
      positive: "text-green-400",
      negative: "text-red-400",
      neutral: "text-yellow-400",
    }[sentiment] || "text-gray-400");

  const getSentimentLabel = (sentiment) =>
    ({
      positive: "مثبت",
      negative: "منفی",
      neutral: "خنثی",
    }[sentiment] || "نامشخص");

  const getPlatformIcon = (platformId) =>
    platforms.find((p) => p.id === platformId)?.icon || MessageCircle;

  const getMediaTypeIcon = (mediaType) =>
    ({
      video: Video,
      image: Image,
      CAROUSEL_ALBUM: Image,
    }[mediaType] || FileText);

  const exportResults = () => {
    const dataStr = JSON.stringify(searchResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kavosh-search-${searchQuery}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `نتایج جستجو برای: ${searchQuery}`,
          text: `تعداد ${searchResults.length} نتیجه برای "${searchQuery}" یافت شد.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("لینک صفحه کپی شد!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <motion.header
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-persian">کاوش</h1>
              <p className="text-xs text-blue-300 font-persian">نسخه پیشرفته</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div
              title={`وضعیت سرور: ${connectionStatus}`}
              className={`p-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500/20"
                  : "bg-red-500/20"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              ></div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 text-sm flex items-center space-x-2 rtl:space-x-reverse">
              <Search className="w-4 h-4 text-blue-300" />
              <span className="font-persian">{userStats.searches}</span>
            </div>
            {useAI && (
              <div className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 text-sm flex items-center space-x-2 rtl:space-x-reverse">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span className="font-persian">{userStats.aiTokens}</span>
              </div>
            )}
            <div className="bg-green-500/20 text-green-300 rounded-xl px-3 py-1.5 border border-green-400/30 text-sm font-persian">
              {userStats.plan}
            </div>
            <motion.button
              onClick={logout}
              className="p-2 text-red-400 hover:bg-white/10 rounded-xl"
              whileHover={{ scale: 1.1 }}
            >
              <LogOut />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold font-persian">
            خوش آمدید، {user?.name}
          </h2>
          <p className="text-xl text-blue-200 font-persian mt-2">
            با هوش مصنوعی در شبکه‌های اجتماعی جستجو کنید
          </p>
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-center text-red-200 text-sm font-persian">
              {error}
            </div>
          )}
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 flex space-x-2 rtl:space-x-reverse">
            {[
              { id: "search", label: "جستجو", icon: Search },
              { id: "results", label: "نتایج", icon: BarChart3 },
              { id: "analytics", label: "آمار", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-persian font-medium transition-colors duration-300 ${
                  activeTab !== tab.id && "hover:bg-white/10"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2 rtl:space-x-reverse">
                  <tab.icon />
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "search" && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="عبارت مورد نظر..."
                    className="w-full text-lg px-6 py-4 pr-14 bg-white/5 border border-white/20 rounded-2xl placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian text-right"
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300" />
                  <motion.button
                    onClick={handleSearch}
                    disabled={
                      !searchQuery ||
                      selectedPlatforms.length === 0 ||
                      isSearching
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-xl font-persian disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSearching ? "در حال جستجو..." : "جستجو"}
                  </motion.button>
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-semibold mb-4 font-persian">
                    انتخاب پلتفرم‌ها
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {platforms.map((p) => (
                      <motion.div
                        key={p.id}
                        onClick={() => handlePlatformToggle(p.id)}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          selectedPlatforms.includes(p.id)
                            ? "border-blue-400 bg-blue-500/20"
                            : "border-white/20 bg-white/5 hover:bg-white/10"
                        }`}
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${p.color}`}
                          >
                            <p.icon size={28} />
                          </div>
                          <h3 className="font-semibold mt-3 font-persian">
                            {p.name}
                          </h3>
                        </div>
                        {selectedPlatforms.includes(p.id) && (
                          <motion.div
                            layoutId={`check-${p.id}`}
                            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle size={16} />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <CustomDropdown
                    value={filters.dateRange}
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, dateRange: v }))
                    }
                    options={dateRangeOptions}
                    placeholder="بازه زمانی"
                    icon={Calendar}
                  />
                  <CustomDropdown
                    value={filters.contentType}
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, contentType: v }))
                    }
                    options={contentTypeOptions}
                    placeholder="نوع محتوا"
                    icon={Filter}
                  />
                  <CustomDropdown
                    value={filters.sentiment}
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, sentiment: v }))
                    }
                    options={sentimentOptions}
                    placeholder="احساسات"
                    icon={TrendingUp}
                  />
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        useAI
                          ? "bg-gradient-to-r from-purple-500 to-pink-600"
                          : "bg-white/20"
                      }`}
                    >
                      <Bot size={28} />
                    </div>
                    <div>
                      <h3 className="font-semibold font-persian">
                        تحلیل هوش مصنوعی
                      </h3>
                      <p className="text-sm text-blue-200 font-persian">
                        بینش‌های پیشرفته از نتایج (۱۰۰ توکن)
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
                    <button
                      onClick={() => setUseAI(!useAI)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        useAI ? "bg-blue-500" : "bg-white/20"
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full absolute top-1"
                        animate={{ x: useAI ? 28 : 4 }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              key="results-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20 flex justify-between items-center">
                    <h3 className="text-lg font-semibold font-persian">
                      نتایج برای "{searchQuery}" ({searchResults.length} مورد)
                    </h3>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={exportResults}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 flex items-center space-x-2 rtl:space-x-reverse font-persian"
                      >
                        <Download size={16} />
                        <span>دانلود</span>
                      </button>
                      <button
                        onClick={shareResults}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 flex items-center space-x-2 rtl:space-x-reverse font-persian"
                      >
                        <Share2 size={16} />
                        <span>اشتراک</span>
                      </button>
                    </div>
                  </div>

                  {aiInsight && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl p-6 mb-6 border border-purple-400/30">
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div className="bg-purple-500/30 rounded-xl p-3">
                          <Bot className="text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 font-persian">
                            تحلیل هوش مصنوعی
                          </h3>
                          <p className="leading-relaxed font-persian whitespace-pre-wrap">
                            {aiInsight}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {searchResults
                      .slice(0, loadedResults)
                      .map((result, index) => (
                        <motion.div
                          key={result.id}
                          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start space-x-4 rtl:space-x-reverse">
                            <div
                              className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-r ${
                                platforms.find((p) => p.id === result.platform)
                                  ?.color
                              }`}
                            >
                              {React.createElement(
                                getPlatformIcon(result.platform)
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  <span className="font-semibold font-persian">
                                    {result.author}
                                  </span>
                                  <span className="text-gray-400 text-sm">
                                    {result.date}
                                  </span>
                                </div>
                                <div
                                  className={`text-sm font-persian px-2 py-1 rounded-full flex items-center space-x-1 rtl:space-x-reverse ${getSentimentColor(
                                    result.sentiment
                                  )
                                    .replace("text-", "bg-")
                                    .replace(
                                      "-400",
                                      "/20"
                                    )} ${getSentimentColor(result.sentiment)}`}
                                >
                                  {React.createElement(
                                    getMediaTypeIcon(result.mediaType),
                                    { size: 14 }
                                  )}
                                  <span>
                                    {getSentimentLabel(result.sentiment)}
                                  </span>
                                </div>
                              </div>
                              <p className="leading-relaxed mb-4 font-persian">
                                {result.content}
                              </p>
                              {result.media && (
                                <img
                                  src={result.media}
                                  alt=""
                                  className="w-full h-48 object-cover rounded-xl mb-4"
                                />
                              )}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-6 rtl:space-x-reverse text-gray-300 text-sm">
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Heart size={16} className="text-red-400" />
                                    <span>
                                      {result.engagement?.likes?.toLocaleString() ||
                                        0}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <MessageSquare
                                      size={16}
                                      className="text-blue-400"
                                    />
                                    <span>
                                      {result.engagement?.comments?.toLocaleString() ||
                                        0}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Repeat2
                                      size={16}
                                      className="text-green-400"
                                    />
                                    <span>
                                      {result.engagement?.shares?.toLocaleString() ||
                                        0}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                                    <Bookmark size={16} />
                                  </button>
                                  <a
                                    href={result.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  {loadedResults < searchResults.length && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMoreResults}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-persian font-semibold"
                      >
                        نمایش بیشتر
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white/10 rounded-3xl p-8 max-w-md mx-auto">
                    <Search className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold font-persian">
                      هنوز جستجویی انجام نشده
                    </h3>
                    <p className="text-blue-200 font-persian mt-2">
                      از تب جستجو برای یافتن محتوا استفاده کنید.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-2xl p-6 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Search />
                  </div>
                  <div>
                    <h3 className="font-persian">جستجوهای انجام شده</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {50 - userStats.searches}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Bot />
                  </div>
                  <div>
                    <h3 className="font-persian">توکن‌های مصرفی</h3>
                    <p className="text-2xl font-bold text-purple-400">
                      {1000 - userStats.aiTokens}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp />
                  </div>
                  <div>
                    <h3 className="font-persian">نتایج یافت شده</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {searchResults.length}
                    </p>
                  </div>
                </div>

                {/* Search History */}
                <div className="md:col-span-2 lg:col-span-3 bg-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold font-persian mb-4">
                    تاریخچه جستجو
                  </h3>
                  <div className="space-y-3">
                    {searchHistory.length > 0 ? (
                      searchHistory.map((search) => (
                        <div
                          key={search.id}
                          className="flex justify-between items-center p-3 bg-white/5 rounded-xl"
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Search className="w-4 h-4 text-blue-300" />
                            <span className="font-persian">{search.query}</span>
                            <span className="text-sm text-gray-400">
                              {search.platforms.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-400">
                            <span>{search.resultsCount} نتیجه</span>
                            <span>
                              {new Date(search.timestamp).toLocaleDateString(
                                "fa-IR"
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 font-persian py-8">
                        هنوز جستجویی انجام نشده است
                      </p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 bg-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold font-persian mb-4">
                    استفاده از پلتفرم‌ها
                  </h3>
                  <div className="space-y-4">
                    {platforms.map((p) => (
                      <div key={p.id}>
                        <div className="flex justify-between items-center mb-1 font-persian text-sm">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <p.icon size={16} />
                            <span>{p.name}</span>
                          </span>
                          <span>
                            {
                              searchResults.filter((r) => r.platform === p.id)
                                .length
                            }
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${p.color}`}
                            style={{
                              width: `${
                                searchResults.length > 0
                                  ? (searchResults.filter(
                                      (r) => r.platform === p.id
                                    ).length /
                                      searchResults.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- App Structure and Routing ---

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
};

export default App;
