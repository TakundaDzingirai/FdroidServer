FdroidServer/
│
├── backend/
│   ├── repo/
│       ├── apks/
│       └── icons/
│           ├── carrion/
│               └── icon.png
│           ├── extirpater/
│               └── icon.png
│           ├── gmapswv/
│               ├── icon.png
│               └── maps.png
│           └── ...other icons
│   └── ...other folders for backend server
|....otherfiles like (*.sh)
│___dockerfile
├── docker-compose.yml
└── README.md



on you linux/ubuntu terminal inside FdroidServer (e.g /Desktop/FdroidServerRepo/FdroidServer$) run : docker-compose build
then run this command next: docker-compose up


and open new terminal and run docker ps to confirm all is up
