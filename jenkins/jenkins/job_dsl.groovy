job('Seed') {
    description('Create a new test for every GitHub user')

    parameters {
        stringParam('GITHUB_NAME', '', 'GitHub repository owner/repo_name (e.g: "Epitech/cobra")')
        stringParam('DISPLAY_NAME', '', 'Display name for the job')
        stringParam('DIRECTORY_NAME', '', 'Directory name for the directory the job will be')
        stringParam('JSON_FILE', '', 'Name of the json file (Ex : ftrace for the ftrace.json)')
    }
    steps {
        dsl {
            text('''
                def username = GITHUB_NAME.split('/')[0]

                folder("${DIRECTORY_NAME}") {
                    displayName("${DIRECTORY_NAME}")
                }

                job("${DIRECTORY_NAME}/${DISPLAY_NAME}") {
                    properties {
                        githubProjectUrl("https://github.com/${GITHUB_NAME}")
                    }

                    scm {
                        git {
                            remote {
                                url("git@github.com:${GITHUB_NAME}.git")
                                credentials("your-credential-id")
                            }
							branch('*/main')
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
    --json="$JSON/${JSON_FILE}.json"
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
