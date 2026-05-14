package constant

import (
	"testing"
)

func TestQuestionTypeString(t *testing.T) {
	tests := []struct {
		qt    QuestionType
		expected string
	}{
		{QuestionTypeRadio, "radio"},
		{QuestionTypeCheckbox, "checkbox"},
		{QuestionTypeInput, "input"},
		{QuestionTypeTextarea, "textarea"},
		{QuestionTypeSelect, "select"},
		{QuestionTypeMultiSelect, "multiSelect"},
		{QuestionTypeDate, "date"},
		{QuestionTypeSlider, "slider"},
		{QuestionTypeRate, "rate"},
		{QuestionType(99), "unknown"},
	}

	for _, tt := range tests {
		result := tt.qt.String()
		if result != tt.expected {
			t.Errorf("QuestionType(%d).String() = %s, want %s", tt.qt, result, tt.expected)
		}
	}
}

func TestProjectTypeString(t *testing.T) {
	tests := []struct {
		pt      ProjectType
		expected string
	}{
		{ProjectTypeSurvey, "survey"},
		{ProjectTypeExam, "exam"},
		{ProjectTypeVote, "vote"},
		{ProjectType(99), "unknown"},
	}

	for _, tt := range tests {
		result := tt.pt.String()
		if result != tt.expected {
			t.Errorf("ProjectType(%d).String() = %s, want %s", tt.pt, result, tt.expected)
		}
	}
}

func TestQuestionTypeCount(t *testing.T) {
	count := int(QuestionTypePageBreak)
	if count < 31 {
		t.Errorf("Expected at least 31 question types, got %d", count)
	}
}

func TestProjectTypeCount(t *testing.T) {
	count := int(ProjectTypePoll)
	if count < 7 {
		t.Errorf("Expected at least 7 project types, got %d", count)
	}
}