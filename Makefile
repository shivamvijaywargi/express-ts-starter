# May not work for windows, but you can check the commands from this file and copy paste them in your terminal
build:
	docker-compose -f docker-compose.yaml build

up-prod:
	docker-compose -f docker-compose.yaml up

up-dev:
	docker-compose -f docker-compose.dev.yaml up

down:
	docker-compose down

volume:
  docker volume inspect shivam-api-nginx_mongodb-data

logs:
  docker-compose logs
