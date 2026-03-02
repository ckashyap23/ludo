from xml.sax.saxutils import escape

TILE = 64
GRID = 15
SIZE = TILE * GRID

COLORS = {
    "red": "#C83A3A",
    "blue": "#2F6FD6",
    "yellow": "#F4C430",
    "green": "#6CBF4B",
    "white": "#FFFFFF",
    "black": "#111111",
    "home": "#EFEDE6",
}

base_track = [
    (6,13),(6,12),(6,11),(6,10),(6,9),(5,8),(4,8),(3,8),(2,8),(1,8),(0,8),(0,7),(0,6),
    (1,6),(2,6),(3,6),(4,6),(5,6),(6,5),(6,4),(6,3),(6,2),(6,1),(6,0),(7,0),(8,0),
    (8,1),(8,2),(8,3),(8,4),(8,5),(9,6),(10,6),(11,6),(12,6),(13,6),(14,6),(14,7),(14,8),
    (13,8),(12,8),(11,8),(10,8),(9,8),(8,9),(8,10),(8,11),(8,12),(8,13),(8,14),(7,14),(6,14)
]
track = list(reversed(base_track))
start_idx = track.index((8,13))
ordered = [track[(start_idx+i) % len(track)] for i in range(len(track))]

start_tiles = {
    "green": (8,13),
    "yellow": ordered[13],
    "blue": ordered[26],
    "red": ordered[39],
}

home_lanes = {
    "green": [(r,13) for r in range(3,8)],
    "yellow": [(13,c) for c in range(7,12)],
    "blue": [(r,1) for r in range(3,8)],
    "red": [(1,c) for c in range(7,12)],
}

parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">']
parts.append(f'<rect x="0" y="0" width="{SIZE}" height="{SIZE}" fill="{COLORS["white"]}"/>')

def cell(r,c):
    return c*TILE, r*TILE

def rect(r,c,fill,stroke=COLORS["black"],sw=2):
    x,y=cell(r,c)
    parts.append(f'<rect x="{x}" y="{y}" width="{TILE}" height="{TILE}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

# corner bases
corners={"blue":(0,0),"red":(0,9),"yellow":(9,0),"green":(9,9)}
for color,(r0,c0) in corners.items():
    x,y=cell(r0,c0)
    parts.append(f'<rect x="{x}" y="{y}" width="{6*TILE}" height="{6*TILE}" fill="{COLORS["white"]}" stroke="{COLORS["black"]}" stroke-width="3"/>')
    x,y=cell(r0+1,c0+1)
    parts.append(f'<rect x="{x}" y="{y}" width="{4*TILE}" height="{4*TILE}" fill="{COLORS[color]}" stroke="{COLORS["black"]}" stroke-width="2"/>')
    x,y=cell(r0+2,c0+2)
    parts.append(f'<rect x="{x}" y="{y}" width="{2*TILE}" height="{2*TILE}" fill="{COLORS["white"]}" stroke="{COLORS["black"]}" stroke-width="2"/>')
    for c,r in [(c0+2,r0+2),(c0+3,r0+2),(c0+2,r0+3),(c0+3,r0+3)]:
        x,y=cell(r,c)
        parts.append(f'<rect x="{x+6}" y="{y+6}" width="{TILE-12}" height="{TILE-12}" fill="{COLORS["black"]}" stroke="{COLORS["white"]}" stroke-width="2"/>')
        cx,cy=x+TILE/2,y+TILE/2
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{TILE/4}" fill="{COLORS[color]}" stroke="{COLORS["white"]}" stroke-width="2"/>')

for r,c in track:
    rect(r,c,COLORS["white"])

for color,(r,c) in start_tiles.items():
    rect(r,c,COLORS[color])
    x,y=cell(r,c)
    cx,cy=x+TILE/2,y+TILE/2
    parts.append(f'<line x1="{cx-14}" y1="{cy}" x2="{cx+14}" y2="{cy}" stroke="{COLORS["black"]}" stroke-width="4"/>')
    parts.append(f'<line x1="{cx}" y1="{cy-14}" x2="{cx}" y2="{cy+14}" stroke="{COLORS["black"]}" stroke-width="4"/>')

for color,cells in home_lanes.items():
    for r,c in cells:
        rect(r,c,COLORS[color])

parts.append(f'<rect x="{6*TILE}" y="{6*TILE}" width="{3*TILE}" height="{3*TILE}" fill="{COLORS["home"]}" stroke="{COLORS["black"]}" stroke-width="3"/>')
parts.append(f'<text x="{7.5*TILE}" y="{7.5*TILE}" text-anchor="middle" dominant-baseline="middle" font-size="22" font-family="Arial" fill="{COLORS["black"]}">HOME</text>')

for i,(r,c) in enumerate(ordered, start=1):
    x,y=cell(r,c)
    parts.append(f'<text x="{x+TILE/2}" y="{y+TILE/2}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-family="Arial" fill="{COLORS["black"]}">{escape(str(i))}</text>')

parts.append(f'<rect x="1" y="1" width="{SIZE-2}" height="{SIZE-2}" fill="none" stroke="{COLORS["black"]}" stroke-width="4"/>')
parts.append('</svg>')

out='docs/ludo_board_numbered.svg'
with open(out,'w',encoding='utf-8') as f:
    f.write('\n'.join(parts))
print('saved', out)
print('starts', start_tiles)
