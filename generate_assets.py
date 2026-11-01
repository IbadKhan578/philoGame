import os
from PIL import Image, ImageDraw, ImageFilter

ASSETS_DIR = "frontend/public/assets"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

# ----------------------------------------------------
# Character Spritesheet Generator (4 directions x 4 frames, 48x48 per frame)
# ----------------------------------------------------
def create_character_spritesheet(char_type, output_path):
    """
    Creates a 4-row x 4-column spritesheet (192 x 192 px)
    Rows:
      0: Down (facing front)
      1: Left
      2: Right
      3: Up (facing back)
    Cols:
      0: Idle
      1: Walk Step 1
      2: Idle
      3: Walk Step 2
    """
    sheet = Image.new("RGBA", (192, 192), (0, 0, 0, 0))

    # Palette setup based on character
    if char_type == "player":
        skin = (255, 218, 185)
        skin_shadow = (230, 180, 150)
        hair = (100, 60, 30)
        robe = (40, 140, 140)     # Teal scholar tunic
        robe_dark = (25, 95, 95)
        accent = (220, 150, 40)   # Amber satchel / scarf
        legs = (60, 50, 40)
        boots = (110, 70, 40)
        has_beard = False
        beard_color = None
        has_wreath = False
    elif char_type == "socrates":
        skin = (245, 205, 175)
        skin_shadow = (220, 170, 140)
        hair = (210, 210, 210)    # Bald top, grey sides
        robe = (160, 120, 85)     # Simple brown himation
        robe_dark = (120, 85, 60)
        accent = (240, 230, 210)  # White inner trim
        legs = skin
        boots = (100, 70, 45)     # Sandals
        has_beard = True
        beard_color = (220, 220, 220)
        is_bald = True
        has_wreath = False
    elif char_type == "plato":
        skin = (250, 210, 180)
        skin_shadow = (225, 175, 145)
        hair = (235, 235, 240)    # Majestic thick white hair
        robe = (180, 40, 60)      # Crimson/wine-red himation
        robe_dark = (130, 25, 45)
        accent = (245, 240, 220)  # Classical white drape
        legs = skin
        boots = (110, 80, 50)
        has_beard = True
        beard_color = (235, 235, 240)
        is_bald = False
        has_wreath = False
    elif char_type == "aristotle":
        skin = (245, 205, 170)
        skin_shadow = (215, 165, 130)
        hair = (75, 60, 50)       # Dark curly hair
        robe = (45, 75, 145)      # Deep royal blue
        robe_dark = (30, 50, 100)
        accent = (220, 180, 50)   # Gold philosopher trim
        legs = skin
        boots = (90, 65, 45)
        has_beard = True
        beard_color = (130, 115, 105) # Salt and pepper
        is_bald = False
        has_wreath = False
    elif char_type == "marcus_aurelius":
        skin = (248, 208, 178)
        skin_shadow = (220, 170, 140)
        hair = (90, 70, 50)       # Roman cropped curls
        robe = (120, 30, 130)     # Imperial Tyrian purple
        robe_dark = (80, 18, 90)
        accent = (230, 195, 65)   # Gold cuirass/fibula
        legs = (140, 110, 70)     # Roman greaves
        boots = (120, 60, 40)
        has_beard = True
        beard_color = (100, 80, 60)
        is_bald = False
        has_wreath = True

    # Draw each frame
    for row, direction in enumerate(["down", "left", "right", "up"]):
        for col in range(4):
            x_offset = col * 48
            y_offset = row * 48
            frame = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
            draw = ImageDraw.Draw(frame)

            # Walking leg offset
            leg_bob = 0
            leg1_dy = 0
            leg2_dy = 0
            arm_swing = 0

            if col == 1:   # step 1
                leg_bob = 1
                leg1_dy = -2
                leg2_dy = 2
                arm_swing = 2
            elif col == 3: # step 2
                leg_bob = 1
                leg1_dy = 2
                leg2_dy = -2
                arm_swing = -2

            cx = 24
            cy = 24 - leg_bob

            # 1. Shadow underneath
            draw.ellipse([cx - 12, 42, cx + 12, 47], fill=(20, 30, 20, 80))

            # 2. Legs / Feet
            if direction in ["down", "up"]:
                # Left leg
                draw.rectangle([cx - 7, 36 + leg1_dy, cx - 2, 43 + leg1_dy], fill=boots, outline=(30, 20, 15, 200))
                # Right leg
                draw.rectangle([cx + 2, 36 + leg2_dy, cx + 7, 43 + leg2_dy], fill=boots, outline=(30, 20, 15, 200))
            elif direction == "left":
                draw.rectangle([cx - 5 + leg1_dy, 36, cx - 1 + leg1_dy, 43], fill=boots, outline=(30, 20, 15, 200))
                draw.rectangle([cx + 1 + leg2_dy, 36, cx + 5 + leg2_dy, 43], fill=boots, outline=(30, 20, 15, 200))
            elif direction == "right":
                draw.rectangle([cx - 5 + leg2_dy, 36, cx - 1 + leg2_dy, 43], fill=boots, outline=(30, 20, 15, 200))
                draw.rectangle([cx + 1 + leg1_dy, 36, cx + 5 + leg1_dy, 43], fill=boots, outline=(30, 20, 15, 200))

            # 3. Body / Robe
            if direction == "down":
                # Robe body
                draw.polygon([
                    (cx - 10, cy + 2),
                    (cx + 10, cy + 2),
                    (cx + 12, cy + 18),
                    (cx - 12, cy + 18)
                ], fill=robe, outline=robe_dark)

                # Classical fold / drapery / belt
                draw.line([(cx - 11, cy + 18), (cx + 11, cy + 18)], fill=accent, width=2)
                draw.line([(cx - 4, cy + 2), (cx + 6, cy + 18)], fill=accent, width=2)

                # Arms
                draw.rectangle([cx - 13, cy + 4 - arm_swing, cx - 9, cy + 13 - arm_swing], fill=robe, outline=robe_dark)
                draw.ellipse([cx - 13, cy + 12 - arm_swing, cx - 9, cy + 16 - arm_swing], fill=skin)
                draw.rectangle([cx + 9, cy + 4 + arm_swing, cx + 13, cy + 13 + arm_swing], fill=robe, outline=robe_dark)
                draw.ellipse([cx + 9, cy + 12 + arm_swing, cx + 13, cy + 16 + arm_swing], fill=skin)

                # Head
                draw.ellipse([cx - 9, cy - 14, cx + 9, cy + 4], fill=skin, outline=skin_shadow)

                # Eyes
                draw.rectangle([cx - 5, cy - 6, cx - 3, cy - 3], fill=(30, 30, 40))
                draw.rectangle([cx + 3, cy - 6, cx + 5, cy - 3], fill=(30, 30, 40))
                # Eye sparkle
                draw.point((cx - 5, cy - 6), fill=(255, 255, 255))
                draw.point((cx + 3, cy - 6), fill=(255, 255, 255))

                # Hair
                if char_type == "player":
                    draw.arc([cx - 10, cy - 16, cx + 10, cy + 2], start=180, end=360, fill=hair, width=5)
                    draw.polygon([(cx - 9, cy - 10), (cx - 4, cy - 8), (cx, cy - 12), (cx + 6, cy - 8), (cx + 9, cy - 10), (cx + 8, cy - 16), (cx - 8, cy - 16)], fill=hair)
                elif char_type == "socrates":
                    # Bald forehead, bushy grey hair on sides
                    draw.ellipse([cx - 11, cy - 8, cx - 7, cy + 2], fill=hair)
                    draw.ellipse([cx + 7, cy - 8, cx + 11, cy + 2], fill=hair)
                    draw.arc([cx - 9, cy - 14, cx + 9, cy - 8], start=200, end=340, fill=(230, 200, 170), width=3)
                elif char_type in ["plato", "aristotle", "marcus_aurelius"]:
                    draw.arc([cx - 10, cy - 16, cx + 10, cy + 1], start=170, end=370, fill=hair, width=5)
                    draw.ellipse([cx - 9, cy - 15, cx + 9, cy - 9], fill=hair)

                # Beard
                if has_beard and beard_color:
                    draw.polygon([
                        (cx - 7, cy - 1),
                        (cx + 7, cy - 1),
                        (cx + 5, cy + 7),
                        (cx, cy + 9),
                        (cx - 5, cy + 7)
                    ], fill=beard_color, outline=(200, 200, 200, 180))

                # Laurel wreath for Marcus Aurelius
                if has_wreath:
                    draw.arc([cx - 9, cy - 16, cx + 9, cy - 8], start=180, end=360, fill=(230, 195, 40), width=3)
                    draw.ellipse([cx - 7, cy - 15, cx - 4, cy - 12], fill=(80, 170, 60))
                    draw.ellipse([cx + 4, cy - 15, cx + 7, cy - 12], fill=(80, 170, 60))

            elif direction == "up":
                # Back view
                draw.polygon([
                    (cx - 10, cy + 2),
                    (cx + 10, cy + 2),
                    (cx + 12, cy + 18),
                    (cx - 12, cy + 18)
                ], fill=robe, outline=robe_dark)
                # Robe mantle line
                draw.polygon([(cx - 8, cy + 2), (cx + 8, cy + 2), (cx, cy + 12)], fill=robe_dark)

                # Arms back
                draw.rectangle([cx - 13, cy + 4 + arm_swing, cx - 9, cy + 14 + arm_swing], fill=robe, outline=robe_dark)
                draw.rectangle([cx + 9, cy + 4 - arm_swing, cx + 13, cy + 14 - arm_swing], fill=robe, outline=robe_dark)

                # Head back
                draw.ellipse([cx - 9, cy - 14, cx + 9, cy + 4], fill=hair if not (char_type == "socrates") else skin, outline=hair if not (char_type == "socrates") else skin_shadow)
                if char_type == "socrates":
                    draw.arc([cx - 10, cy - 6, cx + 10, cy + 5], start=0, end=180, fill=hair, width=4)
                else:
                    draw.ellipse([cx - 9, cy - 14, cx + 9, cy + 2], fill=hair)

                if has_wreath:
                    draw.arc([cx - 9, cy - 13, cx + 9, cy - 7], start=0, end=180, fill=(230, 195, 40), width=3)

            elif direction == "left":
                # Side profile left
                draw.polygon([
                    (cx - 7, cy + 2),
                    (cx + 8, cy + 2),
                    (cx + 9, cy + 18),
                    (cx - 8, cy + 18)
                ], fill=robe, outline=robe_dark)

                # Arm left
                draw.rectangle([cx - 5, cy + 4 - arm_swing, cx - 1, cy + 14 - arm_swing], fill=robe, outline=robe_dark)
                draw.ellipse([cx - 6, cy + 12 - arm_swing, cx - 1, cy + 16 - arm_swing], fill=skin)

                # Head left
                draw.ellipse([cx - 8, cy - 14, cx + 7, cy + 3], fill=skin, outline=skin_shadow)
                # Left eye
                draw.rectangle([cx - 7, cy - 6, cx - 5, cy - 3], fill=(30, 30, 40))
                draw.point((cx - 7, cy - 6), fill=(255, 255, 255))

                # Hair
                if char_type == "socrates":
                    draw.ellipse([cx - 2, cy - 6, cx + 7, cy + 2], fill=hair)
                else:
                    draw.arc([cx - 8, cy - 15, cx + 8, cy], start=130, end=350, fill=hair, width=5)
                    draw.ellipse([cx - 4, cy - 14, cx + 8, cy - 5], fill=hair)

                if has_beard and beard_color:
                    draw.polygon([(cx - 8, cy - 1), (cx - 1, cy - 1), (cx - 4, cy + 8)], fill=beard_color)

                if has_wreath:
                    draw.arc([cx - 7, cy - 14, cx + 7, cy - 8], start=180, end=330, fill=(230, 195, 40), width=3)

            elif direction == "right":
                # Side profile right
                draw.polygon([
                    (cx - 8, cy + 2),
                    (cx + 7, cy + 2),
                    (cx + 8, cy + 18),
                    (cx - 9, cy + 18)
                ], fill=robe, outline=robe_dark)

                # Arm right
                draw.rectangle([cx + 1, cy + 4 + arm_swing, cx + 5, cy + 14 + arm_swing], fill=robe, outline=robe_dark)
                draw.ellipse([cx + 1, cy + 12 + arm_swing, cx + 6, cy + 16 + arm_swing], fill=skin)

                # Head right
                draw.ellipse([cx - 7, cy - 14, cx + 8, cy + 3], fill=skin, outline=skin_shadow)
                # Right eye
                draw.rectangle([cx + 5, cy - 6, cx + 7, cy - 3], fill=(30, 30, 40))
                draw.point((cx + 5, cy - 6), fill=(255, 255, 255))

                # Hair
                if char_type == "socrates":
                    draw.ellipse([cx - 7, cy - 6, cx + 2, cy + 2], fill=hair)
                else:
                    draw.arc([cx - 8, cy - 15, cx + 8, cy], start=190, end=40, fill=hair, width=5)
                    draw.ellipse([cx - 8, cy - 14, cx + 4, cy - 5], fill=hair)

                if has_beard and beard_color:
                    draw.polygon([(cx + 1, cy - 1), (cx + 8, cy - 1), (cx + 4, cy + 8)], fill=beard_color)

                if has_wreath:
                    draw.arc([cx - 7, cy - 14, cx + 7, cy - 8], start=210, end=360, fill=(230, 195, 40), width=3)

            # Paste into sheet
            sheet.paste(frame, (x_offset, y_offset))

    sheet.save(output_path)
    print(f"Saved spritesheet: {output_path}")

# ----------------------------------------------------
# High-Resolution Portrait Generator (240x240)
# ----------------------------------------------------
def create_portrait(char_type, output_path):
    img = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Circular classical cameo backdrop
    bg_colors = {
        "socrates": ((220, 200, 175), (170, 140, 110)),
        "plato": ((235, 195, 205), (180, 80, 100)),
        "aristotle": ((190, 215, 240), (90, 130, 185)),
        "marcus_aurelius": ((225, 200, 235), (140, 80, 160))
    }
    inner_c, border_c = bg_colors.get(char_type, ((220, 220, 220), (120, 120, 120)))

    # Cameo background circle with shadow
    draw.ellipse([15, 15, 225, 225], fill=border_c)
    draw.ellipse([21, 21, 219, 219], fill=(250, 245, 235))
    draw.ellipse([27, 27, 213, 213], fill=inner_c)

    # Greek meander accent border points
    for angle in range(0, 360, 30):
        import math
        rad = math.radians(angle)
        px = 120 + 98 * math.cos(rad)
        py = 120 + 98 * math.sin(rad)
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(210, 180, 70))

    cx, cy = 120, 125

    if char_type == "socrates":
        skin = (250, 215, 185)
        # Shoulders & simple toga
        draw.polygon([(cx - 70, 210), (cx + 70, 210), (cx + 50, 165), (cx - 50, 165)], fill=(160, 120, 85))
        draw.line([(cx - 40, 165), (cx + 25, 210)], fill=(245, 240, 225), width=7)

        # Neck & Head
        draw.rectangle([cx - 20, 140, cx + 20, 175], fill=(235, 195, 165))
        draw.ellipse([cx - 45, 60, cx + 45, 150], fill=skin)

        # Socrates bald head shine
        draw.ellipse([cx - 20, 68, cx + 20, 95], fill=(255, 235, 215))

        # Bushy white side hair
        draw.ellipse([cx - 52, 90, cx - 35, 140], fill=(225, 225, 225))
        draw.ellipse([cx + 35, 90, cx + 52, 140], fill=(225, 225, 225))

        # Deep-set thoughtful eyes
        draw.ellipse([cx - 26, 105, cx - 14, 117], fill=(40, 35, 30))
        draw.ellipse([cx + 14, 105, cx + 26, 117], fill=(40, 35, 30))
        draw.point((cx - 23, 108), fill=(255, 255, 255))
        draw.point((cx + 17, 108), fill=(255, 255, 255))

        # Distinctive Socratic pug nose
        draw.ellipse([cx - 10, 116, cx + 10, 130], fill=(230, 185, 155))

        # Bushy white beard
        draw.polygon([
            (cx - 38, 128),
            (cx + 38, 128),
            (cx + 32, 175),
            (cx, 190),
            (cx - 32, 175)
        ], fill=(235, 235, 238), outline=(210, 210, 215))

    elif char_type == "plato":
        skin = (252, 215, 185)
        # Deep crimson robe with classical folds
        draw.polygon([(cx - 75, 210), (cx + 75, 210), (cx + 55, 160), (cx - 55, 160)], fill=(180, 40, 60))
        draw.line([(cx - 45, 160), (cx + 35, 210)], fill=(245, 240, 225), width=8)

        # Neck & Head
        draw.rectangle([cx - 20, 140, cx + 20, 175], fill=(235, 195, 165))
        draw.ellipse([cx - 45, 60, cx + 45, 150], fill=skin)

        # Flowing noble white hair
        draw.ellipse([cx - 50, 52, cx + 50, 115], fill=(240, 240, 245))
        draw.ellipse([cx - 54, 80, cx - 35, 145], fill=(240, 240, 245))
        draw.ellipse([cx + 35, 80, cx + 54, 145], fill=(240, 240, 245))

        # Forehead
        draw.ellipse([cx - 38, 70, cx + 38, 115], fill=skin)

        # Intellectual visionary eyes
        draw.ellipse([cx - 26, 102, cx - 14, 114], fill=(30, 40, 50))
        draw.ellipse([cx + 14, 102, cx + 26, 114], fill=(30, 40, 50))
        draw.point((cx - 23, 105), fill=(255, 255, 255))
        draw.point((cx + 17, 105), fill=(255, 255, 255))

        # Nose & Moustache / Beard
        draw.polygon([(cx - 5, 110), (cx + 5, 110), (cx, 126)], fill=(230, 185, 155))
        draw.polygon([
            (cx - 36, 126),
            (cx + 36, 126),
            (cx + 28, 185),
            (cx, 195),
            (cx - 28, 185)
        ], fill=(242, 242, 245), outline=(215, 215, 220))

    elif char_type == "aristotle":
        skin = (248, 210, 178)
        # Sapphire blue scholar robe with gold clasps
        draw.polygon([(cx - 75, 210), (cx + 75, 210), (cx + 55, 160), (cx - 55, 160)], fill=(45, 75, 145))
        draw.ellipse([cx - 15, 175, cx + 15, 190], fill=(225, 185, 50))

        # Neck & Head
        draw.rectangle([cx - 20, 140, cx + 20, 175], fill=(230, 190, 160))
        draw.ellipse([cx - 45, 60, cx + 45, 150], fill=skin)

        # Dark curly scholar hair
        draw.ellipse([cx - 49, 52, cx + 49, 110], fill=(70, 55, 45))
        draw.ellipse([cx - 52, 75, cx - 35, 140], fill=(70, 55, 45))
        draw.ellipse([cx + 35, 75, cx + 52, 140], fill=(70, 55, 45))

        # Forehead
        draw.ellipse([cx - 38, 70, cx + 38, 115], fill=skin)

        # Analytical piercing eyes
        draw.ellipse([cx - 26, 102, cx - 14, 114], fill=(35, 45, 40))
        draw.ellipse([cx + 14, 102, cx + 26, 114], fill=(35, 45, 40))
        draw.point((cx - 23, 105), fill=(255, 255, 255))
        draw.point((cx + 17, 105), fill=(255, 255, 255))

        # Nose & Trimmed salt-and-pepper beard
        draw.polygon([(cx - 5, 110), (cx + 5, 110), (cx, 126)], fill=(225, 180, 150))
        draw.polygon([
            (cx - 34, 126),
            (cx + 34, 126),
            (cx + 25, 175),
            (cx, 185),
            (cx - 25, 175)
        ], fill=(135, 120, 110), outline=(100, 85, 75))

    elif char_type == "marcus_aurelius":
        skin = (250, 212, 180)
        # Roman imperial Tyrian purple mantle + golden cuirass
        draw.polygon([(cx - 75, 210), (cx + 75, 210), (cx + 55, 160), (cx - 55, 160)], fill=(120, 30, 130))
        # Golden imperial eagle / fibula clasp
        draw.ellipse([cx + 20, 165, cx + 45, 190], fill=(235, 195, 60), outline=(180, 140, 30))

        # Neck & Head
        draw.rectangle([cx - 20, 140, cx + 20, 175], fill=(230, 190, 160))
        draw.ellipse([cx - 45, 60, cx + 45, 150], fill=skin)

        # Cropped Roman curls
        draw.ellipse([cx - 49, 52, cx + 49, 110], fill=(85, 65, 45))
        draw.ellipse([cx - 52, 75, cx - 35, 135], fill=(85, 65, 45))
        draw.ellipse([cx + 35, 75, cx + 52, 135], fill=(85, 65, 45))

        # Golden Laurel Wreath
        draw.arc([cx - 48, 56, cx + 48, 105], start=170, end=370, fill=(235, 195, 50), width=6)
        draw.ellipse([cx - 30, 60, cx - 18, 72], fill=(70, 150, 50))
        draw.ellipse([cx + 18, 60, cx + 30, 72], fill=(70, 150, 50))

        # Forehead
        draw.ellipse([cx - 38, 72, cx + 38, 115], fill=skin)

        # Calm stoic eyes
        draw.ellipse([cx - 26, 104, cx - 14, 116], fill=(40, 35, 30))
        draw.ellipse([cx + 14, 104, cx + 26, 116], fill=(40, 35, 30))
        draw.point((cx - 23, 107), fill=(255, 255, 255))
        draw.point((cx + 17, 107), fill=(255, 255, 255))

        # Strong Roman nose & philosopher beard
        draw.polygon([(cx - 5, 110), (cx + 5, 110), (cx, 126)], fill=(225, 180, 150))
        draw.polygon([
            (cx - 34, 126),
            (cx + 34, 126),
            (cx + 25, 178),
            (cx, 188),
            (cx - 25, 178)
        ], fill=(95, 75, 55), outline=(70, 50, 35))

    # Classical circular golden frame border
    draw.ellipse([18, 18, 222, 222], outline=(215, 175, 60), width=5)
    draw.ellipse([24, 24, 216, 216], outline=(255, 235, 150), width=2)

    img.save(output_path)
    print(f"Saved portrait: {output_path}")

# ----------------------------------------------------
# Environment Asset Generator
# ----------------------------------------------------
def create_environment_assets():
    env_dir = os.path.join(ASSETS_DIR, "environment")
    ensure_dir(env_dir)

    # 1. Grass Tile (64x64)
    grass = Image.new("RGBA", (64, 64), (105, 168, 85))
    g_draw = ImageDraw.Draw(grass)
    # Subtle grass variations & flowers
    for x, y, c in [
        (8, 12, (95, 155, 75)), (24, 40, (115, 180, 95)), (48, 16, (90, 150, 70)),
        (40, 52, (110, 175, 90)), (14, 48, (120, 185, 100)), (32, 20, (95, 155, 75)),
        (56, 44, (90, 150, 70))
    ]:
        g_draw.line([(x, y), (x + 2, y - 4)], fill=c, width=2)
        g_draw.line([(x + 2, y), (x + 4, y - 5)], fill=c, width=2)
    # Tiny flowers (daisies & lavender)
    g_draw.ellipse([16, 28, 19, 31], fill=(255, 255, 255))
    g_draw.point((17, 29), fill=(255, 215, 0))
    g_draw.ellipse([44, 34, 47, 37], fill=(200, 160, 240))
    grass.save(os.path.join(env_dir, "tile_grass.png"))

    # 2. Stone / Marble Pathway Tile (64x64)
    path = Image.new("RGBA", (64, 64), (220, 215, 205))
    p_draw = ImageDraw.Draw(path)
    # Marble flagstone slabs
    stones = [
        [2, 2, 30, 20], [32, 2, 62, 24],
        [2, 22, 22, 42], [24, 22, 52, 42], [54, 26, 62, 48],
        [2, 44, 34, 62], [36, 44, 62, 62]
    ]
    for s in stones:
        p_draw.rectangle(s, fill=(235, 230, 220), outline=(175, 170, 160), width=1)
        # highlight edge
        p_draw.line([(s[0] + 1, s[1] + 1), (s[2] - 1, s[1] + 1)], fill=(250, 248, 242))
    path.save(os.path.join(env_dir, "tile_path.png"))

    # 3. Ancient Greek Marble Column (48x96)
    col_img = Image.new("RGBA", (48, 96), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(col_img)
    # Column shadow
    c_draw.ellipse([4, 84, 44, 94], fill=(20, 30, 20, 90))
    # Capital (Ionic scrolls / Corinthian flair)
    c_draw.rectangle([6, 8, 42, 16], fill=(245, 242, 235), outline=(180, 175, 165))
    c_draw.ellipse([4, 6, 14, 18], fill=(240, 235, 225), outline=(170, 165, 155))
    c_draw.ellipse([34, 6, 44, 18], fill=(240, 235, 225), outline=(170, 165, 155))
    # Shaft with classical fluting
    c_draw.rectangle([12, 16, 36, 82], fill=(238, 234, 226), outline=(185, 180, 170))
    for fx in [16, 20, 24, 28, 32]:
        c_draw.line([(fx, 17), (fx, 81)], fill=(210, 205, 195), width=1)
        c_draw.line([(fx + 1, 17), (fx + 1, 81)], fill=(250, 248, 242), width=1)
    # Base pedestal
    c_draw.rectangle([8, 80, 40, 88], fill=(235, 230, 220), outline=(175, 170, 160))
    c_draw.rectangle([4, 86, 44, 92], fill=(225, 220, 210), outline=(165, 160, 150))
    col_img.save(os.path.join(env_dir, "column.png"))

    # 4. Classical Stone Fountain (96x96)
    fountain = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(fountain)
    # Fountain base shadow
    f_draw.ellipse([6, 50, 90, 92], fill=(20, 30, 20, 90))
    # Large outer marble basin
    f_draw.ellipse([8, 46, 88, 88], fill=(220, 215, 205), outline=(170, 165, 155), width=3)
    # Shimmering blue water
    f_draw.ellipse([14, 52, 82, 82], fill=(70, 160, 220), outline=(50, 120, 180))
    f_draw.ellipse([20, 56, 76, 78], fill=(100, 190, 245))
    # Inner ripples
    f_draw.ellipse([30, 62, 66, 72], fill=(140, 220, 255))

    # Center tier pedestal
    f_draw.rectangle([42, 30, 54, 65], fill=(230, 225, 215), outline=(170, 165, 155))
    # Upper small basin
    f_draw.ellipse([30, 24, 66, 40], fill=(235, 230, 220), outline=(170, 165, 155), width=2)
    f_draw.ellipse([34, 27, 62, 37], fill=(80, 170, 230))
    # Center water spout / droplets
    f_draw.polygon([(46, 12), (50, 12), (48, 28)], fill=(180, 235, 255))
    f_draw.ellipse([46, 8, 50, 14], fill=(220, 245, 255))
    # Splashes
    f_draw.point((43, 20), fill=(255, 255, 255))
    f_draw.point((53, 21), fill=(255, 255, 255))
    f_draw.point((40, 48), fill=(255, 255, 255))
    f_draw.point((56, 49), fill=(255, 255, 255))
    fountain.save(os.path.join(env_dir, "fountain.png"))

    # 5. Olive Tree (96x112)
    tree = Image.new("RGBA", (96, 112), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(tree)
    # Tree shadow
    t_draw.ellipse([16, 92, 80, 108], fill=(20, 30, 20, 80))
    # Gnarled trunk
    t_draw.polygon([
        (42, 100), (36, 75), (40, 55), (48, 50),
        (56, 55), (60, 75), (54, 100)
    ], fill=(115, 85, 60), outline=(80, 55, 35))
    # Roots & branches
    t_draw.line([(40, 60), (28, 45)], fill=(115, 85, 60), width=4)
    t_draw.line([(56, 60), (68, 45)], fill=(115, 85, 60), width=4)
    # Foliage layers (silvery olive green)
    t_draw.ellipse([10, 20, 55, 65], fill=(90, 135, 95))
    t_draw.ellipse([40, 15, 85, 60], fill=(100, 145, 105))
    t_draw.ellipse([25, 6, 72, 50], fill=(115, 160, 120))
    t_draw.ellipse([20, 30, 76, 70], fill=(80, 125, 85))
    # Canopy highlight clusters
    t_draw.ellipse([32, 12, 64, 40], fill=(130, 175, 135))
    t_draw.ellipse([18, 28, 48, 52], fill=(120, 165, 125))
    t_draw.ellipse([50, 26, 78, 50], fill=(125, 170, 130))
    # Tiny dark olives
    for ox, oy in [(30, 42), (48, 32), (65, 45), (42, 55), (58, 58)]:
        t_draw.ellipse([ox, oy, ox + 3, oy + 4], fill=(45, 40, 30))
    tree.save(os.path.join(env_dir, "olive_tree.png"))

    # 6. Tall Mediterranean Cypress Tree (48x120)
    cypress = Image.new("RGBA", (48, 120), (0, 0, 0, 0))
    cy_draw = ImageDraw.Draw(cypress)
    cy_draw.ellipse([8, 106, 40, 118], fill=(20, 30, 20, 80))
    # Trunk
    cy_draw.rectangle([21, 95, 27, 112], fill=(95, 70, 50))
    # Flame-shaped evergreen foliage
    cy_draw.polygon([
        (24, 6), (36, 30), (38, 60), (36, 95),
        (12, 95), (10, 60), (12, 30)
    ], fill=(40, 85, 50), outline=(25, 60, 35))
    # Shading highlights
    cy_draw.polygon([
        (24, 8), (30, 30), (32, 65), (28, 95),
        (20, 95), (18, 65), (20, 30)
    ], fill=(55, 110, 65))
    cypress.save(os.path.join(env_dir, "cypress_tree.png"))

    # 7. Classical Stone Bench (64x40)
    bench = Image.new("RGBA", (64, 40), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(bench)
    # Shadow
    b_draw.ellipse([4, 26, 60, 38], fill=(20, 30, 20, 80))
    # Legs (carved stone)
    b_draw.rectangle([10, 18, 18, 32], fill=(210, 205, 195), outline=(160, 155, 145))
    b_draw.rectangle([46, 18, 54, 32], fill=(210, 205, 195), outline=(160, 155, 145))
    # Seat slab
    b_draw.rectangle([6, 12, 58, 22], fill=(238, 234, 225), outline=(175, 170, 160))
    b_draw.line([(7, 13), (57, 13)], fill=(255, 252, 245))
    # Backrest
    b_draw.rectangle([8, 2, 56, 10], fill=(230, 225, 215), outline=(170, 165, 155))
    bench.save(os.path.join(env_dir, "bench.png"))

    # 8. Ancient Terracotta Amphora / Vase (32x48)
    urn = Image.new("RGBA", (32, 48), (0, 0, 0, 0))
    u_draw = ImageDraw.Draw(urn)
    u_draw.ellipse([6, 38, 26, 46], fill=(20, 30, 20, 80))
    # Urn body
    u_draw.ellipse([6, 16, 26, 38], fill=(195, 95, 60), outline=(145, 65, 40))
    # Neck & rim
    u_draw.rectangle([11, 8, 21, 18], fill=(195, 95, 60), outline=(145, 65, 40))
    u_draw.ellipse([9, 6, 23, 12], fill=(210, 110, 70), outline=(145, 65, 40))
    # Handles
    u_draw.arc([3, 12, 13, 26], start=90, end=270, fill=(160, 75, 45), width=2)
    u_draw.arc([19, 12, 29, 26], start=270, end=90, fill=(160, 75, 45), width=2)
    # Greek black-figure stripe
    u_draw.line([(8, 24), (24, 24)], fill=(45, 30, 25), width=2)
    urn.save(os.path.join(env_dir, "amphora.png"))

    # 9. Marble Temple Portico / Shrine (160x120)
    temple = Image.new("RGBA", (160, 120), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(temple)
    # Shadow
    t_draw.ellipse([10, 100, 150, 118], fill=(20, 30, 20, 90))
    # Steps / stereobate
    t_draw.rectangle([10, 102, 150, 112], fill=(215, 210, 200), outline=(160, 155, 145))
    t_draw.rectangle([16, 94, 144, 102], fill=(225, 220, 210), outline=(170, 165, 155))
    t_draw.rectangle([22, 86, 138, 94], fill=(235, 230, 220), outline=(180, 175, 165))
    # 4 Columns
    for cx in [30, 62, 98, 130]:
        t_draw.rectangle([cx - 5, 42, cx + 5, 86], fill=(240, 236, 228), outline=(185, 180, 170))
        t_draw.line([(cx - 2, 42), (cx - 2, 86)], fill=(215, 210, 200))
        t_draw.line([(cx + 2, 42), (cx + 2, 86)], fill=(255, 252, 245))
        # Capital & Base
        t_draw.rectangle([cx - 8, 38, cx + 8, 42], fill=(245, 240, 230), outline=(180, 175, 165))
        t_draw.rectangle([cx - 7, 84, cx + 7, 88], fill=(235, 230, 220), outline=(180, 175, 165))
    # Architrave beam
    t_draw.rectangle([20, 30, 140, 38], fill=(238, 233, 224), outline=(180, 175, 165))
    # Triangular pediment / tympanum
    t_draw.polygon([(16, 30), (80, 4), (144, 30)], fill=(245, 240, 232), outline=(180, 175, 165), width=2)
    # Relief medallion in tympanum
    t_draw.ellipse([72, 16, 88, 26], fill=(220, 180, 70), outline=(170, 140, 40))
    temple.save(os.path.join(env_dir, "temple_ruin.png"))

    # 10. Marble Philosopher Bust on Pedestal (36x56)
    bust = Image.new("RGBA", (36, 56), (0, 0, 0, 0))
    bu_draw = ImageDraw.Draw(bust)
    bu_draw.ellipse([4, 48, 32, 54], fill=(20, 30, 20, 80))
    # Pedestal
    bu_draw.rectangle([8, 28, 28, 50], fill=(225, 220, 210), outline=(170, 165, 155))
    bu_draw.rectangle([6, 26, 30, 30], fill=(235, 230, 220), outline=(175, 170, 160))
    bu_draw.rectangle([6, 48, 30, 52], fill=(215, 210, 200), outline=(165, 160, 150))
    # Bust
    bu_draw.polygon([(10, 26), (26, 26), (22, 16), (14, 16)], fill=(240, 236, 228))
    bu_draw.ellipse([12, 6, 24, 18], fill=(245, 242, 235), outline=(190, 185, 175))
    bust.save(os.path.join(env_dir, "statue_bust.png"))

    print("Environment assets generated successfully!")

if __name__ == "__main__":
    # Characters
    create_character_spritesheet("player", "frontend/public/assets/characters/player/spritesheet.png")
    create_character_spritesheet("socrates", "frontend/public/assets/characters/socrates/spritesheet.png")
    create_character_spritesheet("plato", "frontend/public/assets/characters/plato/spritesheet.png")
    create_character_spritesheet("aristotle", "frontend/public/assets/characters/aristotle/spritesheet.png")
    create_character_spritesheet("marcus_aurelius", "frontend/public/assets/characters/marcus_aurelius/spritesheet.png")

    # Portraits
    create_portrait("socrates", "frontend/public/assets/portraits/socrates.png")
    create_portrait("plato", "frontend/public/assets/portraits/plato.png")
    create_portrait("aristotle", "frontend/public/assets/portraits/aristotle.png")
    create_portrait("marcus_aurelius", "frontend/public/assets/portraits/marcus_aurelius.png")

    # Environment
    create_environment_assets()
