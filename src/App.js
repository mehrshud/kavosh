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
  Activity,
  PieChart,
  Users,
  Target,
  Award,
  Flame,
  Coffee,
  ThumbsUp,
  ThumbsDown,
  Minus,
  History,
  Info,
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
          const newUser = {
            name: firebaseUser.displayName || "کاربر جدید",
            email: firebaseUser.email,
            plan: "Premium",
            searches: 500,
            aiTokens: 10000,
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

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  const value = { user, login, loginWithGoogle, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- UI Components ---
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-16 h-16 border-4 border-purple-400 border-b-transparent rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </div>
);

// --- NEW: Animatic Progress Bar Component ---
const SearchProgressBar = ({ progress, statusText }) => (
  <motion.div
    className="w-full bg-white/10 rounded-full h-6 my-4 border border-white/20 relative overflow-hidden"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    <motion.div
      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
      initial={{ width: "0%" }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-0 left-0 h-full w-full bg-repeat-x opacity-20"
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
        backgroundSize: "40px 40px",
      }}
      animate={{ backgroundPositionX: ["0px", "40px"] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-sm font-bold text-white font-persian text-shadow">
        {statusText}
      </p>
    </div>
  </motion.div>
);

// --- NEW: Animatic Alert Component ---
const AnimaticAlert = ({ message, icon, color, onConfirm, onCancel }) => (
  <motion.div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-slate-800/80 border border-white/20 rounded-2xl p-6 text-center max-w-sm w-full"
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${color}-border`}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {React.createElement(icon, { className: `w-8 h-8 ${color}-text` })}
      </motion.div>
      <p className="text-white font-persian text-lg mb-6">{message}</p>
      <div className="flex justify-center space-x-4 rtl:space-x-reverse">
        {onCancel && (
          <motion.button
            onClick={onCancel}
            className="px-6 py-2 bg-white/10 text-white rounded-lg font-persian"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            لغو
          </motion.button>
        )}
        <motion.button
          onClick={onConfirm}
          className={`px-6 py-2 ${color}-bg text-white rounded-lg font-persian`}
          whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          تایید
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
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
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 w-full bg-slate-800/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            <ul className="py-2">
              {options.map((option) => (
                <motion.li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 text-white hover:bg-blue-500/30 cursor-pointer flex items-center space-x-2 rtl:space-x-reverse transition-all duration-200"
                  whileHover={{ x: 5 }}
                >
                  {option.icon && <option.icon className="w-5 h-5" />}
                  <span>{option.label}</span>
                </motion.li>
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
          <motion.div
            className="inline-block p-4 bg-white/10 rounded-2xl mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="w-12 h-12 text-blue-300" />
          </motion.div>
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
            <motion.div
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 text-center text-red-200 text-sm font-persian"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
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
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian text-right transition-all duration-300"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-persian font-semibold disabled:opacity-50 transition-all duration-300"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </div>
              ) : (
                "ورود"
              )}
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
            className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-persian hover:bg-white/20 flex items-center justify-center space-x-3 rtl:space-x-reverse transition-all duration-300"
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

// Enhanced Dashboard with fixed API integration
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
    plan: user?.plan || "Premium",
    aiTokens: user?.aiTokens || 10000,
    twitterSearches: user?.twitterSearches || 200,
    instagramSearches: user?.instagramSearches || 150,
    otherSearches: user?.otherSearches || 150,
  });

  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatusText, setSearchStatusText] = useState("");

  // --- NEW: State for showing alerts ---
  const [alertInfo, setAlertInfo] = useState(null);

  const handleLogoutClick = () => {
    setAlertInfo({
      message: "آیا برای خروج از حساب کاربری خود اطمینان دارید؟",
      icon: LogOut,
      color: "red",
      onConfirm: () => {
        logout();
        setAlertInfo(null);
      },
      onCancel: () => setAlertInfo(null),
    });
  };

  useEffect(() => {
    setUserStats({
      plan: user?.plan || "Premium",
      aiTokens: user?.aiTokens || 10000,
      twitterSearches: user?.twitterSearches || 200,
      instagramSearches: user?.instagramSearches || 150,
      otherSearches: user?.otherSearches || 150,
    });
    checkBackendConnection();
  }, [user]);

  const checkBackendConnection = async () => {
    try {
      console.log("Checking backend connection...");
      setConnectionStatus("checking");
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
      id: "twitter",
      name: "توییتر",
      icon: Twitter,
      color: "from-blue-400 to-blue-600",
      features: ["توییت‌ها", "ترندها", "کاربران"],
    },
    {
      id: "instagram",
      name: "اینستاگرام",
      icon: Instagram,
      color: "from-pink-500 to-purple-600",
      features: ["پست‌ها", "کاربران", "هشتگ‌ها"],
    },
    {
      id: "facebook",
      name: "فیسبوک",
      icon: Facebook,
      color: "from-blue-600 to-blue-800",
      features: ["پست‌ها", "صفحات", "گروه‌ها"],
    },
    {
      id: "eitaa",
      name: "ایتا",
      icon: MessageCircle,
      color: "from-green-500 to-green-700",
      features: ["کانال‌ها", "محتوا", "آمار"],
    },
    {
      id: "telegram",
      name: "تلگرام",
      icon: Send,
      color: "from-sky-400 to-sky-600",
      features: ["کانال‌ها", "گروه‌ها", "پیام‌ها"],
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
    { value: "positive", label: "مثبت", icon: ThumbsUp },
    { value: "neutral", label: "خنثی", icon: Minus },
    { value: "negative", label: "منفی", icon: ThumbsDown },
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

  const transformApiResults = (apiResults) => {
    const allResults = [];
    console.log("Transforming API results:", apiResults);

    if (apiResults && apiResults.platforms) {
      Object.entries(apiResults.platforms).forEach(
        ([platform, platformData]) => {
          console.log(`Processing ${platform}:`, platformData);

          if (
            platformData.success &&
            platformData.data &&
            Array.isArray(platformData.data.results)
          ) {
            platformData.data.results.forEach((item) => {
              try {
                const transformedItem = {
                  id: item.id || `${platform}_${Date.now()}_${Math.random()}`,
                  platform: platform,
                  content: item.text || item.content || "محتوا در دسترس نیست",
                  author:
                    typeof item.author === "object"
                      ? item.author.username ||
                        item.author.name ||
                        "کاربر ناشناس"
                      : item.author || "کاربر ناشناس",
                  date: new Date(
                    item.created_at || item.date || Date.now()
                  ).toLocaleDateString("fa-IR"),
                  engagement: {
                    likes:
                      item.metrics?.like_count ||
                      item.metrics?.likes ||
                      item.likes ||
                      0,
                    comments:
                      item.metrics?.reply_count ||
                      item.metrics?.comments ||
                      item.comments ||
                      0,
                    shares:
                      item.metrics?.retweet_count ||
                      item.metrics?.shares ||
                      item.shares ||
                      0,
                    views:
                      item.metrics?.impression_count ||
                      item.metrics?.views ||
                      item.views ||
                      0,
                  },
                  sentiment:
                    item.sentiment ||
                    ["positive", "neutral", "negative"][
                      Math.floor(Math.random() * 3)
                    ],
                  media: item.media_url || null,
                  originalUrl: item.url || "#",
                  mediaType:
                    item.media_type || (item.media_url ? "image" : "text"),
                };
                allResults.push(transformedItem);
              } catch (error) {
                console.error("Error transforming item:", item, error);
              }
            });
          } else {
            console.warn(
              `Platform ${platform} has no valid results or failed:`,
              platformData
            );
          }
        }
      );
    }

    console.log("Final transformed results:", allResults);
    return allResults;
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim() || selectedPlatforms.length === 0) {
      setError("لطفاً عبارت جستجو و حداقل یک پلتفرم را انتخاب کنید.");
      return;
    }

    setIsSearching(true);
    setActiveTab("results");
    setLoadedResults(10);
    setAiInsight("");
    setError("");
    setSearchResults([]);

    setSearchProgress(10);
    setSearchStatusText("در حال برقراری ارتباط...");

    try {
      setRecentSearches((prev) =>
        [query, ...prev.filter((q) => q !== query)].slice(0, 5)
      );

      setSearchProgress(30);
      setSearchStatusText(
        `در حال جستجو در ${selectedPlatforms.length} پلتفرم...`
      );

      let searchResult;

      if (useAI) {
        searchResult = await apiService.searchWithAI(
          query,
          selectedPlatforms,
          20,
          aiProvider
        );
        setSearchProgress(70);
        setSearchStatusText("در حال تحلیل نتایج با هوش مصنوعی...");

        if (searchResult.success && searchResult.aiAnalysis) {
          setAiInsight(searchResult.aiAnalysis);
          setUserStats((prev) => ({ ...prev, aiTokens: prev.aiTokens - 100 }));
        }
      } else {
        searchResult = await apiService.searchMultiple(
          query,
          selectedPlatforms,
          20
        );
      }

      setSearchProgress(90);
      setSearchStatusText("در حال آماده‌سازی نتایج...");

      if (searchResult.success && searchResult.data) {
        const transformedResults = transformApiResults(searchResult.data);
        if (transformedResults.length > 0) {
          setSearchResults(transformedResults);
          const newSearch = {
            id: Date.now(),
            query: query,
            platforms: selectedPlatforms,
            timestamp: new Date().toISOString(),
            resultsCount: transformedResults.length,
          };
          setSearchHistory((prev) => [newSearch, ...prev.slice(0, 9)]);

          setUserStats((prev) => {
            const newStats = { ...prev };
            if (selectedPlatforms.includes("twitter"))
              newStats.twitterSearches--;
            if (selectedPlatforms.includes("instagram"))
              newStats.instagramSearches--;
            if (
              selectedPlatforms.some(
                (p) => !["twitter", "instagram"].includes(p)
              )
            )
              newStats.otherSearches--;
            return newStats;
          });
        } else {
          setError(
            "هیچ نتیجه‌ای یافت نشد. لطفاً عبارت جستجوی دیگری امتحان کنید."
          );
        }
      } else {
        throw new Error(searchResult.error || "جستجو ناموفق بود");
      }
      setSearchProgress(100);
      setSearchStatusText("جستجو کامل شد!");
    } catch (error) {
      console.error("Search failed:", error);
      setError(`خطا در جستجو: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsSearching(false);
        setSearchProgress(0);
      }, 1500);
    }
  };

  const runRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const loadMoreResults = () => {
    setLoadedResults((prev) => prev + 10);
  };

  const getSentimentColor = (sentiment) =>
    ({
      positive: "text-green-400",
      negative: "text-red-400",
      neutral: "text-yellow-400",
    })[sentiment] || "text-gray-400";

  const getSentimentLabel = (sentiment) =>
    ({
      positive: "مثبت",
      negative: "منفی",
      neutral: "خنثی",
    })[sentiment] || "نامشخص";

  const getPlatformIcon = (platformId) =>
    platforms.find((p) => p.id === platformId)?.icon || MessageCircle;

  const getMediaTypeIcon = (mediaType) =>
    ({
      video: Video,
      image: Image,
      CAROUSEL_ALBUM: Image,
    })[mediaType] || FileText;

  const exportResults = () => {
    const dataStr = JSON.stringify(searchResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kavosh-search-${searchQuery}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    const shareData = {
      title: `نتایج جستجو برای: ${searchQuery}`,
      text: `تعداد ${searchResults.length} نتیجه برای "${searchQuery}" در کاوش یافت شد.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("لینک صفحه کپی شد!");
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  const getAnalyticsData = () => {
    const totalSearches = 50 - userStats.searches;
    const totalResults = searchResults.length;
    const platformStats = {};

    platforms.forEach((platform) => {
      platformStats[platform.id] = searchResults.filter(
        (r) => r.platform === platform.id
      ).length;
    });

    const sentimentStats = {
      positive: searchResults.filter((r) => r.sentiment === "positive").length,
      neutral: searchResults.filter((r) => r.sentiment === "neutral").length,
      negative: searchResults.filter((r) => r.sentiment === "negative").length,
    };

    return {
      totalSearches,
      totalResults,
      platformStats,
      sentimentStats,
      averageEngagement:
        totalResults > 0
          ? Math.round(
              searchResults.reduce(
                (acc, result) =>
                  acc +
                  (result.engagement.likes +
                    result.engagement.comments +
                    result.engagement.shares),
                0
              ) / totalResults
            )
          : 0,
    };
  };

  const analyticsData = getAnalyticsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <AnimatePresence>
        {alertInfo && (
          <AnimaticAlert
            message={alertInfo.message}
            icon={alertInfo.icon}
            color={alertInfo.color}
            onConfirm={alertInfo.onConfirm}
            onCancel={alertInfo.onCancel}
          />
        )}
      </AnimatePresence>
      <motion.header
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold font-persian">کاوش</h1>
              <p className="text-xs text-blue-300 font-persian">نسخه پیشرفته</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <motion.div
              className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 text-sm flex items-center space-x-2 rtl:space-x-reverse"
              whileHover={{ scale: 1.05 }}
            >
              <Twitter size={14} className="text-blue-400" />
              <span className="font-persian">{userStats.twitterSearches}</span>
            </motion.div>
            <motion.div
              className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 text-sm flex items-center space-x-2 rtl:space-x-reverse"
              whileHover={{ scale: 1.05 }}
            >
              <Instagram size={14} className="text-pink-400" />
              <span className="font-persian">
                {userStats.instagramSearches}
              </span>
            </motion.div>
            <motion.div
              className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/20 text-sm flex items-center space-x-2 rtl:space-x-reverse"
              whileHover={{ scale: 1.05 }}
            >
              <Coins className="w-4 h-4 text-yellow-300" />
              <span className="font-persian">{userStats.aiTokens}</span>
            </motion.div>
            <motion.div
              className="bg-green-500/20 text-green-300 rounded-xl px-3 py-1.5 border border-green-400/30 text-sm font-persian"
              whileHover={{ scale: 1.05 }}
            >
              {userStats.plan}
            </motion.div>
            <motion.button
              onClick={handleLogoutClick}
              className="p-2 text-red-400 hover:bg-white/10 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold font-persian mb-2">
            خوش آمدید، {user?.name}
          </h2>
          <p className="text-xl text-blue-200 font-persian">
            با هوش مصنوعی در شبکه‌های اجتماعی جستجو کنید
          </p>
          {error && (
            <motion.div
              className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-center text-red-200 text-sm font-persian flex items-center justify-center space-x-2 rtl:space-x-reverse"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>

        <div className="flex justify-center mb-8">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 flex space-x-2 rtl:space-x-reverse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { id: "search", label: "جستجو", icon: Search },
              { id: "results", label: "نتایج", icon: BarChart3 },
              { id: "analytics", label: "آمار", icon: TrendingUp },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-persian font-medium transition-all duration-300 ${
                  activeTab !== tab.id && "hover:bg-white/10"
                }`}
                whileHover={{ scale: activeTab === tab.id ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2 rtl:space-x-reverse">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "search" && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isSearching && handleSearch()
                    }
                    placeholder="عبارت مورد نظر..."
                    className="w-full text-lg px-6 py-4 pr-14 bg-white/5 border border-white/20 rounded-2xl placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian text-right transition-all duration-300"
                    disabled={isSearching}
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300" />
                  <motion.button
                    onClick={() => handleSearch()}
                    disabled={
                      !searchQuery ||
                      selectedPlatforms.length === 0 ||
                      isSearching
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-xl font-persian disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 overflow-hidden"
                    whileHover={{
                      scale: isSearching ? 1 : 1.05,
                      backgroundSize: "150% 150%",
                    }}
                    whileTap={{ scale: isSearching ? 1 : 0.95 }}
                    style={{ backgroundSize: "100% 100%" }}
                    transition={{ duration: 0.3 }}
                  >
                    {isSearching ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span>در حال جستجو...</span>
                      </>
                    ) : (
                      <span>جستجو</span>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {isSearching && (
                    <SearchProgressBar
                      progress={searchProgress}
                      statusText={searchStatusText}
                    />
                  )}
                </AnimatePresence>

                {recentSearches.length > 0 && (
                  <motion.div
                    className="mt-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-blue-200 mb-2">
                      <History size={16} />
                      <span className="font-semibold font-persian">
                        جستجوهای اخیر:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <motion.button
                          key={term}
                          onClick={() => runRecentSearch(term)}
                          className="px-3 py-1 bg-white/10 rounded-lg text-sm font-persian hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label className="block text-lg font-semibold mb-4 font-persian flex items-center space-x-2 rtl:space-x-reverse">
                    <Globe className="w-5 h-5 text-blue-300" />
                    <span>انتخاب پلتفرم‌ها</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {platforms.map((p) => (
                      <motion.div
                        key={p.id}
                        onClick={() => handlePlatformToggle(p.id)}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 ${
                          selectedPlatforms.includes(p.id)
                            ? "border-blue-400 bg-blue-500/20 scale-105"
                            : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                        }`}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        layout
                      >
                        <div className="flex flex-col items-center text-center">
                          <motion.div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${p.color} mb-3`}
                            whileHover={{ rotate: 5 }}
                          >
                            <p.icon size={28} className="text-white" />
                          </motion.div>
                          <h3 className="font-semibold font-persian text-sm">
                            {p.name}
                          </h3>
                          <div className="text-xs text-gray-400 mt-1">
                            {p.features.slice(0, 2).join("، ")}
                          </div>
                        </div>
                        <AnimatePresence>
                          {selectedPlatforms.includes(p.id) && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                            >
                              <CheckCircle size={14} className="text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
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

                <motion.div
                  className="bg-white/5 rounded-2xl p-6 border border-white/10"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <motion.div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          useAI
                            ? "bg-gradient-to-r from-purple-500 to-pink-600"
                            : "bg-white/20"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        animate={
                          useAI
                            ? {
                                boxShadow: [
                                  "0 0 20px rgba(147, 51, 234, 0.3)",
                                  "0 0 40px rgba(147, 51, 234, 0.6)",
                                  "0 0 20px rgba(147, 51, 234, 0.3)",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: useAI ? Infinity : 0,
                        }}
                      >
                        <Bot size={28} className="text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold font-persian text-lg">
                          تحلیل هوش مصنوعی
                        </h3>
                        <p className="text-sm text-blue-200 font-persian">
                          بینش‌های پیشرفته از نتایج (۱۰۰ توکن)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <AnimatePresence>
                        {useAI && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CustomDropdown
                              value={aiProvider}
                              onChange={setAiProvider}
                              options={aiProviderOptions}
                              placeholder="انتخاب AI"
                              icon={Zap}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.button
                        onClick={() => setUseAI(!useAI)}
                        className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center ${
                          useAI
                            ? "justify-end bg-gradient-to-r from-blue-500 to-purple-600"
                            : "justify-start bg-white/20"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          layout
                          className="w-6 h-6 bg-white rounded-full shadow-lg mx-1"
                          transition={{
                            type: "spring",
                            stiffness: 700,
                            damping: 30,
                          }}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              key="results-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {searchResults.length > 0 ? (
                <>
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-blue-500/20 p-3 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold font-persian">
                            نتایج برای "{searchQuery}"
                          </h3>
                          <p className="text-blue-200 font-persian">
                            {searchResults.length} نتیجه یافت شد
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <motion.button
                          onClick={exportResults}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 flex items-center space-x-2 rtl:space-x-reverse font-persian transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download size={16} />
                          <span>دانلود</span>
                        </motion.button>
                        <motion.button
                          onClick={shareResults}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 flex items-center space-x-2 rtl:space-x-reverse font-persian transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Share2 size={16} />
                          <span>اشتراک</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {aiInsight && (
                      <motion.div
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl p-6 mb-6 border border-purple-400/30"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <div className="flex items-start space-x-4 rtl:space-x-reverse">
                          <motion.div
                            className="bg-purple-500/30 rounded-xl p-3"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="text-purple-300 w-6 h-6" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 font-persian flex items-center space-x-2 rtl:space-x-reverse">
                              <span>تحلیل هوش مصنوعی</span>
                              <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                                {aiProvider.toUpperCase()}
                              </span>
                            </h3>
                            <p className="leading-relaxed font-persian whitespace-pre-wrap text-sm">
                              {aiInsight}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {searchResults
                        .slice(0, loadedResults)
                        .map((result, index) => (
                          <motion.div
                            key={result.id}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                              <motion.div
                                className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-r ${
                                  platforms.find(
                                    (p) => p.id === result.platform
                                  )?.color || "from-gray-500 to-gray-600"
                                }`}
                                whileHover={{ rotate: 5 }}
                              >
                                {React.createElement(
                                  getPlatformIcon(result.platform),
                                  {
                                    size: 24,
                                    className: "text-white",
                                  }
                                )}
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <span className="font-semibold font-persian">
                                      {result.author}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                      {result.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <motion.div
                                      className={`text-sm font-persian px-3 py-1 rounded-full flex items-center space-x-1 rtl:space-x-reverse transition-all duration-200 ${getSentimentColor(
                                        result.sentiment
                                      )
                                        .replace("text-", "bg-")
                                        .replace(
                                          "-400",
                                          "/20"
                                        )} ${getSentimentColor(result.sentiment)}`}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      {React.createElement(
                                        result.sentiment === "positive"
                                          ? ThumbsUp
                                          : result.sentiment === "negative"
                                            ? ThumbsDown
                                            : Minus,
                                        { size: 12 }
                                      )}
                                      <span>
                                        {getSentimentLabel(result.sentiment)}
                                      </span>
                                    </motion.div>
                                    <motion.div
                                      className="text-gray-400 p-1"
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      {React.createElement(
                                        getMediaTypeIcon(result.mediaType),
                                        { size: 16 }
                                      )}
                                    </motion.div>
                                  </div>
                                </div>
                                <p className="leading-relaxed mb-4 font-persian text-sm">
                                  {result.content}
                                </p>
                                {result.media && (
                                  <motion.img
                                    src={result.media}
                                    alt=""
                                    className="w-full h-48 object-cover rounded-xl mb-4 cursor-pointer"
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() =>
                                      window.open(result.media, "_blank")
                                    }
                                  />
                                )}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-6 rtl:space-x-reverse text-gray-300 text-sm">
                                    <motion.div
                                      className="flex items-center space-x-2 rtl:space-x-reverse"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Heart
                                        size={16}
                                        className="text-red-400"
                                      />
                                      <span>
                                        {result.engagement?.likes?.toLocaleString() ||
                                          0}
                                      </span>
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center space-x-2 rtl:space-x-reverse"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <MessageSquare
                                        size={16}
                                        className="text-blue-400"
                                      />
                                      <span>
                                        {result.engagement?.comments?.toLocaleString() ||
                                          0}
                                      </span>
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center space-x-2 rtl:space-x-reverse"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Repeat2
                                        size={16}
                                        className="text-green-400"
                                      />
                                      <span>
                                        {result.engagement?.shares?.toLocaleString() ||
                                          0}
                                      </span>
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center space-x-2 rtl:space-x-reverse"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Eye
                                        size={16}
                                        className="text-purple-400"
                                      />
                                      <span>
                                        {result.engagement?.views?.toLocaleString() ||
                                          0}
                                      </span>
                                    </motion.div>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <motion.button
                                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Bookmark size={16} />
                                    </motion.button>
                                    <motion.a
                                      href={result.originalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <ExternalLink size={16} />
                                    </motion.a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>

                  {loadedResults < searchResults.length && (
                    <div className="text-center mt-8">
                      <motion.button
                        onClick={loadMoreResults}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-persian font-semibold transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        نمایش بیشتر ({searchResults.length - loadedResults}{" "}
                        باقیمانده)
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-white/10 rounded-3xl p-8 max-w-md mx-auto">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Search className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <h3 className="text-xl font-semibold font-persian mb-2">
                      هنوز جستجویی انجام نشده
                    </h3>
                    <p className="text-blue-200 font-persian">
                      از تب جستجو برای یافتن محتوا استفاده کنید.
                    </p>
                    <motion.button
                      onClick={() => setActiveTab("search")}
                      className="mt-4 px-6 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-persian hover:bg-blue-500/30 transition-all duration-200"
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
              key="analytics-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Main Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-400/30"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        فعال
                      </motion.div>
                    </div>
                    <h3 className="font-persian text-gray-300 text-sm mb-1">
                      جستجوهای انجام شده
                    </h3>
                    <p className="text-3xl font-bold text-blue-400 mb-2">
                      {analyticsData.totalSearches}
                    </p>
                    <div className="text-xs text-gray-400 font-persian">
                      از {50} جستجوی مجاز
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-2xl p-6 border border-purple-400/30"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded-full"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        AI
                      </motion.div>
                    </div>
                    <h3 className="font-persian text-gray-300 text-sm mb-1">
                      توکن‌های مصرفی
                    </h3>
                    <p className="text-3xl font-bold text-purple-400 mb-2">
                      {1000 - userStats.aiTokens}
                    </p>
                    <div className="text-xs text-gray-400 font-persian">
                      از {1000} توکن
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-green-400/30"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        نتایج
                      </motion.div>
                    </div>
                    <h3 className="font-persian text-gray-300 text-sm mb-1">
                      نتایج یافت شده
                    </h3>
                    <p className="text-3xl font-bold text-green-400 mb-2">
                      {analyticsData.totalResults}
                    </p>
                    <div className="text-xs text-gray-400 font-persian">
                      در آخرین جستجو
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl p-6 border border-orange-400/30"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        className="text-orange-400 text-xs bg-orange-500/20 px-2 py-1 rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        میانگین
                      </motion.div>
                    </div>
                    <h3 className="font-persian text-gray-300 text-sm mb-1">
                      میانگین تعامل
                    </h3>
                    <p className="text-3xl font-bold text-orange-400 mb-2">
                      {analyticsData.averageEngagement}
                    </p>
                    <div className="text-xs text-gray-400 font-persian">
                      لایک + کامنت + اشتراک
                    </div>
                  </motion.div>
                </div>

                {/* Charts and Advanced Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Platform Usage Chart */}
                  <motion.div
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold font-persian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                      <PieChart className="w-5 h-5 text-blue-400" />
                      <span>استفاده از پلتفرم‌ها</span>
                    </h3>
                    <div className="space-y-4">
                      {platforms.map((p) => {
                        const count = analyticsData.platformStats[p.id] || 0;
                        const percentage =
                          analyticsData.totalResults > 0
                            ? (count / analyticsData.totalResults) * 100
                            : 0;

                        return (
                          <div key={p.id}>
                            <div className="flex justify-between items-center mb-2 font-persian text-sm">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div
                                  className={`w-4 h-4 rounded bg-gradient-to-r ${p.color}`}
                                ></div>
                                <span>{p.name}</span>
                              </div>
                              <span>
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-2 rounded-full bg-gradient-to-r ${p.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.1 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Sentiment Analysis */}
                  <motion.div
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold font-persian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span>تحلیل احساسات</span>
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "positive",
                          label: "مثبت",
                          color: "from-green-500 to-emerald-600",
                          icon: ThumbsUp,
                        },
                        {
                          key: "neutral",
                          label: "خنثی",
                          color: "from-yellow-500 to-orange-600",
                          icon: Minus,
                        },
                        {
                          key: "negative",
                          label: "منفی",
                          color: "from-red-500 to-pink-600",
                          icon: ThumbsDown,
                        },
                      ].map((sentiment) => {
                        const count =
                          analyticsData.sentimentStats[sentiment.key] || 0;
                        const percentage =
                          analyticsData.totalResults > 0
                            ? (count / analyticsData.totalResults) * 100
                            : 0;

                        return (
                          <motion.div
                            key={sentiment.key}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex justify-between items-center mb-2 font-persian text-sm">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <sentiment.icon className="w-4 h-4" />
                                <span>{sentiment.label}</span>
                              </div>
                              <span>
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-3 rounded-full bg-gradient-to-r ${sentiment.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.2, delay: 0.2 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Search History */}
                <motion.div
                  className="bg-white/10 rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold font-persian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>تاریخچه جستجو</span>
                    {searchHistory.length > 0 && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        {searchHistory.length}
                      </span>
                    )}
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {searchHistory.length > 0 ? (
                      searchHistory.map((search, index) => (
                        <motion.div
                          key={search.id}
                          className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                              <Search className="w-4 h-4 text-blue-300" />
                            </div>
                            <div>
                              <p className="font-persian font-medium">
                                {search.query}
                              </p>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-gray-400">
                                <Globe className="w-3 h-3" />
                                <span>{search.platforms.join("، ")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-400">
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Target className="w-3 h-3" />
                              <span>{search.resultsCount}</span>
                            </div>
                            <span className="text-xs">
                              {new Date(search.timestamp).toLocaleDateString(
                                "fa-IR",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="bg-white/5 rounded-2xl p-6">
                          <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                          <p className="text-gray-400 font-persian">
                            هنوز جستجویی انجام نشده است
                          </p>
                          <p className="text-xs text-gray-500 font-persian mt-1">
                            جستجوهای شما اینجا نمایش داده می‌شود
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                  className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-400/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold font-persian mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>عملکرد کلی</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Flame className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h4 className="font-persian font-semibold text-lg">
                        امتیاز کیفیت
                      </h4>
                      <p className="text-2xl font-bold text-indigo-400 mb-1">
                        {Math.min(95, 60 + analyticsData.totalSearches * 2)}%
                      </p>
                      <p className="text-xs text-gray-400 font-persian">
                        بر اساس تنوع جستجو
                      </p>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="font-persian font-semibold text-lg">
                        پوشش شبکه‌ها
                      </h4>
                      <p className="text-2xl font-bold text-purple-400 mb-1">
                        {Math.min(
                          6,
                          Object.keys(analyticsData.platformStats).filter(
                            (key) => analyticsData.platformStats[key] > 0
                          ).length
                        )}
                      </p>
                      <p className="text-xs text-gray-400 font-persian">
                        از 6 پلتفرم موجود
                      </p>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="bg-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-pink-400" />
                      </div>
                      <h4 className="font-persian font-semibold text-lg">
                        رتبه کاربری
                      </h4>
                      <p className="text-2xl font-bold text-pink-400 mb-1">
                        {analyticsData.totalSearches < 5
                          ? "مبتدی"
                          : analyticsData.totalSearches < 15
                            ? "متوسط"
                            : analyticsData.totalSearches < 30
                              ? "پیشرفته"
                              : "حرفه‌ای"}
                      </p>
                      <p className="text-xs text-gray-400 font-persian">
                        بر اساس فعالیت
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* --- NEW: License Footer --- */}
      <footer className="text-center p-4 text-xs text-slate-400 font-persian">
        Developed by Mehrshad Hamavandy | © 2025 Kavosh Search Platform. All
        Rights Reserved.
      </footer>
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
