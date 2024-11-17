import { onReady } from './Events/onReady';
import { onguildCreate } from './Events/onguildCreate';
import { ArcheType } from './archetype';
import { Client, GatewayIntentBits, Message, ChannelType, Guild } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildWebhooks
	]
});

const Webhooks = new ArcheType();
const regex = /https?:\/\/(twitter\.com|x\.com|fxtwitter\.com)/gm;

client
	.once('ready', () => onReady(client))
	.on('guildCreate', async (guild: Guild) => onguildCreate(client, guild))
	.on('messageCreate', async (message: Message) => {
		if (message.content === 'fx!delete' && message.guild) {
			await Webhooks.deleteWebhook(message.guild);
			if (message.channel.type === ChannelType.GuildText) return message.channel.send('Webhooks deleted.');
		}
		if (!message.content || message.author.bot || message.content.search(regex) === -1) return;
		if (message.channel.type === ChannelType.GuildText) {
			message.content = message.content.replace(regex, 'https://fxtwitter.com');
			message.delete();
			Webhooks.send(message, message.channel);
		}
	})
	.login(process.env.TOKEN);
