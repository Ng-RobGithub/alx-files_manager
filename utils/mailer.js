import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
import mimeMessage from 'mime-message';
import { gmail_v1 as gmailV1, google } from 'googleapis';

// Constants
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Prompts for authorization and retrieves a new token.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client.
 * @param {Function} callback The callback to call with the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this URL:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      await writeFileAsync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('Token stored to', TOKEN_PATH);
      callback(oAuth2Client);
    } catch (err) {
      console.error('Error retrieving access token', err);
    }
  });
}

/**
 * Creates an OAuth2 client and executes the callback.
 * @param {Object} credentials The authorization client credentials.
 * @param {Function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  console.log('Client authorization beginning');
  
  try {
    const token = await readFileAsync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await getNewToken(oAuth2Client, callback);
    } else {
      console.error('Error reading token file:', err);
    }
  }

  console.log('Client authorization done');
}

/**
 * Sends an email through the Gmail API.
 * @param {google.auth.OAuth2} auth The authorized OAuth2 client.
 * @param {gmailV1.Schema$Message} mail The message to send.
 */
function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.send({
    userId: 'me',
    requestBody: mail,
  }, (err, _res) => {
    if (err) {
      console.log(`The API returned an error: ${err.message || err.toString()}`);
      return;
    }
    console.log('Message sent successfully');
  });
}

/**
 * Class containing routines for mail delivery with Gmail.
 */
export default class Mailer {
  /**
   * Checks if the authorization credentials are valid.
   */
  static async checkAuth() {
    try {
      const content = await readFileAsync('credentials.json', 'utf-8');
      await authorize(JSON.parse(content), (auth) => {
        if (auth) {
          console.log('Auth check was successful');
        }
      });
    } catch (err) {
      console.log('Error loading client secret file:', err);
    }
  }

  /**
   * Builds a MIME message.
   * @param {string} dest The recipient email address.
   * @param {string} subject The subject of the email.
   * @param {string} message The body of the email.
   * @returns {Object} The MIME message object.
   */
  static buildMessage(dest, subject, message) {
    const senderEmail = process.env.GMAIL_SENDER;

    if (!senderEmail) {
      throw new Error(`Invalid sender: ${senderEmail}`);
    }

    const msgData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [dest],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject,
      body: message,
    };

    if (mimeMessage.validMimeMessage(msgData)) {
      const mimeMsg = mimeMessage.createMimeMessage(msgData);
      return { raw: mimeMsg.toBase64SafeString() };
    }

    throw new Error('Invalid MIME message');
  }

  /**
   * Sends an email.
   * @param {gmailV1.Schema$Message} mail The message to send.
   */
  static async sendMail(mail) {
    try {
      const content = await readFileAsync('credentials.json', 'utf-8');
      await authorize(JSON.parse(content), (auth) => sendMailService(auth, mail));
    } catch (err) {
      console.log('Error loading client secret file:', err);
    }
  }
}
