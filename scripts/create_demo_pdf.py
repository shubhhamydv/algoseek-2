from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


output = Path(__file__).resolve().parents[1] / "data" / "demo" / "dynamic-programming-study-guide.pdf"
output.parent.mkdir(parents=True, exist_ok=True)
pdf = canvas.Canvas(str(output), pagesize=letter)

pdf.setFont("Helvetica-Bold", 18)
pdf.drawString(72, 740, "Dynamic Programming Study Guide")
pdf.setFont("Helvetica", 11)
pdf.drawString(72, 710, "Memoization stores results for states reached by recursion.")
pdf.drawString(72, 690, "It avoids recomputing overlapping subproblems.")
pdf.drawString(72, 670, "For Fibonacci: dp[n] = dp[n - 1] + dp[n - 2].")
pdf.showPage()

pdf.setFont("Helvetica-Bold", 18)
pdf.drawString(72, 740, "Tabulation")
pdf.setFont("Helvetica", 11)
pdf.drawString(72, 710, "Tabulation fills states bottom-up from known base cases.")
pdf.drawString(72, 690, "It can reduce Fibonacci space to O(1) by retaining two values.")
pdf.save()
print(output)
