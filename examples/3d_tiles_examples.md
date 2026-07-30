# 3D Tiles - More Pronounced Examples

For Bogusia Senior game - current v4.3 has 7px fast vs 14px quality. Below are more pronounced options you can drop in.

## Option 1: Ultra Thick Sides (20px) - Most Visible Even Without Picking

```css
/* In JS: zOff = 18 for quality, 6 for fast */
:root{ --tile-w:78px; --tile-h:100px; --z-off:18px; }

/* Quality = real 3D */
body.mode-quality .tile{
  border:3px solid #4a3a1a;
  box-shadow:
    inset 0 2px 0 #fff,
    0 1px 0 #c9b896,
    0 2px 0 #b8a57a,
    0 3px 0 #a8966f,
    0 4px 0 #8a7b5b,
    0 6px 0 #6f6449,
    0 10px 0 #4a3f2b,
    0 16px 0 #2e261a,
    0 22px 28px rgba(0,0,0,0.55);
}
body.mode-quality .tile::before{
  content:'';
  position:absolute;
  top:6px; right:-18px;
  width:18px; height:calc(100% - 6px);
  background:linear-gradient(90deg, #a8966f 0%, #3e2f1e 100%);
  border-radius:0 10px 10px 0;
  transform:skewY(12deg);
  box-shadow:3px 3px 8px rgba(0,0,0,0.4);
}
body.mode-quality .tile::after{
  content:'';
  position:absolute;
  bottom:-18px; left:10px;
  width:calc(100% - 10px); height:18px;
  background:linear-gradient(180deg, #8a7b5b 0%, #2e2415 100%);
  border-radius:0 0 10px 10px;
  transform:skewX(16deg);
  box-shadow:0 4px 8px rgba(0,0,0,0.45);
}
body.mode-fast .tile::before,
body.mode-fast .tile::after{display:none}

/* Stacking in JS: left = x*tw*0.80 + z*18, top = y*th*0.80 + z*18 */
```

Result: Pile height at z=4 = 72px above base, sides 18px thick - visible from distance, not only on pick-up.

## Option 2: Isometric 3 Faces (Top + Left + Right) - Super 3D

```css
.tile{
  transform-style:preserve-3d;
  background:#fff;
}
.tile::before{ /* right side */
  content:''; position:absolute; top:0; right:-16px; width:16px; height:100%;
  background:#7a6a4a; transform-origin:left; transform:skewY(30deg);
  filter:brightness(0.75);
}
.tile::after{ /* bottom side */
  content:''; position:absolute; bottom:-16px; left:0; width:100%; height:16px;
  background:#5a4a2a; transform-origin:top; transform:skewX(30deg);
  filter:brightness(0.6);
}
```

## Option 3: Senior High Contrast + Long Shadow (Best for poor eyesight)

```css
.tile.free{
  background:#ffffff;
  border:4px solid #1b5e20;
  box-shadow:
    0 0 0 2px #2e7d32,
    0 4px 0 #1b5e20,
    0 8px 0 #0f3311,
    0 12px 20px rgba(0,0,0,0.5),
    0 0 16px rgba(46,125,50,0.6);
}
/* Long shadow for depth */
.tile.free::before{
  width:20px; right:-20px;
  background:#1b5e20;
  opacity:0.9;
}
```

## Option 4: What you have now vs More Pronounced

Current v4.3:
- Fast: no sides, z*7
- Quality: 10px sides, z*10

More pronounced suggestion for v4.4:
- Fast: 6px sides, z*6 (still subtle)
- Quality: 20px sides, z*18 + long shadow

Change in JS:
```js
function computeBase(){
  const zOff = document.body.classList.contains('mode-quality') ? 18 : 6;
  view.baseW = maxX*tw*0.80 + tw + maxZ*zOff + 30;
}
function createDOM(){
  const zOff = document.body.classList.contains('mode-quality') ? 18 : 6;
  left = x*tw*0.80 + z*zOff;
  top = y*th*0.80 + z*zOff;
}
```

## Images
See generated examples:
- 3d_tile_extruded_food.png - single tile 16px sides, food icon
- 3d_tile_isometric_stack.png - stacked 2 tiles, 20px sides
- 3d_tile_beveled.png - beveled edges, 25px depth

You can copy any of the CSS blocks into your index.html `<style>` section, replacing the existing `body.mode-quality .tile::before/::after`.

For white plate tile (almost empty), border fix already in v4.1+:
```css
.tile-face img{border:1.5px solid #e0d0a0; background:#fffef5}
.tile{border:2.5px solid #6e5a2a}
```

Want me to build v4.4 with Option 1 (18px sides, 18px stacking) already applied?
