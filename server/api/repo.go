package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userId")
	repo, err := h.service.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repo"})
		return
	}

	c.JSON(http.StatusCreated, repo)
}

func (h *RepoHandler) List(c *gin.Context) {
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

	userID := c.GetString("userId")
	repos, total, err := h.service.List(userID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list repos"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete repo"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Import(id, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to import"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Content imported"})
}