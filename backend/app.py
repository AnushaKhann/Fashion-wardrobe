# backend/app.py

import uuid
import random
import os
import requests
import re
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

from config import Config
from models.database import db, ClothingItem, ChatSession, ChatMessage
from ml_model import classify_image

# Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# --- CORE ROUTES ---

@app.route('/')
def home(): return {"message": "Fashion AI Backend is Running!"}

@app.route('/uploads/<path:filename>')
def uploaded_file(filename): return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# --- CLOTHING MANAGEMENT API ---

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files: return jsonify({"error": "No file uploaded"}), 400
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename): return jsonify({"error": "Invalid file type"}), 400
    
    filename = f"{uuid.uuid4().hex}.{secure_filename(file.filename).rsplit('.', 1)[1].lower()}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    manual_category = request.form.get('category')
    final_category = manual_category if manual_category and manual_category.strip() != "" else classify_image(file_path)
    color = request.form.get('color', 'Default Color')
    
    item = ClothingItem(filename=filename, category=final_category, color=color)
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id, "filename": item.filename, "category": item.category, "color": item.color}), 201

@app.route('/clothes', methods=['GET'])
def get_clothes():
    items = ClothingItem.query.all()
    return jsonify([{"id": i.id, "filename": i.filename, "category": i.category, "color": i.color} for i in items])

@app.route('/clothes/<int:item_id>', methods=['PUT', 'DELETE'])
def manage_clothing_item(item_id):
    item = ClothingItem.query.get_or_404(item_id)
    if request.method == 'PUT':
        data = request.get_json()
        item.category = data.get('category', item.category)
        item.color = data.get('color', item.color)
        db.session.commit()
        return jsonify({"id": item.id, "filename": item.filename, "category": item.category, "color": item.color})
    if request.method == 'DELETE':
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], item.filename))
        except OSError as e:
            print(f"Error deleting file {item.filename}: {e}")
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item deleted"}), 200


# --- CHAT API ---

@app.route('/chats', methods=['POST'])
def create_chat():
    new_chat = ChatSession()
    db.session.add(new_chat)
    db.session.commit()
    return jsonify(new_chat.to_dict()), 201

@app.route('/chats', methods=['GET'])
def get_chats():
    sessions = ChatSession.query.order_by(ChatSession.created_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions])

@app.route('/chats/<int:session_id>', methods=['PUT', 'DELETE'])
def manage_chat_session(session_id):
    session = ChatSession.query.get_or_404(session_id)
    if request.method == 'PUT':
        data = request.get_json()
        new_title = data.get('title')
        if not new_title or not new_title.strip():
            return jsonify({"error": "Title cannot be empty"}), 400
        session.title = new_title
        db.session.commit()
        return jsonify(session.to_dict())
    if request.method == 'DELETE':
        db.session.delete(session)
        db.session.commit()
        return jsonify({"message": "Chat session deleted successfully"})

@app.route('/chats/<int:session_id>/messages', methods=['GET'])
def get_messages(session_id):
    session = ChatSession.query.get_or_404(session_id)
    messages = sorted(session.messages, key=lambda m: m.created_at)
    return jsonify([m.to_dict() for m in messages])

@app.route('/chats/<int:session_id>/messages', methods=['POST'])
def post_message(session_id):
    session = ChatSession.query.get_or_404(session_id)
    data = request.get_json()
    user_prompt = data.get('prompt')
    if not user_prompt: return jsonify({"error": "Prompt is required"}), 400

    user_message = ChatMessage(session_id=session.id, role='user', content=user_prompt)
    db.session.add(user_message)

    ai_response_content = generate_outfit_with_llm(user_prompt)
    
    outfit_data = ai_response_content.get('outfit')
    stylist_notes = ai_response_content.get('notes')

    ai_message = ChatMessage(
        session_id=session.id,
        role='ai',
        content=stylist_notes,
        outfit_data=json.dumps(outfit_data) if outfit_data else None
    )
    db.session.add(ai_message)

    if session.title == "New Outfit Chat":
        session.title = user_prompt[:50]

    db.session.commit()
    return jsonify(ai_message.to_dict()), 201


# --- HELPER DICTIONARIES & FUNCTIONS ---

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename): return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

CLOTHING_TYPES = {'top': ['T-Shirt', 'Shirt', 'Blouse', 'Suit', 'Sweater'], 'bottom': ['Jeans', 'Skirt', 'Trousers'],'dress': ['Dress'],'outerwear': ['Jacket', 'Coat'],'shoes': ['Heels', 'Flats', 'Sneakers']}
OCCASION_RULES = {'Formal': ['Suit', 'Dress', 'Shirt', 'Trousers', 'Heels'],'Casual': ['T-Shirt', 'Jeans', 'Sweater', 'Skirt', 'Jacket', 'Dress', 'Sneakers', 'Flats'],'Party': ['Dress', 'Skirt', 'Blouse', 'Heels'],'Work': ['Suit', 'Shirt', 'Blouse', 'Trousers', 'Skirt', 'Flats', 'Heels'],'Dinner': ['Dress', 'Blouse', 'Skirt', 'Trousers', 'Heels'],'Date Night': ['Dress', 'Blouse', 'Skirt', 'Heels'],'Chill': ['T-Shirt', 'Jeans', 'Sweater', 'Sneakers']}

def parse_prompt(prompt):
    prompt_lower = prompt.lower()
    parsed_info = {'occasion': 'Casual', 'color': None, 'city': 'New Delhi'}
    occasions = ['casual', 'formal', 'party', 'work', 'dinner', 'date night', 'chill']
    colors = ['black', 'white', 'red', 'blue', 'green', 'pink', 'grey', 'beige', 'navy']
    for occ in occasions:
        if occ in prompt_lower: parsed_info['occasion'] = occ.title()
    for col in colors:
        if col in prompt_lower: parsed_info['color'] = col.title()
    match = re.search(r'in\s+([a-zA-Z\s]+)', prompt_lower)
    if match: parsed_info['city'] = match.group(1).strip().title()
    return parsed_info

def get_weather(city):
    api_key = os.getenv('WEATHER_API_KEY')
    if not api_key: return None
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": api_key, "units": "metric"}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Weather API error: {e}")
        return None

# --- FULL LLM OUTFIT GENERATION ---

def generate_outfit_with_llm(user_prompt):
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        return {"outfit": None, "notes": "The Gemini API key is missing. Please add it to your .env file."}
    
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={gemini_api_key}"

    parsed_info = parse_prompt(user_prompt)
    occasion, city, preferred_color = parsed_info['occasion'], parsed_info['city'], parsed_info['color']
    weather_data = get_weather(city)
    if not weather_data:
        return {"outfit": None, "notes": "I couldn't get the weather right now. Please check the city name."}
    
    temp = weather_data['main']['temp']
    weather_condition = weather_data['weather'][0]['main']
    weather_info = f"{city}: {temp}°C, {weather_condition}"

    all_items = ClothingItem.query.all()
    warm_clothes = ['Sweater', 'Jacket', 'Coat']
    cold_clothes = ['T-Shirt', 'Skirt']
    if temp > 25: weather_appropriate_items = [item for item in all_items if item.category not in warm_clothes]
    elif temp < 15: weather_appropriate_items = [item for item in all_items if item.category not in cold_clothes]
    else: weather_appropriate_items = all_items
    allowed_categories = OCCASION_RULES.get(occasion, [])
    wardrobe = [item for item in weather_appropriate_items if item.category in allowed_categories]
    
    wardrobe_list_str = "\n".join([f"- Item ID {item.id}: A {item.color} {item.category}" for item in wardrobe])
    if not wardrobe:
        return {"outfit": None, "notes": f"I looked through your wardrobe but couldn't find enough items for a '{occasion}' outfit suitable for this weather."}

    prompt = f"""
    You are an expert fashion stylist. Your task is to act as a reasoning engine to select the perfect outfit from a user's available wardrobe.
    **User's Request:** "{user_prompt}"
    **Context:**
    - Occasion: {occasion}
    - Weather: {weather_info}
    - User's Color Preference (if any): {preferred_color or 'None'}
    **Available Clothes:**
    {wardrobe_list_str}
    **Your Task:**
    1.  **Reason Step-by-Step:** Think like a stylist to choose the best items from the "Available Clothes" list.
    2.  **Select the Items:** Choose a 'top' item (this can be a dress or a top), and optionally a 'bottom' and 'outerwear' item.
    3.  **Write Stylist Notes:** In 2-3 sentences, write a creative, friendly, and encouraging note explaining your choice.
    4.  **Format Your Final Answer:** You MUST return your final answer as a single, valid JSON object with no other text before or after it. The JSON object must have two keys: "outfit" and "notes". The "outfit" value should be another JSON object containing the selected item IDs for "top", "bottom", and "outerwear". Use the integer ID from the "Available Clothes" list. If a slot is not used, its value should be null.
    **Example of a valid JSON response:**
    ```json
    {{
      "outfit": {{
        "top": 101,
        "bottom": 105,
        "outerwear": null
      }},
      "notes": "This is a fantastic choice! The clean lines of the shirt combined with the classic jeans create a look that's both relaxed and stylish, perfect for a casual day."
    }}
    ```
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        text_response = result['candidates'][0]['content']['parts'][0]['text']
        
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', text_response, re.DOTALL)
        if not json_match:
            json_match = re.search(r'(\{.*?\})', text_response, re.DOTALL)

        if not json_match:
            raise ValueError("No valid JSON object found in the LLM response.")

        json_string = json_match.group(1)
        llm_response = json.loads(json_string)

        outfit_ids = llm_response.get('outfit', {})
        final_outfit_data = {}
        for slot, item_id in outfit_ids.items():
            if item_id:
                item = ClothingItem.query.get(int(item_id))
                if item:
                    final_outfit_data[slot] = {"id": item.id, "filename": item.filename, "category": item.category, "color": item.color}
                else:
                    print(f"Warning: LLM returned a non-existent item ID: {item_id}")
                    final_outfit_data[slot] = None
            else:
                final_outfit_data[slot] = None
        
        return {"outfit": final_outfit_data, "notes": llm_response.get('notes', "Here's a great look for you!")}

    except Exception as e:
        error_message = f"I encountered a technical issue. Details: {str(e)}"
        print(f"Error processing LLM response: {e}")
        if 'response' in locals() and response.text:
            print(f"LLM Raw Response: {response.text}")
        return {"outfit": None, "notes": error_message}

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
