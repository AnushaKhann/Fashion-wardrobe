# backend/prepare_dataset.py

import os
import zipfile
import pandas as pd
import shutil
from tqdm import tqdm
import random

# --- Configuration ---
ZIP_FILE_PATH = 'archive.zip'
DATA_DIR = 'fashion_data'
OUTPUT_DIR = 'dataset'
IMAGE_DIR = ''
CSV_FILE = ''

CATEGORY_MAPPING = {
    'Topwear': 'T-Shirt', 'Tshirts': 'T-Shirt', 'Shirts': 'Shirt', 
    'Blouses': 'Blouse', 'Sweaters': 'Sweater', 'Tops': 'T-Shirt', 
    'Jeans': 'Jeans', 'Skirts': 'Skirt', 'Trousers': 'Trousers', 
    'Shorts': 'Jeans', 'Bottomwear': 'Trousers', 'Dresses': 'Dress', 
    'Jackets': 'Jacket', 'Blazers': 'Jacket', 'Coats': 'Coat',
    'Sandal': 'Flats', 'Heels': 'Heels', 'Flats': 'Flats', 
    'Flip Flops': 'Flats', 'Shoes': 'Sneakers', 'Sports Shoes': 'Sneakers', 
    'Casual Shoes': 'Sneakers',
}

def find_data_paths(base_dir):
    global IMAGE_DIR, CSV_FILE
    for root, dirs, files in os.walk(base_dir):
        if 'images' in dirs and 'styles.csv' in files:
            IMAGE_DIR = os.path.join(root, 'images')
            CSV_FILE = os.path.join(root, 'styles.csv')
            return True
    return False

def prepare_dataset():
    if not os.path.exists(DATA_DIR):
        print(f"Unzipping {ZIP_FILE_PATH}...")
        with zipfile.ZipFile(ZIP_FILE_PATH, 'r') as zip_ref:
            zip_ref.extractall(DATA_DIR)
        print("Unzipping complete.")
    
    if not find_data_paths(DATA_DIR):
        print(f"Error: Could not find 'images' and 'styles.csv' in '{DATA_DIR}'.")
        return

    try:
        df = pd.read_csv(CSV_FILE, on_bad_lines='skip')
        df.set_index('id', inplace=True)
        id_to_subcategory_map = df['subCategory'].to_dict()
    except Exception as e:
        print(f"Error reading or processing '{CSV_FILE}': {e}")
        return

    # Use a temporary directory for initial organization
    TEMP_OUTPUT_DIR = 'dataset_temp'
    if os.path.exists(TEMP_OUTPUT_DIR):
        shutil.rmtree(TEMP_OUTPUT_DIR)
    os.makedirs(TEMP_OUTPUT_DIR, exist_ok=True)

    print("Organizing all available images into temporary folders...")
    actual_filenames = os.listdir(IMAGE_DIR)
    for filename in tqdm(actual_filenames):
        if not filename.endswith('.jpg'): continue
        try:
            image_id = int(filename.split('.')[0])
        except ValueError:
            continue
        subcategory = id_to_subcategory_map.get(image_id)
        if subcategory and subcategory in CATEGORY_MAPPING:
            target_category = CATEGORY_MAPPING[subcategory]
            category_dir = os.path.join(TEMP_OUTPUT_DIR, target_category)
            os.makedirs(category_dir, exist_ok=True)
            source_path = os.path.join(IMAGE_DIR, filename)
            dest_path = os.path.join(category_dir, filename)
            shutil.copyfile(source_path, dest_path)

    # --- NEW: Undersampling to Balance the Dataset ---
    print("\n--- Balancing the Dataset via Undersampling ---")
    
    # 1. Count images in each category
    category_counts = {cat: len(os.listdir(os.path.join(TEMP_OUTPUT_DIR, cat))) for cat in os.listdir(TEMP_OUTPUT_DIR)}
    print("Original counts:", category_counts)

    # 2. Find the size of the smallest class (our target size)
    if not category_counts:
        print("No categories were created. Exiting.")
        return
    min_count = min(category_counts.values())
    print(f"Target size for all categories will be the smallest class size: {min_count}")

    # 3. Create the final balanced dataset directory
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 4. Copy a balanced number of images to the final directory
    for category, count in category_counts.items():
        source_dir = os.path.join(TEMP_OUTPUT_DIR, category)
        dest_dir = os.path.join(OUTPUT_DIR, category)
        os.makedirs(dest_dir, exist_ok=True)
        
        # Get all image files for the category
        images = os.listdir(source_dir)
        # Randomly sample 'min_count' images from the list
        sampled_images = random.sample(images, min_count)
        
        for image in sampled_images:
            shutil.copyfile(os.path.join(source_dir, image), os.path.join(dest_dir, image))

    # 5. Clean up the temporary directory
    shutil.rmtree(TEMP_OUTPUT_DIR)
    
    print("\n-----------------------------------------")
    print("✅ Dataset preparation and balancing complete!")
    print(f"Your new, balanced training data is ready in the '{OUTPUT_DIR}' directory.")
    print(f"Each category now contains {min_count} images.")
    print("-----------------------------------------")

if __name__ == '__main__':
    if not os.path.exists(ZIP_FILE_PATH):
        print(f"Error: '{ZIP_FILE_PATH}' not found. Please download the dataset.")
    else:
        prepare_dataset()
