DB_URL=mysql://root:password@localhost:3306/accounts_app?sslmode=disable

createdb:
	docker run --name accounts_app -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=accounts_app -d -p 3306:3306 mysql

dropdb:
	docker stop accounts_app && docker rm accounts_app

.PHONY: createdb dropdb
