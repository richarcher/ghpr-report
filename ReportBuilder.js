module.exports = function(config) {
  const { team_members, statuses } = config;

  const DURATION_IN_SECONDS = {
    epochs: ["month", "day", "hour", "minute"],
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  const reviewState = function(reviews) {
    let uniqueReviews = countUniqueReviews(reviews);
    return Object.keys(uniqueReviews)
      .sort()
      .reduce((accumulator, currentValue, currentIndex) => {
        return `${accumulator}*${statusLookup(currentValue)}×${uniqueReviews[currentValue]}* `;
      }, " ");
  };

  const timeSinceDate = function(date) {
    let seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let duration = getDuration(seconds);
    let suffix = duration.interval > 1 || duration.interval === 0 ? "s" : "";
    return duration.interval + " " + duration.epoch + suffix;
  };

  const teamMemberLookup = function(user) {
    if (team_members[user]) {
      return team_members[user].slack_username;
    }
    return user;
  };

  const getDuration = function(seconds) {
    let epoch, interval;
    for (let i = 0; i < DURATION_IN_SECONDS.epochs.length; i++) {
      epoch = DURATION_IN_SECONDS.epochs[i];
      interval = Math.floor(seconds / DURATION_IN_SECONDS[epoch]);
      if (interval >= 1) {
        return { interval: interval, epoch: epoch };
      }
    }
  };

  const countUniqueReviews = function(reviews) {
    return reviews.reduce(function(accumulator, currentValue, _currentIndex) {
      accumulator[currentValue] = accumulator[currentValue] + 1 || 1;
      return accumulator;
    }, {});
  };

  const statusLookup = function(status) {
    return statuses[status];
  };

  this.report = function(repo) {
    let { html_url, title, user, created_at, review_state } = repo;
    return `- ${html_url} (${title}) =>${reviewState(review_state)}${timeSinceDate(created_at)} ago @${teamMemberLookup(user.login)}`;
  };
}