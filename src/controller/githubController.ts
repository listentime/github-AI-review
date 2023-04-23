import createRequest from "../utils/request";
import { logger } from "../utils/utils";
import type { AxiosInstance } from "axios";
import type { GithubConfig, GithubChange } from "@/types/types";
import consola from "consola";

const parseLastDiff = (diff: string) => {
  const diffList = diff.split('\n').reverse();
  const lastLineFirstChar = diffList?.[1]?.[0];
  // 获取两次提交之间的位置变更信息
  const lastDiff =
    diffList.find((item) => {
      return /^@@ \-\d+,\d+ \+\d+,\d+ @@/g.test(item);
    }) || '';

  // 将变更信息替换为数字
  const [lastOldLineCount, lastNewLineCount] = lastDiff
    .replace(/@@ \-(\d+),(\d+) \+(\d+),(\d+) @@.*/g, ($0, $1, $2, $3, $4) => {
      return `${+$1 + +$2},${+$3 + +$4}`;
    })
    .split(',');

  if (!/^\d+$/.test(lastOldLineCount) || !/^\d+$/.test(lastNewLineCount)) {
    return {
      lastOldLine: -1,
      lastNewLine: -1,
    };
  }

  const lastOldLine = lastLineFirstChar === '+' ? -1 : (parseInt(lastOldLineCount) || 0) - 1;
  const lastNewLine = lastLineFirstChar === '-' ? -1 : (parseInt(lastNewLineCount) || 0) - 1;

  return {
    lastOldLine,
    lastNewLine,
  };
}

export default class Github {

  private owner: string; // 仓库所有者名称
  private repo: string; // 仓库名称
  private pullNumber: string | number // Merge Request 的编号
  // private token:string; // github token
  private request: AxiosInstance
  private target: RegExp; // 正则，对哪些后缀的文件进行review

  constructor({ host, token, owner, repo, pullNumber, target }: GithubConfig) {
    this.request = createRequest(host, {
      headers: {
        Authorization: `Token ${token}`
      }
    });
    this.owner = owner;
    this.repo = repo;
    this.pullNumber = pullNumber;
    this.target = target || /\.(j|t)sx?｜vue|html$/;

  }

  // 获取改变的文件
  getChanges() {
    // https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests-files
    return this.request
      .get(`/repos/${this.owner}/${this.repo}/pulls/${this.pullNumber}/files`)
      .then((res) => {
        let codeChange: GithubChange[];
        codeChange = res.data.filter((item: GithubChange) => {
          if (item.status !== 'modified') {
            return false;
          }
          if (!this.target.test(item.filename)) {
            return false;
          }
          return true;
        }).map((item: GithubChange) => {
          const { lastOldLine, lastNewLine } = parseLastDiff(item.patch);
          return { ...item, lastNewLine, lastOldLine };
        })
        return {
          state:res.data.status,
          changes:codeChange,
          ref:res.data.// ⚠️ TODO...
        }
      }).catch((error) => {
        logger.error(error)
        return {
          state: '',
          changes: [],
          ref: {},
        };
      })
  }

}