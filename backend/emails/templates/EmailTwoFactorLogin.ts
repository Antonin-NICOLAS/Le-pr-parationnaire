import { TFunction } from 'i18next'
import { IUser } from '../../models/User.js'
import header from './components/header.js'
import footer from './components/footer.js'

const EmailTwoFactorLogin = (
  t: TFunction,
  user: IUser,
  code: string,
  expiration: string,
) => {
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
            
              .row-2 .column-1 .block-2.paragraph_block td.pad > div,
              .row-2 .column-1 .block-4.paragraph_block td.pad > div,
              .row-2 .column-1 .block-6.paragraph_block td.pad > div,
              .row-2 .column-1 .block-8.paragraph_block td.pad > div {
                font-size: 14px !important;
              }
            
              .row-2 .column-1 .block-1.heading_block h3 {
                font-size: 17px !important;
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
            background-color: transparent;
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
              background-color: transparent;
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
                              max-width: 90vw;
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
                                            font-family: Arial, 'Helvetica Neue',
                                              Helvetica, sans-serif;
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
                                          <strong>Bonjour ${
                                            user.firstName
                                          },</strong>
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
                                            La double authentification par email est activée sur votre compte&nbsp;<strong
                                              >Le Préparationnaire</strong
                                            >. Pour vous connecter, utilisez le code ci-dessous :
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    class="html_block block-3"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                    "
                                  >
                                    <tr>
                                      <td class="pad">
                                        <div
                                          style="
                                            font-family: Arial, Helvetica, sans-serif;
                                            text-align: center;
                                          "
                                          align="center"
                                        >
                                          <div
                                            style="
                                              display: flex;
                                              justify-content: center;
                                              gap: 8px;
                                              margin: 20px 0;
                                              font-family: Arial, sans-serif;
                                              color: #ededed;
                                            "
                                          >
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(0, 1)}
                                            </div>
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(1, 1)}
                                            </div>
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(2, 1)}
                                            </div>
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(3, 1)}
                                            </div>
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(4, 1)}
                                            </div>
                                            <div
                                              style="
                                                width: calc(25px + 5%);
                                                height: 56px;
                                                border: 2px solid #ededed;
                                                border-radius: 8px;
                                                font-size: calc(15px + 1vw);
                                                font-weight: bold;
                                                text-align: center;
                                                line-height: 56px;
                                              "
                                            >
                                              ${code.substr(5, 1)}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    class="paragraph_block block-4"
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
                                            <strong>⏱ Validité :</strong> 10 minutes
                                            (jusqu’à ${expiration})<br /><strong
                                              >⚠️ Sécurité :</strong
                                            >&nbsp;Ne partagez jamais ce code, même
                                            avec notre équipe.
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    class="html_block block-5"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation"
                                    style="
                                      mso-table-lspace: 0pt;
                                      mso-table-rspace: 0pt;
                                    "
                                  >
                                    <tr>
                                      <td class="pad">
                                        <div
                                          style="
                                            font-family: Arial, Helvetica, sans-serif;
                                            text-align: center;
                                          "
                                          align="center"
                                        >
                                          <html>
                                            <div
                                              style="
                                                text-align: center;
                                                margin: 25px 0;
                                              "
                                            >
                                              <a
                                                href="#"
                                                style="
                                                  display: inline-block;
                                                  padding: 12px 24px;
                                                  background-color: #8fb4c9;
                                                  color: white;
                                                  border-radius: 6px;
                                                  font-weight: bold;
                                                  text-decoration: none;
                                                  cursor: pointer;
                                                "
                                                >Copier le code</a
                                              >
                                            </div>
                                          </html>
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
                                            <strong>Besoin d’aide ?</strong>
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
                                            start="1"
                                            style="
                                              margin-top: 0;
                                              margin-bottom: 0;
                                              list-style-type: revert;
                                            "
                                          >
                                            <li style="margin: 0 0 0 0">
                                              🚀 Vous n’avez pas demandé ce code
                                              ?&nbsp;<a
                                                href="https://{lien}/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style="
                                                  text-decoration: underline;
                                                  color: #8fb4c9;
                                                "
                                                >Sécurisez votre compte</a
                                              >.
                                            </li>
                                            <li style="margin: 0 0 0 0">
                                              📩 Problème avec le code ?&nbsp;<a
                                                href="https://{lien}/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style="
                                                  text-decoration: underline;
                                                  color: #8fb4c9;
                                                "
                                                >Renvoyer un code</a
                                              >.
                                            </li>
                                          </ul>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    class="paragraph_block block-8"
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
                                            <strong>Cordialement,</strong
                                            ><br />L’équipe&nbsp;<strong
                                              >Le Préparationnaire 🎓</strong
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <div
                                    class="spacer_block block-9"
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

export default EmailTwoFactorLogin
