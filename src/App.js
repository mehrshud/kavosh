import React, { useState, useEffect } from "react";
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
  Users,
  Settings,
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
  MessageSquare,
  Repeat2,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Bot,
  Coins,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Link,
  Sparkles,
} from "lucide-react";
import "./styles/globals.css";

// Firebase Configuration
// IMPORTANT: In a real application, use environment variables
// For this example, we'll use placeholder values.
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

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// API Configuration
const API_CONFIG = {
  instagram: {
    baseUrl: "https://graph.instagram.com/v18.0",
  },
  twitter: {
    baseUrl: "https://api.twitter.com/2",
  },
  eitaa: {
    baseUrl: "https://eitaayar.ir/api",
    token: "bot386047:e951ff62-f45e-4254-ae7d-30b94d1f02b6",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-pro",
  },
};

// Authentication Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Auth Provider with Firebase
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "کاربر",
          ...userDoc.data(),
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        name: result.user.displayName,
        email: result.user.email,
        plan: "Free",
        searches: 50,
        aiTokens: 1000,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 border-4 border-blue-200 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

// Login Component
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("ایمیل یا رمز عبور نادرست است");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("خطا در ورود با گوگل");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-white mb-2 font-persian"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            ورود موفق!
          </motion.h2>
          <motion.p
            className="text-blue-200 font-persian"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            در حال انتقال به داشبورد...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo and Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 font-persian">
            کاوش
          </h1>
          <p className="text-blue-200 font-persian">
            پلتفرم هوشمند جستجوی شبکه‌های اجتماعی
          </p>
          <p className="text-sm text-blue-300 mt-2 font-persian">
            توسط مهرشاد همآوندی
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center font-persian">
            ورود به حساب کاربری
          </h2>

          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center space-x-2 rtl:space-x-reverse"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200 text-sm font-persian mr-2">
                {error}
              </span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="ایمیل"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-persian text-right transition-all duration-300"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-persian text-right transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-persian font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="mr-2 font-persian">در حال ورود...</span>
                </div>
              ) : (
                "ورود"
              )}
            </motion.button>
          </form>

          {/* Google Login */}
          <div className="mt-4">
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-blue-200 text-sm font-persian">
                یا
              </span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-persian font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
              <span className="mr-2">ورود با گوگل</span>
            </motion.button>
          </div>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href="#"
              className="text-blue-300 hover:text-white text-sm font-persian transition-colors"
            >
              رمز عبور خود را فراموش کردید؟
            </a>
          </motion.div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h3 className="text-sm font-semibold text-white mb-2 font-persian">
            برای تست:
          </h3>
          <p className="text-xs text-blue-200 font-persian">
            ایمیل: demo@kavosh.ir
            <br />
            رمز عبور: demo123456
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Fixed Custom Dropdown Component
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
    <div className="relative z-20">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-persian flex items-center justify-between hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {Icon && <Icon className="w-4 h-4 text-blue-300" />}
          <span className="mr-2">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-blue-300" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: 1000 }}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-right text-white hover:bg-white/20 font-persian transition-all duration-200 border-b border-white/10 last:border-b-0 flex items-center space-x-2 rtl:space-x-reverse"
                whileHover={{ x: 5 }}
              >
                {option.icon && (
                  <option.icon className="w-4 h-4 text-blue-300" />
                )}
                <span className="mr-2">{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced API Service with Eitaa Integration
class APIService {
  constructor() {
    this.apiKeys = {
      instagram: "YOUR_INSTAGRAM_TOKEN",
      twitter: "YOUR_TWITTER_BEARER_TOKEN",
      openai: "YOUR_OPENAI_API_KEY",
      gemini: "YOUR_GEMINI_API_KEY",
    };
  }

  // Eitaa API Integration
  async searchEitaa(query, options = {}) {
    try {
      // Search in Eitaa channels
      const searchResponse = await this.makeEitaaRequest("searchChannels", {
        query,
        limit: 20,
      });

      // Get channel posts
      let allPosts = [];
      if (searchResponse.channels) {
        for (const channel of searchResponse.channels.slice(0, 5)) {
          const posts = await this.getEitaaChannelPosts(
            channel.username,
            query
          );
          allPosts = [...allPosts, ...posts];
        }
      }

      return this.formatEitaaResults(allPosts, query);
    } catch (error) {
      console.error("Eitaa API Error:", error);
      return this.getMockResults("eitaa", query);
    }
  }

  async getEitaaChannelPosts(channelUsername, query) {
    try {
      const posts = await this.makeEitaaRequest("getChannelPosts", {
        channel: channelUsername,
        limit: 10,
      });

      // Filter posts by query
      return posts.filter(
        (post) =>
          post.text?.toLowerCase().includes(query.toLowerCase()) ||
          post.caption?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(`Error fetching posts from ${channelUsername}:`, error);
      return [];
    }
  }

  async getEitaaChannelInfo(channelUsername) {
    try {
      return await this.makeEitaaRequest("getChannelInfo", {
        channel: channelUsername,
      });
    } catch (error) {
      console.error(
        `Error fetching channel info for ${channelUsername}:`,
        error
      );
      return null;
    }
  }

  async getEitaaChannelMembers(channelUsername) {
    try {
      return await this.makeEitaaRequest("getChannelMembers", {
        channel: channelUsername,
      });
    } catch (error) {
      console.error(
        `Error fetching channel members for ${channelUsername}:`,
        error
      );
      return null;
    }
  }

  async makeEitaaRequest(endpoint, params) {
    const url = `${API_CONFIG.eitaa.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_CONFIG.eitaa.token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Eitaa API error: ${response.status}`);
    }

    return await response.json();
  }

  formatEitaaResults(posts, query) {
    return posts.map((post, index) => ({
      id: `eitaa_${post.id || index}`,
      platform: "eitaa",
      content: post.text || post.caption || "محتوای بدون متن",
      author: post.channel?.username || `@channel_${index}`,
      channelTitle: post.channel?.title || "کانال نامشخص",
      date: new Date(post.date * 1000).toLocaleDateString("fa-IR"),
      engagement: {
        views: post.views || Math.floor(Math.random() * 10000) + 1000,
        likes: post.reactions?.total || Math.floor(Math.random() * 1000) + 50,
        comments: post.replies || Math.floor(Math.random() * 100) + 10,
        shares: post.forwards || Math.floor(Math.random() * 50) + 5,
      },
      sentiment: this.analyzeSentiment(post.text || post.caption || ""),
      media: post.photo
        ? post.photo.file_id
        : post.video
        ? post.video.file_id
        : null,
      originalUrl: `https://eitaa.com/${post.channel?.username}/${post.message_id}`,
      mediaType: post.photo ? "image" : post.video ? "video" : "text",
      isChannel: true,
      channelInfo: post.channel,
    }));
  }

  // Twitter API Integration (fixed CORS issue by using a proxy)
  async searchTwitter(query, options = {}) {
    try {
      // Use a CORS proxy or backend endpoint
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const response = await fetch(
        `${proxyUrl}${
          API_CONFIG.twitter.baseUrl
        }/tweets/search/recent?query=${encodeURIComponent(
          query
        )}&tweet.fields=created_at,author_id,public_metrics,attachments&expansions=author_id,attachments.media_keys&media.fields=url`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKeys.twitter}`,
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
      const data = await response.json();
      return this.formatTwitterResults(data);
    } catch (error) {
      console.error("Twitter API Error:", error);
      return this.getMockResults("twitter", query);
    }
  }

  // Instagram API Integration
  async searchInstagram(query, options = {}) {
    try {
      const response = await fetch(
        `${API_CONFIG.instagram.baseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${this.apiKeys.instagram}`
      );
      const data = await response.json();

      const filteredResults =
        data.data?.filter((post) =>
          post.caption?.toLowerCase().includes(query.toLowerCase())
        ) || [];

      return this.formatInstagramResults(filteredResults);
    } catch (error) {
      console.error("Instagram API Error:", error);
      return this.getMockResults("instagram", query);
    }
  }

  // Fixed AI Enhancement
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

      const prompt = `تحلیل نتایج جستجوی "${query}" در پلتفرم‌های ${platform}:

نتایج نمونه:
${JSON.stringify(resultsContext, null, 2)}

لطفاً تحلیل جامعی از:
1. روند کلی محتوا
2. احساسات غالب
3. میزان تعامل
4. توصیه‌هایی برای بهبود جستجو
ارائه دهید.`;

      if (aiProvider === "openai" && this.apiKeys.openai) {
        const response = await fetch(
          `${API_CONFIG.openai.baseUrl}/chat/completions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKeys.openai}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: API_CONFIG.openai.model,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 500,
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } else if (aiProvider === "gemini" && this.apiKeys.gemini) {
        const response = await fetch(
          `${API_CONFIG.gemini.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKeys.gemini}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      return "تحلیل هوشمند در حال حاضر در دسترس نیست. لطفاً کلیدهای API را بررسی کنید.";
    }
  }

  // Format Results
  formatInstagramResults(posts) {
    return posts.map((post) => ({
      id: post.id,
      platform: "instagram",
      content: post.caption || "بدون توضیح",
      author: "@user_" + post.id.slice(-6),
      date: new Date(post.timestamp).toLocaleDateString("fa-IR"),
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
      },
      sentiment: this.analyzeSentiment(post.caption || ""),
      media: post.media_url,
      originalUrl: post.permalink,
      mediaType: post.media_type,
    }));
  }

  formatTwitterResults(data) {
    if (!data.data) return [];

    return data.data.map((tweet) => ({
      id: tweet.id,
      platform: "twitter",
      content: tweet.text,
      author:
        data.includes?.users?.find((u) => u.id === tweet.author_id)?.username ||
        "@unknown",
      date: new Date(tweet.created_at).toLocaleDateString("fa-IR"),
      engagement: {
        likes: tweet.public_metrics.like_count,
        comments: tweet.public_metrics.reply_count,
        shares: tweet.public_metrics.retweet_count,
      },
      sentiment: this.analyzeSentiment(tweet.text),
      originalUrl: `https://twitter.com/i/status/${tweet.id}`,
      mediaType: "text",
    }));
  }

  // Mock Results for Demo
  getMockResults(platform, query, count = 7) {
    const platforms = {
      instagram: { icon: Instagram, color: "from-pink-500 to-purple-600" },
      twitter: { icon: Twitter, color: "from-blue-400 to-blue-600" },
      facebook: { icon: Facebook, color: "from-blue-600 to-blue-800" },
      telegram: { icon: Send, color: "from-sky-400 to-sky-600" },
      eitaa: { icon: MessageCircle, color: "from-green-500 to-green-700" },
      rubika: { icon: MessageSquare, color: "from-red-500 to-red-700" },
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

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ["عالی", "خوب", "بهترین", "موفق", "خوشحال", "عاشق"];
    const negativeWords = ["بد", "ضعیف", "ناراحت", "مشکل", "غلط", "متنفر"];

    const positive = positiveWords.some((word) => text.includes(word));
    const negative = negativeWords.some((word) => text.includes(word));

    if (positive && !negative) return "positive";
    if (negative && !positive) return "negative";
    return "neutral";
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
      r.content.replace(/,/g, "،"),
      r.date,
      r.engagement.likes,
      r.engagement.comments,
      r.engagement.shares,
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
}

const apiService = new APIService();

// Dashboard Component with Enhanced Features
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
  const [userStats, setUserStats] = useState({
    searches: user?.searches || 50,
    aiTokens: user?.aiTokens || 1000,
    plan: user?.plan || "Free",
  });

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
      let allResults = [];

      // Search each selected platform
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

      // AI Enhancement
      if (useAI && userStats.aiTokens > 0 && allResults.length > 0) {
        const insight = await apiService.enhanceSearchWithAI(
          searchQuery,
          selectedPlatforms.join(", "),
          allResults,
          aiProvider
        );
        setAiInsight(insight);
        setUserStats((prev) => ({ ...prev, aiTokens: prev.aiTokens - 100 }));
      }

      setUserStats((prev) => ({ ...prev, searches: prev.searches - 1 }));
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to mock data
      const mockResults = apiService.getMockResults(
        "instagram",
        searchQuery,
        7
      );
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = async () => {
    const additionalResults = apiService.getMockResults(
      "instagram",
      searchQuery,
      5
    );
    setSearchResults((prev) => [...prev, ...additionalResults]);
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

        {/* Tabs Content */}
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
                            تحلیل هوش مصنوعی
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
                                        {result.engagement.likes?.toLocaleString() ||
                                          result.engagement.views?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <MessageSquare className="w-4 h-4 text-blue-400" />
                                      <span className="text-sm text-gray-300">
                                        {result.engagement.comments?.toLocaleString() ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      <Repeat2 className="w-4 h-4 text-green-400" />
                                      <span className="text-sm text-gray-300">
                                        {result.engagement.shares?.toLocaleString() ||
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
                                selectedPlatforms.includes(platform.id)
                                  ? Math.floor(Math.random() * 50) + 30
                                  : Math.floor(Math.random() * 20) + 5
                              }%`,
                            }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/" replace />;
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
