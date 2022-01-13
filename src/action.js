const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const PR_TITLE_REGEX = core.getInput('PR_TITLE_REGEX');
const ERROR_MESSAGE = core.getInput('ERROR_MESSAGE') == '' ? 'Please make sure your pull request title follows the PR guidelines.' : core.getInput('ERROR_MESSAGE');

const octokit = github.getOctokit(GITHUB_TOKEN);

const {
	context = {}
} = github;
const {
	pull_request
} = context.payload;

async function run() {
	const pull_request = github.context.issue;
	const title_regex = new RegExp(PR_TITLE_REGEX);
	const title = github.context.payload.pull_request.title;

	console.log(`Title Regex: ${title_regex.source}`);
	console.log(`Title: ${title}`);
	console.log(`Error Message: ${ERROR_MESSAGE}`);


	const is_valid_title = title_regex.test(title);

	if (!is_valid_title) {
		createReview(ERROR_MESSAGE, pull_request);
		core.setFailed(ERROR_MESSAGE);
	} else {
		dismissReview(pull_request);
	}
}

function createReview(comment, pull_request) {
		
	octokit.rest.pulls.createReview({
		owner: pull_request.owner,
		repo: pull_request.repo,
		pull_number: pull_request.number,
		event: 'REQUEST_CHANGES',
		body: comment
	});
}

async function dismissReview(pull_request) {
	const reviews = await octokit.rest.pulls.listReviews({
		owner: pull_request.owner,
		repo: pull_request.repo,
		pull_number: pull_request.number,
	});

	reviews.data.forEach((review) => {
		if (
			review.user != null &&
			review.user.login == "github-actions[bot]" &&
			review.state == 'CHANGES_REQUESTED'
		) {
			void octokit.rest.pulls.dismissReview({
				owner: pull_request.owner,
				repo: pull_request.repo,
				pull_number: pull_request.number,
				review_id: review.id,
				message: 'Title matches the PR guidelines.',
			});
		}
	});
}

run().catch((error) => {
	core.setFailed(error);
});