import os
from PIL import Image, ImageOps

project_dir = r"c:\Users\ANA KARINA\Desktop\podio emdegol"

def get_foreground_bbox_transparency(img):
    # This finds the bounding boxes of non-transparent areas (alpha > 5)
    width, height = img.size
    
    # We look for columns that contain non-transparent pixels
    col_counts = []
    for x in range(width):
        col_alpha_sum = sum(img.getpixel((x, y))[3] > 10 for y in range(height))
        col_counts.append(col_alpha_sum)
        
    intervals = []
    in_fig = False
    start = 0
    for x in range(width):
        if col_counts[x] > 20: # column has non-transparent pixels
            if not in_fig:
                start = x
                in_fig = True
        else:
            if in_fig:
                w_fig = x - start
                if w_fig > 25: # minimum figure width
                    intervals.append((start, x))
                in_fig = False
    if in_fig:
        intervals.append((start, width - 1))
        
    return intervals

def crop_transparent_sheet(img_name, prefix):
    img_path = os.path.join(project_dir, img_name)
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path).convert("RGBA")
    intervals = get_foreground_bbox_transparency(img)
    print(f"[{img_name}] Detected intervals: {intervals}")
    
    # Sort and pick the 3 largest intervals (Front, Side, Back)
    intervals = sorted(intervals, key=lambda pair: pair[1] - pair[0], reverse=True)[:3]
    intervals = sorted(intervals, key=lambda pair: pair[0]) # left to right
    
    for idx, (x1, x2) in enumerate(intervals):
        # Find vertical limits (Y bounds of alpha > 10)
        width, height = img.size
        y_start = 0
        for y in range(height):
            if any(img.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                y_start = y
                break
        
        y_end = height - 1
        for y in range(height - 1, -1, -1):
            if any(img.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                y_end = y
                break
                
        # Exclude text labels by scanning from the bottom
        # Let's check the projection of row alphas to see if there is a gap for text labels
        # Wait! Since the user cropped them "without background", maybe the text is also removed?
        # Let's scan to see if there is text at the bottom.
        # Actually, we can check if there's a horizontal gap of empty pixels.
        found_gap = False
        for y in range(y_start + 100, y_end):
            row_count = sum(img.getpixel((x, y))[3] > 10 for x in range(x1, x2))
            if row_count == 0: # a gap!
                # Check if there is something below
                has_pixels_below = any(img.getpixel((x, ty))[3] > 10 for ty in range(y + 2, y_end + 1) for x in range(x1, x2))
                if has_pixels_below:
                    y_end = y - 1
                    found_gap = True
                    break
                    
        crop_x1 = max(0, x1 - 5)
        crop_y1 = max(0, y_start - 5)
        crop_x2 = min(width, x2 + 5)
        crop_y2 = min(height, y_end + 5)
        
        sprite = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
        filename = f"{prefix}_360_{idx+1}.png"
        sprite.save(os.path.join(project_dir, filename))
        print(f"Saved {filename} with size {sprite.size}")
        
    # Generate mirrored Side frame
    side_path = os.path.join(project_dir, f"{prefix}_360_2.png")
    if os.path.exists(side_path):
        side_img = Image.open(side_path)
        mirrored = ImageOps.mirror(side_img)
        mirrored.save(os.path.join(project_dir, f"{prefix}_360_4.png"))
        print(f"Generated mirrored {prefix}_360_4.png")

# Run for all three
crop_transparent_sheet("lina fifa final.png", "lina")
crop_transparent_sheet("JENNIFER FIFA FINAL.png", "jennifer")
crop_transparent_sheet("JHOAN FIFA 2 (1).png", "jhoan")
