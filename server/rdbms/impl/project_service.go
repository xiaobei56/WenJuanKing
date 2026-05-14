package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type ProjectService struct {
	db *sql.DB
}

func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{db: db}
}

func (s *ProjectService) Create(userID string, req *dto.CreateProjectRequest) (*model.Project, error) {
	if req.Settings == "" {
		req.Settings = "{}"
	}

	now := time.Now()
	project := &model.Project{
		ID:          utils.GenerateUUID(),
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		Status:      0,
		UserID:      userID,
		Settings:    req.Settings,
		CreateTime:  now,
		UpdateTime:  now,
	}

	_, err := s.db.Exec(
		`INSERT INTO projects (id, name, description, type, status, user_id, settings, questions, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		project.ID, project.Name, project.Description, project.Type, project.Status, project.UserID, project.Settings, "[]", project.CreateTime, project.UpdateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert project: %w", err)
	}
	return project, nil
}

func (s *ProjectService) GetByID(id string) (*model.Project, error) {
	project := &model.Project{}
	err := s.db.QueryRow(
		`SELECT id, name, description, type, status, user_id, settings, questions, publish_time, create_time, update_time
		FROM projects WHERE id = $1`, id,
	).Scan(&project.ID, &project.Name, &project.Description, &project.Type, &project.Status, &project.UserID, &project.Settings, &project.Questions, &project.PublishTime, &project.CreateTime, &project.UpdateTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	return project, nil
}

func (s *ProjectService) List(userID string, req *dto.ProjectListRequest) ([]*model.Project, int64, error) {
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Size < 1 || req.Size > 100 {
		req.Size = 20
	}
	offset := (req.Page - 1) * req.Size

	var total int64
	var countQuery string
	var rows *sql.Rows
	var err error

	if userID != "" {
		err = s.db.QueryRow(`SELECT COUNT(*) FROM projects WHERE user_id = $1`, userID).Scan(&total)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count projects: %w", err)
		}
		rows, err = s.db.Query(
			`SELECT id, name, description, type, status, user_id, settings, questions, publish_time, create_time, update_time
			FROM projects WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`,
			userID, req.Size, offset,
		)
	} else {
		err = s.db.QueryRow(`SELECT COUNT(*) FROM projects`).Scan(&total)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count projects: %w", err)
		}
		rows, err = s.db.Query(
			`SELECT id, name, description, type, status, user_id, settings, questions, publish_time, create_time, update_time
			FROM projects ORDER BY create_time DESC LIMIT $1 OFFSET $2`,
			req.Size, offset,
		)
	}

	if err != nil {
		return nil, 0, fmt.Errorf("failed to query projects: %w", err)
	}
	defer rows.Close()

	var projects []*model.Project
	for rows.Next() {
		p := &model.Project{}
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Type, &p.Status, &p.UserID, &p.Settings, &p.Questions, &p.PublishTime, &p.CreateTime, &p.UpdateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, p)
	}
	return projects, total, nil
}

func (s *ProjectService) Update(id string, req *dto.UpdateProjectRequest) error {
	result, err := s.db.Exec(
		`UPDATE projects SET name = $1, description = $2, settings = $3, update_time = $4 WHERE id = $5`,
		req.Name, req.Description, req.Settings, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("failed to update project: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}

func (s *ProjectService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}

func (s *ProjectService) Publish(id string) error {
	now := time.Now()
	result, err := s.db.Exec(
		`UPDATE projects SET status = 1, publish_time = $1, update_time = $2 WHERE id = $3 AND status = 0`,
		now, now, id,
	)
	if err != nil {
		return fmt.Errorf("failed to publish project: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("project not found or already published")
	}
	return nil
}

func (s *ProjectService) Unpublish(id string) error {
	now := time.Now()
	result, err := s.db.Exec(
		`UPDATE projects SET status = 0, publish_time = NULL, update_time = $1 WHERE id = $2`,
		now, id,
	)
	if err != nil {
		return fmt.Errorf("failed to unpublish project: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}

func (s *ProjectService) UpdateQuestions(id string, questions string) error {
	result, err := s.db.Exec(
		`UPDATE projects SET questions = $1, update_time = $2 WHERE id = $3`,
		questions, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("failed to update questions: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}