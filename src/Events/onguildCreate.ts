import { Client, Guild } from 'discord.js';

export function onguildCreate(client: Client, guild: Guild) {
	console.log(`[INFO] Joined ${guild.name} (${guild.id})`);
}
