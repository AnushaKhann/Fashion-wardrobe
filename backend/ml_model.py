# backend/ml_model.py

import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import os
import json

# --- Configuration ---
MODEL_PATH = 'fashion_model.h5'
CLASS_INDICES_PATH = 'class_indices.json'

# --- Load the Custom Model and Class Mappings ---
try:
    # Load our newly trained model
    model = tf.keras.models.load_model(MODEL_PATH)
    
    # Load the class indices file that was saved during training
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
    
    # Invert the dictionary to map the model's output index back to a category name
    # e.g., {'0': 'T-Shirt', '1': 'Jeans', ...}
    index_to_class = {str(v): k for k, v in class_indices.items()}
    
    print("✅ Custom fashion model and class indices loaded successfully.")

except Exception as e:
    print(f"❌ Error loading custom model: {e}")
    print("Falling back to the generic model. Please ensure 'fashion_model.h5' and 'class_indices.json' exist.")
    model = None
    index_to_class = {}


def classify_image(image_path):
    """
    Classifies a clothing item using our custom-trained fashion model.
    """
    if model is None or not index_to_class:
        print("Custom model not available. Cannot classify image.")
        return "Uncategorized"
        
    try:
        # Load and preprocess the image
        img = image.load_img(image_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array_expanded = np.expand_dims(img_array, axis=0)
        processed_img = preprocess_input(img_array_expanded)

        # Make a prediction with our custom model
        predictions = model.predict(processed_img)
        
        # The prediction is an array of probabilities. The highest one is our answer.
        predicted_index = np.argmax(predictions[0])
        
        # Use our mapping to find the category name for that index
        predicted_category = index_to_class.get(str(predicted_index), "Uncategorized")
        
        print(f"DEBUG: Custom model predicted: '{predicted_category}'")
        return predicted_category

    except Exception as e:
        print(f"Error during custom classification: {e}")
        return "Uncategorized"
