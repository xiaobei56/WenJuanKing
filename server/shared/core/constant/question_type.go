package constant

type QuestionType int

const (
	QuestionTypeRadio QuestionType = iota + 1
	QuestionTypeCheckbox
	QuestionTypeInput
	QuestionTypeTextarea
	QuestionTypeSelect
	QuestionTypeMultiSelect
	QuestionTypeCascader
	QuestionTypeDate
	QuestionTypeDateRange
	QuestionTypeDateTime
	QuestionTypeDateTimeRange
	QuestionTypeTime
	QuestionTypeTimeRange
	QuestionTypeSlider
	QuestionTypeRate
	QuestionTypeSwitch
	QuestionTypeUpload
	QuestionTypeUploader
	QuestionTypeButton
	QuestionTypeImage
	QuestionTypeVideo
	QuestionTypeAudio
	QuestionTypeLocation
	QuestionTypePhone
	QuestionTypeEmail
	QuestionTypeNumber
	QuestionTypeCurrency
	QuestionTypeURL
	QuestionTypeColor
	QuestionTypeGrade
	QuestionTypeSignature
	QuestionTypeAnnouncement
	QuestionTypeDivider
	QuestionTypePageBreak
)

func (qt QuestionType) String() string {
	switch qt {
	case QuestionTypeRadio:
		return "radio"
	case QuestionTypeCheckbox:
		return "checkbox"
	case QuestionTypeInput:
		return "input"
	case QuestionTypeTextarea:
		return "textarea"
	case QuestionTypeSelect:
		return "select"
	case QuestionTypeMultiSelect:
		return "multiSelect"
	case QuestionTypeCascader:
		return "cascader"
	case QuestionTypeDate:
		return "date"
	case QuestionTypeDateRange:
		return "dateRange"
	case QuestionTypeDateTime:
		return "dateTime"
	case QuestionTypeDateTimeRange:
		return "dateTimeRange"
	case QuestionTypeTime:
		return "time"
	case QuestionTypeTimeRange:
		return "timeRange"
	case QuestionTypeSlider:
		return "slider"
	case QuestionTypeRate:
		return "rate"
	case QuestionTypeSwitch:
		return "switch"
	case QuestionTypeUpload:
		return "upload"
	case QuestionTypeUploader:
		return "uploader"
	case QuestionTypeButton:
		return "button"
	case QuestionTypeImage:
		return "image"
	case QuestionTypeVideo:
		return "video"
	case QuestionTypeAudio:
		return "audio"
	case QuestionTypeLocation:
		return "location"
	case QuestionTypePhone:
		return "phone"
	case QuestionTypeEmail:
		return "email"
	case QuestionTypeNumber:
		return "number"
	case QuestionTypeCurrency:
		return "currency"
	case QuestionTypeURL:
		return "url"
	case QuestionTypeColor:
		return "color"
	case QuestionTypeGrade:
		return "grade"
	case QuestionTypeSignature:
		return "signature"
	case QuestionTypeAnnouncement:
		return "announcement"
	case QuestionTypeDivider:
		return "divider"
	case QuestionTypePageBreak:
		return "pageBreak"
	default:
		return "unknown"
	}
}