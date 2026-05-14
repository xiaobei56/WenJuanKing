package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/xiaobei56/WenJuanKing/server/rdbms/domain/model"
	"github.com/xiaobei56/WenJuanKing/server/shared/core/utils"
)

type FileService struct {
	db *sql.DB
}

func NewFileService(db *sql.DB) *FileService {
	return &FileService{db: db}
}

func (s *FileService) Create(name, path string, size int64, mimeType, userID string) (*model.File, error) {
	file := &model.File{
		ID:        utils.GenerateUUID(),
		Name:      name,
		Path:      path,
		Size:      size,
		MimeType:  mimeType,
		UserID:    userID,
		CreateTime: time.Now(),
	}

	_, err := s.db.Exec(
		`INSERT INTO files (id, name, path, size, mime_type, user_id, create_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		file.ID, file.Name, file.Path, file.Size, file.MimeType, file.UserID, file.CreateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert file: %w", err)
	}
	return file, nil
}

func (s *FileService) GetByID(id string) (*model.File, error) {
	file := &model.File{}
	err := s.db.QueryRow(
		`SELECT id, name, path, size, mime_type, user_id, create_time
		FROM files WHERE id = $1`, id,
	).Scan(&file.ID, &file.Name, &file.Path, &file.Size, &file.MimeType, &file.UserID, &file.CreateTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("file not found")
		}
		return nil, fmt.Errorf("failed to get file: %w", err)
	}
	return file, nil
}

func (s *FileService) ListByUserID(userID string, page, size int) ([]*model.File, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM files WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count files: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, name, path, size, mime_type, user_id, create_time
		FROM files WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`, userID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query files: %w", err)
	}
	defer rows.Close()

	var files []*model.File
	for rows.Next() {
		f := &model.File{}
		err := rows.Scan(&f.ID, &f.Name, &f.Path, &f.Size, &f.MimeType, &f.UserID, &f.CreateTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan file: %w", err)
		}
		files = append(files, f)
	}
	return files, total, nil
}

func (s *FileService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM files WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("file not found")
	}
	return nil
}