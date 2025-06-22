from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from python_agents.src.agents.research_manager import ResearchManager
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

app = FastAPI()

def extract_analysis_request(body: dict) -> dict:
    """
    Extracts product_name and context from a request body. Handles cases where the body 
    might be a direct object or an object with a prompt key containing a JSON string.
    """
    if 'prompt' in body:
        try:
           
            prompt_data = json.loads(body['prompt'])
            return {
                 'product_name': prompt_data.get('product_name', ""),
                 'context': prompt_data.get('context', "")
            }
        except (json.JSONDecodeError, TypeError):
             logger.error(f"Could not parse prompt {body.get('prompt', '')}")
             raise HTTPException(status_code=400, detail="Invalid prompt format")
    
    return {
         'product_name': body.get('product_name', ""),
         'context': body.get('context', "")
    }


@app.post("/analyze")
async def analyze(request: Request):
    """
    Receives a request to analyze a market and returns a structured response with the analysis.
    """
    try:
        body = await request.json()
        logger.info(f"Received analysis request for: {body}")

        analysis_request = extract_analysis_request(body)
        product_name = analysis_request.get('product_name')
        context = analysis_request.get('context')

        if not product_name:
              raise HTTPException(status_code=400, detail="Product name is required")
      
        research_manager = ResearchManager()
        analysis_results = research_manager.analyze_task(product_name, context)
        
        # Ensure we have a properly structured response
        if isinstance(analysis_results, dict) and 'results' in analysis_results:
            return JSONResponse(content=analysis_results)
        else:
            # If we get an unstructured response, wrap it in our standard format
            return JSONResponse(content={
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'version': '2.0',
                    'status': 'success'
                },
                'results': {
                    'manager': analysis_results,
                    'market': analysis_results,
                    'consumer': analysis_results,
                    'industry': analysis_results
                },
                'errors': {}
            })
    
    except HTTPException as http_ex:
      logger.error(f"HTTP error: {str(http_ex)}")
      return JSONResponse(content={
        'metadata': {
          'timestamp': datetime.now().isoformat(),
          'version': '2.0',
          'status': 'error'
        },
        'results': {
          'manager': {},
          'market': {},
          'consumer': {},
          'industry': {}
        },
        'errors': {
              "system_error": str(http_ex.detail)
        }
      }, status_code=http_ex.status_code)
    except Exception as e:
         logger.error(f"Unexpected error: {str(e)}")
         return JSONResponse(content={
          'metadata': {
            'timestamp': datetime.now().isoformat(),
            'version': '2.0',
            'status': 'error'
          },
          'results': {
             'manager': {},
              'market': {},
              'consumer': {},
              'industry': {}
          },
          'errors': {
              "system_error": str(e)
          }
        }, status_code=500)