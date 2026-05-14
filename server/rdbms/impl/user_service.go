package impl

import (
	"database/sql"
	"time"

	"github.com/surveyking/surveyking/server/rdbms/domain/model"
	"github.com/surveyking/surveyking/server/shared/core/utils"
	"github.com/surveyking/surveyking/server/shared/domain/dto"
)

type UserService struct {
	db *sql.DB
}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) Create(req *dto.RegisterRequest) (*model.User, error) {
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:        utils.GenerateUUID(),
		Username:  req.Username,
		Password:  hash,
		Email:     req.Email,
		Phone:     req.Phone,
		Nickname:  req.Nickname,
		Status:    1,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}

	_, err = s.db.Exec(
		`INSERT INTO users (id, username, password, email, phone, nickname, status, create_time, update_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		user.ID, user.Username, user.Password, user.Email, user.Phone, user.Nickname, user.Status, user.CreateTime, user.UpdateTime,
	)
	if err != nil {
		return nil, err
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
		return nil, err
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
		return nil, err
	}
	return user, nil
}

func (s *UserService) List(page, size int) ([]*model.User, int64, error) {
	offset := (page - 1) * size
	var total int64
	s.db.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&total)

	rows, err := s.db.Query(
		`SELECT id, username, email, phone, nickname, avatar, status, create_time, update_time, last_login_time
		FROM users ORDER BY create_time DESC LIMIT $1 OFFSET $2`, size, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		user := &model.User{}
		rows.Scan(&user.ID, &user.Username, &user.Email, &user.Phone, &user.Nickname, &user.Avatar, &user.Status, &user.CreateTime, &user.UpdateTime, &user.LastLoginTime)
		users = append(users, user)
	}
	return users, total, nil
}

func (s *UserService) Update(id string, req *dto.UpdateUserRequest) error {
	_, err := s.db.Exec(
		`UPDATE users SET nickname = $1, email = $2, phone = $3, avatar = $4, update_time = $5 WHERE id = $6`,
		req.Nickname, req.Email, req.Phone, req.Avatar, time.Now(), id,
	)
	return err
}

func (s *UserService) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM users WHERE id = $1`, id)
	return err
}

func (s *UserService) UpdateLastLogin(id string) error {
	_, err := s.db.Exec(`UPDATE users SET last_login_time = $1 WHERE id = $2`, time.Now(), id)
	return err
}