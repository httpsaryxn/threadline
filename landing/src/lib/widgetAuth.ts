export const INVALID_WIDGET_CONFIG_MESSAGE =
  'Invalid ThreadLine configuration. Please contact your administrator.';

type MaybeBody = Record<string, unknown> | undefined;

function parseApiKeyMap() {
  const raw = process.env.THREADLINE_API_KEYS_JSON;
  if (!raw) return {} as Record<string, string>;

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed ?? {};
  } catch {
    return {} as Record<string, string>;
  }
}

export function extractWidgetCredentials(request: Request, body?: MaybeBody) {
  const headerOrgId = request.headers.get('x-threadline-org-id') ?? request.headers.get('x-org-id');
  const headerApiKey = request.headers.get('x-threadline-api-key') ?? request.headers.get('x-api-key');

  const bodyOrgId =
    typeof body?.orgId === 'string'
      ? body.orgId
      : typeof body?.org_id === 'string'
        ? body.org_id
        : undefined;

  const bodyApiKey =
    typeof body?.apiKey === 'string'
      ? body.apiKey
      : typeof body?.api_key === 'string'
        ? body.api_key
        : undefined;

  return {
    orgId: headerOrgId ?? bodyOrgId,
    apiKey: headerApiKey ?? bodyApiKey,
  };
}

export function validateWidgetCredentials(orgId?: string | null, apiKey?: string | null) {
  if (!orgId || !apiKey) {
    return { ok: false as const, status: 401, message: INVALID_WIDGET_CONFIG_MESSAGE };
  }

  const apiKeyMap = parseApiKeyMap();
  const expectedFromMap = apiKeyMap[orgId];

  if (expectedFromMap) {
    return expectedFromMap === apiKey
      ? { ok: true as const }
      : { ok: false as const, status: 401, message: INVALID_WIDGET_CONFIG_MESSAGE };
  }

  const fallbackOrg = process.env.THREADLINE_ORG_ID;
  const fallbackKey = process.env.THREADLINE_API_KEY;

  if (fallbackOrg && fallbackKey) {
    return fallbackOrg === orgId && fallbackKey === apiKey
      ? { ok: true as const }
      : { ok: false as const, status: 401, message: INVALID_WIDGET_CONFIG_MESSAGE };
  }

  return {
    ok: false as const,
    status: 500,
    message: 'ThreadLine server is missing API key configuration.',
  };
}
