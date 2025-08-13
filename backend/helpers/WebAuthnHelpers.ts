import type { WebAuthnCredential, WebAuthnContainer } from '../models/User.js'

export function setChallenge(container: WebAuthnContainer, challenge: string) {
  container.challenge = challenge
  container.expiration = new Date(Date.now() + 5 * 60 * 1000)
}

export function clearChallenge(container: WebAuthnContainer) {
  container.challenge = undefined
  container.expiration = undefined
}

export function findCredentialById(container: WebAuthnContainer, id: string) {
  return container.credentials.find((c: WebAuthnCredential) => c.id === id)
}

export function updateCredentialCounter(
  container: WebAuthnContainer,
  id: string,
  newCounter: number,
) {
  const credential = findCredentialById(container, id)
  if (credential) {
    credential.counter = newCounter
    credential.lastUsed = new Date()
  }
}

export function getActiveCredentials(container: any): WebAuthnCredential[] {
  return container.credentials ?? []
}
