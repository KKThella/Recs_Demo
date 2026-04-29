# AI Recommendations Demo

An AI-powered supplement recommendation system built with React, Express, and Anthropic's Claude.

> 🚀 **[Live Demo → kkthella.github.io/Recs_Demo](https://kkthella.github.io/Recs_Demo/)**

AI-powered personalized supplement recommendation engine built to demonstrate 
GenAI product thinking.

**To try the demo:** Get a free API key at [console.anthropic.com](https://console.anthropic.com) and paste it on the first screen.


## 🚀 Features

- **Personalized Recommendations**: AI-generated supplement suggestions based on user profiles
- **Multiple Strategies**: Hybrid, content-based, and collaborative filtering approaches
- **Interactive Chat**: Ask questions about supplements and get AI-powered responses
- **Health Profile**: Comprehensive form for age, goals, diet, and restrictions
- **Product Thinking**: KPI metrics and A/B testing frameworks

## 🛠️ Tech Stack

- **Frontend**: React 18 with modern hooks
- **Backend**: Express.js proxy server
- **AI**: Anthropic Claude API
- **Styling**: Custom CSS with modern design

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Anthropic API key

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/KKThella/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Anthropic API key
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start the backend proxy
   npm run server

   # Terminal 2: Start the React frontend
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

Create a `.env` file with:
```
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
```

## 📊 Usage

1. Fill out your health profile (age, goals, diet, restrictions)
2. Click "Get My Recommendations" for AI-powered suggestions
3. Try different recommendation strategies (hybrid, content-based, collaborative)
4. Use the chat feature to ask specific supplement questions

## 🏗️ Architecture

- **Frontend** (`src/`): React components and UI
- **Backend** (`server.js`): Express proxy for Anthropic API
- **API** (`src/api/`): Claude integration and recommendation logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for demonstration purposes. Please ensure compliance with Anthropic's terms of service when using their API.

## ⚠️ Disclaimer

This application is for educational purposes only. Always consult healthcare professionals before starting any supplement regimen. The AI recommendations are not medical advice.
