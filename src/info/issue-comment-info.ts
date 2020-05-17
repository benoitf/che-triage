import { IssueInfo } from './issue-info';

export class IssueCommentInfo extends IssueInfo {

    constructor(
        issueNumber: number,
        ownerName: string,
        repository: string,
        labels: string[],
        private commentID: number,
    ) {
        super(issueNumber, ownerName, repository, labels);
    }

    public get commentId(): number {
        return this.commentID;
    }
}
