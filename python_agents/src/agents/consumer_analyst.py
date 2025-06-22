from .base_agent import BaseAgent
from crewai import Task, Crew
import logging
import re

logger = logging.getLogger(__name__)

class ConsumerAnalyst(BaseAgent):
    """Consumer analyst agent responsible for consumer behavior analysis."""
    
    def __init__(self):
        super().__init__(
            role="Consumer Behavior Analyst",
            goal="Analyze consumer behavior, preferences, and segments",
            backstory="""You are an expert consumer behavior analyst with deep understanding 
            of demographics, psychographics, and buying patterns. You provide detailed insights 
            about consumer segments, preferences, and trends."""
        )

    def analyze_task(self, product_name: str, context: str = "") -> dict:
        """Analyze consumer behavior for the given product."""
        try:
            task_description = f"""
            Conduct a comprehensive consumer analysis for {product_name}.

            Use web search to gather the latest data and trends.
            
            If provided, consider this additional context: {context}
            
            Focus on:
            1. Key consumer segments and demographics
            2. Consumer preferences and behavior patterns
            3. Purchase decision factors
            4. Consumer trends and future outlook
            5. Pain points and opportunities
            
            For any numerical data, present it in a structured format using the following markers:

            For pie charts (e.g., age distribution):
            [CHART_DATA type=pie title="Age Distribution"]
            - 18-24: 15%
            - 25-34: 30%
            - 35-44: 25%
            - 45-54: 20%
            - 55+: 10%
            [/CHART_DATA]

            For bar charts (e.g., purchase factors):
            [CHART_DATA type=bar title="Key Purchase Factors"]
            Factors:
            - Price: 85%
            - Quality: 75%
            - Brand: 60%
            - Features: 55%
            - Reviews: 45%
            [/CHART_DATA]

            For line charts (e.g., adoption trends):
            [CHART_DATA type=line title="Consumer Adoption Trend"]
            Quarters:
            - Q1 2023: 1000
            - Q2 2023: 2500
            - Q3 2023: 4000
            - Q4 2023: 6000
            - Q1 2024: 8500
            [/CHART_DATA]

            For tables (e.g., customer feedback):

            [TABLE_DATA title="Customer Feedback"]
            | Feature       | Positive Feedback | Negative Feedback |
            |---------------|-------------------|-------------------|
            | Price         | 20%               | 80%               |
            | Quality       | 70%               | 30%               |
            | Design        | 60%               | 40%               |
            | Functionality | 85%               | 15%               |
            [/TABLE_DATA]

            Format your response with:
            1. Clear sections and bullet points for qualitative analysis
            2. Structured chart data for quantitative insights
            3. Tables for comparing information
            4. Specific recommendations based on consumer insights
            """
            
            agent = self.create_agent()
            task = Task(
                description=task_description,
                agent=agent,
                expected_output="A comprehensive consumer analysis report with visualizable data."
            )
            crew = Crew(agents=[agent], tasks=[task], verbose=True)
            
            result = str(crew.kickoff())
            charts = []
            tables = []
            
            # Extract all chart data sections
            chart_matches = re.finditer(r'\[CHART_DATA type=(\w+) title="([^"]+)"\](.*?)\[/CHART_DATA\]', result, re.DOTALL)
            
            for match in chart_matches:
                chart_type, title, data = match.groups()
                labels = []
                values = []
                
                if 'Quarters:' in data:
                    # Handle line chart data
                    for line in data.split('\n'):
                        if ':' in line and '-' in line:
                            quarter, value = line.split(':')
                            quarter = quarter.split('-')[1].strip()
                            value = float(value.strip())
                            labels.append(quarter)
                            values.append(value)
                else:
                    # Handle pie/bar chart data
                    for line in data.split('\n'):
                        if ':' in line and '-' in line:
                            label, value = line.split(':')
                            label = label.split('-')[1].strip()
                            value = float(value.replace('%', '').strip())
                            labels.append(label)
                            values.append(value)
                
                if labels and values:
                    charts.append({
                        'type': chart_type,
                        'title': title,
                        'data': {
                            'labels': labels,
                            'datasets': [{
                                'label': title,
                                'data': values
                            }]
                        }
                    })
            
            # Extract table data
            table_matches = re.finditer(r'\[TABLE_DATA title="([^"]+)"\](.*?)\[/TABLE_DATA\]', result, re.DOTALL)
            for match in table_matches:
                title, data = match.groups()
                rows = []
                headers = []
                
                lines = data.strip().split('\n')
                if len(lines) > 1:
                    headers = [h.strip() for h in lines[0].replace('|', '#').split('#') if h.strip()]
                    for row in lines[2:]:
                        values = [v.strip() for v in row.replace('|', '#').split('#') if v.strip()]
                        if len(values) == len(headers):
                           rows.append(dict(zip(headers, values)))

                if rows and headers:
                   tables.append({
                        'title': title,
                        'headers': headers,
                        'rows': rows
                   })

            # Remove the chart data markers from the content
            cleaned_content = re.sub(r'\[CHART_DATA.*?\[/CHART_DATA\]', '', result, flags=re.DOTALL)
            cleaned_content = re.sub(r'\[TABLE_DATA.*?\[/TABLE_DATA\]', '', cleaned_content, flags=re.DOTALL)
            
            return self.format_structured_output(cleaned_content, charts=charts, tables=tables)
            
        except Exception as e:
            logger.error(f"Error in consumer analysis: {str(e)}")
            return self.format_structured_output(f"Error in analysis: {str(e)}")