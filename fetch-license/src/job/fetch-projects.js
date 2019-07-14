const got = require("got");

const blacklist = require("./blacklist.json");
const whitelist = require("./whitelist.json");

function sortProjects(projects, getScore) {
  return projects.slice().sort((a, b) => (getScore(a) > getScore(b) ? -1 : 1));
}

function fetchAllProjects() {
  const url = "https://bestofjs-api-v3.firebaseapp.com/npm-projects.json";
  return got(url, { json: true })
    .then(r => r.body)
    .then(json => json.projects);
}

const limits = {
  trending: 1200,
  popular: 1200
};

async function fetchProjects() {
  const allProjects = await fetchAllProjects();
  const filteredProjects = allProjects
    .filter(project => !!project.npm)
    .filter(project => !blacklist.includes(project.npm));
  const popular = sortProjects(
    filteredProjects,
    project => project.stars
  ).slice(0, limits.popular);
  const trending = sortProjects(
    filteredProjects,
    project => project.trends.daily[0]
  ).slice(0, limits.trending);
  const featured = filteredProjects.filter(project =>
    whitelist.includes(project.npm)
  );
  return {
    popular,
    trending,
    featured
  };
}

module.exports = {
  fetchProjects
};
