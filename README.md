# Platypus Checker

Platypus Checker is a complete **Jenkins** setup designed to automate the process of testing and validating your project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Build With](#build-with)
- [Contributors](#contributors)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- A linux machine with **Docker** installed.
- Access to your code repository.

## Setup

1. Clone this repository to your local machine:
```bash
git clone https://github.com/skignes/Platypus-Checker
cd Platypus-Checker
```

2. Start the Jenkins instance using Docker:
```bash
docker compose up -d
```

3. Access Jenkins at `http://localhost:8080`:
    - The default password is `admin` for the user `admin`

4. Configure the pipeline:
    - Add your repository URL.
    - Set up any required environment variables.

5. Ensure all dependencies for your project are installed on the build agent.

## Usage

### SSH Key

To run the tests on your private repository you need to add a `ssh-key`. So to do so you need to run this command inside the docker :

```bash
# Go inside the docker
docker exec -it jenkins-platypus zsh
# Generate a new ssh key
ssh-keygen
```

Put the information you want.

When this is done you can now add this key to your **Github** account.

After you can now go into the [new credentials settings](http://localhost:8080/manage/credentials/store/system/domain/_/newCredentials) and add a new ssh key :

![Add SSH Key](img/ssh-key.jpg)

Now for each job in the settings of the build you can select the `credentials` to use for this repo and then you select your ssh-key.

You can build your private project now.

### Run the job

So to run the job you first need to **seed** it. To do so you need to go into the seed job at the root of the jenkins.
You can build it with the name you want for the new job (the one the check will be done on).
Then You can find this job in the `PSU` directory (because it is the default one) but this can be change.

When the job is build you will get a nice graph with the info if you :

- `passed`: The test was successfull
- `skipped`: The isn't even run cause the build failed
- `failed`: The test failed

![Test Result](img/test.jpg)

To see the **Github** repository there is a github button. You can click on it and it will redirect you to the repository.

On the **workspace** part there is the log of the tests runned. And also the repository when it was clone.

> [!CAUTION]
> The job will fail if the repo just got created.

## Build With

This project is built with:

- [![Jenkins](https://img.shields.io/badge/Jenkins-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io)
- [![Docker](https://img.shields.io/badge/Docker-blue?logo=docker&logoColor=white)](https://www.docker.com)
- [![Python](https://img.shields.io/badge/Python-306998?logo=python&logoColor=FFD43B)](https://www.python.org)

## Contributors

| Contributor | GitHub Profile |
|-------------|---------------|
| <img src="https://avatars.githubusercontent.com/u/116216779?v=4" width="100" alt="Nicolas"> | [Skignes](https://github.com/skignes) |
| <img src="https://avatars.githubusercontent.com/u/146029080?v=4" width="100" alt="Ulysse"> | [lg-epitech](https://github.com/lg-epitech) |

## Contributing

We welcome contributions! Please follow these guidelines:

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for your commit messages.
    - For **new features**:

        ```bash
        feat(scope): description
        ```
        <sub>Example:</sub>
        ```bash
        feat(corewar): add corewar test
        ```

    - For **bug fixes**:

        ```bash
        fix(scope): description
        ```
        <sub>Example:</sub>
        ```bash
        fix(build): resolve Dockerfile path issue
        ```

Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
