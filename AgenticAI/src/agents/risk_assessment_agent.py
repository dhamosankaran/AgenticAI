"""
Risk Assessment Agent for evaluating investment risk profiles
"""

from typing import Dict, List
from .base_agent import BaseFinancialAgent

class RiskAssessmentAgent(BaseFinancialAgent):
    """Agent responsible for risk assessment and profile analysis"""
    
    def __init__(self):
        super().__init__()
    
    async def assess_risk(self, profile: str) -> str:
        """Assess investment risk based on user profile"""
        try:
            # Parse profile information
            profile_data = self._parse_profile(profile)
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(profile_data)
            
            # Generate risk assessment
            assessment = self._generate_risk_assessment(risk_score, profile_data)
            
            return f"Risk Assessment:\n{assessment}"
            
        except Exception as e:
            self.logger.error(f"Error in risk assessment: {str(e)}")
            return f"Error assessing risk: {str(e)}"
    
    def _parse_profile(self, profile: str) -> Dict:
        """Parse user profile information from text"""
        # This is a simplified implementation
        # In a real system, you would use NLP to extract structured data
        profile_data = {
            "age": 30,  # Default values
            "income": 100000,
            "risk_tolerance": "moderate",
            "investment_goals": "retirement",
            "time_horizon": "long_term"
        }
        
        # Extract age
        if "year old" in profile.lower():
            try:
                age = int(profile.split("year old")[0].strip().split()[-1])
                profile_data["age"] = age
            except:
                pass
        
        # Extract income
        if "$" in profile:
            try:
                income = int(profile.split("$")[1].split()[0].replace(",", ""))
                profile_data["income"] = income
            except:
                pass
        
        # Extract risk tolerance
        risk_levels = ["conservative", "moderate", "aggressive"]
        for level in risk_levels:
            if level in profile.lower():
                profile_data["risk_tolerance"] = level
                break
        
        return profile_data
    
    def _calculate_risk_score(self, profile: Dict) -> float:
        """Calculate risk score based on profile data"""
        score = 0.0
        
        # Age factor (0-1)
        age = profile["age"]
        if age < 30:
            score += 0.8
        elif age < 50:
            score += 0.5
        else:
            score += 0.2
        
        # Income factor (0-1)
        income = profile["income"]
        if income > 200000:
            score += 0.8
        elif income > 100000:
            score += 0.5
        else:
            score += 0.3
        
        # Risk tolerance factor (0-1)
        risk_tolerance = profile["risk_tolerance"]
        if risk_tolerance == "aggressive":
            score += 0.8
        elif risk_tolerance == "moderate":
            score += 0.5
        else:
            score += 0.2
        
        # Normalize score to 0-1 range
        return score / 3.0
    
    def _generate_risk_assessment(self, risk_score: float, profile: Dict) -> str:
        """Generate risk assessment based on risk score and profile"""
        assessment = []
        
        # Overall risk level
        if risk_score >= 0.7:
            risk_level = "High"
        elif risk_score >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        assessment.append(f"Overall Risk Level: {risk_level}")
        assessment.append(f"Risk Score: {risk_score:.2f}")
        assessment.append("\nProfile Analysis:")
        assessment.append(f"- Age: {profile['age']} years")
        assessment.append(f"- Annual Income: ${profile['income']:,}")
        assessment.append(f"- Risk Tolerance: {profile['risk_tolerance'].title()}")
        
        # Recommendations
        assessment.append("\nRecommendations:")
        if risk_level == "High":
            assessment.append("- Consider a growth-oriented portfolio")
            assessment.append("- Focus on equities with some alternative investments")
            assessment.append("- Regular portfolio rebalancing recommended")
        elif risk_level == "Moderate":
            assessment.append("- Balanced portfolio of stocks and bonds")
            assessment.append("- Consider index funds for core holdings")
            assessment.append("- Quarterly portfolio review recommended")
        else:
            assessment.append("- Conservative portfolio with focus on stability")
            assessment.append("- Higher allocation to bonds and cash equivalents")
            assessment.append("- Annual portfolio review sufficient")
        
        return "\n".join(assessment)
    
    async def process_message(self, message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Process a message and return a response"""
        return await self.assess_risk(message) 