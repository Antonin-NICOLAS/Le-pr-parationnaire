const nodemailer = require('nodemailer')

const sendResetPasswordEmail = async (email, resetLink, language) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: `"Préparationnaire" <${process.env.SMTP_USER}>`,
    to: email,
    subject:
      language === 'fr' ? 'Réinitialisation du mot de passe' : 'Password Reset',
    text:
      language === 'fr'
        ? `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
        : `Click this link to reset your password: ${resetLink}`,
    html: `<p>${
      language === 'fr'
        ? 'Cliquez sur ce lien pour réinitialiser votre mot de passe :'
        : 'Click this link to reset your password:'
    }</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
module.exports = {
  sendResetPasswordEmail,
}
