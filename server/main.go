package main

import (
	"log"
	"os"

	"github.com/xiaobei56/WenJuanKing/server/api"
	"github.com/xiaobei56/WenJuanKing/server/config"
	"github.com/xiaobei56/WenJuanKing/server/rdbms/impl"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := config.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}
	defer config.CloseDB()

	r := gin.Default()
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	jwtMiddleware := middleware.NewJWTMiddleware(config.Get().JWT.Secret)

	userService := impl.NewUserService(config.GetDB())
	projectService := impl.NewProjectService(config.GetDB())
	questionService := impl.NewQuestionService(config.GetDB())
	answerService := impl.NewAnswerService(config.GetDB())
	repoService := impl.NewRepoService(config.GetDB())
	logService := impl.NewLogService(config.GetDB())
	notificationService := impl.NewNotificationService(config.GetDB())
	fileService := impl.NewFileService(config.GetDB())

	userHandler := api.NewUserHandler(userService, jwtMiddleware)
	projectHandler := api.NewProjectHandler(projectService, jwtMiddleware)
	questionHandler := api.NewQuestionHandler(questionService, jwtMiddleware)
	answerHandler := api.NewAnswerHandler(answerService, jwtMiddleware)
	repoHandler := api.NewRepoHandler(repoService, jwtMiddleware)
	logHandler := api.NewLogHandler(logService, jwtMiddleware)
	notificationHandler := api.NewNotificationHandler(notificationService, jwtMiddleware)
	fileHandler := api.NewFileHandler(fileService, jwtMiddleware)
	systemHandler := api.NewSystemHandler(jwtMiddleware)

	// Public routes
	r.GET("/health", systemHandler.Health)
	r.GET("/api/health", systemHandler.Health)
	r.GET("/api/info", systemHandler.Info)
	r.GET("/api/config", systemHandler.Config)

	// Auth routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	// Protected API routes
	v1 := r.Group("/api/v1")
	v1.Use(jwtMiddleware.AuthRequired())
	{
		// Users
		users := v1.Group("/users")
		{
			users.GET("", userHandler.List)
			users.GET("/:id", userHandler.Get)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.POST("/change-password", userHandler.ChangePassword)
			users.PUT("/:id/status", userHandler.UpdateStatus)
			users.PUT("/:id/role", userHandler.UpdateRole)
		}

		// Projects
		projects := v1.Group("/projects")
		{
			projects.POST("", projectHandler.Create)
			projects.GET("", projectHandler.List)
			projects.GET("/:id", projectHandler.Get)
			projects.PUT("/:id", projectHandler.Update)
			projects.DELETE("/:id", projectHandler.Delete)
			projects.POST("/:id/publish", projectHandler.Publish)
			projects.POST("/:id/unpublish", projectHandler.Unpublish)
			projects.POST("/:id/duplicate", projectHandler.Duplicate)
			projects.POST("/:id/questions", projectHandler.UpdateQuestions)
		}

		// Questions
		questions := v1.Group("/projects/:projectId/questions")
		{
			questions.POST("", questionHandler.Create)
			questions.GET("", questionHandler.List)
			questions.GET("/:id", questionHandler.Get)
			questions.PUT("/:id", questionHandler.Update)
			questions.DELETE("/:id", questionHandler.Delete)
			questions.POST("/sort", questionHandler.Sort)
			questions.POST("/batch", questionHandler.BatchCreate)
			questions.GET("/count", questionHandler.Count)
		}

		// Answers
		answers := v1.Group("/projects/:projectId/answers")
		{
			answers.POST("", answerHandler.Submit)
			answers.GET("", answerHandler.List)
			answers.GET("/:id", answerHandler.Get)
			answers.GET("/:id/statistics", answerHandler.Statistics)
			answers.POST("/:id/score", answerHandler.UpdateScore)
			answers.POST("/:id/auto-score", answerHandler.AutoScore)
		}

		// User answers
		v1.GET("/answers", answerHandler.MyAnswers)

		// Repos (Templates)
		repos := v1.Group("/repos")
		{
			repos.POST("", repoHandler.Create)
			repos.GET("", repoHandler.List)
			repos.GET("/public", repoHandler.ListPublic)
			repos.GET("/:id", repoHandler.Get)
			repos.PUT("/:id", repoHandler.Update)
			repos.DELETE("/:id", repoHandler.Delete)
			repos.POST("/:id/import", repoHandler.Import)
		}

		// Files
		files := v1.Group("/files")
		{
			files.POST("/upload", fileHandler.Upload)
			files.GET("", fileHandler.List)
			files.DELETE("/:id", fileHandler.Delete)
			files.GET("/download/:filename", fileHandler.Download)
		}

		// Notifications
		notifications := v1.Group("/notifications")
		{
			notifications.GET("", notificationHandler.List)
			notifications.POST("/:id/read", notificationHandler.MarkAsRead)
			notifications.POST("/read-all", notificationHandler.MarkAllAsRead)
			notifications.GET("/unread-count", notificationHandler.UnreadCount)
			notifications.DELETE("/:id", notificationHandler.Delete)
		}

		// Logs
		logs := v1.Group("/logs")
		{
			logs.GET("", logHandler.List)
			logs.POST("", logHandler.Create)
		}

		// Stats
		v1.GET("/stats", systemHandler.Stats)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = config.Get().Server.Port
		if port == "" {
			port = "8080"
		}
	}

	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}