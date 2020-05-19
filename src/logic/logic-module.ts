import { ContainerModule, interfaces } from 'inversify';

import { AddCheMilestoneOnMergedPRLogic } from './add-che-milestone-on-merged-pr-logic';
import { AddStatusTriageLogic } from './add-status-triage';
import { AddWelcomeFirstIssueLogic } from './add-welcome-first-issue';
import { AddWelcomeFirstPRLogic } from './add-welcome-first-pr';
import { Logic } from '../api/logic';
import { RemoveLifeCycleStaleLogic } from './remove-lifecycle-stale-logic';
import { bindMultiInjectProvider } from '../api/multi-inject-provider';

const logicModule = new ContainerModule((bind: interfaces.Bind) => {
  bindMultiInjectProvider(bind, Logic);
  bind(Logic).to(AddCheMilestoneOnMergedPRLogic).inSingletonScope();
  bind(Logic).to(AddStatusTriageLogic).inSingletonScope();
  bind(Logic).to(AddWelcomeFirstIssueLogic).inSingletonScope();
  bind(Logic).to(AddWelcomeFirstPRLogic).inSingletonScope();
  bind(Logic).to(RemoveLifeCycleStaleLogic).inSingletonScope();
});

export { logicModule };
