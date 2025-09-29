# Jenkins image
FROM jenkins/jenkins:latest

USER root

RUN apt-get update &&   \
    apt-get install -y  \
    neovim zsh          \
    build-essential     \
    binutils            \
    clang               \
    gcc-x86-64-linux-gnu  \
    g++-x86-64-linux-gnu  \
    libelf-dev          \
    libgmp-dev          \
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

ENV PATH="/root/.ghcup/bin:/usr/local/bin:$PATH"

RUN ghcup install cabal 3.16.0.0 && \
    ghcup install ghc 9.8.4 && \
    ghcup install stack && \
    ghcup set 9.8.4 && \
    chmod +x /root/.ghcup/bin/stack && \
    chmod o+rx /root/.ghcup && \
    chmod o+rx /root/.ghcup/bin && \
    cp /root/.ghcup/bin/stack /usr/local/bin/stack && \
    chown root:root /usr/local/bin/stack && \
    chmod 755 /usr/local/bin/stack && \
    cp /root/.ghcup/bin/ghc /usr/local/bin/ghc && \
    chown root:root /usr/local/bin/ghc && \
    chmod 755 /usr/local/bin/ghc

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
