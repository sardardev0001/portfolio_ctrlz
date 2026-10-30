"""Generate disposable real videos inside the app image (FFmpeg and Pillow)."""
import subprocess
import sys
from pathlib import Path
from PIL import Image

root=Path(sys.argv[1])
root.mkdir(parents=True, exist_ok=True)
for name, seconds in [('short', '0.1'),('30','30'),('90','90'),('120','120'),('too-long','121')]:
    subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','color=c=blue:s=64x64:r=10',
        '-t',seconds,'-c:v','libx264','-pix_fmt','yuv420p','-threads','1','-movflags','+faststart',str(root/(name+'.mp4'))],check=True,timeout=60)
(root/'corrupt.mp4').write_bytes(b'Not a video, despite the filename.')
Image.new('RGB',(8,8),'blue').save(root/'pixel.png')
