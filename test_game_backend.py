import unittest
import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000"

class TestPhilosophyWorldBackend(unittest.TestCase):
    def get_json(self, endpoint):
        req = urllib.request.Request(f"{BASE_URL}{endpoint}")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            return json.loads(resp.read().decode('utf-8'))

    def test_health_check(self):
        data = self.get_json("/api/health")
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"], "connected")
        self.assertGreaterEqual(data["philosophers_count"], 4)
        self.assertGreaterEqual(data["wisdom_count"], 40)
        print("Health Check: PASSED", data)

    def test_get_all_philosophers(self):
        philosophers = self.get_json("/api/philosophers")
        self.assertGreaterEqual(len(philosophers), 4)
        names = [p["name"] for p in philosophers]
        self.assertIn("Socrates", names)
        self.assertIn("Plato", names)
        self.assertIn("Aristotle", names)
        self.assertIn("Marcus Aurelius", names)
        for p in philosophers:
            self.assertTrue(p["position_x"] > 0)
            self.assertTrue(p["position_y"] > 0)
            self.assertTrue(len(p["school"]) > 0)
            self.assertTrue(len(p["description"]) > 0)
        print(f"Philosophers List: PASSED ({len(philosophers)} philosophers found)")

    def test_get_philosopher_detail(self):
        socrates = self.get_json("/api/philosophers/1")
        self.assertEqual(socrates["name"], "Socrates")
        self.assertIn("wisdom_entries", socrates)
        self.assertGreaterEqual(len(socrates["wisdom_entries"]), 10)
        print(f"Philosopher Detail: PASSED (Socrates has {len(socrates['wisdom_entries'])} wisdom items)")

    def test_random_wisdom_retrieval(self):
        for p_id in [1, 2, 3, 4]:
            wisdom = self.get_json(f"/api/philosophers/{p_id}/wisdom")
            self.assertEqual(wisdom["philosopher_id"], p_id)
            self.assertTrue(len(wisdom["quote"]) > 0)
            self.assertTrue(len(wisdom["explanation"]) > 0)
            self.assertTrue(len(wisdom["source"]) > 0)
        print("Random Wisdom Retrieval: PASSED across all 4 philosophers")

    def test_wisdom_exclusion_prevents_repeat(self):
        # Fetch initial wisdom
        w1 = self.get_json("/api/philosophers/1/wisdom")
        # Fetch with exclude_id
        w2 = self.get_json(f"/api/philosophers/1/wisdom?exclude_id={w1['id']}")
        self.assertNotEqual(w1["id"], w2["id"])
        print(f"Wisdom Exclusion: PASSED (Quote 1 ID: {w1['id']} != Quote 2 ID: {w2['id']})")

    def test_invalid_philosopher_id_handling(self):
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/philosophers/999/wisdom")
            with urllib.request.urlopen(req) as resp:
                self.fail("Should have returned 404")
        except urllib.error.HTTPError as err:
            self.assertEqual(err.code, 404)
        print("Invalid ID 404 Error Handling: PASSED")

    def test_all_wisdom_entries(self):
        all_wisdom = self.get_json("/api/wisdom/all")
        self.assertGreaterEqual(len(all_wisdom), 40)
        print(f"All Wisdom Feed: PASSED ({len(all_wisdom)} total entries in SQLite)")

if __name__ == "__main__":
    unittest.main()
