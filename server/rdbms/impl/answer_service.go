package impl

import (
	"database/sql"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type AnswerService struct {
	db *sql.DB
}

func NewAnswerService() *AnswerService {
	return &AnswerService{}
}

func (s *AnswerService) Submit(projectID, userID string, req *dto.SubmitAnswerRequest, ip, userAgent string) (*model.Answer, error) {
	answer := &model.Answer{
		ID:        utils.GenerateUUID(),
		ProjectID: projectID,
		UserID:    userID,
		Answers:   req.Answers,
		TimeSpent: req.TimeSpent,
		IP:        ip,
		UserAgent: userAgent,
		Status:    1,
		CreateTime: time.Now(),
	}

	_, err := s.db.Exec(
		`INSERT INTO answers (id, project_id, user_id, answers, time_spent, ip, user_agent, status, create_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		answer.ID, answer.ProjectID, answer.UserID, answer.Answers, answer.TimeSpent, answer.IP, answer.UserAgent, answer.Status, answer.CreateTime,
	)
	if err != nil {
		return nil, err
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
		return nil, err
	}
	return answer, nil
}

func (s *AnswerService) ListByProjectID(projectID string, page, size int) ([]*model.Answer, int64, error) {
	offset := (page - 1) * size
	var total int64
	s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1`, projectID).Scan(&total)

	rows, err := s.db.Query(
		`SELECT id, project_id, user_id, answers, score, time_spent, ip, user_agent, status, create_time
		FROM answers WHERE project_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, projectID, size, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var answers []*model.Answer
	for rows.Next() {
		a := &model.Answer{}
		rows.Scan(&a.ID, &a.ProjectID, &a.UserID, &a.Answers, &a.Score, &a.TimeSpent, &a.IP, &a.UserAgent, &a.Status, &a.CreateTime)
		answers = append(answers, a)
	}
	return answers, total, nil
}

func (s *AnswerService) Statistics(projectID string) (*dto.AnswerStatisticsResponse, error) {
	var total, completed, abandoned int64
	var avgTimeSpent float64

	s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1`, projectID).Scan(&total)
	s.db.QueryRow(`SELECT COUNT(*) FROM answers WHERE project_id = $1 AND status = 1`, projectID).Scan(&completed)
	s.db.QueryRow(`SELECT AVG(time_spent) FROM answers WHERE project_id = $1`, projectID).Scan(&avgTimeSpent)
	abandoned = total - completed

	return &dto.AnswerStatisticsResponse{
		Total:       total,
		Completed:   completed,
		Abandoned:   abandoned,
		AvgTimeSpent: avgTimeSpent,
	}, nil
}