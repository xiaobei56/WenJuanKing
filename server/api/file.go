package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
)

type FileHandler struct {
	service       *impl.FileService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewFileHandler(service *impl.FileService, jwtMiddleware *middleware.JWTMiddleware) *FileHandler {
	return &FileHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *FileHandler) Upload(c *gin.Context) {
	userID := c.GetString("userId")
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to upload file: %v", err)})
		return
	}

	ext := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filePath := filepath.Join(uploadDir, newFilename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	mimeType := ""
	switch ext {
	case ".jpg", ".jpeg": mimeType = "image/jpeg"
	case ".png": mimeType = "image/png"
	case ".gif": mimeType = "image/gif"
	case ".pdf": mimeType = "application/pdf"
	}

	url := fmt.Sprintf("/uploads/%s", newFilename)
	f, err := h.service.Create(file.Filename, url, file.Size, mimeType, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       f.ID,
		"url":      url,
		"filename": file.Filename,
		"size":     file.Size,
	})
}

func (h *FileHandler) List(c *gin.Context) {
	userID := c.GetString("userId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	files, total, err := h.service.ListByUserID(userID, page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list files: %v", err)})
		return
	}

	items := make([]gin.H, 0, len(files))
	for _, f := range files {
		items = append(items, gin.H{
			"id":       f.ID,
			"name":     f.Name,
			"size":     f.Size,
			"url":      f.Path,
			"mimeType": f.MimeType,
			"ctime":    f.CreateTime.Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"total": total,
	})
}

func (h *FileHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete file: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "File deleted"})
}

func (h *FileHandler) Download(c *gin.Context) {
	filename := c.Param("filename")

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	filePath := filepath.Join(uploadDir, filename)

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.File(filePath)
}

func (h *FileHandler) GetImage(c *gin.Context) {
	filename := c.Param("filename")

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	filePath := filepath.Join(uploadDir, filename)

	file, err := os.Open(filePath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}
	defer file.Close()

	ext := filepath.Ext(filename)
	contentType := "application/octet-stream"
	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".pdf":
		contentType = "application/pdf"
	}

	c.Header("Content-Type", contentType)
	io.Copy(c.Writer, file)
}