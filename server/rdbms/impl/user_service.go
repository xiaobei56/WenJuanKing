package impl

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) Create(req *dto.RegisterRequest) (*model.User, error) {
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	now := time.Now()
	user := &model.User{
		ID:        utils.GenerateUUID(),
		Username:  req.Username,
		Password:  hash,
		Email:     req.Email,
		Phone:     req.Phone,
		Nickname:  req.Nickname,
		Status:    1,
		CreateTime: now,
		UpdateTime: now,
	}

	_, err = s.db.Exec(
		`INSERT INTO users (id, username, password, email, phone, nickname, status, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		user.ID, user.Username, user.Password, user.Email, user.Phone, user.Nickname, user.Status, user.CreateTime, user.UpdateTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return user, nil
}

func (s *UserService) GetByID(id string) (*model.User, error) {
	user := &model.User{}
	err := s.db.QueryRow(
		`SELECT id, username, email, phone, nickname, avatar, status, create_time, update_time, last_login_time
		FROM users WHERE id = $1`, id,
	).Scan(&user.ID, &user.Username, &user.Email, &user.Phone, &user.Nickname, &user.Avatar, &user.Status, &user.CreateTime, &user.UpdateTime, &user.LastLoginTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func (s *UserService) GetByUsername(username string) (*model.User, error) {
	user := &model.User{}
	err := s.db.QueryRow(
		`SELECT id, username, password, email, phone, nickname, avatar, status, create_time, update_time, last_login_time
		FROM users WHERE username = $1`, username,
	).Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.Phone, &user.Nickname, &user.Avatar, &user.Status, &user.CreateTime, &user.UpdateTime, &user.LastLoginTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func (s *UserService) List(page, size int) ([]*model.User, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	offset := (page - 1) * size

	var total int64
	err := s.db.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT id, username, email, phone, nickname, avatar, status, create_time, update_time, last_login_time
		FROM users ORDER BY create_time DESC LIMIT $1 OFFSET $2`, size, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		user := &model.User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Phone, &user.Nickname, &user.Avatar, &user.Status, &user.CreateTime, &user.UpdateTime, &user.LastLoginTime)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}
	return users, total, nil
}

func (s *UserService) Update(id string, req *dto.UpdateUserRequest) error {
	result, err := s.db.Exec(
		`UPDATE users SET nickname = $1, email = $2, phone = $3, avatar = $4, update_time = $5 WHERE id = $6`,
		req.Nickname, req.Email, req.Phone, req.Avatar, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

func (s *UserService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

func (s *UserService) UpdateLastLogin(id string) error {
	_, err := s.db.Exec(`UPDATE users SET last_login_time = $1 WHERE id = $2`, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	return nil
}

func (s *UserService) CheckUsernameExists(username string) (bool, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = $1`, username).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check username: %w", err)
	}
	return count > 0, nil
}

func (s *UserService) CheckEmailExists(email string) (bool, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM users WHERE email = $1`, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check email: %w", err)
	}
	return count > 0, nil
}