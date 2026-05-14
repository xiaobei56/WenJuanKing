package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
)

type SystemHandler struct {
	jwtMiddleware *middleware.JWTMiddleware
}

func NewSystemHandler(jwtMiddleware *middleware.JWTMiddleware) *SystemHandler {
	return &SystemHandler{jwtMiddleware: jwtMiddleware}
}

func (h *SystemHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"time":    "2025-05-15T00:00:00Z",
	})
}

func (h *SystemHandler) Info(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name":    "SurveyKing v2",
		"version": "0.1.0",
		"author":  "SurveyKing Team",
	})
}

func (h *SystemHandler) Stats(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	c.JSON(http.StatusOK, gin.H{
		"users":    0,
		"projects": 0,
		"answers":  0,
		"page":     page,
		"size":     size,
	})
}

func (h *SystemHandler) Config(c *gin.Context) {
	questionTypes := []gin.H{
		{"value": 1, "label": "单选", "hasOptions": true},
		{"value": 2, "label": "多选", "hasOptions": true},
		{"value": 3, "label": "输入框", "hasOptions": false},
		{"value": 4, "label": "文本域", "hasOptions": false},
		{"value": 5, "label": "下拉选择", "hasOptions": true},
		{"value": 6, "label": "多选下拉", "hasOptions": true},
		{"value": 7, "label": "级联选择", "hasOptions": true},
		{"value": 8, "label": "日期", "hasOptions": false},
		{"value": 9, "label": "日期范围", "hasOptions": false},
		{"value": 10, "label": "日期时间", "hasOptions": false},
		{"value": 11, "label": "日期时间范围", "hasOptions": false},
		{"value": 12, "label": "时间", "hasOptions": false},
		{"value": 13, "label": "时间范围", "hasOptions": false},
		{"value": 14, "label": "滑块", "hasOptions": false},
		{"value": 15, "label": "评分", "hasOptions": false},
		{"value": 16, "label": "开关", "hasOptions": false},
		{"value": 17, "label": "文件上传", "hasOptions": false},
		{"value": 18, "label": "多文件上传", "hasOptions": false},
		{"value": 20, "label": "按钮", "hasOptions": false},
		{"value": 21, "label": "图片", "hasOptions": false},
		{"value": 22, "label": "视频", "hasOptions": false},
		{"value": 23, "label": "音频", "hasOptions": false},
		{"value": 24, "label": "地址位置", "hasOptions": false},
		{"value": 25, "label": "手机号", "hasOptions": false},
		{"value": 26, "label": "数字", "hasOptions": false},
		{"value": 27, "label": "货币", "hasOptions": false},
		{"value": 28, "label": "网址", "hasOptions": false},
		{"value": 29, "label": "颜色选择", "hasOptions": false},
		{"value": 30, "label": "评分等级", "hasOptions": false},
		{"value": 31, "label": "签名", "hasOptions": false},
		{"value": 33, "label": "公告", "hasOptions": false},
		{"value": 34, "label": "分割线", "hasOptions": false},
		{"value": 35, "label": "分页符", "hasOptions": false},
	}

	projectTypes := []gin.H{
		{"value": 1, "label": "问卷"},
		{"value": 2, "label": "考试"},
		{"value": 3, "label": "投票"},
		{"value": 4, "label": "测评"},
		{"value": 5, "label": "反馈"},
		{"value": 6, "label": "评估"},
		{"value": 7, "label": "投票"},
	}

	c.JSON(http.StatusOK, gin.H{
		"questionTypes": questionTypes,
		"projectTypes":  projectTypes,
	})
}