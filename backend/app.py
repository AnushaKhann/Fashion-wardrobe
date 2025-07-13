import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os

load_dotenv()


from config import Config
from models.database import db, ClothingItem

# Load environment variables
print(os.getenv("SQLALCHEMY_DATABASE_URI"))


# Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, origins=app.config['ALLOWED_ORIGINS'])

# DB Init
db.init_app(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Route: Home
@app.route('/')
def home():
    return {"message": "Fashion AI Backend is Running!"}

# Define allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Helper function to validate file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/upload', methods=['POST'])
def upload():
    # Check if the 'image' part exists in request
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG allowed."}), 400

    # Secure and generate a unique filename to avoid overwriting
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, unique_filename)

    # Ensure upload directory exists
    os.makedirs(upload_folder, exist_ok=True)

    # Save the file
    file.save(file_path)

    # Get optional fields from form
    category = request.form.get('category', '')
    color = request.form.get('color', '')

    # Save to DB
    item = ClothingItem(filename=unique_filename, category=category, color=color)
    db.session.add(item)
    db.session.commit()

    return jsonify({
        "message": "Upload successful",
        "filename": unique_filename,
        "category": category,
        "color": color
    }), 200

# Route: Get all clothes
@app.route('/clothes', methods=['GET'])
def get_clothes():
    items = ClothingItem.query.all()
    data = [
        {"id": item.id, "filename": item.filename, "category": item.category, "color": item.color}
        for item in items
    ]
    return jsonify(data)

@app.route('/clothes/<int:item_id>', methods=['DELETE'])
def delete_clothing_item(item_id):
    item = ClothingItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


# Run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
