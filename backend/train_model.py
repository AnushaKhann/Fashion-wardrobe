# backend/train_model.py

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import os

# --- Configuration ---
DATASET_DIR = 'dataset'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_EPOCHS = 5 # An epoch is one full pass through the entire dataset. 5 is a good starting point.
MODEL_SAVE_PATH = 'fashion_model.h5'

def train_model():
    """
    Loads the prepared dataset, fine-tunes a pre-trained model,
    and saves the new, specialized model.
    """
    if not os.path.exists(DATASET_DIR):
        print(f"Error: Dataset directory '{DATASET_DIR}' not found.")
        print("Please run 'prepare_dataset.py' first.")
        return

    # 1. Prepare the Data Generators
    # ImageDataGenerator is a Keras utility that can load images from folders
    # and prepare them for training (e.g., resizing, batching, and data augmentation).
    
    # We split our data: 80% for training, 20% for validation (testing).
    datagen = ImageDataGenerator(
        rescale=1./255, # Normalize pixel values from 0-255 to 0-1
        validation_split=0.2, # Use 20% of the data for validation
        horizontal_flip=True, # Data augmentation to improve model robustness
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2
    )

    train_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training' # This is the training set
    )

    validation_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation' # This is the validation set
    )

    # 2. Build the Model (Fine-Tuning)
    # Load the pre-trained MobileNetV2 model, but without its final classification layer.
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

    # Freeze the layers of the base model so we don't ruin their pre-trained knowledge.
    for layer in base_model.layers:
        layer.trainable = False

    # Add our own custom classification layers on top.
    x = base_model.output
    x = GlobalAveragePooling2D()(x) # A layer to reduce dimensions
    x = Dense(1024, activation='relu')(x) # A dense, fully connected layer
    
    # The final output layer must have the same number of neurons as we have categories.
    num_classes = len(train_generator.class_indices)
    predictions = Dense(num_classes, activation='softmax')(x) # Softmax is used for multi-class classification

    # Combine the base model and our new layers into the final model.
    model = Model(inputs=base_model.input, outputs=predictions)

    # 3. Compile the Model
    # We tell the model how to learn. Adam is a popular and effective optimizer.
    model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("\n--- Model Summary ---")
    model.summary()
    print("---------------------\n")

    # 4. Train the Model
    print("Starting model training...")
    history = model.fit(
        train_generator,
        epochs=NUM_EPOCHS,
        validation_data=validation_generator
    )
    print("✅ Training complete!")

    # 5. Save the Final Model
    model.save(MODEL_SAVE_PATH)
    print(f"✅ Model saved to '{MODEL_SAVE_PATH}'")
    
    # Also save the class indices (e.g., {'T-Shirt': 0, 'Jeans': 1, ...})
    # We will need this mapping to understand the model's predictions later.
    import json
    with open('class_indices.json', 'w') as f:
        json.dump(train_generator.class_indices, f)
    print("✅ Class indices saved to 'class_indices.json'")


if __name__ == '__main__':
    train_model()
