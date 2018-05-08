# GHPR Report

Pulls a report of all the pull requests in repos your team cares about, and also a list of PRs your team has made in other projects within the organisation, in a format ready to paste into Slack.

## Example report

```
*:mega: Pull requests of the day*
- https://github.com/org/repo1/pull/123 (Add new feature) => 19 hours ago @Rod
- https://github.com/org/repo2/pull/456 (Refactor the process) => *:white_check_mark:×3* *:speech_balloon:×3* 3 days ago @Jane
- https://github.com/org/repo3/pull/789 (Do the stuff) => *:white_check_mark:×1* *:speech_balloon:×4* 4 days ago @Freddy
```

## Installation

1. Clone the repo
1. `cd ghpr-report`
1. `mv conf.json.example conf.json`
1. Update the file with your Github token, and your Github and Slack usernames.
1. Add more Github/Slack users, more repo names, and whatever text you want display alongside the pull request feedback stats.
1. `cd ghpr-report`

### Standard

Depends on having node and NPM/Yarn installed.

1. `npm install`
1. `npm start`

### Docker

Relies on Docker being installed.

1. `docker build -t bpr .`
1. `docker run --rm bpr`
