import json
import uuid
import os
import random

# Ensure we're running from the hunter dir or evrevia root
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from input_urls import URLS

LUXURY_ADJECTIVES = ["Premium", "Exquisite", "Luxurious", "Signature", "Ethereal", "Timeless", "Chic", "Elegant", "Opulent", "Bespoke"]
MATERIAL_ADJECTIVES = ["Silk", "Cashmere Blend", "Egyptian Cotton", "Satin", "Velvet", "Linen", "Merino Wool", "Organza"]

CATEGORY_IMAGE_MAP = {
    "Casual t -shirt": "/images/products/casual_tshirt_1.png",
    "Plain T-shirt": "/images/products/plain_white_tshirt.png",
    "Printed T-shirt": "/images/products/casual_tshirt_1.png",
    "Polo T-shirt": "/images/products/plain_white_tshirt.png",
    "Tops": "/images/products/stylish_crop_top.png",
    "Tunics": "/images/products/luxury_tunic.png",
    "Crop top": "/images/products/stylish_crop_top.png",
    "Shirts": "/images/products/plain_white_tshirt.png",
    "Dresses": "/images/products/elegant_gown.png",
    "Sweaters": "/images/products/casual_tshirt_1.png",
    "Jackets": "/images/products/elegant_gown.png",
}

def generate_luxury_title(subcategory):
    adj = random.choice(LUXURY_ADJECTIVES)
    mat = random.choice(MATERIAL_ADJECTIVES)
    base = subcategory.split(" ")[-1] if " " in subcategory else subcategory
    return f"EVRÉVIA {adj} {mat} {base.capitalize()}"

def generate_luxury_description(title, subcategory):
    return f"Discover the epitome of elegance with the {title}. Expertly crafted to elevate your wardrobe, this piece features flawless tailoring and premium materials, designed exclusively for the modern aesthetic. Perfect for {subcategory.lower()} styling."

def main():
    products = []
    
    for subcategory, urls in URLS.items():
        image_path = CATEGORY_IMAGE_MAP.get(subcategory, "/images/products/casual_tshirt_1.png")
        
        for url in urls:
            title = generate_luxury_title(subcategory)
            desc = generate_luxury_description(title, subcategory)
            price = random.randint(150, 450) * 10
            mrp = int(price * 1.5)
            
            product_id = "prod_" + str(uuid.uuid4())[:8]
            
            prod = {
                "id": product_id,
                "name": title,
                "price": price,
                "originalPrice": mrp,
                "category": "Clothing",
                "subCategory": subcategory,
                "description": desc,
                "features": ["Premium Fabric", "Flawless Fit", "Durable Stitching", "Signature EVRÉVIA detailing"],
                "care": ["Dry Clean Only", "Do not bleach", "Iron on low heat"],
                "materials": random.choice(MATERIAL_ADJECTIVES),
                "stock": random.randint(10, 100),
                "rating": round(random.uniform(4.0, 5.0), 1),
                "reviews": random.randint(5, 120),
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["Black", "White", "Navy", "Beige"],
                "image": image_path,
                "gallery": [image_path],
                "isNewArrival": random.choice([True, False]),
                "isBestSeller": random.choice([True, False, False])
            }
            products.append(prod)
            
    # Save the JS file format directly
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "src", "data", "mockProducts.js")
    
    js_content = "export const mockProducts = " + json.dumps(products, indent=2) + ";\n"
    
    with open(output_path, "w") as f:
        f.write(js_content)
        
    print(f"Generated {len(products)} luxury mock products successfully at {output_path}")

if __name__ == "__main__":
    main()
