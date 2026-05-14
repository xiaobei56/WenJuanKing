package constant

type ProjectType int

const (
	ProjectTypeSurvey ProjectType = iota + 1
	ProjectTypeExam
	ProjectTypeVote
	ProjectTypeQuestionnaire
	ProjectTypeAssessment
	ProjectTypeFeedback
	ProjectTypePoll
)

func (pt ProjectType) String() string {
	switch pt {
	case ProjectTypeSurvey:
		return "survey"
	case ProjectTypeExam:
		return "exam"
	case ProjectTypeVote:
		return "vote"
	case ProjectTypeQuestionnaire:
		return "questionnaire"
	case ProjectTypeAssessment:
		return "assessment"
	case ProjectTypeFeedback:
		return "feedback"
	case ProjectTypePoll:
		return "poll"
	default:
		return "unknown"
	}
}