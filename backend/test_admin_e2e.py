import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_admin_flow():
    # Cleanup any leftover test philosophers from previous runs
    all_phils = client.get("/api/philosophers").json()
    for p in all_phils:
        if p["name"] == "Epicurus":
            client.delete(f"/api/admin/philosophers/{p['id']}")

    print("--- 1. Testing Admin Authentication ---")
    # Test wrong password
    bad_res = client.post("/api/admin/login", json={"email": "admin@philosophy.world", "password": "wrong"})
    assert bad_res.status_code == 401, f"Expected 401, got {bad_res.status_code}"
    print("[OK] Wrong password rejected (401)")

    # Test right password with email
    good_res = client.post("/api/admin/login", json={"email": "admin@philosophy.world", "password": "admin123"})
    assert good_res.status_code == 200, f"Expected 200, got {good_res.status_code}"
    auth_data = good_res.json()
    assert auth_data["success"] is True
    print(f"[OK] Login successful: email={auth_data['email']}, token={auth_data['token']}")

    # Test right password with username 'admin'
    user_res = client.post("/api/admin/login", json={"email": "admin", "password": "admin123"})
    assert user_res.status_code == 200
    print("[OK] Username 'admin' login accepted (200)")

    print("\n--- 2. Testing Philosopher CRUD ---")
    # Add new philosopher: Epicurus
    create_res = client.post("/api/admin/philosophers", json={
        "name": "Epicurus",
        "school": "Epicureanism",
        "years": "341 BC - 270 BC",
        "description": "Founder of Epicureanism, advocating modest pleasures and tranquil mind.",
        "image": "marcus.png",
        "position_x": 650,
        "position_y": 420
    })
    assert create_res.status_code == 201, f"Failed to create: {create_res.text}"
    phil_data = create_res.json()
    phil_id = phil_data["id"]
    print(f"[OK] Created philosopher: {phil_data['name']} (ID: {phil_id})")

    # Update philosopher
    update_res = client.put(f"/api/admin/philosophers/{phil_id}", json={
        "description": "Updated description: Pleasures of the mind and absence of bodily pain.",
        "position_x": 670
    })
    assert update_res.status_code == 200, f"Failed to update: {update_res.text}"
    updated_phil = update_res.json()
    assert "absence of bodily pain" in updated_phil["description"]
    assert updated_phil["position_x"] == 670
    print(f"[OK] Updated philosopher ID {phil_id}: description & position verified")

    print("\n--- 3. Testing Wisdom CRUD ---")
    # Add wisdom quote
    wisdom_res = client.post(f"/api/admin/philosophers/{phil_id}/wisdom", json={
        "quote": "Do not spoil what you have by desiring what you have not.",
        "explanation": "Remember that what you now have was once among the things you only hoped for.",
        "source": "Principal Doctrines"
    })
    assert wisdom_res.status_code == 201, f"Failed to create wisdom: {wisdom_res.text}"
    w_data = wisdom_res.json()
    w_id = w_data["id"]
    print(f"[OK] Created wisdom quote ID {w_id}: \"{w_data['quote']}\"")

    # Update wisdom quote
    update_w_res = client.put(f"/api/admin/wisdom/{w_id}", json={
        "quote": "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
        "source": "Vatican Sayings"
    })
    assert update_w_res.status_code == 200, f"Failed to update wisdom: {update_w_res.text}"
    updated_w = update_w_res.json()
    assert updated_w["source"] == "Vatican Sayings"
    print(f"[OK] Updated wisdom quote ID {w_id}")

    # Fetch wisdom via public game API
    pub_res = client.get(f"/api/philosophers/{phil_id}/wisdom")
    assert pub_res.status_code == 200, f"Expected 200, got {pub_res.status_code}: {pub_res.text}"
    pub_wisdom = pub_res.json()
    assert pub_wisdom["id"] == w_id
    print("[OK] Public game API retrieved newly added wisdom quote")

    print("\n--- 4. Testing Custom Face Upload & Reset ---")
    import base64
    import io
    from PIL import Image
    test_img = Image.new("RGBA", (100, 100), (60, 120, 240, 255))
    buf = io.BytesIO()
    test_img.save(buf, format="PNG")
    b64_data = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

    face_upload_res = client.post(f"/api/admin/philosophers/{phil_id}/face", json={"image_data": b64_data})
    assert face_upload_res.status_code == 200, f"Face upload failed: {face_upload_res.text}"
    face_data = face_upload_res.json()
    assert face_data["face_image"] is not None
    assert "/assets/custom_faces/face_" in face_data["face_image"]
    print(f"[OK] Uploaded custom face for philosopher ID {phil_id}: {face_data['face_image']}")

    # Reset face back to default
    face_reset_res = client.delete(f"/api/admin/philosophers/{phil_id}/face")
    assert face_reset_res.status_code == 200
    reset_data = face_reset_res.json()
    assert reset_data["face_image"] is None
    print(f"[OK] Reset philosopher ID {phil_id} face to default (None)")

    print("\n--- 5. Testing Wisdom & Philosopher Deletion ---")
    # Delete wisdom
    del_w_res = client.delete(f"/api/admin/wisdom/{w_id}")
    assert del_w_res.status_code == 200
    print(f"[OK] Deleted wisdom ID {w_id}")

    # Delete philosopher
    del_phil_res = client.delete(f"/api/admin/philosophers/{phil_id}")
    assert del_phil_res.status_code == 200
    print(f"[OK] Deleted philosopher ID {phil_id}")

    # Confirm philosopher is gone
    check_res = client.get(f"/api/philosophers/{phil_id}")
    assert check_res.status_code == 404
    print("[OK] Confirmed philosopher no longer exists in database (404)")

    print("\n==========================================")
    print("ALL ADMIN PANEL E2E BACKEND TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    test_admin_flow()
