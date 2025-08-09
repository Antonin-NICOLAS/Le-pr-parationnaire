import type { WebAuthnCredential, IUser } from '../models/User.js'

export function setChallenge(user: IUser, challenge: string) {
  user.twoFactor.webauthn.challenge = challenge
  user.twoFactor.webauthn.expiration = new Date(Date.now() + 5 * 60 * 1000)
}

export function clearChallenge(user: IUser) {
  user.twoFactor.webauthn.challenge = undefined
  user.twoFactor.webauthn.expiration = undefined
}

export function findCredentialById(user: IUser, id: string) {
  return user.twoFactor.webauthn.credentials.find((c) => c.id === id)
}

export function updateCredentialCounter(
  user: IUser,
  id: string,
  newCounter: number,
) {
  const credential = findCredentialById(user, id)
  if (credential) {
    credential.counter = newCounter
    credential.lastUsed = new Date()
  }
}

export function getActiveCredentials(user: IUser): WebAuthnCredential[] {
  return user.twoFactor.webauthn.credentials ?? []
}
