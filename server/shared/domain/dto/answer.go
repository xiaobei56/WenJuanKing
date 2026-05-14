package dto

import "time"

type SubmitAnswerRequest struct {
	Answers   string `json:"answers" binding:"required"`
	TimeSpent int    `json:"timeSpent"`
}

type AnswerDTO struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"projectId"`
	UserID    string    `json:"userId"`
	Answers   string    `json:"answers"`
	Score     int       `json:"score"`
	TimeSpent int       `json:"timeSpent"`
	IP        string    `json:"ip"`
	UserAgent string    `json:"userAgent"`
	Status    int       `json:"status"`
	CreateTime time.Time `json:"createTime"`
}

type AnswerListRequest struct {
	ProjectID string `json:"projectId"`
	Status    int    `json:"status"`
	Page      int    `json:"page"`
	Size      int    `json:"size"`
}

type AnswerStatisticsResponse struct {
	Total       int64                  `json:"total"`
	Completed   int64                  `json:"completed"`
	Abandoned   int64                  `json:"abandoned"`
	AvgTimeSpent float64               `json:"avgTimeSpent"`
	ScoreDistribution map[string]int    `json:"scoreDistribution"`
}