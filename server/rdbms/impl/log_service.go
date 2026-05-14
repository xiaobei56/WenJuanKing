package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/xiaobei56/WenJuanKing/server/shared/core/utils"
)

type LogService struct {
	db *sql.DB
}

func NewLogService(db *sql.DB) *LogService {
	return &LogService{db: db}
}

func (s *LogService) CreateLog(userID, action, targetType, targetID, details, ip string) error {
	if userID == "" {
		userID = "system"
	}

	_, err := s.db.Exec(
		`INSERT INTO logs (id, user_id, action, target_type, target_id, details, ip, create_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		utils.GenerateUUID(), userID, action, targetType, targetID, details, ip, time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create log: %w", err)
	}
	return nil
}

func (s *LogService) ListByUserID(userID string, page, size int) ([]gin.H, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM logs WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count logs: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, action, target_type, target_id, details, ip, create_time
		FROM logs WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`,
		userID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query logs: %w", err)
	}
	defer rows.Close()

	var logs []gin.H
	for rows.Next() {
		log := make(gin.H)
		rows.Scan(&log["id"], &log["action"], &log["targetType"], &log["targetId"], &log["details"], &log["ip"], &log["createTime"])
		logs = append(logs, log)
	}
	return logs, total, nil
}

func (s *LogService) ListByTarget(targetType, targetID string, page, size int) ([]gin.H, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(
		`SELECT COUNT(*) FROM logs WHERE target_type = $1 AND target_id = $2`,
		targetType, targetID,
	).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count logs: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, user_id, action, target_type, target_id, details, ip, create_time
		FROM logs WHERE target_type = $1 AND target_id = $2 ORDER BY create_time DESC LIMIT $3 OFFSET $4`,
		targetType, targetID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query logs: %w", err)
	}
	defer rows.Close()

	var logs []gin.H
	for rows.Next() {
		log := make(gin.H)
		rows.Scan(&log["id"], &log["userId"], &log["action"], &log["targetType"], &log["targetId"], &log["details"], &log["ip"], &log["createTime"])
		logs = append(logs, log)
	}
	return logs, total, nil
}