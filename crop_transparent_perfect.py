import os
from PIL import Image, ImageOps

project_dir = r"c:\Users\ANA KARINA\Desktop\podio emdegol"

def crop_figures_from_transparent_sheet(img_name, search_box, prefix, min_fig_w=40):
    img_path = os.path.join(project_dir, img_name)
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path).convert("RGBA")
    x_min, y_min, x_max, y_max = search_box
    
    # Crop the search region
    region = img.crop(search_box)
    w_reg, h_reg = region.size
    
    # Column projections of alpha channel
    col_alphas = [sum(region.getpixel((x, y))[3] > 10 for y in range(h_reg)) for x in range(w_reg)]
    
    # Find intervals of columns that have non-transparent pixels
    # Smooth column counts to bridge tiny gaps (like lines)
    smoothed = []
    for i in range(len(col_alphas)):
        left = max(0, i - 4)
        right = min(len(col_alphas), i + 5)
        smoothed.append(sum(col_alphas[left:right]) / (right - left))
        
    intervals = []
    in_fig = False
    start = 0
    for x in range(w_reg):
        if smoothed[x] > 4: # threshold for active column
            if not in_fig:
                start = x
                in_fig = True
        else:
            if in_fig:
                w_fig = x - start
                if w_fig >= min_fig_w:
                    intervals.append((start, x))
                in_fig = False
    if in_fig:
        intervals.append((start, w_reg - 1))
        
    print(f"[{img_name}] Detected raw intervals: {intervals}")
    
    # Filter intervals to keep only those with height > 300 (to exclude small color palettes or label close-ups)
    valid_figs = []
    for x1, x2 in intervals:
        # Find exact Y bounds of active pixels in this interval
        y_start = -1
        for y in range(h_reg):
            if any(region.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                y_start = y
                break
        
        if y_start == -1:
            continue
            
        y_end = h_reg - 1
        for y in range(h_reg - 1, -1, -1):
            if any(region.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                y_end = y
                break
                
        fig_h = y_end - y_start
        if fig_h >= 300: # Tall figure drawing
            valid_figs.append((x1, x2, y_start, y_end))
            
    print(f"[{img_name}] Filtered tall intervals: {[(f[0], f[1]) for f in valid_figs]}")
    
    # Pick the 3 largest/left-most valid figures
    valid_figs = sorted(valid_figs, key=lambda f: f[1] - f[0], reverse=True)[:3]
    valid_figs = sorted(valid_figs, key=lambda f: f[0]) # sort left to right
    
    if len(valid_figs) < 3:
        print(f"Warning: only found {len(valid_figs)} figures, trying fallback simple split.")
        chunk_w = w_reg // 3
        # Simple split fallback
        valid_figs = []
        for i in range(3):
            x1, x2 = i * chunk_w, (i + 1) * chunk_w
            # Find bounds
            y_start = 0
            for y in range(h_reg):
                if any(region.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                    y_start = y
                    break
            y_end = h_reg - 1
            for y in range(h_reg - 1, -1, -1):
                if any(region.getpixel((x, y))[3] > 10 for x in range(x1, x2)):
                    y_end = y
                    break
            valid_figs.append((x1, x2, y_start, y_end))
        
    for idx, (x1, x2, y_start, y_end) in enumerate(valid_figs):
        # Convert coordinates back to sheet space
        abs_x1 = x_min + x1
        abs_y1 = y_min + y_start
        abs_x2 = x_min + x2
        abs_y2 = y_min + y_end
        
        # Apply standard padding (5px)
        abs_x1 = max(0, abs_x1 - 5)
        abs_y1 = max(0, abs_y1 - 5)
        abs_x2 = min(img.width, abs_x2 + 5)
        abs_y2 = min(img.height, abs_y2 + 5)
        
        sprite = img.crop((abs_x1, abs_y1, abs_x2, abs_y2))
        
        filename = f"{prefix}_360_{idx+1}.png"
        sprite.save(os.path.join(project_dir, filename))
        print(f"Saved {filename} with size {sprite.size}")
        
    # Generate mirrored Side frame (4th frame)
    side_path = os.path.join(project_dir, f"{prefix}_360_2.png")
    if os.path.exists(side_path):
        side_img = Image.open(side_path)
        mirrored = ImageOps.mirror(side_img)
        mirrored.save(os.path.join(project_dir, f"{prefix}_360_4.png"))
        print(f"Generated mirrored {prefix}_360_4.png")

# Define target regions for each sheet containing the 3 drawings
# Format: (x_min, y_min, x_max, y_max)
lina_box = (361, 69, 794, 484)
jennifer_box = (382, 310, 972, 721)
jhoan_box = (112, 1408, 947, 1995)

# Run crops
crop_figures_from_transparent_sheet("lina fifa final.png", lina_box, "lina")
crop_figures_from_transparent_sheet("JENNIFER FIFA FINAL.png", jennifer_box, "jennifer")
crop_figures_from_transparent_sheet("JHOAN FIFA 2 (1).png", jhoan_box, "jhoan")
