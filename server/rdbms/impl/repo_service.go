package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
)

type RepoService struct {
	db *sql.DB
}

func NewRepoService(db *sql.DB) *RepoService {
	return &RepoService{db: db}
}

type CreateRepoRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Type        int    `json:"type" binding:"required"`
	Content     string `json:"content"`
	IsPublic    bool   `json:"isPublic"`
}

func (s *RepoService) Create(userID string, req *CreateRepoRequest) (*model.Repo, error) {
	if req.Content == "" {
		req.Content = "{}"
	}

	now := time.Now()
	repo := &model.Repo{
		ID:          utils.GenerateUUID(),
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		UserID:      userID,
		Content:     req.Content,
		IsPublic:    req.IsPublic,
		CreateTime:  now,
		UpdateTime:  now,
	}

	_, err := s.db.Exec(
		`INSERT INTO repos (id, name, description, type, user_id, content, is_public, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		repo.ID, repo.Name, repo.Description, repo.Type, repo.UserID, repo.Content, repo.IsPublic, repo.CreateTime, repo.UpdateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert repo: %w", err)
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("repo not found")
		}
		return nil, fmt.Errorf("failed to get repo: %w", err)
	}
	return repo, nil
}

func (s *RepoService) List(userID string, page, size int) ([]*model.Repo, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM repos WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count repos: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, name, description, type, user_id, content, is_public, create_time, update_time
		FROM repos WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, userID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query repos: %w", err)
	}
	defer rows.Close()

	var repos []*model.Repo
	for rows.Next() {
		r := &model.Repo{}
		err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Type, &r.UserID, &r.Content, &r.IsPublic, &r.CreateTime, &r.UpdateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan repo: %w", err)
		}
		repos = append(repos, r)
	}
	return repos, total, nil
}

func (s *RepoService) ListPublic(page, size int) ([]*model.Repo, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM repos WHERE is_public = true`).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count repos: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, name, description, type, user_id, content, is_public, create_time, update_time
		FROM repos WHERE is_public = true ORDER BY create_time DESC LIMIT $1 OFFSET $2`, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query repos: %w", err)
	}
	defer rows.Close()

	var repos []*model.Repo
	for rows.Next() {
		r := &model.Repo{}
		err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Type, &r.UserID, &r.Content, &r.IsPublic, &r.CreateTime, &r.UpdateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan repo: %w", err)
		}
		repos = append(repos, r)
	}
	return repos, total, nil
}

func (s *RepoService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM repos WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete repo: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("repo not found")
	}
	return nil
}

func (s *RepoService) Import(id string, content string) error {
	result, err := s.db.Exec(`UPDATE repos SET content = $1, update_time = $2 WHERE id = $3`, content, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to import: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("repo not found")
	}
	return nil
}

func (s *RepoService) Update(id string, req *CreateRepoRequest) error {
	result, err := s.db.Exec(
		`UPDATE repos SET name = $1, description = $2, content = $3, is_public = $4, update_time = $5 WHERE id = $6`,
		req.Name, req.Description, req.Content, req.IsPublic, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("failed to update repo: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("repo not found")
	}
	return nil
}