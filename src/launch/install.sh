#!/bin/bash

# Format
BOLD='\033[1m'
GREEN='\033[1;32m'
RED='\033[1;31m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parameter
CONTAINER_NAME="jenkins"
IMAGE_NAME="jenkins:jcasc"
HOST_PORT=8080
JENKINS_PORT=8080
CONFIG_FILE="../jenkins/casc.yml"
GROOVY_FILE="../jenkins/job_dsl.groovy"
BINARY_FOLDER="../binary/"
MAIN_TESTER="../tester/main.py"
JSON_FOLDER="../json/"

# Check if Docker is there
if ! docker info > /dev/null 2>&1; then
    echo -e "[${RED}KO${NC}] Docker is not running or not installed"
    exit 1
fi

# Remove all Jenkins containers
for container in $(docker ps -a -q --filter name=jenkins); do
    echo -e "[${BLUE}INFO${NC}] Stopping container $container"
    docker stop $container > /dev/null 2>&1
    echo -e "[${BLUE}INFO${NC}] Removing container $container"
    docker rm $container > /dev/null 2>&1
done

# Remove the Jenkins images
echo -e "[${BLUE}INFO${NC}] Removing all Jenkins images"
docker images | grep jenkins | awk '{print $3}' | xargs -r docker rmi -f > /dev/null 2>&1

# Remove all Docker volumes
echo -e "[${BLUE}INFO${NC}] Removing Docker volumes"
docker volume prune -f > /dev/null 2>&1

# Deep system prune
echo -e "[${BLUE}INFO${NC}] Deep cleanup of Docker system"
docker system prune -af > /dev/null 2>&1

echo -e "[${BLUE}INFO${NC}] Cleanup finished"

# Build the image
echo -e "[${BLUE}INFO${NC}] Building the Docker image"
docker build -t ${IMAGE_NAME} . > /dev/null 2>&1

# Check if the build is ok
if [ $? -ne 0 ]; then
    echo -e "[${RED}KO${NC}] Docker build failed."
    exit 1
else
    echo -e "[${GREEN}OK${NC}] Docker build Success."
fi

# Check if the config file is there
if [ ! -f "${CONFIG_FILE}" ]; then
    echo -e "[${RED}KO${NC}] Configuration file ${CONFIG_FILE} not found."
    exit 1
else
    echo -e "[${GREEN}OK${NC}] Configuration file ${CONFIG_FILE} found."
fi

echo -e "[${BLUE}INFO${NC}] Starting the container"

# Run the container
docker run -d                                                               \
    --name ${CONTAINER_NAME}                                                \
    -p ${HOST_PORT}:${JENKINS_PORT}                                         \
    -v $(realpath ${CONFIG_FILE}):/var/jenkins_home/casc_configs/casc.yaml  \
    -v $(realpath ${GROOVY_FILE}):/var/jenkins_home/job_dsl.groovy          \
    -v $(realpath ${BINARY_FOLDER}):/opt/jenkins/binary/                    \
    -v $(realpath ${JSON_FOLDER}):/opt/jenkins/json/                        \
    -v $(realpath ${MAIN_TESTER}):/var/jenkins_home/main.py                 \
    -e CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs                   \
    -e USER_ADMIN_PASSWORD=admin                                            \
    -e BINARY=/opt/jenkins/binary                                           \
    ${IMAGE_NAME} > /dev/null 2>&1

# Check if container started successfully
if [ $? -ne 0 ]; then
    echo -e "[${RED}KO${NC}] Failed to start the container"
    exit 1
else
    echo -e "[${GREEN}OK${NC}] Successfully started the container"
fi

echo -e "[${BLUE}INFO${NC}] Jenkins is starting"
echo -e "[${BLUE}INFO${NC}] You can access it at ${YELLOW}${BOLD}http://localhost:${HOST_PORT}${NC}"
echo -e "[${BLUE}INFO${NC}] To view logs: ${YELLOW}${BOLD}docker logs -f ${CONTAINER_NAME}${NC}"
echo -e "[${BLUE}INFO${NC}] To get a shell: ${YELLOW}${BOLD}docker exec -it ${CONTAINER_NAME} sh${NC}"
