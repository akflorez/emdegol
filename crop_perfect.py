import os
from PIL import Image, ImageOps

project_dir = r"c:\Users\ANA KARINA\Desktop\podio emdegol"

def flood_fill_background(img, tolerance=25):
    # Convert image to RGBA
    img = img.convert("RGBA")
    width, height = img.size
    
    # Sample background color at (0, 0)
    bg_color = img.getpixel((0, 0))
    
    # Grid of visited pixels
    visited = [[False for _ in range(width)] for _ in range(height)]
    
    # Output image data
    pixels = list(img.getdata())
    
    # BFS queue for flood fill
    # We seed it with all border pixels
    queue = []
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
        visited[0][x] = True
        visited[height - 1][x] = True
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        visited[y][0] = True
        visited[y][width - 1] = True
        
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        
        # Check current pixel color
        idx = y * width + x
        r, g, b, a = pixels[idx]
        
        # Distance to sampled background
        dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
        
        if dist < tolerance:
            # Set to fully transparent
            pixels[idx] = (0, 0, 0, 0)
            
            # Add neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if not visited[ny][nx]:
                        visited[ny][nx] = True
                        queue.append((nx, ny))
                        
    img.putdata(pixels)
    return img

def crop_and_process(img_name, crops, prefix):
    img_path = os.path.join(project_dir, img_name)
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path)
    
    for idx, box in enumerate(crops):
        cropped = img.crop(box)
        # Apply flood fill to remove background from outer borders in
        processed = flood_fill_background(cropped, tolerance=30)
        
        filename = f"{prefix}_360_{idx+1}.png"
        processed.save(os.path.join(project_dir, filename))
        print(f"Saved {filename}")
        
    # Generate mirrored side frame
    side_path = os.path.join(project_dir, f"{prefix}_360_2.png")
    if os.path.exists(side_path):
        side_img = Image.open(side_path)
        mirrored = ImageOps.mirror(side_img)
        mirrored.save(os.path.join(project_dir, f"{prefix}_360_4.png"))
        print(f"Generated mirrored {prefix}_360_4.png")

# ----------------- COORDINATES WITHOUT TEXT LABELS -----------------

# Jennifer: Y-range 305 to 685 (stops before the "Front", "Side", "Back" texts)
jennifer_crops = [
    (385, 305, 520, 685),  # Front
    (570, 305, 655, 685),  # Side
    (685, 305, 815, 685)   # Back
]

# Jhoan: Y-range 695 to 945 (stops before the texts)
jhoan_crops = [
    (45, 695, 165, 945),   # Front
    (210, 695, 300, 945),  # Side
    (345, 695, 465, 945)   # Back
]

# Lina: Y-range 60 to 425 (stops before the texts)
lina_crops = [
    (440, 60, 600, 425),   # Front
    (645, 60, 750, 425),   # Side
    (790, 60, 819, 425)    # Back
]

# Run crops
crop_and_process("JENNIFER RINCON-FIFA.png", jennifer_crops, "jennifer")
crop_and_process("JHOAN FIFA 2.png", jhoan_crops, "jhoan")
crop_and_process("LINA FIFA 2.png", lina_crops, "lina")
