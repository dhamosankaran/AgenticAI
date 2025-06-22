from .base_agent import BaseAgent
from crewai import Task, Crew
import logging
import re

logger = logging.getLogger(__name__)

class IndustryAnalyst(BaseAgent):
    """Industry analyst agent responsible for industry analysis."""
    
    def __init__(self):
        super().__init__(
            role="Industry Analyst",
            goal="Analyze industry dynamics, regulations, and technological trends",
            backstory="""You are an industry expert specializing in analyzing industry structures,
            regulatory environments, and technological developments. You provide insights about
            industry trends, compliance requirements, and technological disruptions."""
        )

    def analyze_task(self, product_name: str, context: str = "") -> dict:
        """Analyze industry landscape for the given product."""
        try:
            task_description = f"""
            Conduct a comprehensive industry analysis for {product_name}.

            Use web search to gather the latest data and trends.
            
            If provided, consider this additional context: {context}
            
            Focus on:
            1. Industry structure and dynamics
            2. Regulatory environment and compliance
            3. Technological trends and disruptions
            4. Supply chain considerations
            5. Industry best practices and standards
            
             For any numerical data, present it in a structured format using the following markers:

            For pie charts (e.g., regulatory compliance):
            [CHART_DATA type=pie title="Regulatory Compliance"]
            - Compliant: 80%
            - Non-Compliant: 20%
            [/CHART_DATA]

            For line charts (e.g., technology adoption):
            [CHART_DATA type=line title="Technology Adoption"]
            Years:
            - 2020: 20%
            - 2021: 35%
            - 2022: 50%
            - 2023: 65%
            - 2024 (projected): 80%
            [/CHART_DATA]

            For bar charts (e.g., supply chain performance):
             [CHART_DATA type=bar title="Supply Chain Performance"]
            Segments:
            - In-house: 40%
            - Local Suppliers: 35%
            - International Suppliers: 25%
            [/CHART_DATA]

            For tables (e.g., key industry benchmarks):
            [TABLE_DATA title="Key Industry Benchmarks"]
            | Metric              | Benchmark | Current  |
            |---------------------|-----------|----------|
            | Innovation Rate     | 7         | 7.5        |
            | Compliance Index    | 8         | 7.8       |
            | Supply Chain Eff   | 7.5          | 6.5      |
            [/TABLE_DATA]
            Format your response with:
            1. Clear sections and bullet points for qualitative analysis
            2. Structured chart data for quantitative insights
            3. Tables for comparing information
            4. Specific recommendations for industry positioning.
            """
            
            agent = self.create_agent()
            task = Task(
                description=task_description,
                agent=agent,
                expected_output="A comprehensive industry analysis report with visualizable data."
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
                            value = float(value.replace('%', '').strip())
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
            
            # Remove the chart data markers from the content
            cleaned_content = re.sub(r'\[CHART_DATA.*?\[/CHART_DATA\]', '', result, flags=re.DOTALL)
            cleaned_content = re.sub(r'\[TABLE_DATA.*?\[/TABLE_DATA\]', '', cleaned_content, flags=re.DOTALL)

            
            return self.format_structured_output(cleaned_content, charts=charts, tables=tables)
            
        except Exception as e:
            logger.error(f"Error in industry analysis: {str(e)}")
            return self.format_structured_output(f"Error in analysis: {str(e)}")