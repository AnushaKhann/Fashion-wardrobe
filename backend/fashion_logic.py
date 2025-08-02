# backend/fashion_logic.py
import random

# Define which of our AI categories fit into general clothing types
# This helps the logic know what's a top, bottom, etc.
CLOTHING_TYPES = {
    'top': ['T-Shirt', 'Suit', 'Sweater', 'Scarf'],
    'bottom': ['Jeans', 'Skirt'],
    'dress': ['Dress'],
    'outerwear': ['Jacket'],
    'shoes': ['Shoes']
}

# Simple rules mapping occasion to clothing categories
# For example, a 'Formal' occasion requires items categorized as 'Suit'.
OCCASION_RULES = {
    'Formal': ['Suit'],
    'Casual': ['T-Shirt', 'Jeans', 'Sweater', 'Skirt', 'Jacket', 'Shoes'],
    'Party': ['Dress', 'Skirt', 'T-Shirt'],
    'Work': ['Suit', 'Skirt', 'T-Shirt']
}

def generate_outfit_from_wardrobe(all_items, occasion):
    """
    Generates a simple outfit based on the user's wardrobe and a given occasion.

    Args:
        all_items (list): A list of ClothingItem objects from the database.
        occasion (str): The requested occasion (e.g., "Casual", "Formal").

    Returns:
        A dictionary representing the outfit, or None if no suitable outfit can be found.
    """
    
    # Get the list of allowed categories for the given occasion
    allowed_categories = OCCASION_RULES.get(occasion, [])
    if not allowed_categories:
        return None

    # Filter the user's wardrobe to only include items matching the occasion
    wardrobe = [item for item in all_items if item.category in allowed_categories]

    # Separate the filtered wardrobe into lists by clothing type
    tops = [item for item in wardrobe if item.category in CLOTHING_TYPES['top']]
    bottoms = [item for item in wardrobe if item.category in CLOTHING_TYPES['bottom']]
    
    # --- Basic Outfit Generation Logic ---
    # For now, we'll just try to find one top and one bottom.
    # This can be expanded with more complex rules later!
    
    if not tops or not bottoms:
        # Not enough items to make a basic outfit
        return None

    # Select a random top and bottom from the suitable items
    selected_top = random.choice(tops)
    selected_bottom = random.choice(bottoms)

    # Return the selected outfit
    return {
        'top': selected_top.to_dict(),
        'bottom': selected_bottom.to_dict(),
        'outerwear': None # Placeholder for now
    }
