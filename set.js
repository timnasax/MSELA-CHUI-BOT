const fs = require('fs-extra');
const path = require("path");
if (fs.existsSync('set.env')) {
    require('dotenv').config({ path: __dirname + '/set.env' });
}

const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;

module.exports = {
    // Session na Prefix
    session: process.env.SESSION_ID || 'TIMNASA-MD;;;=>eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNk9XeHRoYk9Ga3l2ZWxiTkVqOGhoUXkyakVXZ01hZlJzY2hWa1hDK0YyND0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiSlh4MERqV0pjc25iQWRFSWRMZlZXWmFIRTl3N2NjZDFuSXpuSVdMREZIOD0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJlUDkwYjllQldWSDFTQmdZRmxFRmdaOWRiOEJHbkNaZHJyelV6NUY0cmxjPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ2VXNnc2lGMi9MMnJybjFkUjdYTGI3WVlrT3J6YkxmdSt3VEJVZm9IRG00PSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjRQbTJvYlNRYUVrT2lUaS92N0phVTZiVTRJQy9IaUxDS1h5amZvemhoMG89In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjF0OEhsUWlFVGFsRFV4MG1PWUx6TS9MOGdwVDY1VHY1TFhjRGZwNkl6RHc9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVU9zZjZ2SHhwWUZXTXJ0OWtPY0F4UWhYUkxSQkZpdTBZZlpIQjRTTWwxdz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiN1BET011Z2ZoTlNEbGMxcUdzNFh6MXN0TVpxNGRoL1dhcFZzdElhdzRSWT0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Ik1TbzlaWllORkFuMnZ0d2d5U25lU0FYY0RObW1RWDl2R1NGdkN1RmJjdVlaSFhrUzIvVVNRaE5sczdjSmdvZ0hmdEtCZ3BsMEk1aS9KckpRNVk3R0FnPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6ODksImFkdlNlY3JldEtleSI6Im9UaG9SSXFRekRIcmJiYlRWK1AxOVZSenRwcFdHZG5xaVB6VlY5S1BUNjg9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbeyJrZXkiOnsicmVtb3RlSmlkIjoiMjYwNzY5MzU1NjI0QHMud2hhdHNhcHAubmV0IiwiZnJvbU1lIjp0cnVlLCJpZCI6IkE1Rjk3NTNDQTYwOEU4Njg2RDEwRDQ0Mjg0NTQ2RDFGIn0sIm1lc3NhZ2VUaW1lc3RhbXAiOjE3NjY3NDA1MzR9XSwibmV4dFByZUtleUlkIjo4MTMsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjo4MTMsImFjY291bnRTeW5jQ291bnRlciI6MCwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sInJlZ2lzdGVyZWQiOnRydWUsInBhaXJpbmdDb2RlIjoiTVJGUkFOS0siLCJtZSI6eyJpZCI6IjI2MDc2OTM1NTYyNDo1NkBzLndoYXRzYXBwLm5ldCIsIm5hbWUiOiJtc2VsYWNodWkiLCJsaWQiOiI4OTQ3MDM3NjQyODY3OjU2QGxpZCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDTUdYalpFREVKNmt1Y29HR0FFZ0FDZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoiOTVaQmJ2enUzL21BZVJwTUlESDhpd3g4bzlRK0w0bWpLNnlFMk1CS1RXUT0iLCJhY2NvdW50U2lnbmF0dXJlIjoiQVJzdjNLWmgwSDZjN1k0K0VHRk9qUi9MYVhFSHNrUk12S3plbUJFRlFFZk5adWViTzdGYkpuc0w0VjM3T3gzNGhuUWFPYnA5ZTVsdzlqb1A5UWRGQlE9PSIsImRldmljZVNpZ25hdHVyZSI6IjNWL2ROQzVvcG5NOURrVVlZdHlWWmZpeklUODExMlc4UlhmNzhQblVqMjlmWnh0RkVjT3VwMnh2RGZRdUxYa1MzRHNQNjBjWEZwbkcxZm5xaHUxQURRPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiMjYwNzY5MzU1NjI0OjU2QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQmZlV1FXNzg3dC81Z0hrYVRDQXgvSXNNZktQVVBpK0pveXVzaE5qQVNrMWsifX1dLCJwbGF0Zm9ybSI6InNtYmEiLCJyb3V0aW5nSW5mbyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkNBMElFZ2dDIn0sImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc2Njc0MDUyNSwibGFzdFByb3BIYXNoIjoiMkc0QW11IiwibXlBcHBTdGF0ZUtleUlkIjoiQUFBQUFDUkMifQ==',
    PREFIXE: process.env.PREFIX || "+",
    
    // Habari za Mmiliki (Owner)
    OWNER_NAME: process.env.OWNER_NAME || "chugastan",
    NUMERO_OWNER: process.env.NUMERO_OWNER || "255622286792",
    NOM_OWNER: process.env.OWNER_NAME || "chugastan", // Imetumika kwenye index.js
    
    // Mipangilio ya Bot
    BOT_NAME: process.env.BOT_NAME || 'MATELEE TMD',
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/ejm45q.jpg',
    MODE: process.env.PUBLIC_MODE || "no",
    PM_PERMIT: process.env.PM_PERMIT || 'no',
    DP: process.env.STARTING_BOT_MESSAGE || "yes",
    
    // Hali ya Bot (Status/Presence)
    ETAT: process.env.PRESENCE || '1', // 1: Online, 2: Typing, 3: Recording
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "non",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'non',
    AUTOREACT_STATUS: process.env.AUTOREACT_STATUS || 'yes', // Mpya tuliyoongeza
    
    // Ulinzi na Chatbot
    WARN_COUNT: process.env.WARN_COUNT || '3',
    CHATBOT: process.env.PM_CHATBOT || 'no',
    ADM: process.env.ANTI_DELETE_MESSAGE || 'yes',
    
    // Heroku Settings
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY || '',
    
    // Database Configuration
    DATABASE_URL: DATABASE_URL,
    DATABASE: "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9"
};

// Sehemu ya ku-watch mabadiliko ya file (Hot Reload)
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`Mabadiliko yamehifadhiwa kwenye: ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
