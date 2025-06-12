# Jenkins image
FROM jenkins/jenkins:latest

USER root

RUN apt-get update && \
    apt-get install -y neovim zsh build-essential libelf-dev && \
    apt-get clean

# Don't use the Setup Wizard
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

ENV TZ=Europe/Paris

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN rm -rf /var/jenkins_home/plugins/*

# Install Plugins
RUN jenkins-plugin-cli --plugins    \
    configuration-as-code:latest    \
    cloudbees-folder:latest         \
    credentials:latest              \
    github:latest                   \
    instance-identity:latest        \
    job-dsl:latest                  \
    script-security:latest          \
    structs:latest                  \
    role-strategy:latest            \
    dark-theme:latest               \
    ws-cleanup:latest               \
    pipeline-model-definition:latest \
    workflow-aggregator:latest      \
    junit:latest                    \
    echarts-api:latest              \
    pipeline-stage-view:latest      \
    dashboard-view:latest           \
    test-results-analyzer:latest    \
    cors-filter:latest

USER jenkins
