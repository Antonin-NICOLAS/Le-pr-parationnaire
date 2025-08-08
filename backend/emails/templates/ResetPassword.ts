import { TFunction } from 'i18next'
import { IUser } from '../../models/User.js'
import header from './components/header.js'
import footer from './components/footer.js'

const ResetPassword = (t: TFunction, user: IUser, link: string) => {
  const template = `
    <!DOCTYPE html>
<html
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--[if mso]>
      <xml
        ><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"
          ><w:DontUseAdvancedTypographyReadingMail
        /></w:WordDocument>
        <o:OfficeDocumentSettings
          ><o:PixelsPerInch>96</o:PixelsPerInch
          ><o:AllowPNG /></o:OfficeDocumentSettings
      ></xml>
    <![endif]-->
    <!--[if !mso]><!-->
    <!--<![endif]-->
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: inherit !important;
      }

      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
      }

      p {
        line-height: inherit;
      }

      .desktop_hide,
      .desktop_hide table {
        mso-hide: all;
        display: none;
        max-height: 0px;
        overflow: hidden;
      }

      .image_block img + div {
        display: none;
      }

      sup,
      sub {
        font-size: 75%;
        line-height: 0;
      }

      #converted-body .list_block ul,
      #converted-body .list_block ol,
      .body [class~='x_list_block'] ul,
      .body [class~='x_list_block'] ol,
      u + .body .list_block ul,
      u + .body .list_block ol {
        padding-left: 20px;
      }

      @media (max-width: 620px) {
        .desktop_hide table.icons-inner {
          display: inline-block !important;
        }

        .icons-inner {
          text-align: center;
        }

        .icons-inner td {
          margin: 0 auto;
        }

        .mobile_hide {
          display: none;
        }

        .row-content {
          width: 100% !important;
        }

        .stack .column {
          width: 100%;
          display: block;
        }

        .mobile_hide {
          min-height: 0;
          max-height: 0;
          max-width: 0;
          overflow: hidden;
          font-size: 0px;
        }

        .desktop_hide,
        .desktop_hide table {
          display: table !important;
          max-height: none !important;
        }

        .row-2 .column-1 .block-1.heading_block h3 {
          font-size: 17px !important;
        }

        .row-2 .column-1 .block-2.paragraph_block td.pad > div,
        .row-2 .column-1 .block-3.paragraph_block td.pad > div,
        .row-2 .column-1 .block-6.paragraph_block td.pad > div {
          font-size: 14px !important;
        }

        .row-2 .column-1 .block-7.list_block ul {
          font-size: 14px !important;
          line-height: auto !important;
        }
      }
    </style>
    <!--[if mso
      ]><style>
        sup,
        sub {
          font-size: 100% !important;
        }
        sup {
          mso-text-raise: 10%;
        }
        sub {
          mso-text-raise: -10%;
        }
      </style>
    <![endif]-->
  </head>

  <body
    class="body"
    style="
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    "
  >
    <table
      class="nl-container"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #ffffff;
      "
    >
      <tbody>
        <tr>
          <td>
            ${header}
            <table
              class="row row-2"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-size: auto;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-size: auto;
                        border-left: 5px solid #8fb4c9;
                        border-right: 5px solid #8fb4c9;
                        color: #000000;
                        background-color: #548ca8;
                        border-radius: 20px 20px 0 0;
                        border-top: 5px solid #8fb4c9;
                        padding: 5px;
                        width: 600px;
                        margin: 0 auto;
                      "
                      width="600"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: middle;
                            "
                          >
                            <table
                              class="heading_block block-1"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <h3
                                    style="
                                      margin: 0;
                                      color: #ededed;
                                      direction: ltr;
                                      font-family: Arial, Helvetica, sans-serif;
                                      font-size: 20px;
                                      font-weight: 700;
                                      letter-spacing: normal;
                                      line-height: 1.2;
                                      text-align: left;
                                      margin-top: 0;
                                      margin-bottom: 0;
                                      mso-line-height-alt: 24px;
                                    "
                                  >
                                    <span
                                      class="tinyMce-placeholder"
                                      style="word-break: break-word"
                                      >Bonjour ${user.firstName},</span
                                    >
                                  </h3>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-2"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      color: #ededed;
                                      direction: ltr;
                                      font-family: Arial, Helvetica, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      letter-spacing: 0px;
                                      line-height: 1.2;
                                      text-align: left;
                                      mso-line-height-alt: 19px;
                                    "
                                  >
                                    <p style="margin: 0">
                                      Vous avez demandé la réinitialisation du
                                      mot de passe associé à votre
                                      compte&nbsp;<strong
                                        >Le Préparationnaire</strong
                                      >
                                      (${user.email}).
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-3"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      color: #ededed;
                                      direction: ltr;
                                      font-family: Arial, Helvetica, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      letter-spacing: 0px;
                                      line-height: 1.2;
                                      text-align: left;
                                      mso-line-height-alt: 19px;
                                    "
                                  >
                                    <p style="margin: 0; margin-bottom: 16px">
                                      <strong
                                        >⚡️
                                        <u>Procédez dès maintenant :</u></strong
                                      >
                                    </p>
                                    <p style="margin: 0">
                                      Cliquez sur le bouton ci-dessous
                                      pour&nbsp;<strong
                                        >choisir un nouveau mot de passe</strong
                                      >&nbsp;:
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="button_block block-4"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div class="alignment" align="center">
                                    <a
                                      href="${link}"
                                      target="_blank"
                                      style="
                                        color: #ffffff;
                                        text-decoration: none;
                                      "
                                      >><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"  href="${link}"  style="height:42px;width:279px;v-text-anchor:middle;" arcsize="10%" fillcolor="#8fb4c9">
<v:stroke dashstyle="Solid" weight="0px" color="#8fb4c9"/>
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:sans-serif;font-size:16px">
<!
                                      [endif]--><span
                                        class="button"
                                        style="
                                          background-color: #8fb4c9;
                                          border-bottom: 0px solid transparent;
                                          border-left: 0px solid transparent;
                                          border-radius: 4px;
                                          border-right: 0px solid transparent;
                                          border-top: 0px solid transparent;
                                          color: #ffffff;
                                          display: inline-block;
                                          font-family: Arial, Helvetica,
                                            sans-serif;
                                          font-size: 16px;
                                          font-weight: 400;
                                          mso-border-alt: none;
                                          padding-bottom: 5px;
                                          padding-top: 5px;
                                          padding-left: 20px;
                                          padding-right: 20px;
                                          text-align: center;
                                          width: auto;
                                          word-break: keep-all;
                                          letter-spacing: normal;
                                        "
                                        ><span
                                          style="
                                            word-break: break-word;
                                            line-height: 32px;
                                          "
                                          >🔒 Réinitialiser mon mot de
                                          passe</span
                                        ></span
                                      >><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></a</a
                                    >
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-5"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      color: #ededed;
                                      direction: ltr;
                                      font-family: Arial, Helvetica, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      letter-spacing: 0px;
                                      line-height: 1.2;
                                      text-align: left;
                                      mso-line-height-alt: 19px;
                                    "
                                  >
                                    <p style="margin: 0">
                                      <em
                                        >(Ce lien expirera dans 24 heures pour
                                        des raisons de sécurité)</em
                                      >
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-6"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      color: #ededed;
                                      direction: ltr;
                                      font-family: Arial, Helvetica, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      letter-spacing: 0px;
                                      line-height: 1.2;
                                      text-align: left;
                                      mso-line-height-alt: 19px;
                                    "
                                  >
                                    <p style="margin: 0">
                                      🔐
                                      <strong
                                        ><u
                                          >Recommandations de sécurité :</u
                                        ></strong
                                      >
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="list_block block-7"
                              width="100%"
                              border="0"
                              cellpadding="10"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                                color: #ededed;
                                direction: ltr;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 16px;
                                font-weight: 400;
                                letter-spacing: 0px;
                                line-height: 1.2;
                                text-align: left;
                                mso-line-height-alt: 19px;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div style="margin-left: -20px">
                                    <ul
                                      style="
                                        margin-top: 0;
                                        margin-bottom: 0;
                                        list-style-type: revert;
                                      "
                                    >
                                      <li style="margin: 0 0 0 0">
                                        <strong
                                          >Ne partagez jamais ce lien</strong
                                        >&nbsp;: Il donne accès complet à votre
                                        compte.
                                      </li>
                                      <li style="margin: 0 0 0 0">
                                        <strong
                                          >Créez un mot de passe robuste</strong
                                        >&nbsp;:
                                        <div style="margin-left: -10px">
                                          <ul
                                            style="
                                              margin-top: 0;
                                              margin-bottom: 0;
                                              list-style-type: revert;
                                            "
                                          >
                                            <li style="margin: 0 0 0 0">
                                              8 caractères minimum
                                            </li>
                                            <li style="margin: 0 0 0 0">
                                              Combinaison de lettres
                                              (majuscules/minuscules), chiffres
                                              et symboles
                                            </li>
                                            <li style="margin: 0 0 0 0">
                                              Aucune information personnelle
                                              (date de naissance, nom, etc.)
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                      <li style="margin: 0 0 0 0">
                                        <strong
                                          >Méfiez-vous des tentatives de
                                          phishing</strong
                                        >&nbsp;:
                                      </li>
                                      <li style="margin: 0 0 0 0">
                                        Notre équipe ne vous demandera
                                        <strong>jamais</strong>&nbsp;votre mot
                                        de passe par email.
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <div
                              class="spacer_block block-8"
                              style="
                                height: 20px;
                                line-height: 20px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            ${footer(t, user)}
          </td>
        </tr>
      </tbody>
    </table>
    <!-- End -->
  </body>
</html>
  `

  return template
}

export default ResetPassword
