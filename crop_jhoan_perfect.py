import os
from PIL import Image, ImageOps

project_dir = r"c:\Users\ANA KARINA\Desktop\podio emdegol"
jhoan_path = os.path.join(project_dir, "JHOAN FIFA 2.png")

img = Image.open(jhoan_path).convert("RGBA")
width, height = img.size
print(f"Jhoan sheet size: {width}x{height}")

# Sample background color
bg_color = img.getpixel((10, 10))
print(f"Jhoan bg color: {bg_color}")

# Search region for Jhoan's drawings: bottom left
# X from 50 to 950, Y from 1350 to 2030
search_rect = (50, 1350, 950, 2030)
cropped = img.crop(search_rect)
w_reg, h_reg = cropped.size

# Find foreground mask
mask = []
for y in range(h_reg):
    row = []
    for x in range(w_reg):
        r, g, b, a = cropped.getpixel((x, y))
        dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
        row.append(dist > 30)
    mask.append(row)

# Get column projections
col_counts = [sum(mask[y][x] for y in range(h_reg)) for x in range(w_reg)]

# Find figure intervals (Front, Side, Back)
intervals = []
in_fig = False
start = 0
for x in range(w_reg):
    if col_counts[x] > 40:
        if not in_fig:
            start = x
            in_fig = True
    else:
        if in_fig:
            w_fig = x - start
            if w_fig > 50:
                intervals.append((start, x))
            in_fig = False
if in_fig:
    intervals.append((start, w_reg - 1))

print("Found intervals in region:", intervals)

def flood_fill_background(img_crop, tolerance=30):
    w, h = img_crop.size
    bg = img_crop.getpixel((0, 0))
    visited = [[False for _ in range(w)] for _ in range(h)]
    pixels = list(img_crop.getdata())
    
    queue = []
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited[0][x] = True
        visited[h - 1][x] = True
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
        visited[y][0] = True
        visited[y][w - 1] = True
        
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        idx = y * w + x
        r, g, b, a = pixels[idx]
        dist_exact = ((r - bg[0])**2 + (g - bg[1])**2 + (b - bg[2])**2)**0.5
        if dist_exact < tolerance:
            pixels[idx] = (0, 0, 0, 0)
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    if not visited[ny][nx]:
                        visited[ny][nx] = True
                        queue.append((nx, ny))
    img_crop.putdata(pixels)
    return img_crop

for idx, (x1, x2) in enumerate(intervals[:3]):
    row_counts = [sum(mask[y][x] for x in range(x1, x2)) for y in range(h_reg)]
    y_start = 0
    for y in range(h_reg):
        if row_counts[y] > 5:
            y_start = y
            break
            
    # Find feet bottom
    y_end = h_reg - 1
    found_gap = False
    for y in range(y_start + 100, h_reg):
        if row_counts[y] < 8:
            has_text_below = False
            for ty in range(y + 5, min(h_reg, y + 60)):
                if row_counts[ty] > 5:
                    has_text_below = True
                    break
            if has_text_below:
                y_end = y - 5
                found_gap = True
                break
                
    if not found_gap:
        for y in range(h_reg - 1, -1, -1):
            if row_counts[y] > 5:
                y_end = y
                break

    # Add padding
    crop_x1 = max(50, 50 + x1 - 10)
    crop_y1 = max(1350, 1350 + y_start - 10)
    crop_x2 = min(950, 50 + x2 + 10)
    crop_y2 = min(2030, 1350 + y_end)

    print(f"Jhoan Figure {idx+1} bounds: X=({crop_x1}, {crop_x2}), Y=({crop_y1}, {crop_y2})")
    
    sprite = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    sprite_clean = flood_fill_background(sprite)
    
    filename = f"jhoan_360_{idx+1}.png"
    sprite_clean.save(os.path.join(project_dir, filename))
    print(f"Saved {filename}")

# Generate mirrored Side frame
side_path = os.path.join(project_dir, "jhoan_360_2.png")
if os.path.exists(side_path):
    side_img = Image.open(side_path)
    mirrored = ImageOps.mirror(side_img)
    mirrored.save(os.path.join(project_dir, "jhoan_360_4.png"))
    print("Generated mirrored jhoan_360_4.png")
