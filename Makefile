.PHONY: build run test clean docker-build docker-up docker-down

build:
	cd server && go build -o bin/server main.go

run:
	cd server && go run main.go

test:
	cd server && go test ./...

lint:
	cd server && golint ./... || go fmt ./...

clean:
	rm -rf server/bin
	cd client && rm -rf build

docker-build:
	docker build -t surveyking/server -f Dockerfile .
	docker build -t surveyking/client -f client/Dockerfile .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

db-init:
	go run scripts/init_db.go

install:
	cd server && go mod download
	cd client && npm install

dev:
	cd server && go run main.go & cd client && npm start

prod:
	docker-compose -f docker-compose.yml up -d --build