FROM ubuntu:latest
RUN apt-get update
RUN apt-get install -y python3 python3-pip
ENV NODE_ENV=production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip3 install --upgrade pip
COPY . /app

RUN pip3 install -r requirements.txt
RUN python3 manage.py makemigrations hiketracking
RUN python3 manage.py migrate
RUN python3 manage.py loaddata db_population/data.json

EXPOSE 8000
