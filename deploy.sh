#pull image
#gcloud auth print-access-token | sudo docker login -u oauth2accesstoken --password-stdin https://us.gcr.io

sudo docker pull us.gcr.io/megansburfday/megansappui

sudo docker run -p 443:443 -p 80:80 --add-host=host.docker.internal:host-gateway us.gcr.io/megansburfday/megansappui:latest

##backend
sudo docker pull us.gcr.io/megansburfday/megansappbackend

sudo docker run -p 8000:8000  --add-host=host.docker.internal:host-gateway us.gcr.io/megansburfday/megansappbackend:latest

##redis
sudo docker pull redis

sudo docker run  --add-host=host.docker.internal:host-gateway -p 6379:6379 redis:latest




