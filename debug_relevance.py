from ai import is_relevant_topic

msg = "i want to suicide"
message_lower = msg.lower()

RELEVANT_KEYWORDS = [
    'anxious', 'anxiety', 'sad', 'depression', 'depressed', 'stress', 'stressful',
    'therapy', 'therapist', 'counselor', 'psychologist', 'mental', 'health',
    'bipolar', 'ocd', 'trauma', 'ptsd', 'panic', 'nervous', 'scared', 'fear',
    'burnout', 'overwhelmed', 'lonely', 'loneliness', 'suicide', 'self-harm',
    'feeling', 'mood', 'emotion', 'help', 'support', 'listen', 'crying', 'hopeless',
    'peace', 'calm', 'breathing', 'meditation', 'grounding', 'mindfulness',
    'sleep', 'insomnia', 'worry', 'worried', 'struggling', 'pain', 'hurting',
    'relationship', 'family', 'friend', 'social', 'confidence', 'self-esteem'
]

print(f"Message: {msg}")
print(f"Lower: {message_lower}")
found_keyword = None
for word in RELEVANT_KEYWORDS:
    if word in message_lower:
        found_keyword = word
        break

print(f"Found keyword: {found_keyword}")
print(f"Is Relevant: {is_relevant_topic(msg)}")
