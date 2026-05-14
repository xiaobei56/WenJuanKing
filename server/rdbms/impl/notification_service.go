package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/shared/core/utils"
)

type NotificationService struct {
	db *sql.DB
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{db: db}
}

func (s *NotificationService) Create(userID, title, content string, notificationType int) error {
	_, err := s.db.Exec(
		`INSERT INTO notifications (id, user_id, title, content, type, is_read, create_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		utils.GenerateUUID(), userID, title, content, notificationType, false, time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}

func (s *NotificationService) ListByUserID(userID string, page, size int) ([]gin.H, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, title, content, type, is_read, create_time
		FROM notifications WHERE user_id = $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3`,
		userID, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var notifications []gin.H
	for rows.Next() {
		n := make(gin.H)
		rows.Scan(&n["id"], &n["title"], &n["content"], &n["type"], &n["isRead"], &n["createTime"])
		notifications = append(notifications, n)
	}
	return notifications, total, nil
}

func (s *NotificationService) MarkAsRead(id string) error {
	result, err := s.db.Exec(`UPDATE notifications SET is_read = true WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to mark as read: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("notification not found")
	}
	return nil
}

func (s *NotificationService) MarkAllAsRead(userID string) error {
	_, err := s.db.Exec(`UPDATE notifications SET is_read = true WHERE user_id = $1`, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all as read: %w", err)
	}
	return nil
}

func (s *NotificationService) UnreadCount(userID string) (int, error) {
	var count int
	err := s.db.QueryRow(
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
		userID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread: %w", err)
	}
	return count, nil
}

func (s *NotificationService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM notifications WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("notification not found")
	}
	return nil
}