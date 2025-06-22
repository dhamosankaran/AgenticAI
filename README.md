# AI Market Research System

[![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-teal?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, AI-powered market research platform that leverages multiple specialized AI agents to provide comprehensive market analysis, consumer insights, and strategic recommendations.

![AI Market Research System](preview.png)

## 🌟 Features

- **Multi-Agent Analysis**: Utilizes four specialized AI agents:
  - Research Manager: Provides strategic synthesis and overview
  - Market Analyst: Analyzes market trends and competition
  - Consumer Expert: Studies consumer behavior and segments
  - Industry Specialist: Examines technical and regulatory aspects

- **Real-Time Processing**: Stream results as they're generated
- **Modern UI/UX**: Clean, responsive interface with intuitive navigation
- **Export Capabilities**: Export reports in markdown format
- **Error Handling**: Robust error handling and retry mechanisms

## 🚀 Tech Stack

- **Frontend**:
  - Next.js 13+ (React)
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - Lucide Icons

- **Backend**:
  - Python
  - FastAPI
  - CrewAI for agent orchestration
  - Advanced AI Models

## 📋 Prerequisites

- Node.js 16+
- Python 3.8+
- pip (Python package manager)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhamosankaran/marketresearch.git
   cd marketresearch
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_api_key_here
   # Add other necessary environment variables
   ```

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   # From the root directory
   cd python_agents
   uvicorn src.api.main:app --reload
   ```

2. **Start the frontend development server**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   # or
   yarn dev
   ```

3. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
ai-market-research/
├── src/
│   ├── app/                 # Next.js pages and routing
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── types/              # TypeScript type definitions
├── python_agents/
│   ├── src/
│   │   ├── agents/         # AI agent implementations
│   │   ├── api/            # FastAPI endpoints
│   │   └── utils/          # Helper functions
│   └── tests/              # Python tests
├── public/                 # Static assets
└── package.json           # Project dependencies and scripts
```

## 🔧 Configuration

The application can be configured through various environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `API_BASE_URL`: Backend API URL (defaults to http://localhost:8000)
- Add other relevant configuration options

## 🧪 Testing

- **Frontend Tests**
  ```bash
  npm test
  # or
  yarn test
  ```

- **Backend Tests**
  ```bash
  cd python_agents
  pytest
  ```

## 📚 API Documentation

The backend API provides the following endpoints:

- `POST /analyze`: Main endpoint for market research analysis
  - Request body:
    ```json
    {
      "product_name": "string",
      "context": "string"
    }
    ```
  - Returns streaming response with analysis results

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [CrewAI](https://github.com/joaomdmoura/crewAI) for the agent orchestration framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for the AI models

## 🔍 Troubleshooting

Common issues and their solutions:

1. **Backend Connection Error**
   - Ensure the backend server is running on port 8000
   - Check if your OpenAI API key is valid and has sufficient credits
   - Verify network connectivity and firewall settings

2. **Frontend Build Issues**
   - Clear the Next.js cache: `rm -rf .next`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Ensure Node.js version is 16 or higher

3. **Agent Response Issues**
   - Check the browser console for any error messages
   - Verify that all required environment variables are set
   - Monitor the backend logs for any API errors

## 📊 Performance

The system is optimized for:

- **Response Time**: Average initial response within 2-3 seconds
- **Streaming Updates**: Real-time updates every 0.5-1 seconds
- **Concurrent Users**: Supports multiple simultaneous analysis requests
- **Memory Usage**: Typically uses 200-300MB RAM on the backend
- **Browser Support**: Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)

## 🔒 Security

- All API requests are rate-limited
- Environment variables are properly secured
- No sensitive data is stored or logged
- Regular dependency updates for security patches

## 📧 Contact

Dhamodharan Sankaran - [@dhamosankaran](https://twitter.com/dhamosankaran) - dhamo.sankaran@gmail.com

Project Link: [https://github.com/dhamosankaran/marketresearch](https://github.com/dhamosankaran/marketresearch)