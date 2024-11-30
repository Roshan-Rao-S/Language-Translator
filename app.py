import os
from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
# from flask_cors import CORS

# nope the app is working now! 
app = Flask(__name__)

# CORS(app)

genai.configure(api_key='AIzaSyBJ3zEb8ivbhhQ-Pt-YezVBtpZ1pIcngTM')

# Initialize the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="You are an expert in multilingual translation. Your task is to translate the given input text from its original language into the specified target language accurately while preserving the meaning. For example, if the input is 'What is your name in French?', the output should be 'Comment vous appelez-vous ?' in French. Translate into any language as requested in the input.output should be only the sentence or text to be translated dont explain and speak the output if i just give text then ssk the user which language do i need to translate it"
)

# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"response": "hello"})

@app.route("/")
def home():
    return render_template("index.html")

# @app.route("/chatt", methods=["POST"])
# def chatss():
#     user_input = request.json.get('message')
#     return  jsonify({"response": user_input, "history": "history"})

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    history = request.json.get('history', [])
    print(user_input)
    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(user_input)
    model_response = response.text
    
    history.extend([
        {"role": "user", "parts": [user_input]},
        {"role": "model", "parts": [model_response]}
    ])
    print(model_response)
    return jsonify({"response": model_response, "history": history})



if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=8000)


# venv/Scripts/activate pip freeze > requirements.txt
