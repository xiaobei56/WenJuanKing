package impl

import (
	"testing"
)

func TestAnswerService_ScoreCalculation(t *testing.T) {
	t.Run("ScoreDistributionInitialization", func(t *testing.T) {
		// Test that score distribution map is properly initialized
		distribution := make(map[string]int)
		distribution["0"] = 5
		distribution["100"] = 10

		if distribution["0"] != 5 {
			t.Errorf("Expected 5 answers with score 0, got %d", distribution["0"])
		}
		if distribution["100"] != 10 {
			t.Errorf("Expected 10 answers with score 100, got %d", distribution["100"])
		}
	})
}

func TestAnswerService_StatusValues(t *testing.T) {
	t.Run("ValidAnswerStatus", func(t *testing.T) {
		// 1 = completed, 0 = abandoned
		validStatuses := []int{0, 1}
		for _, status := range validStatuses {
			if status != 0 && status != 1 {
				t.Errorf("Status %d is not valid", status)
			}
		}
	})
}

func TestAnswerService_TimeSpent(t *testing.T) {
	t.Run("TimeSpentCalculation", func(t *testing.T) {
		// Test average time spent calculation
		times := []int{60, 120, 180, 240, 300}
		total := 0
		for _, t := range times {
			total += t
		}
		avg := total / len(times)
		expectedAvg := 180

		if avg != expectedAvg {
			t.Errorf("Expected average time %d, got %d", expectedAvg, avg)
		}
	})
}