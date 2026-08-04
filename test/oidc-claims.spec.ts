import { UnauthorizedException } from '@nestjs/common'
import { toAuthenticatedUser } from '@/auth/oidc-claims'
import type { ClaimsPolicy } from '@/auth/oidc-claims'
import { Role, toRoles } from '@/auth/roles'
import type { CognitoAccessToken } from '@/common/types/authenticated-user'

const POLICY: ClaimsPolicy = {
  resourceServer: 'mkirell-portfolio-ms',
  allowedClientIds: ['console-client', 'ci-client'],
}

function token(overrides: Partial<CognitoAccessToken> = {}): CognitoAccessToken {
  return {
    sub: 'a3f1c0de-0000-4000-8000-000000000001',
    iss: 'https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_Ab12Cd34E',
    token_use: 'access',
    client_id: 'console-client',
    username: 'owner',
    ...overrides,
  }
}

describe('toRoles', () => {
  it('keeps only the roles this service enforces', () => {
    expect(toRoles(['admin', 'aws.cognito.signin.user.admin'])).toEqual([Role.Admin])
  })

  it('deduplicates roles arriving from both scopes and groups', () => {
    expect(toRoles(['admin', 'admin'])).toEqual([Role.Admin])
  })
})

describe('toAuthenticatedUser', () => {
  it('derives the admin role from a resource-server scope', () => {
    const user = toAuthenticatedUser(
      token({ scope: 'openid profile mkirell-portfolio-ms/admin' }),
      POLICY,
    )

    expect(user.roles).toEqual([Role.Admin])
    expect(user.id).toBe('a3f1c0de-0000-4000-8000-000000000001')
    expect(user.username).toBe('owner')
  })

  it('also accepts the role from a Cognito group', () => {
    const user = toAuthenticatedUser(token({ 'cognito:groups': ['admin'] }), POLICY)

    expect(user.roles).toEqual([Role.Admin])
  })

  it('ignores a scope belonging to another resource server', () => {
    const user = toAuthenticatedUser(token({ scope: 'some-other-ms/admin' }), POLICY)

    expect(user.roles).toEqual([])
  })

  it('ignores Cognito’s own reserved scopes', () => {
    const user = toAuthenticatedUser(
      token({ scope: 'aws.cognito.signin.user.admin openid' }),
      POLICY,
    )

    expect(user.roles).toEqual([])
  })

  it('grants nothing to a token with no scopes or groups', () => {
    expect(toAuthenticatedUser(token(), POLICY).roles).toEqual([])
  })

  it('rejects an id token presented as an access token', () => {
    expect(() => toAuthenticatedUser(token({ token_use: 'id' }), POLICY)).toThrow(
      UnauthorizedException,
    )
  })

  it('rejects a token minted for a client this service does not serve', () => {
    expect(() => toAuthenticatedUser(token({ client_id: 'someone-elses-app' }), POLICY)).toThrow(
      UnauthorizedException,
    )
  })

  it('rejects a token with no client_id when a client allowlist is configured', () => {
    expect(() => toAuthenticatedUser(token({ client_id: undefined }), POLICY)).toThrow(
      UnauthorizedException,
    )
  })

  it('skips the client check when no allowlist is configured', () => {
    const open = { resourceServer: 'mkirell-portfolio-ms', allowedClientIds: [] }

    expect(toAuthenticatedUser(token({ client_id: 'anything' }), open).id).toBe(
      'a3f1c0de-0000-4000-8000-000000000001',
    )
  })

  it('rejects a token with no subject', () => {
    expect(() => toAuthenticatedUser(token({ sub: '' }), POLICY)).toThrow(UnauthorizedException)
  })

  it('tolerates an access token without an email, as Cognito issues by default', () => {
    const user = toAuthenticatedUser(token(), POLICY)

    expect(user.email).toBeNull()
    expect(user.displayName).toBe('owner')
  })

  it('lowercases an email when a pre-token trigger supplies one', () => {
    const user = toAuthenticatedUser(token({ email: 'Owner@Example.COM' }), POLICY)

    expect(user.email).toBe('owner@example.com')
  })

  it('falls back to the subject when the token carries no username', () => {
    const user = toAuthenticatedUser(token({ username: undefined }), POLICY)

    expect(user.username).toBe('a3f1c0de-0000-4000-8000-000000000001')
  })

  it('defaults a missing picture to null', () => {
    expect(toAuthenticatedUser(token(), POLICY).picture).toBeNull()
  })
})
