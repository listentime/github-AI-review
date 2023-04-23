import Github from "./controller/githubController";
const githubConfig = {
  host:'https://api.github.com',
  token:'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',
  owner:'listentime',
  repo:'topline-mobile',
  pullNumber:'3'
}
const github = new Github(githubConfig)
github.getChanges()