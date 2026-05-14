package api

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
	"github.com/xiaobei56/WenJuanKing/server/shared/domain/dto"
)

type AnswerHandler struct {
	service       *impl.AnswerService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewAnswerHandler(service *impl.AnswerService, jwtMiddleware *middleware.JWTMiddleware) *AnswerHandler {
	return &AnswerHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *AnswerHandler) Submit(c *gin.Context) {
	projectID := c.Param("projectId")
	var req dto.SubmitAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	userID := c.GetString("userId")
	if userID == "" {
		userID = "anonymous"
	}

	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	answer, err := h.service.Submit(projectID, userID, &req, ip, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to submit answer: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, answer)
}

func (h *AnswerHandler) List(c *gin.Context) {
	projectID := c.Param("projectId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	answers, total, err := h.service.ListByProjectID(projectID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list answers: %v", err)})
		return
	}

	items := make([]*dto.AnswerDTO, 0, len(answers))
	for _, a := range answers {
		items = append(items, &dto.AnswerDTO{
			ID:        a.ID,
			ProjectID: a.ProjectID,
			UserID:    a.UserID,
			Answers:   a.Answers,
			Score:     a.Score,
			TimeSpent: a.TimeSpent,
			IP:        a.IP,
			UserAgent: a.UserAgent,
			Status:    a.Status,
			CreateTime: a.CreateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": items, "total": total, "page": page, "size": size})
}

func (h *AnswerHandler) Get(c *gin.Context) {
	id := c.Param("id")
	answer, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Answer not found"})
		return
	}
	c.JSON(http.StatusOK, answer)
}

func (h *AnswerHandler) Statistics(c *gin.Context) {
	projectID := c.Param("projectId")
	stats, err := h.service.Statistics(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get statistics: %v", err)})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *AnswerHandler) Export(c *gin.Context) {
	projectID := c.Param("projectId")
	format := c.DefaultQuery("format", "csv")

	answers, _, err := h.service.ListByProjectID(projectID, 1, 10000)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get answers: %v", err)})
		return
	}

	if format == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=answers_%s.csv", projectID))

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		writer.Write([]string{"ID", "UserID", "Score", "TimeSpent", "Status", "IP", "UserAgent", "CreateTime", "Answers"})

		for _, a := range answers {
			record := []string{
				a.ID,
				a.UserID,
				strconv.Itoa(a.Score),
				strconv.Itoa(a.TimeSpent),
				strconv.Itoa(a.Status),
				a.IP,
				a.UserAgent,
				a.CreateTime.Format("2006-01-02 15:04:05"),
				a.Answers,
			}
			writer.Write(record)
		}
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported format. Use 'csv'."})
}

func (h *AnswerHandler) UpdateScore(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Score int `json:"score" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.UpdateScore(id, req.Score); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update score: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Score updated"})
}

func (h *AnswerHandler) MyAnswers(c *gin.Context) {
	userID := c.GetString("userId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	answers, total, err := h.service.ListByUserID(userID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list answers: %v", err)})
		return
	}

	items := make([]*dto.AnswerDTO, 0, len(answers))
	for _, a := range answers {
		items = append(items, &dto.AnswerDTO{
			ID:        a.ID,
			ProjectID: a.ProjectID,
			UserID:    a.UserID,
			Answers:   a.Answers,
			Score:     a.Score,
			TimeSpent: a.TimeSpent,
			Status:    a.Status,
			CreateTime: a.CreateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": items, "total": total, "page": page, "size": size})
}

func (h *AnswerHandler) AutoScore(c *gin.Context) {
	id := c.Param("id")
	score, err := h.service.AutoScore(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to auto score: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Auto scoring completed", "score": score})
}