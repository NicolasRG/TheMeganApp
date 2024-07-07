#gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://us.gcr.io

cd middleware

docker buildx build --platform linux/amd64 -t us.gcr.io/megansburfday/megansappui .

cd ..

cd meganappbackend

docker push us.gcr.io/megansburfday/megansappui

docker buildx build --platform linux/amd64 -t us.gcr.io/megansburfday/megansappbackend .

docker push us.gcr.io/megansburfday/megansappbackend