import { TextChannel, Webhook, Message, Guild, ChannelType } from 'discord.js';

export class ArcheType {
	private webhooks: Map<string, Webhook>;
	constructor() {
		this.webhooks = new Map();
	}

	public async getWebhookInChannel(channel: TextChannel) {
		const webhook = this.webhooks.get(channel.id) ?? (await this.getWebhook(channel));
		return webhook;
	}

	public async getWebhook(channel: TextChannel) {
		const webhooks = await channel.fetchWebhooks();
		const webhook =
			webhooks?.find((v: Webhook) => v.token) ??
			(await channel.createWebhook({ name: 'fxWebhook' }));
		if (webhook) this.webhooks.set(channel.id, webhook);
		return webhook;
	}

	public async send(message: Message, channel: TextChannel) {
		const nickname = message.member?.displayName;
		const avatarURL = message.author.avatarURL() ?? undefined;
		const webhook = await this.getWebhookInChannel(channel);
		return webhook
			.send({
				content: message.content,
				username: nickname,
				avatarURL: avatarURL
			})
			.catch((e: Error) => console.error(e));
	}

	public deleteWebhook(guild: Guild) {
		guild.channels.cache.map((channel) => {
			if (channel.type === ChannelType.GuildText) {
				channel.fetchWebhooks().then((webhooks) => {
					webhooks.map((webhook) => {
						if (webhook.name === 'fxWebhook') webhook.delete();
					});
					this.webhooks.clear();
				});
			}
		});
	}
}
