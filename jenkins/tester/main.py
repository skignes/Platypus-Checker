#!/usr/bin/env python3

import argparse
import xml.etree.ElementTree as ET
import time
import json
import subprocess
import sys
import os


def parseArgs():
    parser = argparse.ArgumentParser(
        description="Run test somwhere"
    )
    parser.add_argument(
        '--repo',
        required=True,
        help='Path to the repository'
    )
    parser.add_argument(
        '--junit',
        required=True,
        help='Directory for the xml file for Junit'
    )
    parser.add_argument(
        '--log',
        required=True,
        help='Directory for the logs'
    )
    parser.add_argument(
        '--json',
        required=True,
        help='JSON file for the test'
    )
    args = parser.parse_args()

    return args


def checkJson(file):
    try:
        with open(file, 'r') as handle:
            parsed = json.load(handle)

        for exercise_name, exercise_data in parsed.items():
            if "build" not in exercise_data:
                print(f"[ERROR] - Exercise {exercise_name} is missing 'build' key.")
                sys.exit(1)

            if "tests" not in exercise_data or not isinstance(exercise_data["tests"], list):
                print(f"[ERROR] - Exercise {exercise_name} is missing 'tests' array.")
                sys.exit(1)

        return parsed
    except json.JSONDecodeError as e:
        print(f"[ERROR] - Failed to parse JSON file: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"[ERROR] - JSON file not found: {file}")
        sys.exit(1)


def junitReport(tests, file):
    testsuite = ET.Element('testsuite')
    testsuite.set('name', 'AllTests')
    testsuite.set('timestamp', time.strftime('%Y-%m-%dT%H:%M:%S'))

    passed = sum(1 for test in tests if test['result'] == 0)
    skipped = sum(1 for test in tests if test['result'] == 'skipped')
    total = len(tests)

    testsuite.set('tests', str(total))
    testsuite.set('failures', str(total - passed - skipped))
    testsuite.set('skipped', str(skipped))
    testsuite.set('errors', "0")

    functional_tests = [test_item for test_item in tests if test_item['category'] == 'tests']
    for functional_test in functional_tests:
        testcase = ET.SubElement(testsuite, 'testcase')
        testcase.set('name', functional_test['name'])
        testcase.set('classname', 'FunctionalTests')
        testcase.set('time', str(functional_test.get('time', 0)))

        if functional_test.get('actual_code') == 124:
            failure_element = ET.SubElement(testcase, 'failure')
            failure_element.set('type', 'Timeout')
            failure_element.set('message', 'Test timed out')
            continue

        if functional_test['result'] == 'skipped':
            skip = ET.SubElement(testcase, 'skipped')
            if 'skip_reason' in functional_test:
                skip.set('message', functional_test['skip_reason'])
            continue

        if functional_test['result'] != 0:
            failure_element = ET.SubElement(testcase, 'failure')
            failure_element.set('type', 'TestFailure')

            failure_message = "Test failed"
            expected = functional_test.get('expected_code')
            actual_code = functional_test.get('actual_code')
            if expected is not None and actual_code is not None:
                if actual_code != expected:
                    failure_message += f" with return code {actual_code}, expected {expected}"

            expected_output = functional_test.get('expected_output')
            stdout = functional_test.get('stdout', '').strip()
            if expected_output and expected_output != "*":
                failure_message += f". Expected output: '{expected_output}', got: '{stdout}'"

            failure_element.set('message', failure_message)

    testsuites = ET.Element('testsuites')
    testsuites.append(testsuite)

    tree = ET.ElementTree(testsuites)
    with open(file, 'wb') as f:
        f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
        tree.write(f, encoding='utf-8')


def execCmd(cmd, path, log_file=None, timeout=10):
    print(f"[INFO] - Running command: {cmd}")
    start_time = time.time()

    if timeout is not None:
        cmd = f"timeout {timeout}s {cmd}"

    process = subprocess.Popen(
        cmd,
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        shell=True,
        cwd=path
    )
    stdout, stderr = process.communicate()
    end_time = time.time()

    stdout_str = stdout.decode('utf-8', errors='replace')
    stderr_str = stderr.decode('utf-8', errors='replace')

    if log_file:
        with open(log_file, 'w') as f:
            f.write(f"COMMAND: {cmd}\n")
            f.write(f"STDOUT:\n{stdout_str}\n")
            f.write(f"STDERR:\n{stderr_str}\n")
            f.write(f"RETURN CODE: {process.returncode}\n")

    return {
        'stdout': stdout_str,
        'stderr': stderr_str,
        'returncode': process.returncode,
        'time': end_time - start_time
    }


def buildExercise(repo, exercise_name, exercise_config, log_dir):
    build_cmd = exercise_config['build']
    expected_code = int(exercise_config.get('return_code', 0))

    print(f"\n=== Building {exercise_name} ===")
    log_file = f"{log_dir}/build.log"
    result = execCmd(build_cmd, repo, log_file, None)

    build_passed = result['returncode'] == expected_code

    status = "PASSED" if build_passed else "FAILED"
    print(f"Build Result: {status}")
    print(f"Return Code: {result['returncode']}")
    print(f"Expected Return Code: {expected_code}")

    return build_passed


def runExerciseTests(repo, tests, exercise_name, tests_config, log_dir):
    if not tests_config:
        print(f"[WARNING] - No tests defined for {exercise_name}")
        return tests

    print(f"\n=== Running Tests for {exercise_name} ===")

    for test_info in tests_config:
        test_name = test_info.get('name', 'unnamed')
        category = test_info.get('category', 'uncategorized')
        print(f"[INFO] - Running test: {test_name} ({category})")

        command = test_info.get('command')
        if not command:
            print(f"[ERROR] - Skipping test {test_name}, no command specified")
            continue

        expected_output = test_info.get('output')
        grep_value = test_info.get('grep')
        expected_code = int(test_info.get('return', 0))
        std_type = test_info.get('std', 'stdout')
        timeout = test_info.get('timeout', 10)

        log_file = f"{log_dir}/{test_name}.log"
        result = execCmd(command, repo, log_file, timeout)

        output_to_check = result.get(std_type, "")

        if expected_output is not None:
            if expected_output == "*":
                output_match = True
            else:
                output_match = output_to_check == expected_output
        elif grep_value is not None:
            output_match = grep_value in output_to_check
        else:
            output_match = True

        return_code_match = result['returncode'] == expected_code
        test_passed = return_code_match and output_match

        full_test_name = f"{exercise_name}:{category}:{test_name}"

        tests.append({
            'name': full_test_name,
            'category': 'tests',
            'result': 0 if test_passed else 1,
            'stdout': result['stdout'],
            'stderr': result['stderr'],
            'time': result['time'],
            'expected_output': expected_output,
            'expected_code': expected_code,
            'actual_code': result['returncode'],
            'exact_match': True
        })

        status = "PASSED" if test_passed else "FAILED"
        print(f"  Test {test_name}: {status}")

        if not test_passed:
            if not return_code_match:
                print(f"    Return code mismatch: expected {expected_code}, got {result['returncode']}")
            if not output_match and expected_output is not None and expected_output != "*":
                print("    Output mismatch:")
                print(f"      Expected (from {std_type}): '{repr(expected_output)}'")
                print(f"      Got (from {std_type}):      '{repr(output_to_check)}'")

    return tests


def clean(args):
    if os.path.exists(args.repo):
        print("[INFO] - Restoring the repo to its original state.")
        restore_result = execCmd("git restore .", args.repo, None)
        if restore_result['returncode'] != 0:
            print(f"[ERROR] - Failed to restore repository: {restore_result['stderr']}")
            sys.exit(1)
        clean_result = execCmd("git clean -fd", args.repo, None)
        if clean_result['returncode'] != 0:
            print(f"[ERROR] - Failed to clean repository: {clean_result['stderr']}")
            sys.exit(0)


def main():
    args = parseArgs()
    config = checkJson(args.json)
    tests = []

    for name, exercise_config in config.items():
        print(f"\n====== Processing Exercise: {name} ======")

        build = buildExercise(args.repo, name, exercise_config, args.log)

        flattened_tests = []
        for tests_group in exercise_config.get('tests', []):
            if isinstance(tests_group, dict):
                for category, test_list in tests_group.items():
                    for test in test_list:
                        test['category'] = category
                        flattened_tests.append(test)
            else:
                flattened_tests.append(tests_group)

        if not build:
            print(f"[ERROR] - Build failed for {name}, skipping tests")
            for test in flattened_tests:
                test_name = test.get('name', 'unnamed')
                full_test_name = f"{name}:{test.get('category','uncategorized')}:{test_name}"
                tests.append({
                    'name': full_test_name,
                    'category': 'tests',
                    'result': 'skipped',
                    'skip_reason': f'Build failed for {name}, tests skipped',
                    'time': 0
                })
        else:
            if flattened_tests:
                tests = runExerciseTests(args.repo, tests, name, flattened_tests, args.log)
            else:
                print(f"[WARNING] - No tests found for {name}")

        print(f"\n[INFO] - Cleaning repository after {name}")
        clean(args)

    junit_file = f"{args.junit}/junit.xml"
    junitReport(tests, junit_file)

    tests_failed = any(test['category'] == 'tests' and test['result'] != 0 and test['result'] != 'skipped' for test in tests)
    if tests_failed:
        print("\n[WARNING] - Some tests failed, but continuing")


if __name__ == "__main__":
    main()
