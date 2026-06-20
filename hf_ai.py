"""
Hugging Face AI Module - Mental Health Support
Uses InferenceClient SDK (routes via router.huggingface.co — accessible even behind firewalls)
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

# Hugging Face Configuration
HF_API_KEY = os.getenv('HF_API_KEY', '').strip()

# System prompt
SYSTEM_PROMPT = (
    "You are a compassionate mental health support chatbot for India. "
    "Be empathetic, warm, and supportive. Never diagnose or prescribe medication. "
    "Keep responses under 100 words. Use simple, caring language."
)

# Models to try in order — all confirmed to have active providers on HuggingFace router
MODELS = [
    "Qwen/Qwen2.5-72B-Instruct",          # featherless-ai / sambanova provider
    "meta-llama/Meta-Llama-3-8B-Instruct", # multiple providers
    "mistralai/Mixtral-8x7B-Instruct-v0.1",# multiple providers
    "google/gemma-2-2b-it",                # multiple providers
    "meta-llama/Llama-3.2-1B-Instruct",   # original (novita - may be down)
]


def call_huggingface_api(user_message: str, context: str = "") -> Optional[str]:
    """
    Call HuggingFace via InferenceClient (routes via router.huggingface.co).
    Tries multiple models in order until one succeeds.
    """
    if not HF_API_KEY or HF_API_KEY in ('', 'your-huggingface-api-key-here'):
        print("DEBUG: No HF API key configured")
        return None

    # Build system message with optional RAG context
    system_content = SYSTEM_PROMPT
    if context:
        system_content += f"\n\nRelevant info: {context[:300]}"

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_message},
    ]

    for model in MODELS:
        try:
            print(f"DEBUG: Trying model: {model}")
            client = InferenceClient(model=model, token=HF_API_KEY)

            response = client.chat.completions.create(
                messages=messages,
                max_tokens=150,
                temperature=0.7,
            )

            if response and response.choices:
                result = response.choices[0].message.content.strip()
                if result:
                    print(f"DEBUG: Success with model: {model}")
                    return result

        except Exception as e:
            err = str(e)
            print(f"DEBUG: {model} failed: {err[:150]}")
            logging.warning(f"HF model {model} failed: {err}")
            continue

    print("DEBUG: All HF models failed, using pattern fallback")
    return None


def test_hf_api():
    """Test function to verify HF API connectivity"""
    print("=" * 60)
    print("TESTING HUGGING FACE API")
    print("=" * 60)

    if not HF_API_KEY or HF_API_KEY in ('', 'your-huggingface-api-key-here'):
        print("\n❌ No API key configured")
        return False

    print(f"\nAPI Key: {HF_API_KEY[:10]}...{HF_API_KEY[-4:]}")

    test_message = "I'm feeling anxious"
    print(f"\nTest message: '{test_message}'")

    response = call_huggingface_api(test_message)

    if response:
        print("\n✅ SUCCESS!")
        print(f"\nResponse: {response}")
        return True
    else:
        print("\n❌ FAILED")
        return False


if __name__ == "__main__":
    test_hf_api()
