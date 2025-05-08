folder('PSU') {
    displayName('PSU')
    description('Folder containing all the PSU project')
}

job('Seed') {
    description('Create a new test for every GitHub user')

    parameters {
        stringParam('GITHUB_NAME', '', 'GitHub repository owner/repo_name (e.g: "Epitech/cobra")')
        stringParam('DISPLAY_NAME', '', 'Display name for the job')
    }
    steps {
        dsl {
            text('''
                def username = GITHUB_NAME.split('/')[0]

                job("PSU/${DISPLAY_NAME}") {
                    properties {
                        githubProjectUrl("https://github.com/${GITHUB_NAME}")
                    }

                    scm {
                        git {
                            remote {
                                url("git@github.com:${GITHUB_NAME}.git")
                                credentials("your-credential-id")
                            }
                            extensions {
                                relativeTargetDirectory('repository')
                            }
                        }
                    }

                    wrappers {
                        preBuildCleanup()
                    }

                    steps {
                        shell('mkdir -p results logs')
                        shell("""#!/bin/bash
set -e
echo "[INFO] Running tests on repository: ${GITHUB_NAME}"
python3 "/var/jenkins_home/main.py" \\
    --repo="repository" \\
    --junit="results" \\
    --log="logs" \\
    --json="/opt/jenkins/json/ftrace.json"
""")
                    }

                    publishers {
                        archiveArtifacts {
                            pattern('results/*, logs/*')
                            allowEmpty(true)
                        }

                        archiveJunit('results/junit.xml') {
                            allowEmptyResults(true)
                            retainLongStdout(true)
                            healthScaleFactor(1.0)
                        }
                    }
                }
            ''')
        }
    }
}
