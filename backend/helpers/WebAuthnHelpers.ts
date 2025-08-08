import type { WebAuthnCredential } from '../models/User'

type UserWithWebauthn = {
  twoFactor: {
    webauthn: {
      challenge?: string
      expiration?: Date
      credentials: WebAuthnCredential[]
    }
  }
}

export function setChallenge(user: UserWithWebauthn, challenge: string) {
  user.twoFactor.webauthn.challenge = challenge
  user.twoFactor.webauthn.expiration = new Date(Date.now() + 5 * 60 * 1000)
}

export function clearChallenge(user: UserWithWebauthn) {
  user.twoFactor.webauthn.challenge = undefined
  user.twoFactor.webauthn.expiration = undefined
}

export function findCredentialById(user: UserWithWebauthn, id: string) {
  return user.twoFactor.webauthn.credentials.find((c) => c.id === id)
}

export function updateCredentialCounter(
  user: UserWithWebauthn,
  id: string,
  newCounter: number,
) {
  const credential = findCredentialById(user, id)
  if (credential) {
    credential.counter = newCounter
    credential.lastUsed = new Date()
  }
}

export function getActiveCredentials(
  user: UserWithWebauthn,
): WebAuthnCredential[] {
  return user.twoFactor.webauthn.credentials ?? []
}
