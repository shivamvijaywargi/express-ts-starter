# May not work for windows, but you can check the commands from this file and copy paste them in your terminal
build:
	docker-compose -f docker-compose.yml build

up-prod:
	docker-compose -f docker-compose.yml up

up-dev:
	docker-compose -f docker-compose.dev.yml up

down:
	docker-compose down

volume:
  docker volume inspect shivam-api-nginx_mongodb-data
