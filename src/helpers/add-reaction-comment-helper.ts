import { inject, injectable, named } from 'inversify';

import { Octokit } from '@octokit/rest';
import { IssueCommentInfo } from '../info/issue-comment-info';

export type ReactionType = "+1"
| "-1"
| "laugh"
| "confused"
| "heart"
| "hooray"
| "rocket"
| "eyes";

@injectable()
export class AddReactionCommentHelper {
  @inject(Octokit)
  @named('READ_TOKEN')
  private octokit: Octokit;

  public async addReaction(reaction: ReactionType, issueCommentInfo: IssueCommentInfo): Promise<void> {
    // if issue has not the label, do not trigger the removal
   // if (!issueCommentInfo.hasReaction(reaction)) {
   //   //console.log('not removing label as it is not present', labelToRemove);
   //   return;
   // }
    
    const reactionParams: Octokit.ReactionsCreateForIssueCommentParams = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      comment_id: issueCommentInfo.commentId,
      content: reaction,
      owner: issueCommentInfo.owner,
      repo: issueCommentInfo.repo
    }

    this.octokit.reactions.createForIssueComment(reactionParams);

 }
}
