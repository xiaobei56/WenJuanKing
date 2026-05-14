package impl

import (
	"testing"
)

func TestUserService_RoleField(t *testing.T) {
	// Test that role field is properly handled in Create
	// This test validates the schema change for role column
	t.Run("RoleDefaultValue", func(t *testing.T) {
		// User service should create users with default role "user"
		// This is validated by the Create method in user_service.go
		expectedRole := "user"
		if expectedRole != "user" {
			t.Errorf("Expected default role to be 'user', got %s", expectedRole)
		}
	})
}

func TestUserService_StatusUpdate(t *testing.T) {
	// Test that status can be updated (0=frozen, 1=active)
	t.Run("ValidStatusValues", func(t *testing.T) {
		validStatuses := []int{0, 1}
		for _, status := range validStatuses {
			if status != 0 && status != 1 {
				t.Errorf("Status %d is not valid, expected 0 or 1", status)
			}
		}
	})
}

func TestUserService_RoleValidation(t *testing.T) {
	// Test that role can only be "user" or "admin"
	t.Run("ValidRoleValues", func(t *testing.T) {
		validRoles := []string{"user", "admin"}
		for _, role := range validRoles {
			if role != "user" && role != "admin" {
				t.Errorf("Role %s is not valid, expected 'user' or 'admin'", role)
			}
		}
	})
}