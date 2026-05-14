package main

import (
	"log"
	"os"

	"github.com/surveyking/surveyking/server/api"
	"github.com/surveyking/surveyking/server/config"
	"github.com/surveyking/surveyking/server/rdbms/impl"
	"github.com/surveyking/surveyking/server/shared/core/middleware"
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

	userHandler := api.NewUserHandler(userService, jwtMiddleware)
	projectHandler := api.NewProjectHandler(projectService, jwtMiddleware)
	questionHandler := api.NewQuestionHandler(questionService, jwtMiddleware)
	answerHandler := api.NewAnswerHandler(answerService, jwtMiddleware)
	repoHandler := api.NewRepoHandler(repoService, jwtMiddleware)

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	v1 := r.Group("/api/v1")
	v1.Use(jwtMiddleware.AuthRequired())
	{
		users := v1.Group("/users")
		{
			users.GET("", userHandler.List)
			users.GET("/:id", userHandler.Get)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
		}

		projects := v1.Group("/projects")
		{
			projects.POST("", projectHandler.Create)
			projects.GET("", projectHandler.List)
			projects.GET("/:id", projectHandler.Get)
			projects.PUT("/:id", projectHandler.Update)
			projects.DELETE("/:id", projectHandler.Delete)
			projects.POST("/:id/publish", projectHandler.Publish)
		}

		questions := v1.Group("/projects/:projectId/questions")
		{
			questions.POST("", questionHandler.Create)
			questions.GET("", questionHandler.List)
			questions.GET("/:id", questionHandler.Get)
			questions.PUT("/:id", questionHandler.Update)
			questions.DELETE("/:id", questionHandler.Delete)
			questions.POST("/sort", questionHandler.Sort)
		}

		answers := v1.Group("/projects/:projectId/answers")
		{
			answers.POST("", answerHandler.Submit)
			answers.GET("", answerHandler.List)
			answers.GET("/:id", answerHandler.Get)
			answers.GET("/:id/statistics", answerHandler.Statistics)
		}

		repos := v1.Group("/repos")
		{
			repos.POST("", repoHandler.Create)
			repos.GET("", repoHandler.List)
			repos.GET("/:id", repoHandler.Get)
			repos.DELETE("/:id", repoHandler.Delete)
			repos.POST("/:id/import", repoHandler.Import)
		}
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