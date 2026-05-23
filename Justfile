image := "orgmcr.or-gm.com/osmargm1202/dagendang:v2"
container := "dagendang-web"
network := "nginx_proxy_network"
port := "3010"

build:
    docker buildx build --load -t {{image}} -f Dockerfile .

push:
    docker buildx build --push -t {{image}} -f Dockerfile .

build-push: push

deploy host="osmarg@10.0.0.13" port=port:
    ssh {{host}} 'docker network inspect {{network}} >/dev/null 2>&1 || docker network create {{network}}'
    ssh {{host}} 'docker pull {{image}}'
    ssh {{host}} 'docker rm -f {{container}} >/dev/null 2>&1 || true'
    ssh {{host}} 'docker run -d --name {{container}} --restart unless-stopped --network {{network}} -p 127.0.0.1:{{port}}:3000 --env-file ~/Code/dagendang-web.env {{image}}'

logs host="osmarg@10.0.0.13":
    ssh {{host}} 'docker logs --tail=120 -f {{container}}'

ps host="osmarg@10.0.0.13":
    ssh {{host}} 'docker ps --filter name={{container}}'
