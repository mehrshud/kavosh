# Kavosh - کاوش

<div align="center">
  <h3>Advanced Social Media Search Platform with AI Integration</h3>
  <p><strong>پلتفرم پیشرفته جستجوی شبکه‌های اجتماعی با هوش مصنوعی</strong></p>
  
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://kavosh-social-search.vercel.app)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
  [![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
</div>

---

## 📖 Overview

Kavosh is a sophisticated social media search and analytics platform that enables users to search across multiple social media platforms simultaneously. Built with modern web technologies and enhanced with AI capabilities, it provides comprehensive insights and analysis of social media content.

### 🌟 Key Features

- **🔍 Multi-Platform Search**: Search across Twitter, Instagram, Eitaa, Telegram, and Rubika
- **🤖 AI-Powered Analysis**: Enhanced search results with OpenAI and Google Gemini integration
- **📊 Real-time Analytics**: Advanced sentiment analysis and engagement metrics
- **🌍 Persian Language Support**: Optimized for Persian/Farsi content and users
- **📱 Responsive Design**: Modern, mobile-first interface with RTL support
- **🔒 Secure Architecture**: Serverless functions protect API keys and handle CORS
- **📈 Data Visualization**: Rich charts and graphs for search analytics
- **💾 Export Capabilities**: Export results in JSON and CSV formats

---

## 🏗️ Architecture

```
kavosh/
├── 📁 api/                    # Vercel Serverless Functions
│   ├── enhanceAI.js          # AI analysis endpoint
│   ├── searchTwitter.js      # Twitter API proxy
│   ├── searchInstagram.js    # Instagram API proxy
│   ├── searchEitaa.js        # Eitaa API proxy
│   └── searchTelegram.js     # Telegram API proxy (placeholder)
├── 📁 public/                # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── 📁 src/                   # React application source
│   ├── 📁 config/           # Configuration files
│   │   └── firebase.js      # Firebase configuration
│   ├── 📁 services/         # API services
│   │   └── apiService.js    # Main API service class
│   ├── 📁 styles/           # CSS and styling
│   │   └── globals.css      # Global styles
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── vercel.json              # Vercel deployment configuration
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Vercel account (for deployment)
- API keys for social media platforms and AI services

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mehrshadhamavandy/kavosh.git
   cd kavosh
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the project root:

   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Social Media APIs (for client-side)
   REACT_APP_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   REACT_APP_INSTAGRAM_TOKEN=your_instagram_access_token
   REACT_APP_EITAA_TOKEN=your_eitaa_bot_token

   # AI APIs (for client-side)
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key

   # App Configuration
   REACT_APP_APP_NAME=Kavosh
   REACT_APP_VERSION=1.0.0
   ```

4. **Run the development server**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

---

## 🔧 Deployment

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**

   ```bash
   npm run deploy
   ```

3. **Configure Environment Variables**

   In your Vercel dashboard, add these environment variables (note: remove `REACT_APP_` prefix for serverless functions):

   ```
   # For Serverless Functions (without REACT_APP_ prefix)
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   EITAA_TOKEN=your_eitaa_bot_token
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # For React App (with REACT_APP_ prefix)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   # ... (other Firebase configs)
   ```

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

---

## 🔌 API Configuration

### Twitter API Setup

1. Create a Twitter Developer account
2. Create a new app in the Twitter Developer Portal
3. Generate Bearer Token with appropriate permissions
4. Add the token to your environment variables

### OpenAI API Setup

1. Sign up for OpenAI API access
2. Generate an API key from your OpenAI dashboard
3. Add the key to your environment variables

### Google Gemini API Setup

1. Go to Google AI Studio
2. Create a new project and enable Gemini API
3. Generate an API key
4. Add the key to your environment variables

### Eitaa API Setup

1. Contact Eitaa support for API access
2. Create a bot and get the bot token
3. Add the token to your environment variables

---

## 🛠️ Available Scripts

```bash
# Development
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production

# Code Quality
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier

# Deployment
npm run deploy     # Deploy to Vercel
npm run analyze    # Analyze bundle size
```

---

## 📱 Features in Detail

### Multi-Platform Search

- **Twitter**: Real-time tweets with engagement metrics
- **Instagram**: Posts with media content and user data
- **Eitaa**: Channel messages and media content
- **Telegram**: Public channel content (planned)
- **Rubika**: Public content search (planned)

### AI-Powered Analytics

- **Sentiment Analysis**: Automatic mood detection in Persian and English
- **Content Categorization**: Smart tagging and classification
- **Trend Analysis**: Identify trending topics and hashtags
- **Engagement Prediction**: Predict post performance
- **Summary Generation**: AI-generated content summaries

### Advanced Filtering

- **Date Range**: Filter by specific time periods
- **Content Type**: Filter by text, image, video, or mixed content
- **Engagement Level**: Filter by likes, comments, and shares
- **Language**: Multi-language content detection
- **User Type**: Filter by verified accounts or specific user groups

---

## 🔒 Security Features

- **API Key Protection**: All sensitive keys stored in serverless functions
- **CORS Handling**: Proper cross-origin request management
- **Rate Limiting**: Built-in request throttling
- **Input Sanitization**: XSS and injection attack prevention
- **Secure Headers**: Security headers for all API responses

---

## 🎨 UI/UX Features

- **Persian Typography**: Beautiful Vazirmatn font family
- **RTL Support**: Full right-to-left layout support
- **Dark/Light Mode**: System-based theme switching
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Charts**: Real-time data visualization
- **Accessibility**: WCAG 2.1 AA compliance
- **Progressive Web App**: PWA capabilities for mobile installation

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors

If you encounter CORS errors:

1. Ensure all API functions have proper CORS headers
2. Check that environment variables are set correctly in Vercel
3. Verify API endpoints are accessible

#### API Key Issues

For API key problems:

1. Verify keys are correct and active
2. Check rate limits on external APIs
3. Ensure environment variable names match exactly

#### Build Failures

If builds fail:

1. Check Node.js version (16.0.0+ required)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and run `npm install` again

#### Deployment Issues

For deployment problems:

1. Check Vercel function logs
2. Verify environment variables in Vercel dashboard
3. Ensure `vercel.json` configuration is correct

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compliance
- Test on multiple devices and browsers

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mehrshad Hamavandy**

- GitHub: [@mehrshadhamavandy](https://github.com/mehrshud)
- Email: [mehrshadhamavandy@gmail.com](mailto:mehrshadhamavandy@gmail.com)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Vercel for serverless hosting
- Tailwind CSS for the utility-first CSS framework
- OpenAI and Google for AI integration
- Persian community for language support feedback

---

## 📊 Project Stats

- **Total Lines of Code**: ~5,000+
- **Components**: 20+
- **API Endpoints**: 4 serverless functions
- **Supported Platforms**: 5 social media platforms
- **Languages**: English, Persian/Farsi
- **Bundle Size**: < 2MB (optimized)

---

## 🔮 Roadmap

### Phase 1 (Current)

- [x] Basic multi-platform search
- [x] AI-powered analysis
- [x] Persian language support
- [x] Responsive design

### Phase 2 (Q4 2025)

- [ ] Advanced filtering options
- [ ] Real-time notifications
- [ ] User dashboard and profiles
- [ ] Team collaboration features

<div align="center">
  <p><strong>Made with ❤️ in Iran</strong></p>
  <p><strong>ساخته شده با ❤️ در ایران</strong></p>
</div>
