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
const regex = /(twitter\.com|x\.com|fxtwitter\.com)/gm;

client
	.once('ready', () => onReady(client))
	.on('guildCreate', async (guild: Guild) => onguildCreate(client, guild))
	.on('messageCreate', async (message: Message) => {
		if (!message.content || message.author.bot || message.content.search(regex) === -1) return;
		if (message.channel.type === ChannelType.GuildText) {
			message.content = message.content.replace(regex, 'fxtwitter.com');
			message.delete();
			Webhooks.send(message, message.channel);
		}
		if (message.content === 'fx!delete' && message.guild) {
			Webhooks.deleteWebhook(message.guild);
			message.channel.send('Webhooks deleted.');
		}
	})
	.login(process.env.TOKEN);
