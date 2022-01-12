const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');

async function run() {
	await octokit.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: 'Thank you for submitting a pull request! We will try to review this as soon as we can.'
	  });
}

run();