# registry-curator

> Manage repositories of a private docker registry

## current features

- list repositories
- list tag of a repository
- delete tags of repository

## run as docker container

### copy and adjust environment file

```bash
cp .env.template .env
vi .env
```

### run container

```bash
docker run --rm -it -v /path/to/.env:/app/.env registry-curator
```
