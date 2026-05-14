package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type AnswerService struct {
	db *sql.DB
}

func NewAnswerService(db *sql.DB) *AnswerService {
	return &AnswerService{db: db}
}

func (s *AnswerService) Submit(projectID, userID string, req *dto.SubmitAnswerRequest, ip, userAgent string) (*model.Answer, error) {
	if req.Answers == "" {
		req.Answers = "{}"
	}

	now := time.Now()
	answer := &model.Answer{
		ID:        utils.GenerateUUID(),
		ProjectID: projectID,
		UserID:    userID,
		Answers:   req.Answers,
		TimeSpent: req.TimeSpent,
		IP:        ip,
		UserAgent: userAgent,
		Status:    1,
		CreateTime: now,
	}

	_, err := s.db.Exec(
		`INSERT INTO answers (id, project_id, user_id, answers, time_spent, ip, user_agent, status, create_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		answer.ID, answer.ProjectID, answer.UserID, answer.Answers, answer.TimeSpent, answer.IP, answer.UserAgent, answer.Status, answer.CreateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert answer: %w", err)
	}
	return answer, nil
}

func (s *AnswerService) GetByID(id string) (*model.Answer, error) {
	answer := &model.Answer{}
	err := s.db.QueryRow(
		`SELECT id, project_id, user_id, answers, score, time_spent, ip, user_agent, status, create_time
		FROM answers WHERE id = $1`, id,
	).Scan(&answer.ID, &answer.ProjectID, &answer.UserID, &answer.Answers, &answer.Score, &answer.TimeSpent, &answer.IP, &answer.UserAgent, &answer.Status, &answer.CreateTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("answer not found")
		}
		return nil, fmt.Errorf("failed to get answer: %w", err)
	}
	return answer, nil
}

func (s *AnswerService) ListByProjectID(projectID string, page, size int) ([]*model.Answer, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1`, projectID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count answers: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, project_id, user_id, answers, score, time_spent, ip, user_agent, status, create_time
		FROM answers WHERE project_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, projectID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query answers: %w", err)
	}
	defer rows.Close()

	var answers []*model.Answer
	for rows.Next() {
		a := &model.Answer{}
		err := rows.Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Answers, &a.Score, &a.TimeSpent, &a.IP, &a.UserAgent, &a.Status, &a.CreateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan answer: %w", err)
		}
		answers = append(answers, a)
	}
	return answers, total, nil
}

func (s *AnswerService) ListByUserID(userID string, page, size int) ([]*model.Answer, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count answers: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, project_id, user_id, answers, score, time_spent, ip, user_agent, status, create_time
		FROM answers WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, userID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query answers: %w", err)
	}
	defer rows.Close()

	var answers []*model.Answer
	for rows.Next() {
		a := &model.Answer{}
		err := rows.Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Answers, &a.Score, &a.TimeSpent, &a.IP, &a.UserAgent, &a.Status, &a.CreateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan answer: %w", err)
		}
		answers = append(answers, a)
	}
	return answers, total, nil
}

func (s *AnswerService) Statistics(projectID string) (*dto.AnswerStatisticsResponse, error) {
	stats := &dto.AnswerStatisticsResponse{}

	err := s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1`, projectID).Scan(&stats.Total)
	if err != nil {
		return nil, fmt.Errorf("failed to count total: %w", err)
	}

	err = s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1 AND status = 1`, projectID).Scan(&stats.Completed)
	if err != nil {
		return nil, fmt.Errorf("failed to count completed: %w", err)
	}

	stats.Abandoned = stats.Total - stats.Completed

	var avgTime sql.NullFloat64
	err = s.db.QueryRow(`SELECT AVG(time_spent) FROM answers WHERE project_id = $1 AND time_spent > 0`, projectID).Scan(&avgTime)
	if err != nil {
		return nil, fmt.Errorf("failed to get avg time: %w", err)
	}
	if avgTime.Valid {
		stats.AvgTimeSpent = avgTime.Float64
	}

	stats.ScoreDistribution = make(map[string]int)
	rows, err := s.db.Query(`SELECT score, COUNT(*) FROM answers WHERE project_id = $1 GROUP BY score`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get score distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var score, count int
		rows.Scan(&score, &count)
		stats.ScoreDistribution[fmt.Sprintf("%d", score)] = count
	}

	return stats, nil
}

func (s *AnswerService) UpdateScore(id string, score int) error {
	result, err := s.db.Exec(`UPDATE answers SET score = $1 WHERE id = $2`, score, id)
	if err != nil {
		return fmt.Errorf("failed to update score: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("answer not found")
	}
	return nil
}