const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../settings');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402507750390@newsletter',
            newsletterName: 'suho',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `┏━━━━━ ⚔️ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐀𝐑𝐑𝐈𝐕𝐀𝐋 ⚔️ ━━━━━┓

🌑 *Hunter Summoned:* @${userName}  
Welcome to the guild — *${metadata.subject}*!  

🧾 *Hunter ID:* #${groupMembersCount}  
🕒 *Summoned at:* ${timestamp}  

📜 *Guild Codex:*  
${desc}  

Tread carefully in the abyss…  
Power only bows to those who endure.  

┗━━━━━━━━━━━━━━━━━━━━━━━┛  
> ⚡ *System: ${config.BOT_NAME}*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `┏━━━━━ ☠️ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐅𝐀𝐋𝐋 ☠️ ━━━━━┓

@${userName} has departed from *${metadata.subject}*.  

🕒 *Time of Exit:* ${timestamp}  
👥 *Hunters Remaining:* ${groupMembersCount}  

The gate closes behind you…  
May the darkness not consume your path.  

┗━━━━━━━━━━━━━━━━━━━━━━━┛  
> ⚡ *System: ${config.BOT_NAME}*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `⚠️ *Hierarchy Shift*  

@${demoter} has stripped @${userName} of their command sigil 🔻  

🕒 *Time:* ${timestamp}  
🏰 *Guild:* ${metadata.subject}  

The shadows obey new masters...`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `👑 *Rise, New Monarch*  

@${promoter} has elevated @${userName} to Shadow Commander 🛡️  

🕒 *Time:* ${timestamp}  
🏰 *Guild:* ${metadata.subject}  

The darkness bends before its new ruler!`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
