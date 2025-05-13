# se2-2022-02-HikeTracking
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)

## TL;DR + My role:
Web application developed to track hiking routes across Italy, built as part of an Agile software development course. Followed full Scrum methodology with sprint planning, retrospectives, and product demos every two weeks.
- Developed key frontend features in React, including user interface for hike selection and role-based access for hikers, local guides, and hut managers
- Wrote unit and integration tests to ensure component reliability and smooth feature rollout
- Contributed to retrospective documentation, working closely with teammates and professors acting as Product Owners
- Used YouTrack for sprint planning, backlog tracking, effort logging (12 hours/week per member), and agile board management
- Integrated SonarQube for detecting code smells and maintaining code quality across the project

## Table of Contents
- [Background](#background) 
- [Install](#install)
- [Usage](#usage)
- [Changelog](#changelog)
<!--- [Describe directory](#describedirectort)-->

## Background
This project is developed for Software engineering II course. In this course, we developed the project using agile software development.

## Install
Use following command to download the project:
```sh
$ git clone git@github.com:christiancagnazzo/se2022-02-HikeTracking.git
```
or you can directly download the file.   
  
## Usage   

### Docker

This installation uses docker as prerequisite. Run this conmand to install it:
```sh
$ curl -fsSL https://get.docker.com | bash -s docker
```

Copy the "docker-compose.yml" file in a folder and run:
```sh
$ docker compose pull
```
```sh
$ docker compose up
```

### Local

Clone the project and run:
```sh
$ cd server
$ pip install -r requirements.txt
$ python manage.py makemigrations hiketracking
$ python manage.py migrate  
$ python manage.py runserver
```
  
Then you need to open a new terminal and run the client:
```sh
$ cd client
$ npm install
$ npm start
```

To insert data to test the application run:
```sh
python manage.py loaddata db_population/data.json
```

HARD CODED USER
| Email        | Password | Role        |
|--------------|----------|-------------|
| "h@mail.com" | "1234"   | Hiker       |
| "g@mail.com" | "1234"   | Local Guide |
| "hw@mail.com" | "1234"   | HutWorker |
| "pm@mail.com" | "1234"   | PlatformManager |

To execute the code locally, it is necessary to create a file with the name 'key.py' in the 'server / server' folder and insert the following string 'key = APP_PASSWORD' with the password to access the mail service used to send the registration confirm email

### Demo4(09/01/2023)
- modify hikes and add pages about hike 
- add wealther alert and notification
- add record point
- add performance stats
### Demo3(12/12/2022)
- add recommend hikes
- add unit test
- Refactoring test
- add sonar-project
- add security check
### Demo2(28/11/2022)
- add requirement.txt
- add Retrospective
- fix bug and add some api
- introduce jinja template to Refactor code
### Demo1(14/11/2022)
- add user management
- add some pages
- add some api
- add docker file
- add test 
  
### Create project(04/11/2022)
