# Technical Documentation for Developers

## System Architecture Details

### Frontend Architecture

#### Component Structure
```
src/
├── app/
│   ├── page.tsx                 # Main research page
│   ├── layout.tsx              # Root layout
│   └── api/                    # API routes
│       ├── chat/
│       │   └── route.ts        # SSE endpoint
│       └── openai/
│           └── chat/
│               └── route.ts    # OpenAI integration
├── components/
│   ├── ResearchResults.tsx     # Results display
│   ├── InteractiveCharts.tsx   # Chart components
│   ├── VoiceSearch.tsx         # Voice input
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── utils.ts               # Utility functions
│   ├── api-client.ts          # API client
│   └── exportService.ts       # Export functionality
└── types/
    └── research.ts            # TypeScript interfaces
```

#### Key Interfaces

```typescript
// Research Request Interface
interface ResearchRequest {
  product_name: string;
  context?: string;
}

// Research Response Interface
interface ResearchResponse {
  metadata: {
    timestamp: string;
    version: string;
    status: 'success' | 'partial_success' | 'error';
  };
  results: {
    manager: AgentResult;
    market: AgentResult;
    consumer: AgentResult;
    industry: AgentResult;
  };
  errors: Record<string, string>;
}

// Agent Result Interface
interface AgentResult {
  content?: string;
  charts?: ChartData[];
  tables?: TableData[];
  status: 'success' | 'error';
  timestamp: string;
}
```

### Backend Architecture

#### Python Package Structure
```
python_agents/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py          # Base agent class
│   │   ├── research_manager.py    # Research coordinator
│   │   ├── market_analyst.py      # Market analysis
│   │   ├── consumer_analyst.py    # Consumer insights
│   │   ├── industry_analyst.py    # Industry analysis
│   │   └── cache.py              # Caching system
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py               # FastAPI application
│   └── utils/
│       ├── __init__.py
│       └── helpers.py            # Utility functions
└── tests/
    └── ...                      # Test files
```

#### Agent System Architecture

```python
# Base Agent Class Structure
class BaseAgent:
    def __init__(self, model: str, temperature: float):
        self.model = model
        self.temperature = temperature
        self.cache = Cache()

    async def analyze(self, request: ResearchRequest) -> AgentResult:
        # Implementation
        pass

    async def _process_response(self, response: str) -> AgentResult:
        # Implementation
        pass

# Research Manager Implementation
class ResearchManager(BaseAgent):
    def __init__(self):
        super().__init__(model="gpt-4", temperature=0.7)
        self.market_analyst = MarketAnalyst()
        self.consumer_analyst = ConsumerAnalyst()
        self.industry_analyst = IndustryAnalyst()

    async def coordinate_analysis(self, request: ResearchRequest) -> ResearchResponse:
        # Implementation
        pass
```

## Configuration Details

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env)
OPENAI_API_KEY=your_openai_key
SERPER_API_KEY=your_serper_key
CACHE_TTL=3600
DEBUG_MODE=True
LOG_LEVEL=INFO
MAX_TOKENS=4000
TEMPERATURE=0.7
```

### API Configuration

```python
# FastAPI Configuration (main.py)
app = FastAPI(
    title="Market Research API",
    description="AI-powered market research analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Rate Limiting
app.add_middleware(
    RateLimitMiddleware,
    calls=100,
    period=3600
)
```

### Cache Configuration

```python
# Cache Settings (cache.py)
CACHE_CONFIG = {
    "TTL": 3600,  # Time to live in seconds
    "MAX_SIZE": 1000,  # Maximum number of items
    "EVICTION_POLICY": "LRU"  # Least Recently Used
}

class Cache:
    def __init__(self):
        self.cache = {}
        self.ttl = CACHE_CONFIG["TTL"]
        self.max_size = CACHE_CONFIG["MAX_SIZE"]
```

## API Endpoints

### Research Analysis Endpoint

```python
@app.post("/analyze")
async def analyze_market(request: ResearchRequest) -> StreamingResponse:
    try:
        return StreamingResponse(
            generate_analysis(request),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

## Development Guidelines

### Code Style

#### TypeScript/React
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript interfaces for type safety
- Follow ESLint configuration

```typescript
// Example Component Structure
const ResearchComponent: React.FC<Props> = ({ prop1, prop2 }) => {
    const [state, setState] = useState<State>({});
    
    useEffect(() => {
        // Side effects
    }, [dependencies]);

    const handleEvent = useCallback(() => {
        // Event handling
    }, [dependencies]);

    return (
        <ErrorBoundary>
            {/* Component JSX */}
        </ErrorBoundary>
    );
};
```

#### Python
- Follow PEP 8 guidelines
- Use type hints
- Implement proper logging
- Use async/await for I/O operations

```python
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

async def process_data(data: Dict[str, Any]) -> Optional[Result]:
    try:
        # Processing logic
        return result
    except Exception as e:
        logger.error(f"Error processing data: {e}")
        return None
```

### Testing

#### Frontend Tests
```typescript
// Jest + React Testing Library
describe('ResearchComponent', () => {
    it('should render loading state', () => {
        const { getByTestId } = render(<ResearchComponent />);
        expect(getByTestId('loading')).toBeInTheDocument();
    });
});
```

#### Backend Tests
```python
# pytest
@pytest.mark.asyncio
async def test_analyze_market():
    request = ResearchRequest(product_name="test")
    response = await client.post("/analyze", json=request.dict())
    assert response.status_code == 200
```

### Error Handling

#### Frontend Error Handling
```typescript
// API Error Handling
const handleApiError = (error: Error) => {
    if (error instanceof ApiError) {
        toast.error(error.message);
    } else {
        toast.error('An unexpected error occurred');
    }
    logger.error('API Error:', error);
};
```

#### Backend Error Handling
```python
# Custom Exception Handling
class AnalysisError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

@app.exception_handler(AnalysisError)
async def analysis_error_handler(request: Request, exc: AnalysisError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message}
    )
```

## Deployment

### Docker Configuration

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]

# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./backend:/app
```

## Performance Optimization

### Frontend Optimization
- Implement React.memo for expensive components
- Use proper key props in lists
- Implement virtual scrolling for large lists
- Use proper image optimization
- Implement proper code splitting

### Backend Optimization
- Implement proper caching strategies
- Use connection pooling
- Implement proper database indexing
- Use proper logging levels
- Implement proper error handling

## Security Best Practices

### Frontend Security
- Implement proper XSS protection
- Use proper CSRF tokens
- Implement proper input validation
- Use proper authentication
- Use proper authorization

### Backend Security
- Implement proper rate limiting
- Use proper API key management
- Implement proper error handling
- Use proper logging
- Implement proper validation 