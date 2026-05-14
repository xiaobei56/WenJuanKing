package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	if hash == "" {
		t.Error("Hash should not be empty")
	}
	if hash == password {
		t.Error("Hash should not equal plain password")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "testpassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if !CheckPassword(password, hash) {
		t.Error("CheckPassword should return true for correct password")
	}

	if CheckPassword("wrongpassword", hash) {
		t.Error("CheckPassword should return false for wrong password")
	}
}

func TestGenerateUUID(t *testing.T) {
	uuid1 := GenerateUUID()
	uuid2 := GenerateUUID()

	if uuid1 == "" {
		t.Error("UUID should not be empty")
	}
	if uuid1 == uuid2 {
		t.Error("Two generated UUIDs should be different")
	}
	if len(uuid1) != 32 {
		t.Errorf("UUID length should be 32, got %d", len(uuid1))
	}
}

func TestGenerateToken(t *testing.T) {
	userID := "test-user-123"
	username := "testuser"
	secret := "test-secret"
	expireHour := 72

	token, expiresAt, err := GenerateToken(userID, username, secret, expireHour)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if token == "" {
		t.Error("Token should not be empty")
	}
	if expiresAt.IsZero() {
		t.Error("ExpiresAt should not be zero")
	}
}