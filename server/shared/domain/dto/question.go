package dto

import "time"

type CreateQuestionRequest struct {
	Title      string `json:"title" binding:"required"`
	Type       int    `json:"type" binding:"required"`
	Required   bool   `json:"required"`
	Options    string `json:"options"`
	Validation string `json:"validation"`
	Logic      string `json:"logic"`
	Settings   string `json:"settings"`
	OrderNum   int    `json:"orderNum"`
}

type UpdateQuestionRequest struct {
	Title      string `json:"title"`
	Type       int    `json:"type"`
	Required   bool   `json:"required"`
	Options    string `json:"options"`
	Validation string `json:"validation"`
	Logic      string `json:"logic"`
	Settings   string `json:"settings"`
}

type QuestionDTO struct {
	ID         string    `json:"id"`
	ProjectID  string    `json:"projectId"`
	Title      string    `json:"title"`
	Type       int       `json:"type"`
	Required   bool      `json:"required"`
	Options    string    `json:"options"`
	Validation string    `json:"validation"`
	Logic      string    `json:"logic"`
	Settings   string    `json:"settings"`
	OrderNum   int       `json:"orderNum"`
	CreateTime time.Time `json:"createTime"`
	UpdateTime time.Time `json:"updateTime"`
}

type SortQuestionsRequest struct {
	QuestionIDs []string `json:"questionIds" binding:"required"`
}