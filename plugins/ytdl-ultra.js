// ✅ Coded by JawadTechX for JAWAD MD
// ⚙️ API: https://jawad-tech.vercel.app/download/ytdl?url=

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytv",
    alias: ["ytmp4", "video"],
    desc: "Download YouTube video (MP4)",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.ytv alone marshmello`");

        let url = q;
        let videoInfo = null;

        // 🔍 Detect URL or search by title
        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            const searchFromUrl = await yts({ videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        // 🎯 Extract YouTube video ID
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // 🖼️ Send thumbnail + video info
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `*🎬 VIDEO DOWNLOADER*\n\n🎞️ *Title:* ${videoInfo.title}\n📺 *Channel:* ${videoInfo.author.name}\n🕒 *Duration:* ${videoInfo.timestamp}\n\n*Status:* Downloading Video...\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙚𝙘𝙝𝙓 𝙈𝘿*`
        }, { quoted: mek });

        // ⚙️ Fetch from JawadTech API
        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data?.result?.mp4) {
            return await reply("❌ Failed to fetch download link! Try again later.");
        }

        const vid = data.result;

        // 📹 Send as video
        await conn.sendMessage(from, {
            video: { url: vid.mp4 },
            caption: `🎬 *${vid.title}*\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓*`
        }, { quoted: mek });

        // ✅ Success Reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytv command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});


// jawad tech

cmd({
    pattern: "play",
    desc: "Download YouTube audio with thumbnail",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("🎧 Please provide a song name!\n\nExample: .play Faded Alan Walker");
        }

        // 🔍 Search video
        const search = await yts(q);

        if (!search.videos || search.videos.length < 1) {
            return reply("❌ No results found!");
        }

        // ✅ Filter videos
        const videos = search.videos.filter(v =>
            !v.live &&
            v.seconds < 7200
        );

        if (!videos.length) {
            return reply("❌ No valid videos found!");
        }

        const vid = videos[0];
        const videoUrl = vid.url;

        // 🎵 Song Info
        const title = vid.title || "Unknown Song";
        const duration = vid.timestamp || "Unknown";
        const views = vid.views ? vid.views.toLocaleString() : "Unknown";
        const author = vid.author?.name || "Unknown";

        // 🖼️ Send thumbnail first
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption:
`- *AUDIO DOWNLOADER 🎧*

╭━━❐━⪼
┇๏ *Title* - ${title}
┇๏ *Duration* - ${duration}
┇๏ *Views* - ${views}
┇๏ *Author* - ${author}
┇๏ *Status* - Downloading...
╰━━❑━⪼

> *© Powered By TechX MD*`
        }, { quoted: mek });

        // 🔗 API URL
        const apiUrl = `https://adeelmdmp3.vercel.app/download?url=${encodeURIComponent(videoUrl)}&key=adeelbaloch.dev`;

        let audioUrl;

        try {

            const response = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            const data = response.data;

            // ✅ Different response support
            if (data?.status === true) {

                if (typeof data.result === "string") {
                    audioUrl = data.result;
                }

                else if (typeof data.result === "object") {
                    audioUrl =
                        data.result.download ||
                        data.result.url ||
                        data.result.link;
                }
            }

        } catch (apiErr) {

            console.log("API ERROR:", apiErr.message);

            return reply("❌ Audio API failed!\nTry again later.");
        }

        // ❌ No audio
        if (!audioUrl) {
            return reply("❌ Failed to fetch audio link!");
        }

        // 🧹 Clean filename
        const safeFileName = title
            .replace(/[\\/:*?"<>|]/g, "")
            .slice(0, 60);

        // 🎧 Send audio
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${safeFileName}.mp3`,
            ptt: false
        }, { quoted: mek });

        // ✅ React success
        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: m.key
            }
        });

    } catch (e) {

        console.log("PLAY CMD ERROR:", e);

        await conn.sendMessage(from, {
            react: {
                text: "❌",
                key: m.key
            }
        });

        return reply("❌ Error occurred while processing your request!");
    }
});