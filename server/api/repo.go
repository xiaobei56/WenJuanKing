package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
)

type RepoHandler struct {
	service       *impl.RepoService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewRepoHandler(service *impl.RepoService, jwtMiddleware *middleware.JWTMiddleware) *RepoHandler {
	return &RepoHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *RepoHandler) Create(c *gin.Context) {
	var req impl.CreateRepoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	userID := c.GetString("userId")
	repo, err := h.service.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create repo: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, repo)
}

func (h *RepoHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	userID := c.GetString("userId")
	repos, total, err := h.service.List(userID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list repos: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": repos, "total": total, "page": page, "size": size})
}

func (h *RepoHandler) ListPublic(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	repos, total, err := h.service.ListPublic(page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list repos: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": repos, "total": total, "page": page, "size": size})
}

func (h *RepoHandler) Get(c *gin.Context) {
	id := c.Param("id")
	repo, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repo not found"})
		return
	}
	c.JSON(http.StatusOK, repo)
}

func (h *RepoHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete repo: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Repo deleted"})
}

func (h *RepoHandler) Import(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Import(id, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to import: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Content imported"})
}

func (h *RepoHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req impl.CreateRepoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update repo: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Repo updated"})
}