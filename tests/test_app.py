import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_for_activity_success():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    client.delete(f"/activities/{activity}/participants/{email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Clean up
    client.delete(f"/activities/{activity}/participants/{email}")

def test_signup_duplicate():
    email = "testuser2@mergington.edu"
    activity = "Chess Club"
    client.delete(f"/activities/{activity}/participants/{email}")
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]
    # Clean up
    client.delete(f"/activities/{activity}/participants/{email}")

def test_remove_participant():
    email = "testuser3@mergington.edu"
    activity = "Chess Club"
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 204
    # Try removing again, should 404
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]
