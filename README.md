# windmail
<!--Идея-->
Новая концепция форумов -> Отзывчивость + Глубина. Realtime, современная база, гибкая система -> Структура + Динамизм.
концептуальная база.
1) Контроль открытости. Возможность сделать сообщество закрытым и расположить на собственном хостинге, чтобы ресурс затерялся в общем потоке интернета
и стал незаметен, что позволило бы поднять уровень открытости внутри сообщества, установить более тесные связи, повысить безопасность.
2) Самоуправление. Участники влияют на систему, причем изнутри программы, то есть организационные вопросы включены в приложение естественным образом. Предусмотрены специальные системные комнаты и опросы, система внесения изменений,
открытая для всех пользователей, специальная административная панель, на которой модераторы могут планировать работы, сообщать об обновлениях и 
голосовать за них, то есть согласовываться. Для администраторов открыт доступ к коду. Модераторы могут через админ-панель редактировать нюансы дизайна
и правила сообщества через форму, без навыков программирования.
3) Активность участников не отслеживается. Не встроены трекеры. Данные пользоваетелей не передаются во внешнюю среду. Не отображается онлайн-статус, за
исключением записи в админ-панели, где указывается время последнего входа, и это доступно только администратору.
4) Не применяются технологии умных рекомендаций, ии, самые популярные записи - это те, у которых более всего просмотров.
5) Возможность активировать систему автоудаления. Данные, с момента создания которых прошло определенное время, удаляются. Так система приобретает
динамизм и легкость.
6) Участники имеют информацию о системе, опубликованную в руководстве. Для модераторов открыты специальные разделы.
7) Высказывания независимы и равноценны - без ранжирования ответов и предусмотренных для этого оценок. Встроена альтернативная реакция "поблагодарить".
8) Отсутствуют встроенные механизмы монетизации.

<!--Установка-->
## Установка (Linux)
1. Клонирование репозитория 

`git clone https://github.com/maomail/windmail.git`

2. Переход в директорию и устанавливаем питона, виртуальное окружение

`sudo apt install -y build-essential libssl-dev libffi-dev python3-dev`
`cd windmail `
`python3 -m venv venv`
`source venv/bin/activate`
`pip install gunicorn`

3. Устанавливаем зависимости

`pip install -r requirements.txt`

4. Устанавлиаем и настраиваем gunicorn
/etc/systemd/system/gunicorn.service (его надо создать): 
```
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target
[Service]
User=root
WorkingDirectory=/var/www/windmail
ExecStart=/var/www/windmail/venv/bin/gunicorn --workers 5 --bind unix:/run/gunicorn.sock windmail.wsgi:application
[Install]
WantedBy=multi-user.target
```

/etc/systemd/system/gunicorn.socket:
```
[Unit]
Description=gunicorn socket
[Socket]
ListenStream=/run/gunicorn.sock
[Install]
WantedBy=sockets.target
```
Запишите файл settings.py как вам нужно.

```systemd-analyze verify gunicorn.service```
```sudo systemctl enable gunicorn```
```sudo systemctl start gunicorn {service gunicorn restart для обновления}```
```sudo systemctl status gunicorn <- статус должен быть running```
```sudo service nginx start {sudo systemctl restart nginx}```

5. Настроим вебсокеты с дафной
`apt install daphne`

/etc/systemd/system/daphne.service:

```
[Unit]
Description=WebSocket Daphne Service
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/var/www/WindMail_app
ExecStart=/var/www/WindMail_app/venv/bin/daphne -b 0.0.0.0 -p 7002 windmail.asgi:application  
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

`systemctl daemon-reload`
`systemctl start daphne.service`
`systemctl status daphne.service`

Настройки ASGI в settings.py для channels.
```
ASGI_APPLICATION = "windmail.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

6. База данных по умолчанию sqlite:
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Здесь вы можете получить стартовую базу.

7. Настройки почты в settings.py: 
```
EMAIL_HOST = "smtp.beget.com"
EMAIL_HOST_USER = "maomail@windmail.ru"
EMAIL_HOST_PASSWORD = "coupavankey111P@"
EMAIL_PORT = 465
EMAIL_USE_SSL = True
SERVER_EMAIL = "maomail@windmail.ru"
DEFAULT_FROM_EMAIL = "maomail@windmail.ru"
```

8. Также нужно запустить crontab, если мы хотим, чтобы периодически записи удалялись автоматически.
в settings.py добавить:
```
CRONJOBS = [
   ('10 * * * *', 'windmail.tasks.autodelete')
] # каждый день в 3 часа запускать автоудаление материалов
```
