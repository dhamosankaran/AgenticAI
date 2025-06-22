from .base_agent import BaseAgent
from crewai import Task, Crew
import logging
import re

logger = logging.getLogger(__name__)

class MarketAnalyst(BaseAgent):
    """Market analyst agent responsible for market research."""
    
    def __init__(self):
        super().__init__(
            role="Market Research Analyst",
            goal="Analyze market trends and opportunities for products",
            backstory="""You are an experienced market research analyst with expertise in 
            identifying market opportunities, analyzing competition, and understanding consumer behavior.
            You provide detailed insights about market size, growth potential, and key trends."""
        )

    def analyze_task(self, product_name: str, context: str = "") -> dict:
        """Analyze market opportunities for the given product."""
        try:
            task_description = f"""
            Conduct a comprehensive market analysis for {product_name}.

            Use web search to gather the latest data and trends.
            
            If provided, consider this additional context: {context}
            
            Focus on:
            1. Market size and growth potential
            2. Key market trends
            3. Target market segments
            4. Competitive landscape
            5. Market opportunities and challenges
            
            For any numerical data, present it in a structured format using the following markers:

            For pie charts (e.g., market share):
            [CHART_DATA type=pie title="Market Share Distribution"]
            - Company A: 35%
            - Company B: 25%
            - Company C: 20%
            - Others: 20%
            [/CHART_DATA]

            For line charts (e.g., growth trends):
            [CHART_DATA type=line title="Market Growth Trend"]
            Years:
            - 2020: $50M
            - 2021: $75M
            - 2022: $100M
            - 2023: $150M
            - 2024 (projected): $200M
            [/CHART_DATA]

            For bar charts (e.g., segment comparison):
            [CHART_DATA type=bar title="Market Segments"]
            Segments:
            - Enterprise: 45%
            - SMB: 30%
            - Consumer: 25%
            [/CHART_DATA]

            For tables (e.g. competitor analysis)

            [TABLE_DATA title="Competitor Comparison"]
            | Competitor | Market Share | Customer Satisfaction |
            |------------|--------------|-----------------------|
            | Company A  | 35%         | 8.5                    |
            | Company B  | 25%         | 7.8                    |
            | Company C  | 20%         | 8.0                    |
            | Others     | 20%         | 7.2                    |
            [/TABLE_DATA]


            Format your response with:
            1. Clear sections and bullet points for qualitative analysis
            2. Structured chart data for quantitative insights
            3. Tables for comparing information
            4. Specific recommendations based on the data
            """
            
            agent = self.create_agent()
            task = Task(
                description=task_description,
                agent=agent,
                expected_output="A comprehensive market analysis report with visualizable data."
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
                
                if 'Years:' in data:
                    # Handle line chart data
                    for line in data.split('\n'):
                        if ':' in line and '-' in line:
                            year, value = line.split(':')
                            year = year.split('-')[1].strip()
                            value = float(value.replace('$', '').replace('M', '').strip())
                            labels.append(year)
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
            
            # Remove the chart and table data markers from the content
            cleaned_content = re.sub(r'\[CHART_DATA.*?\[/CHART_DATA\]', '', result, flags=re.DOTALL)
            cleaned_content = re.sub(r'\[TABLE_DATA.*?\[/TABLE_DATA\]', '', cleaned_content, flags=re.DOTALL)
            
            return self.format_structured_output(cleaned_content, charts=charts, tables = tables)
            
        except Exception as e:
            logger.error(f"Error in market analysis: {str(e)}")
            return self.format_structured_output(f"Error in analysis: {str(e)}")