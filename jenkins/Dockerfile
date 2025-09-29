# Jenkins image
FROM jenkins/jenkins:latest

USER root

RUN apt-get update &&   \
    apt-get install -y  \
    neovim zsh          \
    build-essential     \
    libelf-dev          \
    bash                \
    curl                \
    git                 \
    make                \
    m4                  \
    gcc                 \
    g++                 \
    ocaml               \
    ocaml-compiler-libs \
    opam                \
    findutils           \
    binutils-gold       \
    libc-dev            \
    libffi-dev          \
    musl-dev            \
    ncurses-dev         \
    perl                \
    tar                 \
    && apt-get clean

RUN curl -L https://downloads.haskell.org/~ghcup/x86_64-linux-ghcup -o /usr/bin/ghcup && \
    chmod +x /usr/bin/ghcup

ENV PATH="$HOME/.cabal/bin:$HOME/.ghcup/bin:$PATH"

RUN ghcup install cabal 3.16.0.0 && \
    ghcup install ghc 9.8.4 && \
    ghcup install stack && \
    ghcup set 9.8.4

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
