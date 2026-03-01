import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

CHATBOT_SYSTEM_PROMPT = """You are a helpful customer support agent for BillFlow, a SaaS billing and subscription management platform.

You assist customers with:
- Billing questions (invoices, charges, payment methods, pricing)
- Refund requests (returns, disputes, credits)
- Account access issues (login problems, password resets, MFA)
- Cancellation requests (subscriptions, plan changes)
- General product inquiries (features, how-tos, product info)

Guidelines:
- Be concise, empathetic, and professional
- Always acknowledge the customer's concern first
- Provide clear, actionable next steps
- If you cannot resolve something directly, explain how to escalate
- Keep responses under 150 words
"""

CLASSIFICATION_PROMPT = """You are a support ticket classifier. Analyze the following customer support conversation and classify it into exactly one category.

Categories:
- Billing: Questions about invoices, charges, payment methods, pricing, or subscription fees
- Refund: Requests to return a product, get money back, dispute a charge, or process a credit
- Account Access: Issues logging in, resetting passwords, locked accounts, MFA problems, or setting up/configuring account security
- Cancellation: Requests to cancel a subscription, downgrade a plan, or close an account
- General Inquiry: Anything that doesn't fit the above: feature questions, product info, how-to questions

Rules:
1. Return ONLY the category name, nothing else
2. If the conversation touches multiple categories, choose the PRIMARY intent
3. For ambiguous cases between Billing and Refund, choose Refund if money-back is the primary goal
4. For ambiguous cases between Billing and Cancellation, choose Cancellation if ending service is the primary goal
5. For ambiguous cases between Refund and Cancellation, choose Refund if getting money back is explicitly requested

Customer message: {user_message}
Agent response: {bot_response}

Category:"""


def get_chatbot_model():
    return genai.GenerativeModel(
        model_name="gemini-3-flash-preview",
        system_instruction=CHATBOT_SYSTEM_PROMPT
    )

def get_classifier_model():
    return genai.GenerativeModel(model_name="gemini-3-flash-preview")


async def generate_chat_response(user_message: str) -> str:
    model = get_chatbot_model()
    response = model.generate_content(user_message)
    return response.text.strip()


async def classify_trace(user_message: str, bot_response: str) -> str:
    valid_categories = ["Billing", "Refund", "Account Access", "Cancellation", "General Inquiry"]
    
    model = get_classifier_model()
    prompt = CLASSIFICATION_PROMPT.format(
        user_message=user_message,
        bot_response=bot_response
    )
    
    response = model.generate_content(prompt)
    raw = response.text.strip()
    
    # Match against valid categories (case-insensitive)
    for cat in valid_categories:
        if cat.lower() in raw.lower():
            return cat
    
    # Fallback: try to find partial matches
    raw_lower = raw.lower()
    if "billing" in raw_lower:
        return "Billing"
    elif "refund" in raw_lower:
        return "Refund"
    elif "account" in raw_lower or "access" in raw_lower or "login" in raw_lower:
        return "Account Access"
    elif "cancel" in raw_lower:
        return "Cancellation"
    else:
        return "General Inquiry"