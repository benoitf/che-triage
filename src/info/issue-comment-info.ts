import { IssueInfo } from './issue-info';
import { injectable } from 'inversify';

export class IssueCommentInfo extends IssueInfo {
  private __commentID: number;

  public withCommentId(commentID: number): this {
    this.__commentID = commentID;
    return this;
  }

  public get commentId(): number {
    return this.__commentID;
  }
}

@injectable()
export class IssueCommentInfoBuilder {
  build(): IssueCommentInfo {
    return new IssueCommentInfo();
  }
}
