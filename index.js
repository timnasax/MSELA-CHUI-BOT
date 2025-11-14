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
            console.log('🔧 Initializing WhatsApp Bot...');
            
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
            
            console.log('✅ Bot initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error initializing bot:', error);
        }
    }

    // Setup event handlers
    setupEventHandlers() {
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(shouldReconnect ? '🔁 Reconnecting...' : '❌ Logged out, please restart the bot.');
                
                if (shouldReconnect) {
                    this.initialize();
                }
            } else if (connection === 'open') {
                this.isConnected = true;
                console.log('✅ Connected successfully!');
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
            const pushname = message.pushName || 'User';

            console.log(`📩 Message from ${pushname}: ${text}`);

            // Command handlers
            if (text.startsWith('!')) {
                await this.handleCommand(text, sender, pushname);
            }

        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    }

    // Handle commands
    async handleCommand(command, sender, pushname) {
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case '!hi':
            case '!hello':
                await this.sendMessage(sender, `👋 Hello ${pushname}! I'm working fine.`);
                break;
                
            case '!time':
                await this.sendMessage(sender, `🕐 Current time: ${new Date().toLocaleString()}`);
                break;
                
            case '!info':
                const botInfo = `
🤖 *BOT INFORMATION*

*Name:* WhatsApp Bot
*Owner:* Developer
*Time:* ${new Date().toLocaleString()}
*Status:* Connected
                `;
                await this.sendMessage(sender, botInfo);
                break;
                
            case '!help':
                const helpText = `
🆘 *COMMAND HELP*

*!hi* - Greet the bot
*!time* - Show current time
*!info* - Bot information
*!help* - Help menu
*!owner* - Contact the owner
*!status* - Check bot status
*!ping* - Test response time
                `;
                await this.sendMessage(sender, helpText);
                break;
                
            case '!owner':
                await this.sendMessage(sender, 
                    `📞 *CONTACT OWNER:*\n` +
                    `Email: developer@example.com\n` +
                    `WhatsApp: +255XXX XXX XXX`
                );
                break;

            case '!status':
                const status = this.isConnected ? '🟢 ONLINE' : '🔴 OFFLINE';
                await this.sendMessage(sender, 
                    `🤖 *BOT STATUS*\n` +
                    `Status: ${status}\n` +
                    `Uptime: ${process.uptime().toFixed(0)} seconds\n` +
                    `Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
                );
                break;

            case '!ping':
                const start = Date.now();
                await this.sendMessage(sender, '🏓 Pong!');
                const latency = Date.now() - start;
                await this.sendMessage(sender, `⏱️ Response time: ${latency}ms`);
                break;
                
            default:
                await this.sendMessage(sender, 
                    `❌ Unknown command! Use *!help* to see available commands.`
                );
        }
    }

    // Send message method
    async sendMessage(jid, text) {
        try {
            await this.sock.sendMessage(jid, { text: text });
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    }

    // Send welcome message to owner
    async sendWelcomeMessage() {
        const ownerJid = '255XXXXXXXXX@s.whatsapp.net'; // Replace with your number
        const welcomeMsg = `
🎉 *BOT STARTED SUCCESSFULLY!*

*Time:* ${new Date().toLocaleString()}
*Status:* Connected
*Version:* 1.0.0

Use *!help* to see command menu.
        `;
        
        await this.sendMessage(ownerJid, welcomeMsg);
    }

    // Utility method to download media
    async downloadMedia(message, filename) {
        try {
            const buffer = await this.sock.downloadMediaMessage(message);
            const filePath = path.join(__dirname, 'media', filename);
            
            // Create media directory if it doesn't exist
            if (!fs.existsSync(path.join(__dirname, 'media'))) {
                fs.mkdirSync(path.join(__dirname, 'media'));
            }
            
            fs.writeFileSync(filePath, buffer);
            return filePath;
        } catch (error) {
            console.error('❌ Error downloading media:', error);
            return null;
        }
    }

    // Send image method
    async sendImage(jid, imagePath, caption = '') {
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            await this.sock.sendMessage(jid, {
                image: imageBuffer,
                caption: caption
            });
        } catch (error) {
            console.error('❌ Error sending image:', error);
        }
    }

    // Check if user is bot owner
    isOwner(jid) {
        const ownerJid = '255XXXXXXXXX@s.whatsapp.net'; // Replace with your number
        return jid === ownerJid;
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

    static isUserJid(jid) {
        return jid.endsWith('@s.whatsapp.net');
    }

    static extractCommand(text) {
        const match = text.match(/^!(\w+)/);
        return match ? match[1].toLowerCase() : null;
    }

    static extractArgs(text) {
        return text.split(' ').slice(1).join(' ');
    }
}

// Configuration class
class BotConfig {
    static get settings() {
        return {
            ownerNumber: '255XXXXXXXXX',
            botName: 'WhatsApp Bot',
            prefix: '!',
            maxUploadSize: 10000000,
            autoReadMessages: false,
            antiDelete: true,
            welcomeMessage: 'Welcome to the bot! Use !help for commands.',
            autoReply: true
        };
    }
}

// Initialize and start the bot
async function startBot() {
    const bot = new WhatsAppBot();
    await bot.initialize();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Goodbye! Bot is shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Bot terminated!');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejection:', reason);
});

// Start the bot
console.log('🚀 Starting WhatsApp Bot...');
console.log('📋 Available commands: !hi, !time, !info, !help, !owner, !status, !ping');

startBot().catch(console.error);
