package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
)

type NotificationHandler struct {
	service       *impl.NotificationService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewNotificationHandler(service *impl.NotificationService, jwtMiddleware *middleware.JWTMiddleware) *NotificationHandler {
	return &NotificationHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID := c.GetString("userId")
	page, _ := fmt.Atoi(c.DefaultQuery("page", "1"))
	size, _ := fmt.Atoi(c.DefaultQuery("size", "20"))

	notifications, total, err := h.service.ListByUserID(userID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": notifications,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.MarkAsRead(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark as read"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetString("userId")
	if err := h.service.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all as read"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All marked as read"})
}

func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID := c.GetString("userId")
	count, err := h.service.UnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get count"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (h *NotificationHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}