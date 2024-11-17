import { TextChannel, Webhook, Message, Guild, ChannelType } from 'discord.js';

export class ArcheType {
	private webhooks: Map<string, Webhook>;

	constructor() {
		this.webhooks = new Map();
	}

	/**
	 * チャンネルに関連付けられた Webhook を取得します。
	 * キャッシュが存在しない場合は新規作成します。
	 * @param channel 対象のテキストチャンネル
	 * @returns Webhook
	 */
	public async getWebhookInChannel(channel: TextChannel): Promise<Webhook> {
		try {
			const webhook = this.webhooks.get(channel.id) ?? (await this.getWebhook(channel));
			if (!webhook) throw new Error(`Failed to retrieve or create webhook for channel: ${channel.id}`);
			return webhook;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	/**
	 * チャンネル内の Webhook を取得、または新規作成します。
	 * @param channel 対象のテキストチャンネル
	 * @returns Webhook | undefined
	 */
	public async getWebhook(channel: TextChannel): Promise<Webhook | undefined> {
		try {
			const webhooks = await channel.fetchWebhooks();
			let webhook = webhooks.find((v: Webhook) => v.token);

			if (!webhook) {
				webhook = await channel.createWebhook({ name: 'fxWebhook' });
				this.webhooks.set(channel.id, webhook);
			}

			return webhook;
		} catch (e) {
			console.error(`Failed to fetch or create webhook: ${e}`);
			return undefined;
		}
	}

	/**
	 * Webhook を利用してメッセージを送信します。
	 * @param message 送信元のメッセージ
	 * @param channel 送信先のテキストチャンネル
	 */
	public async send(message: Message, channel: TextChannel): Promise<void> {
		try {
			const nickname = message.member?.displayName;
			const avatarURL = message.author.avatarURL() ?? undefined;
			const webhook = await this.getWebhookInChannel(channel);

			if (webhook) {
				await webhook.send({
					content: message.content,
					username: nickname,
					avatarURL: avatarURL
				});
			}
		} catch (e) {
			console.error(`Failed to send message via webhook: ${e}`);
		}
	}

	/**
	 * ギルド内の全ての Webhook を削除します。
	 * @param guild 対象のギルド
	 */
	public async deleteWebhook(guild: Guild): Promise<void> {
		try {
			const deletePromises = guild.channels.cache.map(async (channel) => {
				if (channel.type === ChannelType.GuildText) {
					const webhooks = await channel.fetchWebhooks();
					const deleteTasks = webhooks.map(async (webhook) => {
						if (webhook.name === 'fxWebhook') {
							await webhook.delete();
							this.webhooks.delete(channel.id);
						}
					});
					await Promise.all(deleteTasks);
				}
			});

			await Promise.all(deletePromises);
		} catch (e) {
			console.error(`Failed to delete webhooks in guild: ${e}`);
		}
	}
}
