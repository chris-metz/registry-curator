# registry-curator

> Manage repositories of a private docker registry

## current features

- list repositories
- list tags of a repository
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

## hint

This tool only issues HTTP commands to a docker registry. In order to really delete physical files and free disk space a garbage collection must be run.

Here's an example running garbage collection of a registry running in a kubernetes cluster:

```bash
# get the name of the pod
PODNAME=`kubectl get pods --no-headers -o custom-columns=":metadata.name" -l 'app=registry'`
# dry-run to preview execution
kubectl exec $PODNAME -- registry garbage-collect --dry-run /etc/config.yml
# issue garbage collection
kubectl exec $PODNAME -- registry garbage-collect /etc/config.yml
```
