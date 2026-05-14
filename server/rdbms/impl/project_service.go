package impl

import (
	"database/sql"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type ProjectService struct {
	db *sql.DB
}

func NewProjectService() *ProjectService {
	return &ProjectService{}
}

func (s *ProjectService) Create(userID string, req *dto.CreateProjectRequest) (*model.Project, error) {
	project := &model.Project{
		ID:          utils.GenerateUUID(),
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		Status:      0,
		UserID:      userID,
		Settings:    req.Settings,
		CreateTime:  time.Now(),
		UpdateTime:  time.Now(),
	}

	_, err := s.db.Exec(
		`INSERT INTO projects (id, name, description, type, status, user_id, settings, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		project.ID, project.Name, project.Description, project.Type, project.Status, project.UserID, project.Settings, project.CreateTime, project.UpdateTime,
	)
	if err != nil {
		return nil, err
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
		return nil, err
	}
	return project, nil
}

func (s *ProjectService) List(userID string, req *dto.ProjectListRequest) ([]*model.Project, int64, error) {
	offset := (req.Page - 1) * req.Size
	var total int64
	var countQuery, listQuery string

	if userID != "" {
		countQuery = `SELECT COUNT(*) FROM projects WHERE user_id = $1`
		listQuery = `SELECT id, name, description, type, status, user_id, settings, questions, publish_time, create_time, update_time
		FROM projects WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`
		rows := s.db.QueryRow(countQuery, userID)
		rows.Scan(&total)
		rows2, _ := s.db.Query(listQuery, userID, req.Size, offset)
	} else {
		countQuery = `SELECT COUNT(*) FROM projects`
		listQuery = `SELECT id, name, description, type, status, user_id, settings, questions, publish_time, create_time, update_time
		FROM projects ORDER BY create_time DESC LIMIT $1 OFFSET $2`
		s.db.QueryRow(countQuery).Scan(&total)
		_, err := s.db.Query(listQuery, req.Size, offset)
		if err != nil {
			return nil, 0, err
		}
	}

	return nil, total, nil
}

func (s *ProjectService) Update(id string, req *dto.UpdateProjectRequest) error {
	_, err := s.db.Exec(
		`UPDATE projects SET name = $1, description = $2, settings = $3, update_time = $4 WHERE id = $5`,
		req.Name, req.Description, req.Settings, time.Now(), id,
	)
	return err
}

func (s *ProjectService) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM projects WHERE id = $1`, id)
	return err
}

func (s *ProjectService) Publish(id string) error {
	_, err := s.db.Exec(
		`UPDATE projects SET status = 1, publish_time = $1 WHERE id = $2`,
		time.Now(), id,
	)
	return err
}