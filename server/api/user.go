package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/config"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type UserHandler struct {
	service       *impl.UserService
	jwtMiddleware *middleware.JWTMiddleware
}

func NewUserHandler(service *impl.UserService, jwtMiddleware *middleware.JWTMiddleware) *UserHandler {
	return &UserHandler{service: service, jwtMiddleware: jwtMiddleware}
}

func (h *UserHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	exists, err := h.service.CheckUsernameExists(req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	if req.Email != "" {
		exists, err := h.service.CheckEmailExists(req.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check email"})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
	}

	if req.Nickname == "" {
		req.Nickname = req.Username
	}

	user, err := h.service.Create(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"nickname": user.Nickname,
		"email":    user.Email,
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	user, err := h.service.GetByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	cfg := config.Get()
	token, expiresAt, err := utils.GenerateToken(user.ID, user.Username, cfg.JWT.Secret, cfg.JWT.ExpireHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	h.service.UpdateLastLogin(user.ID)

	c.JSON(http.StatusOK, dto.LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User: dto.UserDTO{
			ID:            user.ID,
			Username:      user.Username,
			Nickname:      user.Nickname,
			Email:         user.Email,
			Phone:         user.Phone,
			Avatar:        user.Avatar,
			Status:        user.Status,
			CreateTime:    user.CreateTime,
			LastLoginTime: user.LastLoginTime,
		},
	})
}

func (h *UserHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	users, total, err := h.service.List(page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list users: %v", err)})
		return
	}

	items := make([]dto.UserDTO, 0, len(users))
	for _, u := range users {
		items = append(items, dto.UserDTO{
			ID:         u.ID,
			Username:   u.Username,
			Nickname:   u.Nickname,
			Email:      u.Email,
			Phone:      u.Phone,
			Avatar:     u.Avatar,
			Status:     u.Status,
			CreateTime: u.CreateTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": items, "total": total, "page": page, "size": size})
}

func (h *UserHandler) Get(c *gin.Context) {
	id := c.Param("id")
	user, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	if err := h.service.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update user: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
}

func (h *UserHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete user: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.GetString("userId")
	user, err := h.service.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}