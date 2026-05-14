package dto

import "time"

type CreateProjectRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Type        int    `json:"type" binding:"required"`
	Settings    string `json:"settings"`
}

type UpdateProjectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Settings    string `json:"settings"`
}

type ProjectDTO struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Type        int       `json:"type"`
	Status      int       `json:"status"`
	UserID      string    `json:"userId"`
	Settings    string    `json:"settings"`
	Questions   string    `json:"questions"`
	PublishTime time.Time `json:"publishTime"`
	CreateTime  time.Time `json:"createTime"`
	UpdateTime  time.Time `json:"updateTime"`
}

type ProjectListRequest struct {
	Type   int    `json:"type"`
	Status int    `json:"status"`
	Page   int    `json:"page"`
	Size   int    `json:"size"`
}

type ProjectListResponse struct {
	Items  []ProjectDTO `json:"items"`
	Total  int64        `json:"total"`
	Page   int          `json:"page"`
	Size   int          `json:"size"`
}