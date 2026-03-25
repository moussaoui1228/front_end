from PIL import Image

def remove_white(image_path, output_path, tolerance=230, crops=(0, 0, 0, 0)):
    try:
        img = Image.open(image_path).convert("RGBA")
        
        # crops = (left_pct, top_pct, right_pct, bottom_pct)
        if any(c > 0 for c in crops):
            width, height = img.size
            left = int(width * crops[0])
            top = int(height * crops[1])
            right = int(width * (1 - crops[2]))
            bottom = int(height * (1 - crops[3]))
            img = img.crop((left, top, right, bottom))
            
        data = img.getdata()
        new_data = []
        
        for item in data:
            if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
                new_data.append((255, 255, 255, 0)) # transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed {output_path}")
    except Exception as e:
        print(f"Failed to process image: {e}")

def process_all():
    images = [
        ("public/olive-branch-1.jpg", "public/olive-branch-1.png", (0, 0, 0, 0)),
        ("public/olive-branch-2.jpg", "public/olive-branch-2.png", (0, 0, 0, 0)),
        ("public/olive-corner.jpg", "public/olive-corner.png", (0, 0, 0, 0)),
        ("public/olive-tree.jpg", "public/olive-tree.png", (0, 0, 0, 0)),
        ("public/olive-corner-2.jpg", "public/olive-corner-2.png", (0, 0, 0, 0)), # No crop for new image
        ("public/extra-1.jpg", "public/extra-1.png", (0, 0, 0, 0)),
        ("public/extra-2.jpg", "public/extra-2.png", (0, 0, 0, 0))
    ]
    for input_p, output_p, crops in images:
        remove_white(input_p, output_p, 235, crops)

process_all()
