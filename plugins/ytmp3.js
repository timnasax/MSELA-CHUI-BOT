// • Feature : ytmp4 & ytmp3
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
// • Description : Download YouTube videos or audio in mp3/mp4 format

const axios = require('axios');
const { lite } = require('../lite');

lite({
  pattern: 'ytmp3',
  alias: ['ytmp4', 'yta', 'ytv'],
  desc: 'Download YouTube videos or audio (mp3/mp4)',
  category: 'downloader',
  react: '📥',
  filename: __filename
}, async (conn, mek, m, { args, command, usedPrefix, reply }) => {
  const url = args[0];
  if (!url) return reply(`📹 Example:\n${usedPrefix + command} https://youtu.be/abc123`);

  // detect format
  const format = /yt(a|mp3)/i.test(command) ? 'mp3' : 'mp4';
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = `https://api.platform.web.id/notube/download?url=${encodeURIComponent(url)}&format=${format}`;
    const { data } = await axios.get(apiUrl);

    if (!data.download_url) return reply('❌ Download link not found from API.');

    const caption = `🎵 *${data.title}*\n📦 Format: ${format.toUpperCase()}`;
    await conn.sendFile(m.chat, data.download_url, `${data.title}.${format}`, caption, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err?.message || err}`);
  }
});
