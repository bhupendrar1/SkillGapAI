import sys
import json

# Ensure UTF-8 output where supported
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    
    # Test 1: Health check
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    print("[PASS] Health check passed:", resp.json())
    
    # Test 2: Analyze endpoint with sample PDF
    with open("data/sample_resume.pdf", "rb") as f:
        pdf_bytes = f.read()
    with open("data/sample_job_description.txt", "r", encoding="utf-8") as f:
        jd_text = f.read()
        
    resp2 = client.post(
        "/api/analyze",
        files={"resume_file": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": jd_text, "target_role": "Software Developer"}
    )
    assert resp2.status_code == 200, f"Analyze failed: {resp2.text}"
    data = resp2.json()
    print("[PASS] Analyze endpoint passed! Status:", resp2.status_code)
    print("Overall Match:", data["overall_match"], "%")
    print("Formula:", data["formula_explanation"])
    print("Matched Skills:", data["matched_skills"])
    print("Partial Skills:", data["partial_skills"])
    print("Missing Skills:", data["missing_skills"])
    print("Skill Analysis Table count:", len(data["skill_analysis"]))
    print("Recommendations count:", len(data["recommendations"]))
    if data["recommendations"]:
        print("Sample Recommendation:", json.dumps(data["recommendations"][0], indent=2))

if __name__ == "__main__":
    run_tests()
