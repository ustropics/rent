import os
import json

def scan_images_for_id(id, img_base_path="static/img"):
    """Scan the folder static/img/[id]/ for image files and return their paths."""
    img_folder = os.path.join(img_base_path, str(id))
    image_paths = []
    
    if os.path.exists(img_folder):
        for filename in os.listdir(img_folder):
            # Check if the file is an image (based on common extensions)
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
                # Construct the relative path
                image_path = os.path.join(img_folder, filename).replace('\\', '/')
                image_paths.append(image_path)
    
    return sorted(image_paths)  # Sort for consistent order

def update_data_with_images(data_path="static/json/data.json"):
    """Read data.json, scan for images, and update with image paths."""
    # Read data.json
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {data_path}: {e}")
        return

    # Process each entry
    for item in data:
        if 'id' in item:
            # Scan for images in static/img/[id]/
            images = scan_images_for_id(item['id'])
            # Add images array to the item
            item['images'] = images
        else:
            item['images'] = []  # Fallback if no ID

    # Write updated data back to data.json
    try:
        with open(data_path, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"Successfully updated {data_path} with image paths.")
    except Exception as e:
        print(f"Error writing to {data_path}: {e}")

if __name__ == "__main__":
    update_data_with_images()