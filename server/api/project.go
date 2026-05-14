package api

import (
	"fmt"
	"net/http"
	"strconv"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	userID := c.GetString("userId")
	project, err := h.service.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create project: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func (h *ProjectHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	req := &dto.ProjectListRequest{Page: page, Size: size}
	userID := c.GetString("userId")

	projects, total, err := h.service.List(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list projects: %v", err)})
		return
	}

	items := make([]*dto.ProjectDTO, 0, len(projects))
	for _, p := range projects {
		items = append(items, &dto.ProjectDTO{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Type:        p.Type,
			Status:      p.Status,
			UserID:      p.UserID,
			Settings:    p.Settings,
			Questions:   p.Questions,
			PublishTime: p.PublishTime,
			CreateTime:  p.CreateTime,
			UpdateTime:  p.UpdateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": items, "total": total, "page": page, "size": size})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update project: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project updated"})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete project: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func (h *ProjectHandler) Publish(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Publish(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to publish project: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project published"})
}

func (h *ProjectHandler) Unpublish(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Unpublish(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to unpublish project: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project unpublished"})
}

func (h *ProjectHandler) UpdateQuestions(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Questions string `json:"questions" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.UpdateQuestions(id, req.Questions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update questions: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Questions updated"})
}