import { IssueInfo } from './issue-info';
import { injectable } from 'inversify';

export class PullRequestInfo extends IssueInfo {
  private __merged: boolean;
  private __mergingBranch: string;

  public withMergedState(merged: boolean): PullRequestInfo {
    this.__merged = merged;
    return this;
  }

  public withMergingBranch(mergingBranch: string): PullRequestInfo {
    this.__mergingBranch = mergingBranch;
    return this;
  }

  public get mergingBranch(): string {
    return this.__mergingBranch;
  }

  public get merged(): boolean {
    return this.__merged;
  }
}

@injectable()
export class PullRequestInfoBuilder {
  build(): PullRequestInfo {
    return new PullRequestInfo();
  }
}
