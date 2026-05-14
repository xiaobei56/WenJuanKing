package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type ProjectHandler struct {
	service       *impl.ProjectService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewProjectHandler(service *impl.ProjectService, jwtMiddleware *middleware.JWTMiddleware) *ProjectHandler {
	return &ProjectHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req dto.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("userId")
	project, err := h.service.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func (h *ProjectHandler) List(c *gin.Context) {
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

	req := &dto.ProjectListRequest{Page: page, Size: size}
	userID := c.GetString("userId")

	projects, total, err := h.service.List(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list projects"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": projects, "total": total, "page": page, "size": size})
}

func (h *ProjectHandler) Get(c *gin.Context) {
	id := c.Param("id")
	project, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project updated"})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func (h *ProjectHandler) Publish(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Publish(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project published"})
}