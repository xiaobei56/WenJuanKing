package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	question, err := h.service.Create(projectID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create question"})
		return
	}

	c.JSON(http.StatusCreated, question)
}

func (h *QuestionHandler) List(c *gin.Context) {
	projectID := c.Param("projectId")
	questions, err := h.service.ListByProjectID(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list questions"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update question"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Question updated"})
}

func (h *QuestionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete question"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Question deleted"})
}

func (h *QuestionHandler) Sort(c *gin.Context) {
	projectID := c.Param("projectId")
	var req dto.SortQuestionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Sort(projectID, req.QuestionIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sort questions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Questions sorted"})
}