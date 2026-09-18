import { describe, expect, it } from 'vitest';

import { createProjectIntegrationScope, aetherGatewayScopeHeaders } from './integration-scope';

const memory = { tenantId: 'tenant-signalfoundry' };
const knowledge = {
  spaces: ['https://knowledge.example/spaces/shared'],
  projectSpacesEnabled: true,
  projectSpaceBaseUrl: 'https://knowledge.example/spaces/signalfoundry/projects',
};

describe('project integration scope', () => {
  it('derives stable external scopes from the trusted project identity', () => {
    const environment = {
      NODE_ENV: 'production',
      SIGNALFOUNDRY_AETHERGATEWAY_ORGANIZATION_ID: 'org_dave',
      SIGNALFOUNDRY_AETHERGATEWAY_PROJECT_ID: 'prj_signalfoundry',
      SIGNALFOUNDRY_AETHERGATEWAY_ENVIRONMENT_ID: 'env_prod',
    };
    const first = createProjectIntegrationScope({ projectId: 'project-a', memory, knowledge, environment });
    const replay = createProjectIntegrationScope({ projectId: 'project-a', memory, knowledge, environment });

    expect(first).toEqual(replay);
    expect(first.knowledge.requestedSpaceIds).toEqual([
      'https://knowledge.example/spaces/signalfoundry/projects/project-a',
      'https://knowledge.example/spaces/shared',
    ]);
    expect(first.scopeSha256).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(aetherGatewayScopeHeaders(first)).toMatchObject({
      'X-AetherGateway-Organization-Id': 'org_dave',
      'X-AetherGateway-Project-Id': 'prj_signalfoundry',
      'X-AetherGateway-Environment-Id': 'env_prod',
    });
  });

  it('keeps workspace knowledge partitions distinct while sharing the consumer boundary', () => {
    const first = createProjectIntegrationScope({ projectId: 'project-a', memory, knowledge });
    const second = createProjectIntegrationScope({ projectId: 'project-b', memory, knowledge });

    expect(first.memory.tenantId).toBe(second.memory.tenantId);
    expect(first.aetherGateway).toEqual(second.aetherGateway);
    expect(first.knowledge.projectSpaceId).not.toBe(second.knowledge.projectSpaceId);
    expect(first.scopeSha256).not.toBe(second.scopeSha256);
  });

  it('rejects malformed trusted scope configuration', () => {
    expect(() => createProjectIntegrationScope({
      projectId: 'project-a',
      memory,
      knowledge,
      environment: { SIGNALFOUNDRY_AETHERGATEWAY_PROJECT_ID: 'bad project' },
    })).toThrow('SIGNALFOUNDRY_AETHERGATEWAY_PROJECT_ID');
  });
});
