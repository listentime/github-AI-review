export type ChatGPTConfig = {
  apiKey?: string;
  model?: string;
  temperature?: number;
  top_p?: number;
  language?: string;
}

export type GithubConfig = {
  host: string;
  token: string;
  owner: string;
  repo: string;
  pullNumber: string | number;
  target?: RegExp;
}

export type GithubChange = {
  sha: string,
  filename: string,
  status: string,
  additions: number,
  deletions: number,
  changes: number,
  blob_url: string,
  raw_url: string,
  contents_url: string,
  patch: string
}