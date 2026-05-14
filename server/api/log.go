package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
)

type LogHandler struct {
	service       *impl.LogService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewLogHandler(service *impl.LogService, jwtMiddleware *middleware.JWTMiddleware) *LogHandler {
	return &LogHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *LogHandler) List(c *gin.Context) {
	// List system logs
	c.JSON(http.StatusOK, gin.H{
		"items": []gin.H{},
		"total": 0,
	})
}

func (h *LogHandler) Create(c *gin.Context) {
	var req struct {
		Action    string `json:"action"`
		TargetType string `json:"targetType"`
		TargetID  string `json:"targetId"`
		Details   string `json:"details"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userId")
	ip := c.ClientIP()

	if err := h.service.CreateLog(userID, req.Action, req.TargetType, req.TargetID, req.Details, ip); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create log"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Log created"})
}