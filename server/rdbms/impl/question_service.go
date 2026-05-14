package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type QuestionService struct {
	db *sql.DB
}

func NewQuestionService(db *sql.DB) *QuestionService {
	return &QuestionService{db: db}
}

func (s *QuestionService) Create(projectID string, req *dto.CreateQuestionRequest) (*model.Question, error) {
	now := time.Now()
	if req.Options == "" {
		req.Options = "[]"
	}
	if req.Validation == "" {
		req.Validation = "{}"
	}
	if req.Logic == "" {
		req.Logic = "{}"
	}
	if req.Settings == "" {
		req.Settings = "{}"
	}

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
		CreateTime: now,
		UpdateTime: now,
	}

	_, err := s.db.Exec(
		`INSERT INTO questions (id, project_id, title, type, required, options, validation, logic, settings, order_num, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		question.ID, question.ProjectID, question.Title, question.Type, question.Required, question.Options, question.Validation, question.Logic, question.Settings, question.OrderNum, question.CreateTime, question.UpdateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert question: %w", err)
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to get question: %w", err)
	}
	return question, nil
}

func (s *QuestionService) ListByProjectID(projectID string) ([]*model.Question, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, title, type, required, options, validation, logic, settings, order_num, create_time, update_time
		FROM questions WHERE project_id = $1 ORDER BY order_num, create_time`, projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query questions: %w", err)
	}
	defer rows.Close()

	var questions []*model.Question
	for rows.Next() {
		q := &model.Question{}
		err := rows.Scan(&q.ID, &q.ProjectID, &q.Title, &q.Type, &q.Required, &q.Options, &q.Validation, &q.Logic, &q.Settings, &q.OrderNum, &q.CreateTime, &q.UpdateTime)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, q)
	}
	return questions, nil
}

func (s *QuestionService) Update(id string, req *dto.UpdateQuestionRequest) error {
	result, err := s.db.Exec(
		`UPDATE questions SET title = $1, type = $2, required = $3, options = $4, validation = $5, logic = $6, settings = $7, update_time = $8 WHERE id = $9`,
		req.Title, req.Type, req.Required, req.Options, req.Validation, req.Logic, req.Settings, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("failed to update question: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("question not found")
	}
	return nil
}

func (s *QuestionService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM questions WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete question: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("question not found")
	}
	return nil
}

func (s *QuestionService) Sort(projectID string, questionIDs []string) error {
	if len(questionIDs) == 0 {
		return nil
	}

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`UPDATE questions SET order_num = $1, update_time = $2 WHERE id = $3 AND project_id = $4`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	now := time.Now()
	for i, id := range questionIDs {
		_, err := stmt.Exec(i, now, id, projectID)
		if err != nil {
			return fmt.Errorf("failed to update question order: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (s *QuestionService) GetMaxOrderNum(projectID string) (int, error) {
	var maxOrder int
	err := s.db.QueryRow(`SELECT COALESCE(MAX(order_num), -1) FROM questions WHERE project_id = $1`, projectID).Scan(&maxOrder)
	if err != nil {
		return 0, fmt.Errorf("failed to get max order: %w", err)
	}
	return maxOrder, nil
}

func (s *QuestionService) CountByProjectID(projectID string) (int64, error) {
	var count int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM questions WHERE project_id = $1`, projectID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count questions: %w", err)
	}
	return count, nil
}