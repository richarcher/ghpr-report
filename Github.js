const request = require("request-promise");
const ReportBuilder = require("./ReportBuilder");

const REVIEW_STATUS = {
  approved: "APPROVED",
  commented: "COMMENTED",
  changes_requested: "CHANGES_REQUESTED"
};

module.exports = function(config) {
  const { token, organisation, team_repositories, team_members, platform } = config;

  const getOrgRepos = function() {
    return request({
      method: "GET",
      uri: `https://api.github.com/search/repositories?q=org:${organisation}&per_page=100`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Pull requester"
      }
    }).then(function(response) {
      return response.items.map(repo => ({
        name: repo.name,
        owner: repo.owner.login
      }));
    });
  };

  const getRepoPRs = function(repo) {
    return request({
      method: "GET",
      uri: `https://api.github.com/repos/${repo.owner}/${repo.name}/pulls`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Pull requester"
      }
    }).then(function(response) {
      return response.map(pr => ({
        repo: repo.name,
        html_url: pr.html_url,
        title: pr.title,
        user: {
          login: pr.user.login
        },
        created_at: pr.created_at,
        statuses_url: pr.statuses_url,
        labels: pr.labels,
        reviews_url: `https://api.github.com/repos/${repo.owner}/${
          repo.name
        }/pulls/${pr.number}/reviews`
      }));
    });
  };

  const flatten = function(array) {
    if (array.length == 0) return array;
    return array.reduce((a, b) => a.concat(b));
  };

  const scrumTeamRepo = function(repo) {
    let importantRepos = team_repositories.includes(repo.repo) || Object.keys(team_members).includes(repo.user.login);
    return importantRepos;
  };

  const getReviews = function(repo) {
    return request({
      method: "GET",
      uri: repo.reviews_url,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Pull requester"
      }
    }).then(function(response) {
      repo.review_state = response.map(function(a) {
        return a.state;
      });
      return repo;
    });
  };

  const nonScrumTeamDevs = function(repo) {
    return (
      (repo.repo === platform &&
        Object.keys(team_members).includes(repo.user.login)) ||
      repo.repo !== platform
    );
  };

  const getStatuses = function(repo) {
    return request({
      method: "GET",
      uri: repo.statuses_url,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Pull requester"
      }
    }).then(function(response) {
      repo.statuses = response.map(status => ({
        state: status.state,
        context: status.context
      }));
      return repo;
    });
  };

  this.report = function() {
    return getOrgRepos()
      .map(getRepoPRs)
      .then(flatten)
      .filter(scrumTeamRepo)
      .map(getReviews)
      .filter(nonScrumTeamDevs)
      .map(getStatuses)
      .map(new ReportBuilder(config).report);
  };
};
