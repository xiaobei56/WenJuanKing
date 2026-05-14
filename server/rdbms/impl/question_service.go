package impl

import (
	"database/sql"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type QuestionService struct {
	db *sql.DB
}

func NewQuestionService() *QuestionService {
	return &QuestionService{}
}

func (s *QuestionService) Create(projectID string, req *dto.CreateQuestionRequest) (*model.Question, error) {
	question := &model.Question{
		ID:         utils.GenerateUUID(),
		ProjectID:  projectID,
		Title:      req.Title,
		Type:       req.Type,
		Required:   req.Required,
		Options:    req.Options,
		Validation: req.Validation,
		Logic:      req.Logic,
		Settings:   req.Settings,
		OrderNum:   req.OrderNum,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}

	_, err := s.db.Exec(
		`INSERT INTO questions (id, project_id, title, type, required, options, validation, logic, settings, order_num, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		question.ID, question.ProjectID, question.Title, question.Type, question.Required, question.Options, question.Validation, question.Logic, question.Settings, question.OrderNum, question.CreateTime, question.UpdateTime,
	)
	if err != nil {
		return nil, err
	}
	return question, nil
}

func (s *QuestionService) GetByID(id string) (*model.Question, error) {
	question := &model.Question{}
	err := s.db.QueryRow(
		`SELECT id, project_id, title, type, required, options, validation, logic, settings, order_num, create_time, update_time
		FROM questions WHERE id = $1`, id,
	).Scan(&question.ID, &question.ProjectID, &question.Title, &question.Type, &question.Required, &question.Options, &question.Validation, &question.Logic, &question.Settings, &question.OrderNum, &question.CreateTime, &question.UpdateTime)
	if err != nil {
		return nil, err
	}
	return question, nil
}

func (s *QuestionService) ListByProjectID(projectID string) ([]*model.Question, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, title, type, required, options, validation, logic, settings, order_num, create_time, update_time
		FROM questions WHERE project_id = $1 ORDER BY order_num, create_time`, projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []*model.Question
	for rows.Next() {
		q := &model.Question{}
		rows.Scan(&q.ID, &q.ProjectID, &q.Title, &q.Type, &q.Required, &q.Options, &q.Validation, &q.Logic, &q.Settings, &q.OrderNum, &q.CreateTime, &q.UpdateTime)
		questions = append(questions, q)
	}
	return questions, nil
}

func (s *QuestionService) Update(id string, req *dto.UpdateQuestionRequest) error {
	_, err := s.db.Exec(
		`UPDATE questions SET title = $1, type = $2, required = $3, options = $4, validation = $5, logic = $6, settings = $7, update_time = $8 WHERE id = $9`,
		req.Title, req.Type, req.Required, req.Options, req.Validation, req.Logic, req.Settings, time.Now(), id,
	)
	return err
}

func (s *QuestionService) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM questions WHERE id = $1`, id)
	return err
}

func (s *QuestionService) Sort(projectID string, questionIDs []string) error {
	for i, id := range questionIDs {
		_, err := s.db.Exec(`UPDATE questions SET order_num = $1, update_time = $2 WHERE id = $3 AND project_id = $4`, i, time.Now(), id, projectID)
		if err != nil {
			return err
		}
	}
	return nil
}