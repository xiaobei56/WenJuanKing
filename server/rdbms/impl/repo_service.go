package impl

import (
	"database/sql"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
)

type RepoService struct {
	db *sql.DB
}

func NewRepoService() *RepoService {
	return &RepoService{}
}

type CreateRepoRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Type        int    `json:"type" binding:"required"`
	Content     string `json:"content"`
	IsPublic    bool   `json:"isPublic"`
}

func (s *RepoService) Create(userID string, req *CreateRepoRequest) (*model.Repo, error) {
	repo := &model.Repo{
		ID:          utils.GenerateUUID(),
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		UserID:      userID,
		Content:     req.Content,
		IsPublic:    req.IsPublic,
		CreateTime:  time.Now(),
		UpdateTime:  time.Now(),
	}

	_, err := s.db.Exec(
		`INSERT INTO repos (id, name, description, type, user_id, content, is_public, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		repo.ID, repo.Name, repo.Description, repo.Type, repo.UserID, repo.Content, repo.IsPublic, repo.CreateTime, repo.UpdateTime,
	)
	if err != nil {
		return nil, err
	}
	return repo, nil
}

func (s *RepoService) GetByID(id string) (*model.Repo, error) {
	repo := &model.Repo{}
	err := s.db.QueryRow(
		`SELECT id, name, description, type, user_id, content, is_public, create_time, update_time
		FROM repos WHERE id = $1`, id,
	).Scan(&repo.ID, &repo.Name, &repo.Description, &repo.Type, &repo.UserID, &repo.Content, &repo.IsPublic, &repo.CreateTime, &repo.UpdateTime)
	if err != nil {
		return nil, err
	}
	return repo, nil
}

func (s *RepoService) List(userID string, page, size int) ([]*model.Repo, int64, error) {
	offset := (page - 1) * size
	var total int64
	s.db.QueryRow(`SELECT COUNT(*) FROM repos WHERE user_id = $1`, userID).Scan(&total)

	rows, err := s.db.Query(
		`SELECT id, name, description, type, user_id, content, is_public, create_time, update_time
		FROM repos WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, userID, size, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var repos []*model.Repo
	for rows.Next() {
		r := &model.Repo{}
		rows.Scan(&r.ID, &r.Name, &r.Description, &r.Type, &r.UserID, &r.Content, &r.IsPublic, &r.CreateTime, &r.UpdateTime)
		repos = append(repos, r)
	}
	return repos, total, nil
}

func (s *RepoService) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM repos WHERE id = $1`, id)
	return err
}

func (s *RepoService) Import(id string, content string) error {
	_, err := s.db.Exec(`UPDATE repos SET content = $1, update_time = $2 WHERE id = $3`, content, time.Now(), id)
	return err
}