#!/usr/bin/env python3
"""
Elo Booster - Document Complet V4
Sommaire corrigé + Titres avec retour à la ligne
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import chess, chess.svg, io, json, os, glob
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF, renderPM

WIDTH, HEIGHT = A4
MARGIN = 0.8 * cm

COLORS = {
    'dark': '#1A2332',
    'gold': '#D4AF37',
    'light': '#F5F5F5',
    'green': '#90EE90',
    'red': '#FFB6C1',
    'gray': '#666666',
    'gray_light': '#AAAAAA',
    'green_bg': '#E8F5E9',
    'yellow_bg': '#FFF8E1', 
    'red_bg': '#FFEBEE',
    'green_dark': '#2E7D32',
    'yellow_dark': '#F57C00',
    'red_dark': '#C62828',
    'green_medium': '#66BB6A',
    'yellow_medium': '#FFB74D',
    'red_medium': '#EF5350',
}

def hex_color(name):
    return colors.HexColor(COLORS.get(name, name))

def load_all_openings(data_dir='data_en'):
    openings = []
    for filepath in sorted(glob.glob(os.path.join(data_dir, '*.json'))):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            data['_file'] = os.path.basename(filepath)
            openings.append(data)
    return openings

def categorize_and_sort(openings):
    levels = {'Beginner': [], 'Intermediate': [], 'Advanced': []}
    for op in openings:
        complexity = op.get('complexity', 'Intermediate')
        if 'Beginner' in complexity:
            levels['Beginner'].append(op)
        elif 'Advanced' in complexity:
            levels['Advanced'].append(op)
        else:
            levels['Intermediate'].append(op)
    for level in levels:
        levels[level] = sorted(levels[level], key=lambda x: x.get('white_win', 50), reverse=True)
    return levels

class EloBoosterPremium:
    def __init__(self, output_path):
        self.c = canvas.Canvas(output_path, pagesize=A4)
        self.page_num = 0
        
    def hex(self, name):
        return colors.HexColor(COLORS.get(name, name))
    
    def new_page(self):
        self.c.showPage()
        self.page_num += 1
        
    def board_png(self, fen, green=None, red=None, size=400):
        board = chess.Board(fen)
        fill = {}
        for sq in (green or []):
            try: fill[chess.parse_square(sq)] = COLORS['green']
            except: pass
        for sq in (red or []):
            try: fill[chess.parse_square(sq)] = COLORS['red']
            except: pass
        svg = chess.svg.board(board, size=size, coordinates=True,
            colors={"square light": "#F0D9B5", "square dark": "#B58863"}, fill=fill)
        # Utiliser svglib au lieu de cairosvg
        drawing = svg2rlg(io.BytesIO(svg.encode()))
        img_data = io.BytesIO()
        renderPM.drawToFile(drawing, img_data, fmt='PNG', dpi=150)
        img_data.seek(0)
        return ImageReader(img_data)
    
    def board_mini(self, fen, highlights=None, size=300):
        board = chess.Board(fen)
        fill = {}
        for sq in (highlights or []):
            try: fill[chess.parse_square(sq)] = COLORS['green']
            except: pass
        svg = chess.svg.board(board, size=size, coordinates=False,
            colors={"square light": "#F0D9B5", "square dark": "#B58863"}, fill=fill)
        # Utiliser svglib au lieu de cairosvg
        drawing = svg2rlg(io.BytesIO(svg.encode()))
        img_data = io.BytesIO()
        renderPM.drawToFile(drawing, img_data, fmt='PNG', dpi=150)
        img_data.seek(0)
        return ImageReader(img_data)
    
    def draw_rect(self, x, y, w, h, color, radius=0):
        """x, y, w, h en points (pas en cm)"""
        self.c.setFillColor(self.hex(color))
        if radius:
            self.c.roundRect(x, y, w, h, radius, fill=True, stroke=False)
        else:
            self.c.rect(x, y, w, h, fill=True, stroke=False)
    
    def wrap_text(self, text, font, size, max_width):
        """Retourne une liste de lignes"""
        self.c.setFont(font, size)
        words = text.split()
        lines, line = [], ""
        for w in words:
            test = f"{line} {w}".strip()
            if self.c.stringWidth(test, font, size) < max_width:
                line = test
            else:
                if line: lines.append(line)
                line = w
        if line: lines.append(line)
        return lines
    
    def fit_text(self, text, font, size, max_width):
        """Tronque le texte pour qu'il tienne dans max_width"""
        self.c.setFont(font, size)
        if self.c.stringWidth(text, font, size) <= max_width:
            return text
        while len(text) > 3 and self.c.stringWidth(text + "…", font, size) > max_width:
            text = text[:-1]
        return text + "…"

    # === COUVERTURE ===
    def generate_cover(self):
        c = self.c
        self.page_num = 1
        
        # Fond
        c.setFillColor(self.hex('dark'))
        c.rect(0, 0, WIDTH, HEIGHT, fill=True, stroke=False)
        
        # Bandes dorées
        c.setFillColor(self.hex('gold'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 0.3*cm, fill=True, stroke=False)
        c.rect(0, 2.7*cm, WIDTH, 0.3*cm, fill=True, stroke=False)
        
        # Titre
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 56)
        c.drawCentredString(WIDTH/2, HEIGHT - 7*cm, "ELO BOOSTER")
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 20)
        c.drawCentredString(WIDTH/2, HEIGHT - 9*cm, "The Ultimate Opening Guide")
        
        # Ligne
        c.setStrokeColor(self.hex('gold'))
        c.setLineWidth(2)
        c.line(WIDTH/2 - 4*cm, HEIGHT - 10*cm, WIDTH/2 + 4*cm, HEIGHT - 10*cm)
        
        # Cercle central
        c.setFillColor(self.hex('gold'))
        c.circle(WIDTH/2, HEIGHT/2 - 1*cm, 3*cm, fill=True, stroke=False)
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 48)
        c.drawCentredString(WIDTH/2, HEIGHT/2 - 0.5*cm, "30")
        c.setFont("Helvetica", 14)
        c.drawCentredString(WIDTH/2, HEIGHT/2 - 1.8*cm, "OPENINGS")
        
        # 3 niveaux
        y_level = HEIGHT/2 - 5*cm
        levels_data = [
            ('green_dark', '10', 'DÉBUTANT'),
            ('yellow_dark', '10', 'INTERMÉDIAIRE'),
            ('red_dark', '10', 'AVANCÉ'),
        ]
        x_positions = [WIDTH/2 - 5*cm, WIDTH/2, WIDTH/2 + 5*cm]
        
        for i, (color, num, label) in enumerate(levels_data):
            x = x_positions[i]
            c.setFillColor(self.hex(color))
            c.circle(x, y_level, 1.2*cm, fill=True, stroke=False)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 24)
            c.drawCentredString(x, y_level - 0.3*cm, num)
            c.setFont("Helvetica", 10)
            c.drawCentredString(x, y_level - 1.8*cm, label)
        
        # Features
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 12)
        features = [
            "✓ Strategic ideas explained",
            "✓ Traps to know with responses",
            "✓ Detailed plans for each side",
            "✓ Typical mistakes to avoid",
        ]
        y_feat = 6*cm
        for feat in features:
            c.drawCentredString(WIDTH/2, y_feat, feat)
            y_feat -= 0.6*cm
        
        # Footer
        c.setFillColor(self.hex('gray_light'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 1.5*cm, "© 2025 Elo Booster")

    # === TABLE OF CONTENTS ===
    def generate_toc(self, levels):
        self.new_page()
        c = self.c
        
        # Header
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 3*cm, fill=True, stroke=False)
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(WIDTH/2, HEIGHT - 2*cm, "TABLE OF CONTENTS")
        
        y = HEIGHT - 4.2*cm  # Position en points
        page = 3
        
        level_info = {
            'Beginner': ('green_dark', 'green_medium', 'green_bg'),
            'Intermediate': ('yellow_dark', 'yellow_medium', 'yellow_bg'),
            'Advanced': ('red_dark', 'red_medium', 'red_bg')
        }
        
        content_width = WIDTH - 2*cm
        row_height = 0.65*cm
        
        for level_name in ['Beginner', 'Intermediate', 'Advanced']:
            ops = levels[level_name]
            dark, medium, bg = level_info[level_name]
            
            # Titre de section
            c.setFillColor(self.hex(dark))
            c.roundRect(1*cm, y - 0.2*cm, content_width, 0.9*cm, 4, fill=True, stroke=False)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 12)
            c.drawCentredString(WIDTH/2, y + 0.1*cm, f"━━  {level_name.upper()}  ━━  {len(ops)} openings  ━━")
            y -= 1.2*cm
            
            # Ouvertures
            for i, op in enumerate(ops):
                # Fond alterné
                if i % 2 == 0:
                    c.setFillColor(self.hex(bg))
                    c.rect(1*cm, y - 0.15*cm, content_width, row_height, fill=True, stroke=False)
                
                # Nom (sans le nom alternatif)
                name = op['name']
                name = self.fit_text(name, "Helvetica-Bold", 10, 6.2*cm)
                
                c.setFillColor(self.hex('dark'))
                c.setFont("Helvetica-Bold", 10)
                c.drawString(1.3*cm, y, name)
                
                # Coups
                moves = self.fit_text(op.get('moves', ''), "Helvetica", 9, 4.5*cm)
                c.setFillColor(self.hex('gray'))
                c.setFont("Helvetica", 9)
                c.drawString(7.8*cm, y, moves)
                
                # Stats
                c.setFillColor(self.hex('dark'))
                c.setFont("Helvetica-Bold", 9)
                c.drawString(12.8*cm, y, f"⚪{op.get('white_win', '')}%")
                
                # Page dans cercle
                c.setFillColor(self.hex(medium))
                c.circle(WIDTH - 1.3*cm, y + 0.1*cm, 0.3*cm, fill=True, stroke=False)
                c.setFillColor(colors.white)
                c.setFont("Helvetica-Bold", 8)
                c.drawCentredString(WIDTH - 1.3*cm, y - 0.05*cm, str(page))
                
                y -= row_height
                page += 1
            
            y -= 0.4*cm
        
        # Footer
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 8)
        c.drawCentredString(WIDTH/2, 0.8*cm, "— 2 —")

    # === FICHE D'OUVERTURE ===
    def generate_opening(self, data):
        self.new_page()
        c = self.c
        
        # Couleur selon niveau
        complexity = data.get('complexity', 'Intermediate')
        if 'Beginner' in complexity:
            level_color = 'green_dark'
        elif 'Advanced' in complexity:
            level_color = 'red_dark'
        else:
            level_color = 'yellow_dark'
        
        content_width = WIDTH - 2*MARGIN
        
        # === HEADER ===
        header_h = 2.8*cm
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - header_h, WIDTH, header_h, fill=True, stroke=False)
        
        # Bande couleur niveau
        c.setFillColor(self.hex(level_color))
        c.rect(0, HEIGHT - header_h, 0.5*cm, header_h, fill=True, stroke=False)
        
        # Titre (avec retour à la ligne si nécessaire)
        title = data['name']
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 20)
        
        max_title_width = 10*cm
        if c.stringWidth(title, "Helvetica-Bold", 20) > max_title_width:
            # Retour à la ligne
            lines = self.wrap_text(title, "Helvetica-Bold", 20, max_title_width)
            c.drawString(1.2*cm, HEIGHT - 1*cm, lines[0])
            if len(lines) > 1:
                c.setFont("Helvetica-Bold", 18)
                c.drawString(1.2*cm, HEIGHT - 1.6*cm, lines[1])
        else:
            c.drawString(1.2*cm, HEIGHT - 1.2*cm, title)
        
        # Sous-titre
        subtitle = data.get('moves', '')
        if data.get('alt_name'):
            subtitle = f"{data['alt_name']} • {subtitle}"
        subtitle = self.fit_text(subtitle, "Helvetica", 10, 10*cm)
        c.setFont("Helvetica", 10)
        c.setFillColor(self.hex('gold'))
        c.drawString(1.2*cm, HEIGHT - 2.1*cm, subtitle)
        
        # Infos droite
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 9)
        c.drawRightString(WIDTH - 1*cm, HEIGHT - 0.8*cm, f"Level: {complexity}")
        champions = self.fit_text(data.get('champions', ''), "Helvetica", 9, 6*cm)
        c.drawRightString(WIDTH - 1*cm, HEIGHT - 1.3*cm, f"Champions: {champions}")
        
        # Stats
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 14)
        c.drawRightString(WIDTH - 3 * cm, HEIGHT - 2.2 * cm, f"⚪ {data.get('white_win', '')}%")
        c.setFillColor(colors.gray)
        c.drawRightString(WIDTH - 1 * cm, HEIGHT - 2.2 * cm, f"⚫ {data.get('black_win', '')}%")
        # === POSITION + IDÉE ===
        y = HEIGHT - header_h - 0.4*cm
        
        # Échiquier
        board_size = 5.8*cm
        try:
            fen = data.get('uci_moves', '')
            board = chess.Board()
            for m in fen.split():
                board.push_uci(m)
            img = self.board_png(board.fen(), data.get('highlights_green'), data.get('highlights_red'), 400)
            c.drawImage(img, MARGIN, y - board_size, board_size, board_size)
        except: pass
        
        # Idée principale
        idea_x = MARGIN + board_size + 0.3*cm
        idea_w = content_width - board_size - 0.3*cm
        self.draw_rect(idea_x, y - board_size, idea_w, board_size, 'light', 4)
        
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(idea_x + 0.3*cm, y - 0.4*cm, "💡 MAIN IDEA")
        
        # Ligne déco
        c.setStrokeColor(self.hex('gold'))
        c.setLineWidth(1.5)
        c.line(idea_x + 0.3*cm, y - 0.65*cm, idea_x + idea_w - 0.3*cm, y - 0.65*cm)
        
        c.setFont("Helvetica", 9)
        c.setFillColor(self.hex('dark'))
        lines = self.wrap_text(data.get('idea', ''), "Helvetica", 12, idea_w - 0.6*cm)
        ty = y - 1*cm
        for line in lines[:12]:
            c.drawString(idea_x + 0.3*cm, ty, line)
            ty -= 0.38*cm
        
        y -= board_size + 0.4*cm
        
        # === ERREURS ===
        err_h = 2.8*cm
        col_w = content_width / 2 - 0.15*cm
        
        # Blancs
        self.draw_rect(MARGIN, y - err_h, col_w, err_h, 'green', 4)
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN + 0.3*cm, y - 0.4*cm, "⚪ WHITE'S MISTAKES")
        c.setFont("Helvetica", 10)
        ey = y - 0.85*cm
        for err in data.get('errors_white', [])[:3]:
            for line in self.wrap_text(f"• {err}", "Helvetica", 8, col_w - 0.5*cm)[:3]:
                c.drawString(MARGIN + 0.3*cm, ey, line)
                ey -= 0.32*cm
            ey -= 0.08*cm
        
        # Noirs
        col2_x = MARGIN + col_w + 0.3*cm
        self.draw_rect(col2_x, y - err_h, col_w, err_h, 'red', 4)
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(col2_x + 0.3*cm, y - 0.4*cm, "⚫ BLACK'S MISTAKES")
        c.setFont("Helvetica", 10)
        ey = y - 0.85*cm
        for err in data.get('errors_black', [])[:3]:
            for line in self.wrap_text(f"• {err}", "Helvetica", 8, col_w - 0.5*cm)[:3]:
                c.drawString(col2_x + 0.3*cm, ey, line)
                ey -= 0.32*cm
            ey -= 0.08*cm
        
        y -= err_h + 0.3*cm
        
        # === DEVELOPMENT CHALLENGES ===
        dev_h = 2.0*cm
        self.draw_rect(MARGIN, y - dev_h, content_width, dev_h, 'yellow_bg', 4)
        
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN + 0.3*cm, y - 0.35*cm, "🎯 DEVELOPMENT CHALLENGES")
        
        devs = data.get('development', [])
        if devs:
            c.setFont("Helvetica", 9)
            col_w = content_width / 3
            for i, dev in enumerate(devs[:6]):
                col = i % 3
                row = i // 3
                dx = MARGIN + 0.3*cm + col * col_w
                dy = y - 0.7*cm - row * 0.6*cm
                
                # dev peut être [piece_name, goal] ou {"piece_name": X, "goal": Y}
                if isinstance(dev, list):
                    piece_name = dev[0]
                    goal = dev[1]
                else:
                    piece_name = dev.get('piece_name', '')
                    goal = dev.get('goal', '')
                
                c.setFillColor(self.hex('dark'))
                c.setFont("Helvetica-Bold", 9)
                c.drawString(dx, dy, f"• {piece_name}:")
                
                c.setFont("Helvetica", 6)
                goal_text = self.fit_text(goal, "Helvetica", 8, col_w - 0.8*cm)
                c.drawString(dx, dy - 0.25*cm, goal_text)
        
        y -= dev_h + 1*cm
        
        # === PIÈGES ===
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN, y, "⚠️ TRAPS TO KNOW")
        y -= 0.8*cm
        
        trap_w = content_width / 3 - 0.2*cm
        trap_h = 3.2*cm
        tx = MARGIN
        
        for trap in data.get('traps', [])[:3]:
            self.draw_rect(tx, y - trap_h, trap_w, trap_h, 'light', 4)
            
            # Échiquier
            board_mini_size = 2.2*cm
            try:
                img = self.board_mini(trap['fen'], trap.get('highlights'), 220)
                c.drawImage(img, tx + 0.1*cm, y - 2.4*cm, board_mini_size, board_mini_size)
            except: pass
            
            # Nom (avec retour à la ligne)
            text_x = tx + board_mini_size + 0.2*cm
            text_w = trap_w - board_mini_size - 0.4*cm
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 9)
            trap_name = trap.get('name', '')
            name_lines = self.wrap_text(trap_name, "Helvetica-Bold", 9, text_w)
            ny = y - 0.3*cm
            for line in name_lines[:2]:
                c.drawString(text_x, ny, line)
                ny -= 0.28*cm
            
            # Description
            c.setFont("Helvetica", 8)
            desc_lines = self.wrap_text(trap.get('desc', ''), "Helvetica", 8, text_w)
            dy = ny - 0.1*cm
            for line in desc_lines[:10]:
                c.drawString(text_x, dy, line)
                dy -= 0.24*cm
            
            tx += trap_w + 0.3*cm
        
        y -= trap_h + 1*cm
        
        # === VARIANTES ===
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN, y, "📚 MAIN VARIATIONS")
        y -= 0.8*cm
        
        var_w = content_width / 3 - 0.2*cm
        var_h = 3.8*cm
        vx = MARGIN
        
        for var in data.get('variants', [])[:3]:
            self.draw_rect(vx, y - var_h, var_w, var_h, 'light', 4)
            
            # Échiquier
            board_mini_size = 2.2*cm
            try:
                board = chess.Board()
                for m in var.get('uci', '').split():
                    board.push_uci(m)
                img = self.board_mini(board.fen(), var.get('highlights'), 220)
                c.drawImage(img, vx + 0.1*cm, y - 2.5*cm, board_mini_size, board_mini_size)
            except: pass
            
            # Infos
            text_x = vx + board_mini_size + 0.2*cm
            text_w = var_w - board_mini_size - 0.4*cm
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 9)
            var_name = var.get('name', '')
            name_lines = self.wrap_text(var_name, "Helvetica-Bold", 9, text_w)
            ny = y - 0.25*cm
            for line in name_lines[:2]:
                c.drawString(text_x, ny, line)
                ny -= 0.26*cm
            
            c.setFont("Helvetica", 8)
            var_moves = self.fit_text(var.get('moves', ''), "Helvetica", 8, text_w)
            c.drawString(text_x, ny - 0.05*cm, var_moves)
            
            # Stats
            c.setFont("Helvetica-Bold", 8)
            ww = var.get('white_win', '')
            bw = var.get('black_win', '')
            c.drawString(text_x, ny - 0.35*cm, f"⚪{ww}% ⚫{bw}% ")
            
            # Plans
            plan_y = ny - 0.85*cm
            

            c.setFont("Helvetica-Bold", 8)
            c.drawString(text_x, plan_y, "Blancs:")
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 8)
            for i, line in enumerate(self.wrap_text(var.get('white_plan', ''), "Helvetica", 8, text_w)[:3]):
                c.drawString(text_x, plan_y - 0.25*cm - i*0.22*cm, line)
            
            plan_y2 = plan_y - 0.1*cm
            c.setFont("Helvetica-Bold", 8)
            c.drawString(text_x, plan_y2, "Noirs:")
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 8)
            for i, line in enumerate(self.wrap_text(var.get('black_plan', ''), "Helvetica", 8, text_w)[:3]):
                c.drawString(text_x, plan_y2 - 0.25*cm - i*0.22*cm, line)
            
            vx += var_w + 0.3*cm
        
        # Footer
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 0.5*cm, f"— {self.page_num} —")

    # === CHECKLIST ===
    def generate_checklist(self):
        self.new_page()
        c = self.c
        
        # Header
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - 3.5*cm, WIDTH, 3.5*cm, fill=True, stroke=False)
        
        # Bande dorée
        c.setFillColor(self.hex('gold'))
        c.rect(0, HEIGHT - 3.5*cm, WIDTH, 0.4*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(WIDTH/2, HEIGHT - 2*cm, "✓ CHECKLIST")
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 14)
        c.drawCentredString(WIDTH/2, HEIGHT - 2.8*cm, "10 questions à se poser AVANT chaque coup")
        
        # Contenu
        y = HEIGHT - 5*cm
        content_width = WIDTH - 3*cm
        
        checklist = [
            {
                "num": "1",
                "title": "ÉCHEC ?",
                "color": "red_dark",
                "question": "Mon adversaire me fait-il échec ? Puis-je faire échec ?",
                "detail": "Un échec non vu = partie perdue. Toujours vérifier en premier !"
            },
            {
                "num": "2", 
                "title": "PRISE ?",
                "color": "red_dark",
                "question": "Y a-t-il une pièce en prise ? Puis-je capturer quelque chose ?",
                "detail": "Regarder TOUTES les pièces : les miennes ET celles de l'adversaire."
            },
            {
                "num": "3",
                "title": "MENACE ?",
                "color": "yellow_dark",
                "question": "Quelle est la menace de mon adversaire ? Quelle est MA menace ?",
                "detail": "Identifier la menace adverse AVANT de jouer son coup."
            },
            {
                "num": "4",
                "title": "TACTIQUE ?",
                "color": "yellow_dark", 
                "question": "Y a-t-il une fourchette, un clouage, une enfilade, un échec double ?",
                "detail": "Fourchette (2 pièces attaquées), Clouage (pièce immobilisée), Enfilade (2 pièces en ligne)."
            },
            {
                "num": "5",
                "title": "PIÈCES FAIBLES ?",
                "color": "yellow_dark",
                "question": "Ai-je une pièce non défendue ? Mon adversaire en a-t-il une ?",
                "detail": "Une pièce non défendue = cible tactique. Les compter à chaque coup."
            },
            {
                "num": "6",
                "title": "ROI EN SÉCURITÉ ?",
                "color": "green_dark",
                "question": "Mon Roi est-il en sécurité ? Celui de l'adversaire ?",
                "detail": "Roi au centre = danger. Roquer tôt. Attention aux colonnes ouvertes."
            },
            {
                "num": "7",
                "title": "DÉVELOPPEMENT ?",
                "color": "green_dark",
                "question": "Toutes mes pièces sont-elles développées et actives ?",
                "detail": "Cavaliers et Fous sortis, Tours connectées, pas de pièce passive."
            },
            {
                "num": "8",
                "title": "CENTRE ?",
                "color": "green_dark",
                "question": "Qui contrôle le centre ? Puis-je l'améliorer ?",
                "detail": "Cases e4, d4, e5, d5 = les plus importantes. Pions + pièces au centre."
            },
            {
                "num": "9",
                "title": "PLAN ?",
                "color": "green_dark",
                "question": "Quel est mon plan ? Ce coup le sert-il ?",
                "detail": "Chaque coup doit avoir un but. Pas de coup \"en attendant\"."
            },
            {
                "num": "10",
                "title": "BLUNDER CHECK !",
                "color": "red_dark",
                "question": "Si je joue ce coup, que répond mon adversaire ?",
                "detail": "TOUJOURS imaginer la réponse adverse AVANT de jouer. Évite 90% des erreurs !"
            }
        ]
        
        item_height = 2.1*cm
        
        for i, item in enumerate(checklist):
            # Fond alterné
            if i % 2 == 0:
                c.setFillColor(self.hex('light'))
                c.rect(1.5*cm, y - item_height + 0.2*cm, content_width, item_height - 0.1*cm, fill=True, stroke=False)
            
            # Numéro dans cercle coloré
            c.setFillColor(self.hex(item['color']))
            c.circle(2.3*cm, y - 0.7*cm, 0.55*cm, fill=True, stroke=False)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 16)
            c.drawCentredString(2.3*cm, y - 0.85*cm, item['num'])
            
            # Titre
            c.setFillColor(self.hex(item['color']))
            c.setFont("Helvetica-Bold", 14)
            c.drawString(3.2*cm, y - 0.5*cm, item['title'])
            
            # Question
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 10)
            c.drawString(3.2*cm, y - 1.05*cm, item['question'])
            
            # Détail
            c.setFillColor(self.hex('gray'))
            c.setFont("Helvetica", 9)
            c.drawString(3.2*cm, y - 1.5*cm, item['detail'])
            
            y -= item_height
        
        # Footer avec conseil
        c.setFillColor(self.hex('gold'))
        c.rect(1.5*cm, 1.2*cm, content_width, 1.2*cm, fill=True, stroke=False)
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(WIDTH/2, 1.95*cm, "💡 ASTUCE : Mémoriser \"É-P-M-T\" (Échec, Prise, Menace, Tactique)")
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 1.5*cm, "Les 4 premiers points couvrent 80% des erreurs. Toujours les vérifier !")
        
        # Numéro de page
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 0.5*cm, f"— {self.page_num} —")

    # === PAGE ZONES ===
    def generate_zones(self):
        self.new_page()
        c = self.c
        
        # Header
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 3*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 0.3*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(WIDTH/2, HEIGHT - 1.7*cm, "🗺️ LES 3 ZONES DE L'ÉCHIQUIER")
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 11)
        c.drawCentredString(WIDTH/2, HEIGHT - 2.4*cm, "Comprendre où se passe l'action pour mieux planifier")
        
        y = HEIGHT - 3.8*cm
        content_width = WIDTH - 1.6*cm
        zone_height = 8.5*cm
        
        zones = [
            {
                "name": "AILE DAME",
                "color": "green_dark",
                "cols": "a, b, c",
                "icon": "♕",
                "fen": "r4rk1/1pp2ppp/p1n2n2/3pp3/8/P1NPPP2/1P4PP/R1B2RK1 w - - 0 1",
                "highlights": ["a3", "b2", "c3", "a1"],
                "quand": [
                    "Majorité de pions",
                    "Roi adverse au petit roque",
                    "Colonnes a/b/c ouvertes",
                    "Poussée b4-b5 possible"
                ],
                "plans": [
                    "Créer pion passé (finale)",
                    "Minority attack (b4-b5)",
                    "Tours sur colonnes a/b",
                    "Cavalier en c5"
                ],
                "tip": "Ne pas dégarnir le Roi !"
            },
            {
                "name": "CENTRE",
                "color": "yellow_dark", 
                "cols": "d, e",
                "icon": "⚔️",
                "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1",
                "highlights": ["d4", "e4", "d5", "e5"],
                "quand": [
                    "TOUJOURS prioritaire !",
                    "Contrôle = mobilité",
                    "Pièces centralisées",
                    "Basculer d'une aile à l'autre"
                ],
                "plans": [
                    "Occuper avec pions e4-d4",
                    "Cavalier en d5/e5",
                    "Ouvrir si mieux développé",
                    "Fermer pour attaque flanc"
                ],
                "tip": "\"Contrôle le centre, contrôle la partie\""
            },
            {
                "name": "AILE ROI",
                "color": "red_dark",
                "cols": "f, g, h",
                "icon": "♚",
                "fen": "r1bq1rk1/ppp2ppp/2n2n2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 1",
                "highlights": ["f3", "g2", "h2", "f7", "g7", "h7"],
                "quand": [
                    "Roi adverse au petit roque",
                    "Centre fermé/stable",
                    "Plus de pièces vers aile roi",
                    "Colonne g ou h ouverte"
                ],
                "plans": [
                    "Poussée g4-g5-g6",
                    "Sacrifice sur h7 (Bxh7+)",
                    "Tour lift (Ta3-g3)",
                    "Cavalier en g5 ou f5"
                ],
                "tip": "Attaquer avec assez de pièces !"
            }
        ]
        
        zone_w = (content_width - 0.6*cm) / 3
        zx = 0.8*cm
        
        for zone in zones:
            # Fond
            c.setFillColor(self.hex('light'))
            c.roundRect(zx, y - zone_height, zone_w, zone_height, 5, fill=True, stroke=False)
            
            # Bandeau titre
            c.setFillColor(self.hex(zone['color']))
            c.roundRect(zx, y - 0.9*cm, zone_w, 0.9*cm, 5, fill=True, stroke=False)
            
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(zx + zone_w/2, y - 0.6*cm, f"{zone['icon']} {zone['name']} ({zone['cols']})")
            
            # Échiquier
            try:
                img = self.board_mini(zone['fen'], zone['highlights'], 200)
                board_size = 2.8*cm
                c.drawImage(img, zx + (zone_w - board_size)/2, y - 1.1*cm - board_size, board_size, board_size)
            except: pass
            
            # Quand jouer
            ty = y - 4.2*cm
            c.setFillColor(self.hex(zone['color']))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(zx + 0.15*cm, ty, "QUAND ?")
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 6.5)
            ty -= 0.32*cm
            for item in zone['quand']:
                c.drawString(zx + 0.15*cm, ty, f"• {item}")
                ty -= 0.3*cm
            
            # Plans
            ty -= 0.15*cm
            c.setFillColor(self.hex(zone['color']))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(zx + 0.15*cm, ty, "PLANS")
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 6.5)
            ty -= 0.32*cm
            for item in zone['plans']:
                c.drawString(zx + 0.15*cm, ty, f"• {item}")
                ty -= 0.3*cm
            
            # Tip
            ty -= 0.15*cm
            c.setFillColor(self.hex(zone['color']))
            c.setFont("Helvetica-Bold", 6)
            c.drawString(zx + 0.15*cm, ty, f"💡 {zone['tip']}")
            
            zx += zone_w + 0.3*cm
        
        # Section du bas : Règles d'or
        y -= zone_height + 0.4*cm
        
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 13)
        c.drawString(0.8*cm, y, "⭐ RÈGLES D'OR")
        y -= 0.55*cm
        
        rules = [
            ("1. CENTRE D'ABORD", "Contrôlez le centre avant d'attaquer une aile."),
            ("2. FLANC = CENTRE FERMÉ", "N'attaquez une aile que si le centre est fermé ou stable."),
            ("3. ATTAQUEZ VOTRE CÔTÉ FORT", "Attaquez là où vous avez plus d'espace ou de pièces."),
            ("4. CONTRE AU CENTRE", "Si l'adversaire attaque une aile, contre-attaquez au centre !"),
        ]
        
        for title, desc in rules:
            c.setFillColor(self.hex('gold'))
            c.setFont("Helvetica-Bold", 10)
            c.drawString(1*cm, y, title)
            
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 9)
            c.drawString(6.5*cm, y, desc)
            y -= 0.5*cm
        
        # Footer
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 0.5*cm, f"— {self.page_num} —")

    # === PAGE PAWN STRUCTURES ===
    def generate_pawn_structures(self):
        self.new_page()
        c = self.c
        
        # Header
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - 3.2*cm, WIDTH, 3.2*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.rect(0, HEIGHT - 3.2*cm, WIDTH, 0.4*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(WIDTH/2, HEIGHT - 1.8*cm, "♟️ PAWN STRUCTURES")
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 12)
        c.drawCentredString(WIDTH/2, HEIGHT - 2.6*cm, "Pawns are the soul of chess - Philidor")
        
        y = HEIGHT - 4*cm
        
        structures = [
            {
                "name": "ISOLATED PAWN",
                "fen": "8/pp3ppp/3p4/8/3P4/8/PP3PPP/8 w - - 0 1",
                "desc": "Pawn with no neighbor on adjacent files",
                "plus": "+ Square ahead = outpost\n+ Semi-open files\n+ Active pieces",
                "moins": "- Weakness in endgame\n- Target for enemy Rooks\n- Must be defended by pieces",
                "plan": "BLANCS: Piece activity, attack before endgame\nNOIRS: Exchange pieces, block and attack the pawn"
            },
            {
                "name": "DOUBLED PAWNS",
                "fen": "8/pp3ppp/8/8/8/2P5/PPP2PPP/8 w - - 0 1",
                "desc": "Two pawns on the same file",
                "plus": "+ Square control\n+ Semi-open file\n+ Sometimes an extra pawn",
                "moins": "- Reduced mobility\n- Weak in endgame\n- Cannot protect each other",
                "plan": "Compensate with piece activity. En finale, avoid exchanges if possible."
            },
            {
                "name": "PASSED PAWN",
                "fen": "8/pp3ppp/8/3P4/8/8/PP3PPP/8 w - - 0 1",
                "desc": "No enemy pawn can block it",
                "plus": "+ Promotion threat\n+ Forces pieces to block it\n+ Very strong in endgame",
                "moins": "- Can be blocked\n- Must be supported\n- Beware of sacrifices",
                "plan": "BLANCS: Push! Support with King and pieces\nNOIRS: Block with a piece (Knight ideal)"
            },
            {
                "name": "PAWN CHAIN",
                "fen": "8/pp3ppp/4p3/3pP3/2PP4/8/PP3PPP/8 w - - 0 1",
                "desc": "Pawns in diagonal (ex: c4-d5-e6)",
                "plus": "+ Space control\n+ Solid structure\n+ Strong squares ahead",
                "moins": "- Chain base = weakness\n- Weak squares on opposite side",
                "plan": "BLANCS: Protect the base (c4), push if possible\nNOIRS: Attack the base with ...b5 ou ...f6"
            },
            {
                "name": "HANGING PAWNS",
                "fen": "8/pp3ppp/8/2pp4/8/8/PP3PPP/8 w - - 0 1",
                "desc": "Two pawns side by side without support",
                "plus": "+ Center control\n+ Can advance together\n+ Dynamic",
                "moins": "- Targets if blocked\n- Weak on open files\n- One advances = other weakens",
                "plan": "Advance together or use to open the game. Avoid them being blocked."
            },
            {
                "name": "PAWN MAJORITY",
                "fen": "8/ppp2ppp/8/8/8/8/PP3PPP/8 w - - 0 1",
                "desc": "More pawns on one side (ex: 3 vs 2)",
                "plus": "+ Can create passed pawn\n+ Endgame advantage\n+ Initiative on that wing",
                "moins": "- Other side is weakened\n- Takes time to exploit",
                "plan": "Advance majority to create passed pawn. Ideal in Rook endgames."
            },
        ]
        
        struct_w = (WIDTH - 2.5*cm) / 2
        struct_h = 4*cm
        
        for i, struct in enumerate(structures):
            col = i % 2
            row = i // 2
            
            sx = 1*cm + col * (struct_w + 0.5*cm)
            sy = y - row * (struct_h + 0.3*cm)
            
            # Fond
            c.setFillColor(self.hex('light'))
            c.roundRect(sx, sy - struct_h, struct_w, struct_h, 5, fill=True, stroke=False)
            
            # Titre
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 11)
            c.drawString(sx + 0.2*cm, sy - 0.4*cm, struct['name'])
            
            # Description
            c.setFillColor(self.hex('gray'))
            c.setFont("Helvetica", 7)
            c.drawString(sx + 0.2*cm, sy - 0.75*cm, struct['desc'])
            
            # Mini échiquier
            try:
                img = self.board_mini(struct['fen'], None, 180)
                c.drawImage(img, sx + 0.1*cm, sy - 2.9*cm, 2*cm, 2*cm)
            except: pass
            
            # Plus/Moins
            text_x = sx + 2.2*cm
            text_w = struct_w - 2.5*cm
            
            c.setFillColor(self.hex('green_dark'))
            c.setFont("Helvetica", 6)
            plus_y = sy - 1.1*cm
            for line in struct['plus'].split('\n'):
                c.drawString(text_x, plus_y, line)
                plus_y -= 0.28*cm
            
            c.setFillColor(self.hex('red_dark'))
            moins_y = plus_y - 0.1*cm
            for line in struct['moins'].split('\n'):
                c.drawString(text_x, moins_y, line)
                moins_y -= 0.28*cm
            
            # Plan
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 5.5)
            plan_lines = self.wrap_text(struct['plan'], "Helvetica-Bold", 5.5, struct_w - 0.4*cm)
            plan_y = sy - struct_h + 0.6*cm
            for line in plan_lines[:2]:
                c.drawString(sx + 0.2*cm, plan_y, line)
                plan_y -= 0.24*cm
        
        # Footer
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 0.5*cm, f"— {self.page_num} —")

    # === PAGE TACTIQUES ===
    def generate_tactics(self):
        self.new_page()
        c = self.c
        
        # Header
        c.setFillColor(self.hex('dark'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 3*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.rect(0, HEIGHT - 3*cm, WIDTH, 0.3*cm, fill=True, stroke=False)
        
        c.setFillColor(self.hex('gold'))
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(WIDTH/2, HEIGHT - 1.7*cm, "⚡ ESSENTIAL TACTICS")
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 11)
        c.drawCentredString(WIDTH/2, HEIGHT - 2.4*cm, "Tactical patterns to recognize instantly")
        
        y = HEIGHT - 3.6*cm
        
        # 8 tactiques avec échiquiers (4 lignes x 2 colonnes)
        tactics = [
            {
                "name": "FORK",
                "icon": "🍴",
                "color": "red_dark",
                "fen": "r3k2r/ppp2ppp/8/3N4/8/8/PPP2PPP/R3K2R w KQkq - 0 1",
                "highlights": ["d5", "c7", "e7", "f6"],
                "def": "One piece attacks 2+ pieces",
                "tip": "Knight = king of forks !"
            },
            {
                "name": "PIN",
                "icon": "📌",
                "color": "yellow_dark",
                "fen": "r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 1",
                "highlights": ["b4", "c3", "e1"],
                "def": "Piece frozen (protects King)",
                "tip": "Absolute (King) vs Relative (other)"
            },
            {
                "name": "SKEWER",
                "icon": "🎯",
                "color": "green_dark",
                "fen": "6k1/5ppp/8/8/8/8/q4PPP/R5K1 w - - 0 1",
                "highlights": ["a1", "a2", "a8"],
                "def": "Attack strong piece, capture behind",
                "tip": "Reverse of pin"
            },
            {
                "name": "DOUBLE CHECK",
                "icon": "👑",
                "color": "red_dark",
                "fen": "r1bqk2r/pppp1Npp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 1",
                "highlights": ["f7", "e8", "d8"],
                "def": "2 pieces give check at once",
                "tip": "King MUST move !"
            },
            {
                "name": "DISCOVERY",
                "icon": "💨",
                "color": "yellow_dark",
                "fen": "r1bqkb1r/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1",
                "highlights": ["c4", "e5", "f7"],
                "def": "Piece moves, reveals attack",
                "tip": "Double threat possible"
            },
            {
                "name": "SACRIFICE",
                "icon": "💎",
                "color": "green_dark",
                "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1",
                "highlights": ["h5", "f7", "c4"],
                "def": "Donner matériel pour gagner plus",
                "tip": "Calculer jusqu'au bout !"
            },
            {
                "name": "ÉLIMINATION",
                "icon": "🗑️",
                "color": "red_dark",
                "fen": "r2qkb1r/ppp2ppp/2n1bn2/4p3/4P3/1NN5/PPPP1PPP/R1BQKB1R w KQkq - 0 1",
                "highlights": ["c3", "e6", "d8"],
                "def": "Capturer le défenseur clé",
                "tip": "Identifier LA pièce qui tient tout"
            },
            {
                "name": "SURCHARGE",
                "icon": "⚖️",
                "color": "yellow_dark",
                "fen": "3r2k1/5ppp/8/8/8/8/5PPP/3RQ1K1 w - - 0 1",
                "highlights": ["d8", "d1", "e1"],
                "def": "Pièce avec trop de tâches",
                "tip": "Créer menaces multiples"
            },
        ]
        
        tact_w = (WIDTH - 1.6*cm) / 2 - 0.2*cm
        tact_h = 4.8*cm
        
        for i, tact in enumerate(tactics):
            col = i % 2
            row = i // 2
            
            tx = 0.8*cm + col * (tact_w + 0.4*cm)
            ty = y - row * (tact_h + 0.25*cm)
            
            # Fond
            c.setFillColor(self.hex('light'))
            c.roundRect(tx, ty - tact_h, tact_w, tact_h, 5, fill=True, stroke=False)
            
            # Bandeau titre
            c.setFillColor(self.hex(tact['color']))
            c.roundRect(tx, ty - 0.7*cm, tact_w, 0.7*cm, 5, fill=True, stroke=False)
            
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(tx + tact_w/2, ty - 0.5*cm, f"{tact['icon']} {tact['name']}")
            
            # Échiquier
            board_size = 2.8*cm
            try:
                img = self.board_mini(tact['fen'], tact['highlights'], 220)
                c.drawImage(img, tx + 0.15*cm, ty - 0.9*cm - board_size, board_size, board_size)
            except: pass
            
            # Texte à droite de l'échiquier
            text_x = tx + board_size + 0.35*cm
            text_w = tact_w - board_size - 0.6*cm
            
            # Définition
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica-Bold", 8)
            def_lines = self.wrap_text(tact['def'], "Helvetica-Bold", 8, text_w)
            def_y = ty - 1.1*cm
            for line in def_lines[:2]:
                c.drawString(text_x, def_y, line)
                def_y -= 0.35*cm
            
            # Tip
            c.setFillColor(self.hex(tact['color']))
            c.setFont("Helvetica-Bold", 7)
            tip_lines = self.wrap_text(f"💡 {tact['tip']}", "Helvetica-Bold", 7, text_w)
            tip_y = ty - 2.1*cm
            for line in tip_lines[:2]:
                c.drawString(text_x, tip_y, line)
                tip_y -= 0.3*cm
            
            # Légende sous l'échiquier
            c.setFillColor(self.hex('gray'))
            c.setFont("Helvetica", 6)
            c.drawCentredString(tx + 0.15*cm + board_size/2, ty - 4*cm, "Cases vertes = pièces clés")
        
        # Autres tactiques en bas (texte simple)
        y = y - 4 * (tact_h + 0.25*cm) - 0.3*cm
        
        c.setFillColor(self.hex('dark'))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(0.8*cm, y, "⚡ OTHER PATTERNS :")
        
        other_tactics = [
            ("Deflection", "Force piece to leave its square"),
            ("Attraction", "Lure piece to bad square"),
            ("X-Ray", "Attack through enemy piece"),
            ("Perpetual check", "Forced check series = draw"),
        ]
        
        c.setFont("Helvetica", 8)
        ox = 0.8*cm
        for name, desc in other_tactics:
            c.setFillColor(self.hex('gold'))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(ox, y - 0.5*cm, f"• {name}:")
            c.setFillColor(self.hex('dark'))
            c.setFont("Helvetica", 8)
            c.drawString(ox + 2.5*cm, y - 0.5*cm, desc)
            ox += 4.8*cm
            if ox > WIDTH - 4*cm:
                ox = 0.8*cm
                y -= 0.5*cm
        
        # Footer
        c.setFillColor(self.hex('gray'))
        c.setFont("Helvetica", 9)
        c.drawCentredString(WIDTH/2, 0.5*cm, f"— {self.page_num} —")

    # === GÉNÉRATION ===
    def generate_complete(self, data_dir='data_en'):
        openings = load_all_openings(data_dir)
        levels = categorize_and_sort(openings)
        
        print(f"📚 {len(openings)} openings chargées")
        print(f"   🟢 {len(levels['Beginner'])} Beginner")
        print(f"   🟡 {len(levels['Intermediate'])} Intermediate")
        print(f"   🔴 {len(levels['Advanced'])} Advanced")
        
        # 1. Couverture
        self.generate_cover()
        
        # 2. Sommaire
        self.generate_toc(levels)
        
        # 3. Fiches
        for level_name in ['Beginner', 'Intermediate', 'Advanced']:
            for op in levels[level_name]:
                self.generate_opening(op)
                print(f"   ✅ {op['name']}")
        
        # 4. Checklist
        self.generate_checklist()
        print(f"   ✅ Checklist ajoutée")
        
        self.c.save()
        print(f"\n✅ Document généré: {len(openings)} fiches + checklist sur {self.page_num} pages")

if __name__ == '__main__':
    pdf = EloBoosterPremium('Elo_Booster_EN_Premium.pdf')
    pdf.generate_complete('data_en')
