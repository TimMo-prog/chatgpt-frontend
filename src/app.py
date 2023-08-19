from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Replace with your OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ENDPOINT = 'https://api.openai.com/v1/engines/davinci/completions'

@app.route('/ask', methods=['POST'])
def ask_chatgpt():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json'
    }

    data = {
        "prompt": user_message,
        "max_tokens": 150
    }

    response = requests.post(OPENAI_ENDPOINT, headers=headers, json=data)

    if response.status_code == 200:
        gpt_response = response.json()
        return jsonify({"message": gpt_response['choices'][0]['text'].strip()})
    else:
        return jsonify({"error": "Failed to get response from ChatGPT"}), 500

if __name__ == '__main__':
    app.run(debug=True)
