package model

import (
	"time"
)

type User struct {
	ID            string    `json:"id" db:"id"`
	Username      string    `json:"username" db:"username"`
	Password      string    `json:"-" db:"password"`
	Nickname      string    `json:"nickname" db:"nickname"`
	Email         string    `json:"email" db:"email"`
	Phone         string    `json:"phone" db:"phone"`
	Avatar        string    `json:"avatar" db:"avatar"`
	Status        int       `json:"status" db:"status"`
	CreateTime    time.Time `json:"createTime" db:"create_time"`
	UpdateTime    time.Time `json:"updateTime" db:"update_time"`
	LastLoginTime time.Time `json:"lastLoginTime" db:"last_login_time"`
}

type Project struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Type        int       `json:"type" db:"type"`
	Status      int       `json:"status" db:"status"`
	UserID      string    `json:"userId" db:"user_id"`
	Settings    string    `json:"settings" db:"settings"`
	Questions   string    `json:"questions" db:"questions"`
	PublishTime time.Time `json:"publishTime" db:"publish_time"`
	CreateTime  time.Time `json:"createTime" db:"create_time"`
	UpdateTime  time.Time `json:"updateTime" db:"update_time"`
}

type Question struct {
	ID         string    `json:"id" db:"id"`
	ProjectID  string    `json:"projectId" db:"project_id"`
	Title      string    `json:"title" db:"title"`
	Type       int       `json:"type" db:"type"`
	Required   bool      `json:"required" db:"required"`
	Options    string    `json:"options" db:"options"`
	Validation string    `json:"validation" db:"validation"`
	Logic      string    `json:"logic" db:"logic"`
	Settings   string    `json:"settings" db:"settings"`
	OrderNum   int       `json:"orderNum" db:"order_num"`
	CreateTime time.Time `json:"createTime" db:"create_time"`
	UpdateTime time.Time `json:"updateTime" db:"update_time"`
}

type Answer struct {
	ID        string    `json:"id" db:"id"`
	ProjectID string    `json:"projectId" db:"project_id"`
	UserID    string    `json:"userId" db:"user_id"`
	Answers   string    `json:"answers" db:"answers"`
	Score     int       `json:"score" db:"score"`
	TimeSpent int       `json:"timeSpent" db:"time_spent"`
	IP        string    `json:"ip" db:"ip"`
	UserAgent string    `json:"userAgent" db:"user_agent"`
	Status    int       `json:"status" db:"status"`
	CreateTime time.Time `json:"createTime" db:"create_time"`
}

type Repo struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Type        int       `json:"type" db:"type"`
	UserID      string    `json:"userId" db:"user_id"`
	Content     string    `json:"content" db:"content"`
	IsPublic    bool      `json:"isPublic" db:"is_public"`
	CreateTime  time.Time `json:"createTime" db:"create_time"`
	UpdateTime  time.Time `json:"updateTime" db:"update_time"`
}