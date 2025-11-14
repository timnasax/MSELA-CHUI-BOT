const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const P = require('pino');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.authState = null;
        this.isConnected = false;
    }

    // Initialize the bot
    async initialize() {
        try {
            console.log('🔧 Inaanzisha WhatsApp Bot...');
            
            // Load authentication state
            const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
            this.authState = state;
            
            // Fetch latest version
            const { version } = await fetchLatestBaileysVersion();
            
            // Create socket connection
            this.sock = makeWASocket({
                version,
                logger: P({ level: 'silent' }),
                printQRInTerminal: true,
                auth: this.authState,
                browser: Browsers.ubuntu('Chrome'),
                generateHighQualityLinkPreview: true,
            });

            // Handle credentials update
            this.sock.ev.on('creds.update', saveCreds);

            // Handle connection events
            this.setupEventHandlers();
            
            console.log('✅ Bot imeanzishwa kikamilifu!');
            
        } catch (error) {
            console.error('❌ Hitilafu katika kuanzisha bot:', error);
        }
    }

    // Setup event handlers
    setupEventHandlers() {
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(shouldReconnect ? '🔁 Tunaunganisha tena...' : '❌ Umeingia nje, tafadhali weka upya bot.');
                
                if (shouldReconnect) {
                    this.initialize();
                }
            } else if (connection === 'open') {
                this.isConnected = true;
                console.log('✅ Imewasilishwa kwa mafanikio!');
                this.sendWelcomeMessage();
            }
        });

        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message.message || message.key.fromMe) return;

            await this.handleMessage(message);
        });
    }

    // Handle incoming messages
    async handleMessage(message) {
        try {
            const messageType = Object.keys(message.message)[0];
            const text = message.message.conversation || 
                        message.message.extendedTextMessage?.text || 
                        '';
            
            const sender = message.key.remoteJid;
            const pushname = message.pushName || 'Mtemjiaji';

            console.log(`📩 Ujumbe kutoka kwa ${pushname}: ${text}`);

            // Command handlers
            if (text.startsWith('!')) {
                await this.handleCommand(text, sender, pushname);
            }

        } catch (error) {
            console.error('❌ Hitilafu katika kushughulikia ujumbe:', error);
        }
    }

    // Handle commands
    async handleCommand(command, sender, pushname) {
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case '!hii':
            case '!hello':
                await this.sendMessage(sender, `👋 Halo ${pushname}! Ninafanya kazi vizuri.`);
                break;
                
            case '!muda':
                await this.sendMessage(sender, `🕐 Muda wa sasa: ${new Date().toLocaleString()}`);
                break;
                
            case '!info':
                const botInfo = `
🤖 *TAARIFA ZA BOT*

*Jina:* WhatsApp Bot
*Mwenyeji:* Developer
*Muda:* ${new Date().toLocaleString()}
*Status:* Imewasilishwa
                `;
                await this.sendMessage(sender, botInfo);
                break;
                
            case '!saidia':
            case '!help':
                const helpText = `
🆘 *Msaada wa Commands*

*!hii* - Salamu za bot
*!muda* - Onyesha muda wa sasa
*!info* - Taarifa za bot
*!saidia* - Menu ya msaada
*!admin* - Wasiliana na mwenyeji
                `;
                await this.sendMessage(sender, helpText);
                break;
                
            case '!admin':
                await this.sendMessage(sender, 
                    `📞 *Wasiliana na Mwenyeji:*\n` +
                    `Email: developer@example.com\n` +
                    `WhatsApp: +255XXX XXX XXX`
                );
                break;
                
            default:
                await this.sendMessage(sender, 
                    `❌ Amri haijulikani! Tumia *!saidia* kuona orodha ya amri.`
                );
        }
    }

    // Send message method
    async sendMessage(jid, text) {
        try {
            await this.sock.sendMessage(jid, { text: text });
        } catch (error) {
            console.error('❌ Hitilafu katika kutuma ujumbe:', error);
        }
    }

    // Send welcome message to owner
    async sendWelcomeMessage() {
        const ownerJid = '255XXXXXXXXX@s.whatsapp.net'; // Badilisha na namba yako
        const welcomeMsg = `
🎉 *BOT IMESHAWASHWA KIKAMILIFU!*

*Muda:* ${new Date().toLocaleString()}
*Status:* Imewasilishwa
*Version:* 1.0.0

Tumia *!saidia* kuona menu ya amri.
        `;
        
        await this.sendMessage(ownerJid, welcomeMsg);
    }

    // Utility method to download media
    async downloadMedia(message, filename) {
        try {
            const buffer = await this.sock.downloadMediaMessage(message);
            const filePath = path.join(__dirname, 'media', filename);
            
            fs.writeFileSync(filePath, buffer);
            return filePath;
        } catch (error) {
            console.error('❌ Hitilafu katika kupakua media:', error);
            return null;
        }
    }
}

// Additional utility functions
class BotUtils {
    static formatPhoneNumber(phone) {
        // Format phone number to international format
        return phone.replace(/\D/g, '').replace(/^0/, '255');
    }

    static isGroupJid(jid) {
        return jid.endsWith('@g.us');
    }

    static extractCommand(text) {
        const match = text.match(/^!(\w+)/);
        return match ? match[1].toLowerCase() : null;
    }
}

// Initialize and start the bot
async function startBot() {
    const bot = new WhatsAppBot();
    await bot.initialize();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Kwaheri! Bot inaachwa...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Hitilafu isiyotarajiwa:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Ahadi ilikataa:', reason);
});

// Start the bot
console.log('🚀 Inaanzisha WhatsApp Bot...');
startBot().catch(console.error);
