"""
Crisis Detection Module - Rule-based safety layer
Detects suicidal ideation, self-harm, and extreme distress
"""

import re
import logging

# Set up logging
logging.basicConfig(filename='crisis_debug.log', level=logging.DEBUG)

# Crisis keyword patterns (case-insensitive)
SUICIDE_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die', 
    'better off dead', 'no reason to live', 'end it all',
    'take my own life', 'don\'t want to live', 'kill me',
    'ending my life', 'wanting to die'
]

SELF_HARM_KEYWORDS = [
    'hurt myself', 'cut myself', 'self harm', 'self-harm',
    'harm myself', 'injure myself', 'punish myself'
]

EXTREME_DISTRESS_KEYWORDS = [
    'can\'t go on', 'give up on life', 'no point living',
    'worthless', 'hopeless', 'nothing matters anymore',
    'everyone would be better without me', 'burden to everyone'
]

# Context exclusions (avoid false positives)
EXCLUSION_PATTERNS = [
    r'kill.*exam', r'kill.*test', r'die.*laughing',
    r'kill.*assignment', r'suicide.*mission', r'kill.*enemy',
    r'not.*suicide', r'promise.*not', r'never.*suicide'
]

def detect_crisis(message):
    """
    Detect crisis indicators in user message
    """
    if not message or not isinstance(message, str):
        return False, None
        
    message_lower = message.lower().strip()
    logging.debug(f"Detecting crisis in: '{message_lower}'")
    
    # Check for false positive contexts first
    for pattern in EXCLUSION_PATTERNS:
        if re.search(pattern, message_lower):
            logging.debug(f"Exclusion match: {pattern}")
            return False, None
    
    # Check for suicide indicators
    for keyword in SUICIDE_KEYWORDS:
        if keyword in message_lower:
            logging.debug(f"Suicide match: {keyword}")
            return True, 'suicide'
    
    # Check for self-harm indicators
    for keyword in SELF_HARM_KEYWORDS:
        if keyword in message_lower:
            logging.debug(f"Self-harm match: {keyword}")
            return True, 'self_harm'
    
    # Check for extreme distress (multiple keywords = higher risk)
    distress_count = sum(1 for keyword in EXTREME_DISTRESS_KEYWORDS if keyword in message_lower)
    if distress_count >= 2:
        logging.debug(f"Extreme distress count: {distress_count}")
        return True, 'extreme_distress'
    
    return False, None

def get_crisis_response(crisis_type):
    """
    Generate appropriate crisis response based on type
    """
    base_message = """<p>I'm really concerned about what you're sharing. Your safety is the most important thing right now.</p>
<div style="margin: 20px 0; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; text-align: left; border-left: 4px solid #ef4444;">
    <p style="font-weight: 800; color: #ef4444; margin-bottom: 10px;">🆘 Please reach out to these helplines immediately:</p>
    <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>📞 Kiran Helpline:</strong> <a href="tel:18005990019" style="color: #ef4444; font-weight: bold;">1800-599-0019</a> (24/7)</li>
        <li style="margin-bottom: 10px;"><strong>📞 AASRA:</strong> <a href="tel:+919820466726" style="color: #ef4444; font-weight: bold;">+91-9820466726</a> (24/7)</li>
        <li><strong>📞 Sneha India:</strong> <a href="tel:04424640050" style="color: #ef4444; font-weight: bold;">044-24640050</a> (24/7)</li>
    </ul>
</div>
<p style="margin-bottom: 15px;">You don't have to face this alone. Counselors are ready to help right now.</p>
<div style="font-size: 14px; opacity: 0.8; text-align: left;">
    <strong>If in immediate danger:</strong>
    <ul style="margin-top: 5px;">
        <li>Call emergency services (112)</li>
        <li>Go to the nearest hospital</li>
    </ul>
</div>"""

    if crisis_type == 'suicide':
        return base_message
    elif crisis_type == 'self_harm':
        return base_message.replace(
            "I'm really concerned about what you're sharing.",
            "I hear that you're thinking about hurting yourself, and I'm really concerned."
        )
    elif crisis_type == 'extreme_distress':
        return base_message.replace(
            "I'm really concerned about what you're sharing.",
            "I can hear how much pain you're in right now, and I'm concerned about your safety."
        )
    
    return base_message

def get_helpline_info():
    """
    Return formatted helpline information
    """
    return {
        'kiran': {
            'name': 'Kiran Mental Health Helpline',
            'number': '1800-599-0019',
            'availability': '24/7',
            'description': 'Government of India mental health helpline'
        },
        'aasra': {
            'name': 'AASRA',
            'number': '+91-9820466726',
            'availability': '24/7',
            'description': 'Suicide prevention helpline'
        },
        'sneha': {
            'name': 'Sneha India Foundation',
            'number': '044-24640050',
            'availability': '24/7',
            'description': 'Emotional support and crisis intervention'
        }
    }
