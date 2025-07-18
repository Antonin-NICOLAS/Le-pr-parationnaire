const User = require('../models/User')
const { generateBackupCodes } = require('../helpers/2FAHelpers')
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server')
const {
  isoBase64URL,
  isoUint8Array,
} = require('@simplewebauthn/server/helpers')
const {
  setChallenge,
  getActiveCredentials,
  validateChallenge,
  clearChallenge,
  findCredentialById,
  updateCredentialCounter,
} = require('../helpers/WebAuthnHelpers')

// Configuration WebAuthn
const rpName = 'Le préparationnaire'
const rpID = process.env.DOMAIN
const PORT = 5173
const origin =
  process.env.NODE_ENV === 'production'
    ? `https://${rpID}`
    : `http://${rpID}:${PORT}`

// Générer les options d'enregistrement
const generateRegistrationOpt = async (req, res) => {
  try {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Récupérer les clés d'authentification existantes
    const activeCredentials = getActiveCredentials(user)

    // 3. On génère la nouvelle clé d'enregistrement en excluant les clés existantes
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: isoUint8Array.fromUTF8String(user._id.toString()),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: activeCredentials.map((passkey) => ({
        id: isoBase64URL.toBuffer(passkey.credentialId),
        type: 'public-key',
        transports: passkey.transports || [],
      })),
      authenticatorSelection: {
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      extensions: {
        credProps: true,
      },
    })

    // 4. Stockage du challenge temporaire
    setChallenge(user, options.challenge)
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.registration_options_generated'),
      data: { options },
    })
  } catch (error) {
    const { t } = req
    console.error('Erreur génération options enregistrement:', error)
    return res.status(500).json({
      success: false,
      error: t('auth.errors.webauthn.registration_options_error'),
    })
  }
}


// Vérifier la réponse d'enregistrement
const verifyRegistration = async (req, res) => {
  try {
    const { attestationResponse, deviceName } = req.body
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si la réponse d'enregistrement est valide
    if (!attestationResponse) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.registration_response_error'),
      })
    }

    // 3. Vérifier si le challenge est valide
    if (!validateChallenge(user, attestationResponse.challenge)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.challenge_expired'),
      })
    }

    console.log(
      user.twoFactor.challenge,
      attestationResponse.challenge,
      'Vérification du challenge:',
      user.twoFactor.challenge === attestationResponse.challenge,
    )

    // 4. Vérifier et décoder la réponse d'enregistrement
    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: user.twoFactor.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      })
    } catch (error) {
      console.error('Erreur vérification:', error)
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.challenge_expired'),
      })
    }

    const { verified, registrationInfo } = verification

    // 5. Si la vérification est réussie, on ajoute la nouvelle clé d'authentification
    if (verified && registrationInfo) {
      const { credential } = registrationInfo

      const deviceType = attestationResponse.extensions?.credProps?.rk
        ? 'security-key'
        : 'platform'

      const newCredential = {
        credentialId: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter || 0,
        transports: attestationResponse.transports || [],
        deviceType,
        deviceName: deviceName || 'Unknown Device',
        createdAt: new Date(),
        lastUsed: null
      }

      user.twoFactor.webauthn.credentials.push(newCredential)

      // 6. On supprime le challenge temporaire
      clearChallenge(user)

      // 7. On active la méthode WebAuthn si ce n'est pas déjà fait
      if (!user.twoFactor.webauthn.isEnabled) {
        user.twoFactor.webauthn.isEnabled = true
      }

      user.twoFactor.lastVerified = new Date()

      // 8. Si webauthn est la première méthode 2FA, on génère des codes de sauvegarde ou certains sont utilisés, on les remplace

      if (!user.twoFactor.backupCodes || user.twoFactor.backupCodes.length === 0) {
        user.twoFactor.backupCodes = generateBackupCodes(8)
      } else {

        const unusedCodes = user.twoFactor.backupCodes.filter(code => !code.used)
        const codesToGenerate = 8 - unusedCodes.length

        if (codesToGenerate > 0) {
          const newCodes = generateBackupCodes(codesToGenerate)
          user.twoFactor.backupCodes = [...unusedCodes, ...newCodes]
        }
      }

      // 9. Si webauthn est la première méthode 2FA activée, on la définit comme méthode préférée
      if (!user.twoFactor.preferredMethod) {
        user.twoFactor.preferredMethod = 'webauthn'
      }

      await user.save()

      const devices = user.twoFactor.webauthn.credentials
        .map((cred) => ({
          id: cred.credentialId,
          deviceType: cred.deviceType,
          deviceName: cred.deviceName,
          lastUsed: cred.lastUsed,
          createdAt: cred.createdAt,
        }))

      // 10. On envoie la réponse avec les clés actives, la méthode  oréférée et les codes de sauvegarde
      return res.status(200).json({
        success: true,
        message: t('auth:success.webauthn.registration_response_successful'),
        data: {
          devices,
          preferredMethod: user.twoFactor.preferredMethod,
          backupCodes: user.twoFactor.backupCodes,
        },
      })
    } else {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.registration_failed'),
      })
    }
  } catch (error) {
    const { t } = req
    console.error('Erreur vérification enregistrement:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.webauthn.registration_error'),
    })
  }
}

// Générer les options d'authentification
const generateAuthenticationOpt = async (req, res) => {
  try {
    const { email } = req.body
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    if ( !email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.invalid_email'),
      })
    }
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si l'utilisateur a activé WebAuthn
    if (!user.twoFactor.webauthn.isEnabled || user.twoFactor.webauthn.credentials.length === 0) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.not_enabled'),
      })
    }

    // 3. On génère les options d'authentification
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.twoFactor.webauthn.credentials.map((cred) => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
    })

    // 4. On stocke le challenge temporaire
    setChallenge(user, options.challenge)
    await user.save()
    console.log('Challenge stocké:', user.twoFactor.challenge)

    return res.status(200).json({
      success: true,
      message: t('auth:success.registration_options_generated'),
      data: { options },
    })
  } catch (error) {
    console.error('Erreur génération options auth:', error)
    return res.status(500).json({
      success: false,
      error: t('auth.errors.webauthn.registration_options_error'),
    })
  }
}

// Vérifier la réponse d'authentification
const verifyAuthentication = async ({ responsekey, user, res }) => {
  try {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    console.log("Réponse d'authentification reçue:", responsekey)
    console.log(responsekey.challenge)

    // 2. Vérifier le challenge
    if (!validateChallenge(user, responsekey.challenge)) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.challenge_expired'),
      })
    }

    const credentialId = responsekey.id
    const dbCredential = findCredentialById(user, credentialId)

    // 3. Vérifier si la clé existe
    if (!dbCredential) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.credential_not_found'),
      })
    }

    // 4. Conversion critique des données
    const authenticator = {
      id: dbCredential.credentialId,
      publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
      counter: Number(dbCredential.counter),
      transports: dbCredential.transports || [],
    }

    // 5. Vérifier la réponse d'authentification
    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: responsekey,
        expectedChallenge: user.twoFactor.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: authenticator,
      })
    } catch (error) {
      console.error("Détails de l'erreur:", {
        error: error.message,
        stack: error.stack,
      })
      return sendLocalizedError(
        res,
        400,
        'errors.webauthn.authentication_failed',
      )
    }

    // 6. Si la vérification est réussie, on met à jour le compteur et on supprime le challenge
    if (verification.verified) {
      updateCredentialCounter(
        user,
        credentialId,
        verification.authenticationInfo.newCounter,
      )
      clearChallenge(user)
      await user.save()

      return {
        verified: true,
        credentialId,
        deviceType: dbCredential.deviceType,
      }
    } else {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.authentication'),
      })
    }
  } catch (error) {
    console.error('Erreur complète:', {
      message: error.message,
      stack: error.stack,
      raw: error,
    })
    return res.status(500).json({
      success: false,
      error: t('auth:errors.webauthn.authentication'),
    })
  }
}

// Supprimer une clé WebAuthn
const removeWebAuthnCredential = async (req, res) => {
  try {
    const { credentialId } = req.params
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si l'utilisateur a activé WebAuthn
    if (!user.twoFactor.webauthn.isEnabled || user.twoFactor.webauthn.credentials.length === 0) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.not_enabled'),
      })
    }

    // 3. Vérifier si la clé demandée existe
    const credentialIndex = user.twoFactor.webauthn.credentials.findIndex(
      (cred) => cred.id === credentialId,
    )

    if (credentialIndex === -1) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.webauthn.credential_not_found'),
      })
    }

    // 4. Supprimer la clé
    user.twoFactor.webauthn.credentials.splice(credentialIndex, 1)

    // 5. Si aucune clé WebAuthn n'est restante, on désactive WebAuthn
    if (user.twoFactor.webauthn.credentials.length === 0) {
      user.twoFactor.webauthn.isEnabled = false

      // 6. Si WebAuthn est la méthode préférée, on la remplace par la méthode suivante disponible
      if (user.twoFactor.preferredMethod === 'webauthn') {
        user.twoFactor.preferredMethod = user.twoFactor.app.isEnabled
          ? 'app'
          : user.twoFactor.email.isEnabled
            ? 'email'
            : undefined
      }

      // 7. Si aucune autre méthode n'est disponible, on supprime les codes de sauvegarde
      if (!user.twoFactor.app.isEnabled && !user.twoFactor.email.isEnabled) {
        user.twoFactor = {
          backupCodes: [],
          lastVerified: null,
        }
      }
    }
    await user.save()

    return res.status(200).json({
      success: true,
      message: t('auth:success.webauthn.credential_removed'),
      data: {
        devices: user.twoFactor.webauthn.credentials.map((cred) => ({
          id: cred.credentialId,
          deviceType: cred.deviceType,
          deviceName: cred.deviceName,
          lastUsed: cred.lastUsed,
          createdAt: cred.createdAt,
        })),
        preferredMethod: user.twoFactor.preferredMethod,
        backupCodes: user.twoFactor.backupCodes,
      },
    })
  } catch (error) {
    const { t } = req
    console.error('Erreur lors de la suppression de la clé WebAuthn:', error)
    return res.status(500).json({
      success: false,
      error: t('auth:errors.webauthn.credential_removal'),
    })
  }
}

const getWebAuthnDevices = async (req, res) => {
  try {
    const { t } = req

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: t('auth:errors.user_not_found'),
      })
    }

    // 2. Vérifier si l'utilisateur a activé WebAuthn
    if (!user.twoFactor.webauthn.isEnabled || user.twoFactor.webauthn.credentials.length === 0) {
      return res.status(400).json({
        success: false,
        error: t('auth:errors.webauthn.not_enabled'),
      })
    }

    // 3. Récupérer les appareils
    const devices = user.twoFactor.webauthn.credentials
      .map((cred) => ({
        id: cred.credentialId,
        deviceType: cred.deviceType,
        deviceName: cred.deviceName,
        lastUsed: cred.lastUsed,
        createdAt: cred.createdAt,
      }))

    return res.status(200).json({
      success: true,
      data: {
        devices
      }
    })
  } catch (error) {
    console.error('Erreur récupération appareils:', error)
    return sendLocalizedError(res, 500, 'errors.webauthn.devices_error')
  }
}

module.exports = {
  generateRegistrationOpt,
  verifyRegistration,
  generateAuthenticationOpt,
  verifyAuthentication,
  removeWebAuthnCredential,
  getWebAuthnDevices,
}
