import { ContainerModule, interfaces } from 'inversify';

import { AddCheMilestoneOnMergedPRLogic } from './add-che-milestone-on-merged-pr-logic';
import { AddKindFromLinkedIssuesLogic } from './add-kind-from-linked-issue';
import { AddStatusTriageLogic } from './add-status-triage';
import { AddWelcomeFirstIssueLogic } from './add-welcome-first-issue';
import { AddWelcomeFirstPRLogic } from './add-welcome-first-pr';
import { CronAddStaleIssuesLogic } from './cron-add-stale-issues';
import { CronCloseStaleIssuesLogic } from './cron-close-stale-issues';
import { Logic } from '../api/logic';
import { RemoveLifeCycleStaleLogic } from './remove-lifecycle-stale-logic';
import { ScheduleListener } from '../api/schedule-listener';
import { bindMultiInjectProvider } from '../api/multi-inject-provider';

const logicModule = new ContainerModule((bind: interfaces.Bind) => {
  bindMultiInjectProvider(bind, Logic);
  bind(Logic).to(AddCheMilestoneOnMergedPRLogic).inSingletonScope();
  bind(Logic).to(AddStatusTriageLogic).inSingletonScope();
  bind(Logic).to(AddWelcomeFirstIssueLogic).inSingletonScope();
  bind(Logic).to(AddWelcomeFirstPRLogic).inSingletonScope();
  bind(Logic).to(RemoveLifeCycleStaleLogic).inSingletonScope();
  bind(Logic).to(AddKindFromLinkedIssuesLogic).inSingletonScope();

  bind(CronAddStaleIssuesLogic).to(CronAddStaleIssuesLogic).inSingletonScope();
  bind(ScheduleListener).toService(CronAddStaleIssuesLogic);
  bind(Logic).toService(CronAddStaleIssuesLogic);

  bind(CronCloseStaleIssuesLogic).to(CronCloseStaleIssuesLogic).inSingletonScope();
  bind(ScheduleListener).toService(CronCloseStaleIssuesLogic);
  bind(Logic).toService(CronCloseStaleIssuesLogic);
});

export { logicModule };
