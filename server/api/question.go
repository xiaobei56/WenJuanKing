package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
	"github.com/xiaobei56/WenJuanKing/server/shared/domain/dto"
)

type QuestionHandler struct {
	service       *impl.QuestionService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewQuestionHandler(service *impl.QuestionService, jwtMiddleware *middleware.JWTMiddleware) *QuestionHandler {
	return &QuestionHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *QuestionHandler) Create(c *gin.Context) {
	projectID := c.Param("projectId")
	var req dto.CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	maxOrder, err := h.service.GetMaxOrderNum(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order"})
		return
	}
	req.OrderNum = maxOrder + 1

	question, err := h.service.Create(projectID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create question: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, question)
}

func (h *QuestionHandler) List(c *gin.Context) {
	projectID := c.Param("projectId")
	questions, err := h.service.ListByProjectID(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list questions: %v", err)})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func (h *QuestionHandler) Get(c *gin.Context) {
	id := c.Param("id")
	question, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}
	c.JSON(http.StatusOK, question)
}

func (h *QuestionHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update question: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Question updated"})
}

func (h *QuestionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete question: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Question deleted"})
}

func (h *QuestionHandler) Sort(c *gin.Context) {
	projectID := c.Param("projectId")
	var req dto.SortQuestionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Sort(projectID, req.QuestionIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to sort questions: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Questions sorted"})
}

func (h *QuestionHandler) BatchCreate(c *gin.Context) {
	projectID := c.Param("projectId")
	var req struct {
		Questions []dto.CreateQuestionRequest `json:"questions" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	maxOrder, err := h.service.GetMaxOrderNum(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order"})
		return
	}

	created := make([]*struct{}, 0)
	for i, q := range req.Questions {
		q.OrderNum = maxOrder + i + 1
		question, err := h.service.Create(projectID, &q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create question: %v", err)})
			return
		}
		created = append(created, question)
	}

	c.JSON(http.StatusCreated, gin.H{"items": created})
}

func (h *QuestionHandler) Count(c *gin.Context) {
	projectID := c.Param("projectId")
	count, err := h.service.CountByProjectID(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to count questions: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}