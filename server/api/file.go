package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FileHandler struct{}

func NewFileHandler() *FileHandler {
	return &FileHandler{}
}

func (h *FileHandler) Upload(c *gin.Context) {
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

	url := fmt.Sprintf("/uploads/%s", newFilename)
	c.JSON(http.StatusOK, gin.H{
		"url":      url,
		"filename": file.Filename,
		"size":     file.Size,
	})
}

func (h *FileHandler) List(c *gin.Context) {
	_ = c.GetString("userId")

	var files []gin.H
	// Simulated file list
	files = append(files, gin.H{
		"id":    "1",
		"name":  "document.pdf",
		"size":  1024000,
		"url":   "/uploads/document.pdf",
		"ctime": time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
	})

	c.JSON(http.StatusOK, gin.H{
		"items": files,
		"total": len(files),
	})
}

func (h *FileHandler) Delete(c *gin.Context) {
	_ = c.Param("id")
	// Simulated delete
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