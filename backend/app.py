# backend/app.py

import uuid
import random
import os
import requests
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

from config import Config
from models.database import db, ClothingItem
from ml_model import classify_image

# Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app) # Use a more permissive CORS setup for development

db.init_app(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- FIX: Re-added the missing helper function ---
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---
@app.route('/')
def home(): return {"message": "Fashion AI Backend is Running!"}

@app.route('/uploads/<path:filename>')
def uploaded_file(filename): return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files: return jsonify({"error": "No file uploaded"}), 400
    file = request.files['image']
    # The check that was causing the error
    if file.filename == '' or not allowed_file(file.filename): 
        return jsonify({"error": "Invalid file type"}), 400
        
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

# (The rest of your app.py, including the generate-outfit route, remains the same)
# ...

# --- FASHION DICTIONARY & LOGIC ---
CLOTHING_TYPES = {
    'top': ['T-Shirt', 'Shirt', 'Blouse', 'Suit', 'Sweater'], 
    'bottom': ['Jeans', 'Skirt', 'Trousers'],
    'dress': ['Dress'],
    'outerwear': ['Jacket', 'Coat'],
    'shoes': ['Heels', 'Flats', 'Sneakers']
}
OCCASION_RULES = {
    'Formal': ['Suit', 'Dress', 'Shirt', 'Trousers', 'Heels'],
    'Casual': ['T-Shirt', 'Jeans', 'Sweater', 'Skirt', 'Jacket', 'Dress', 'Sneakers', 'Flats'],
    'Party': ['Dress', 'Skirt', 'Blouse', 'Heels'],
    'Work': ['Suit', 'Shirt', 'Blouse', 'Trousers', 'Skirt', 'Flats', 'Heels'],
    'Dinner': ['Dress', 'Blouse', 'Skirt', 'Trousers', 'Heels'],
    'Date Night': ['Dress', 'Blouse', 'Skirt', 'Heels'],
    'Chill': ['T-Shirt', 'Jeans', 'Sweater', 'Sneakers']
}
NEUTRAL_COLORS = ['White', 'Black', 'Grey', 'Beige', 'Navy']
def colors_are_compatible(color1, color2):
    if color1 in NEUTRAL_COLORS or color2 in NEUTRAL_COLORS: return True
    if color1 == color2: return True
    return False

def parse_prompt(prompt):
    prompt_lower = prompt.lower()
    parsed_info = {'occasion': 'Casual', 'color': None, 'city': 'New Delhi'}
    occasions = ['casual', 'formal', 'party', 'work', 'dinner', 'date night', 'chill']
    colors = ['black', 'white', 'red', 'blue', 'green', 'pink', 'grey', 'beige', 'navy']
    for occ in occasions:
        if occ in prompt_lower:
            parsed_info['occasion'] = occ.title()
            break
    for col in colors:
        if col in prompt_lower: parsed_info['color'] = col.title()
    match = re.search(r'in\s+([a-zA-Z\s]+)', prompt_lower)
    if match: parsed_info['city'] = match.group(1).strip().title()
    return parsed_info

def score_outfit(outfit, occasion, preferred_color):
    score = 0
    is_dress = outfit.get('bottom') is None
    if is_dress:
        if occasion in ['Party', 'Formal', 'Date Night']: score += 20
        elif occasion in ['Dinner', 'Work']: score += 10
        else: score += 5
    else:
        if occasion in ['Casual', 'Work', 'Chill']: score += 20
        elif occasion in ['Dinner', 'Date Night']: score += 10
        else: score += 5
    top_category = outfit['top'].category
    if is_dress:
        if top_category not in OCCASION_RULES.get(occasion, []): score -= 15
    else:
        bottom_category = outfit['bottom'].category
        if top_category not in OCCASION_RULES.get(occasion, []) or bottom_category not in OCCASION_RULES.get(occasion,[]):
            score -= 15
    if not is_dress and colors_are_compatible(outfit['top'].color, outfit['bottom'].color):
        score += 10
    if preferred_color:
        item_colors = [outfit['top'].color]
        if not is_dress: item_colors.append(outfit['bottom'].color)
        if preferred_color in item_colors: score += 25
    return score

@app.route('/generate-outfit', methods=['POST'])
def generate_outfit_route():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt: return jsonify({"error": "Prompt not provided"}), 400
    parsed_info = parse_prompt(prompt)
    occasion, city, preferred_color = parsed_info['occasion'], parsed_info['city'], parsed_info['color']
    weather_data = get_weather(city)
    if not weather_data or weather_data.get('cod') != 200:
        return jsonify({"error": f"Could not get weather for {city}. Please check the city name."}), 404
    temp = weather_data['main']['temp']
    weather_condition = weather_data['weather'][0]['main']
    all_items = ClothingItem.query.all()
    warm_clothes = ['Sweater', 'Jacket', 'Coat']
    cold_clothes = ['T-Shirt', 'Skirt']
    if temp > 25: weather_appropriate_items = [item for item in all_items if item.category not in warm_clothes]
    elif temp < 15: weather_appropriate_items = [item for item in all_items if item.category not in cold_clothes]
    else: weather_appropriate_items = all_items
    allowed_categories = OCCASION_RULES.get(occasion, [])
    wardrobe = [item for item in weather_appropriate_items if item.category in allowed_categories]
    if preferred_color:
        wardrobe = [item for item in wardrobe if item.color == preferred_color]
    tops = [item for item in wardrobe if item.category in CLOTHING_TYPES['top']]
    bottoms = [item for item in wardrobe if item.category in CLOTHING_TYPES['bottom']]
    dresses = [item for item in wardrobe if item.category in CLOTHING_TYPES['dress']]
    outerwear_items = [item for item in wardrobe if item.category in CLOTHING_TYPES['outerwear']]
    candidates = []
    for dress in dresses: candidates.append({'top': dress, 'bottom': None})
    for top in tops:
        for bottom in bottoms:
            if colors_are_compatible(top.color, bottom.color):
                candidates.append({'top': top, 'bottom': bottom})
    if not candidates:
        return jsonify({"error": f"Not enough variety for a '{occasion}' outfit. Try uploading more clothes!"}), 404
    scored_candidates = [(score_outfit(c, occasion, preferred_color), c) for c in candidates]
    if not scored_candidates:
         return jsonify({"error": "Could not find any suitable outfits."}), 404
    max_score = max(s for s, c in scored_candidates)
    score_threshold = max_score * 0.8
    good_candidates = [c for score, c in scored_candidates if score >= score_threshold]
    best_outfit = random.choice(good_candidates)
    best_outfit['outerwear'] = None
    if temp < 20 and outerwear_items:
        compatible_outerwear = [item for item in outerwear_items if colors_are_compatible(item.color, best_outfit['top'].color)]
        if compatible_outerwear:
            best_outfit['outerwear'] = random.choice(compatible_outerwear)
    stylist_notes = f"For a {occasion.lower()} occasion, here is a great option. "
    if best_outfit.get('bottom'):
        stylist_notes += f"The {best_outfit['top'].color.lower()} {best_outfit['top'].category.lower()} and {best_outfit['bottom'].color.lower()} {best_outfit['bottom'].category.lower()} pair well together. "
    else:
        stylist_notes += f"This {best_outfit['top'].color.lower()} {best_outfit['top'].category.lower()} is a perfect choice. "
    if best_outfit['outerwear']:
        stylist_notes += f"I've added the {best_outfit['outerwear'].category.lower()} for the cooler weather."
    final_outfit = {
        'weather_info': f"{city}: {temp}°C, {weather_condition}",
        'stylist_notes': stylist_notes
    }
    for key, value in best_outfit.items():
        if hasattr(value, 'id'):
            final_outfit[key] = {"id": value.id, "filename": value.filename, "category": value.category, "color": value.color}
        else:
            final_outfit[key] = None
    return jsonify(final_outfit), 200

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
