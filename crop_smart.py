import os
from PIL import Image, ImageOps

project_dir = r"c:\Users\ANA KARINA\Desktop\podio emdegol"

def auto_crop_figures(img_name, search_rect, num_figures=3, padding=15):
    # search_rect is (left, top, right, bottom) representing the region where the Front/Side/Back drawings are
    img_path = os.path.join(project_dir, img_name)
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return []

    img = Image.open(img_path).convert("RGBA")
    cropped_region = img.crop(search_rect)
    w_reg, h_reg = cropped_region.size

    # Sample background color near top-left of the region
    bg_color = cropped_region.getpixel((5, 5))
    
    # Create mask of non-bg pixels
    mask = []
    for y in range(h_reg):
        row = []
        for x in range(w_reg):
            r, g, b, a = cropped_region.getpixel((x, y))
            dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
            row.append(dist > 30) # True if foreground
        mask.append(row)

    # 1. Column analysis to find horizontal bounds of each figure
    col_counts = [sum(mask[y][x] for y in range(h_reg)) for x in range(w_reg)]
    
    # Smooth column counts slightly
    smoothed = []
    for i in range(len(col_counts)):
        left = max(0, i - 5)
        right = min(len(col_counts), i + 6)
        smoothed.append(sum(col_counts[left:right]) / (right - left))

    # Find clusters of columns
    threshold = 10 # More than 10 pixels high of non-bg
    intervals = []
    in_fig = False
    start = 0
    for x in range(w_reg):
        if smoothed[x] > threshold:
            if not in_fig:
                start = x
                in_fig = True
        else:
            if in_fig:
                width = x - start
                if width > 40: # figure width must be at least 40px
                    intervals.append((start, x))
                in_fig = False
    if in_fig:
        intervals.append((start, w_reg - 1))

    print(f"[{img_name}] Found X intervals: {intervals}")
    
    # We expect exactly `num_figures` (3: Front, Side, Back)
    # If we found more or fewer, filter to the best/largest ones
    intervals = sorted(intervals, key=lambda pair: pair[1] - pair[0], reverse=True)[:num_figures]
    intervals = sorted(intervals, key=lambda pair: pair[0]) # sort left to right

    final_crops = []
    for idx, (x_start, x_end) in enumerate(intervals):
        # 2. Row analysis within these columns to find the vertical bounds (hair to toes)
        row_counts = [sum(mask[y][x] for x in range(x_start, x_end)) for y in range(h_reg)]
        
        y_start = 0
        for y in range(h_reg):
            if row_counts[y] > 2: # non-trivial foreground
                y_start = y
                break
        
        y_end = h_reg - 1
        for y in range(h_reg - 1, -1, -1):
            if row_counts[y] > 2:
                y_end = y
                break

        # Apply padding
        x1 = max(0, x_start - padding)
        y1 = max(0, y_start - padding)
        x2 = min(w_reg, x_end + padding)
        y2 = min(h_reg, y_end + padding)

        # Crop the actual sprite from the region
        sprite = cropped_region.crop((x1, y1, x2, y2))
        
        # Transparent conversion
        sprite_rgba = sprite.convert("RGBA")
        data = sprite_rgba.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item
            dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
            if dist < 32:
                new_data.append((0, 0, 0, 0)) # fully transparent
            else:
                new_data.append(item)
        sprite_rgba.putdata(new_data)

        final_crops.append(sprite_rgba)
        
    return final_crops

# ----------------- EXECUTE CROPS -----------------

# Jennifer: drawings are in the center-left:
# let's search from X=800 to X=1650, Y=600 to Y=1500 (estimates on 2048x2048)
# Wait, let's verify where Jennifer's figures are.
# In "JENNIFER RINCON-FIFA.png":
# Let's search columns:
# JENNIFER RINCON-FIFA has size 2048x2048.
# The Front/Side/Back drawings are at Y = 600 to 1500.
# Let's search X range 750 to 1700, Y range 550 to 1550.
jennifer_rect = (750, 550, 1700, 1550)
jennifer_sprites = auto_crop_figures("JENNIFER RINCON-FIFA.png", jennifer_rect)

# Jhoan: drawings are in the bottom left
# Y range: 1400 to 2000, X range: 80 to 950
jhoan_rect = (80, 1350, 950, 2030)
jhoan_sprites = auto_crop_figures("JHOAN FIFA 2.png", jhoan_rect)

# Lina: drawings are at the top right
# Y range: 100 to 1000, X range: 800 to 1800 (on 1844 width)
lina_rect = (800, 100, 1800, 1000)
lina_sprites = auto_crop_figures("LINA FIFA 2.png", lina_rect)

# Save sprites and generate mirrored 4th frames
for prefix, sprites in [("jennifer", jennifer_sprites), ("jhoan", jhoan_sprites), ("lina", lina_sprites)]:
    print(f"Processing prefix {prefix}, found {len(sprites)} sprites.")
    for idx, sprite in enumerate(sprites):
        filename = f"{prefix}_360_{idx+1}.png"
        sprite.save(os.path.join(project_dir, filename))
        print(f"Saved {filename}")

    # Generate mirrored 4th frame (from 2nd frame - Side)
    if len(sprites) >= 2:
        side_img = sprites[1] # Frame 2 is Side
        mirrored = ImageOps.mirror(side_img)
        mirrored.save(os.path.join(project_dir, f"{prefix}_360_4.png"))
        print(f"Generated mirrored {prefix}_360_4.png")
