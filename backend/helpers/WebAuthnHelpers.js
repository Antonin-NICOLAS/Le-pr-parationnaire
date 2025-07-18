const setChallenge = (user, challenge) => {
  user.twoFactor.webauthn.challenge = challenge
  user.twoFactor.webauthn.expiration = new Date(Date.now() + 5 * 60 * 1000) // 5 min expiration
}

const validateChallenge = (user, challenge) => {
  if (
    !user.twoFactor.webauthn.challenge ||
    !user.twoFactor.webauthn.expiration
  ) {
    return false
  }

  return (
    user.twoFactor.webauthn.challenge === challenge &&
    new Date(user.twoFactor.webauthn.expiration) > new Date()
  )
}

const clearChallenge = (user) => {
  user.twoFactor.webauthn.challenge = null
  user.twoFactor.webauthn.expiration = null
}

const findCredentialById = (user, credentialId) => {
  return user.twoFactor.webauthn.credentials.find(
    (cred) => cred.credentialId === credentialId,
  )
}

const normalizeCredentialId = (credentialId) => {
  return credentialId.replace(/\s+/g, '').toLowerCase()
}

const updateCredentialCounter = (user, credentialId, newCounter) => {
  const credential = findCredentialById(user, credentialId)
  if (credential) {
    credential.counter = newCounter
    credential.lastUsed = new Date()
  }
}

const getActiveCredentials = (user) => {
  if (!user.twoFactor || user.twoFactor.webauthn.credentials.length === 0) {
    return []
  }
  return user.twoFactor.webauthn.credentials.filter((cred) => !cred.revoked)
}

module.exports = {
  setChallenge,
  validateChallenge,
  clearChallenge,
  findCredentialById,
  normalizeCredentialId,
  updateCredentialCounter,
  getActiveCredentials,
}
