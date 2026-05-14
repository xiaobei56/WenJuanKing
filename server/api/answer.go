package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userId")
	if userID == "" {
		userID = c.ClientIP()
	}

	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	answer, err := h.service.Submit(projectID, userID, &req, ip, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit answer"})
		return
	}

	c.JSON(http.StatusCreated, answer)
}

func (h *AnswerHandler) List(c *gin.Context) {
	projectID := c.Param("projectId")
	page := 1
	size := 20
	if p := c.Query("page"); p != "" {
		if _, err := fmt.Sscanf(p, "%d", &page); err != nil {
			page = 1
		}
	}
	if s := c.Query("size"); s != "" {
		if _, err := fmt.Sscanf(s, "%d", &size); err != nil {
			size = 20
		}
	}

	answers, total, err := h.service.ListByProjectID(projectID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list answers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": answers, "total": total, "page": page, "size": size})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get statistics"})
		return
	}
	c.JSON(http.StatusOK, stats)
}