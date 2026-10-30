from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parents[1] / "seed_assets" / "resume-demo.pdf"
W, H = A4
navy = colors.HexColor("#030b19")
blue = colors.HexColor("#087dff")
cyan = colors.HexColor("#18e4fb")
muted = colors.HexColor("#a7bed1")
white = colors.HexColor("#f5fbff")
c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
c.setTitle("CTRL.Z — Illustrative Resume")
c.setAuthor("CTRL.Z Demo Portfolio")
c.setFillColor(navy)
c.rect(0, 0, W, H, stroke=0, fill=1)
c.setStrokeColor(blue)
c.setLineWidth(2)
c.line(44, H - 48, W - 44, H - 48)
c.setFillColor(cyan)
c.setFont("Helvetica-Bold", 18)
c.drawString(44, H - 82, "CTRL.Z")
c.setFillColor(white)
c.setFont("Helvetica-Bold", 34)
c.drawString(44, H - 136, "Visual Editor")
c.setFont("Helvetica", 13)
c.setFillColor(muted)
c.drawString(44, H - 158, "Portfolio resume / editorial illustration")
c.setFillColor(colors.HexColor("#103959"))
c.roundRect(44, H - 213, W - 88, 35, 8, stroke=0, fill=1)
c.setFillColor(cyan)
c.setFont("Helvetica-Bold", 11)
c.drawString(56, H - 200, "DEMO CONTENT — REPLACE WITH VERIFIED BIOGRAPHY")


def section(y, title, lines):
    c.setFillColor(cyan)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(44, y, title.upper())
    c.setStrokeColor(colors.HexColor("#184364"))
    c.line(44, y - 9, W - 44, y - 9)
    c.setFillColor(white)
    c.setFont("Helvetica", 10.5)
    for i, line in enumerate(lines):
        if stringWidth(line, "Helvetica", 10.5) > W - 96:
            raise ValueError("Resume line exceeds the page width")
        c.drawString(44, y - 31 - i * 18, line)


section(
    H - 253,
    "Profile",
    [
        "Illustrative editor profile for demonstrating the downloadable-resume feature.",
        "Specialties: video editing, visual rhythm, cinematic color and motion design.",
    ],
)
section(
    H - 351,
    "Experience",
    [
        "2025 — Present    Freelance Video Editor (illustrative)",
        "2024 — 2025       Creative Content Team (illustrative)",
        "2022 — 2024       Editing Practice and Collaboration (illustrative)",
    ],
)
section(
    H - 472,
    "Creative toolkit",
    [
        "Adobe Premiere Pro  /  After Effects  /  DaVinci Resolve",
        "Story structure  /  Color grading  /  Sound design",
    ],
)
section(
    H - 572,
    "Selected work",
    [
        "Cinematic edits, promotional teasers, motion graphics and social video.",
        "The matching site portfolio contains sample records and placeholder artwork.",
    ],
)
section(
    H - 670,
    "Contact",
    [
        "Use the website contact form for a demonstration of the message workflow.",
        "Replace all content, metrics and links in the admin panel before publication.",
    ],
)
c.setStrokeColor(blue)
c.line(44, 59, W - 44, 59)
c.setFillColor(muted)
c.setFont("Helvetica", 9)
c.drawString(44, 43, "CTRL.Z  /  EDITOR PORTFOLIO")
c.drawRightString(W - 44, 43, "DEMO  -  NOT A REAL CV")
c.showPage()
c.save()
print(OUT)
