"""Rebuild sprite bounds after replacing artwork. Requires Pillow; runtime does not."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
metrics = {}
for directory in ('characters', 'enemies'):
    for asset in sorted((root / 'assets' / directory).glob('*.webp')):
        im = Image.open(asset).convert('RGBA')
        alpha = im.getchannel('A').point(lambda value: 255 if value > 10 else 0)
        left, top, right, bottom = alpha.getbbox() or (0, 0, *im.size)
        metrics[asset.relative_to(root).as_posix()] = {
            'fullW': im.width, 'fullH': im.height,
            'contentH': bottom - top, 'centerX': (left + right) / 2,
            'bottomY': bottom,
        }
overrides = root / 'assets' / 'sprite-anchor-overrides.json'
if overrides.exists():
    metrics.update(json.loads(overrides.read_text()))
(root / 'data' / 'sprite-metrics.js').write_text(
    '// Generated alpha bounds. No runtime pixel reads or server required.\n'
    'window.IMMUNO_SPRITE_METRICS = '
    + json.dumps(metrics, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{len(metrics)} sprite bounds generated.')
