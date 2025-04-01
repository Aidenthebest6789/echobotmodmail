/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/


const { getModmailSetup } = require('../models/modmailSetup');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Icons = require('../UI/Icons');
const config = require('../config');
module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (message.guild || message.author.bot) return;

        //console.log(`Received DM from ${message.author.tag}: ${message.content}`);

       
        const guildId = config.guildId; 
        const setup = await getModmailSetup(guildId);

        if (!setup || !setup.modmailSystemEnabled) {
            return message.author.send("The ModMail system is not enabled.");
        }

    
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return message.author.send("Error: Unable to find the guild.");
        }

   
        let modmailChannel = guild.channels.cache.find(c => c.name === `modmail-${message.author.username}`);
        if (modmailChannel) {
            await modmailChannel.send(`**${message.author.tag}:** ${message.content}`);
            await message.react('✅'); 
            return;
        }

      
        const category = guild.channels.cache.get(setup.modmailCategoryId);

        modmailChannel = await guild.channels.create({
            name: `modmail-${message.author.username}`,
            type: ChannelType.GuildText,
            parent: category ? category.id : null, 
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
                { id: message.author.id, allow: [PermissionFlagsBits.ViewChannel] }, 
                ...setup.adminRoleIds.map(roleId => ({
                    id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }))
            ]
        });

        
        const embed = new EmbedBuilder()
            .setTitle(`Modmail from ${message.author.tag}`)
            .setDescription(`User **${message.author}** Has Created a support conversation.`)
            .setColor('#FFFF00');

        const closeButton = new ButtonBuilder()
            .setCustomId('close_modmail')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeButton);

        await modmailChannel.send({ embeds: [embed], components: [row] });

        const Embed = new EmbedBuilder()
        .setAuthor({
            name: "Mail Alert",
            iconURL: Icons.tick2Icon,
            url: "https://discord.gg/neEV7uKDja"
        })
        .setDescription(`Your, ticket has been created. You can now chat with the staff.`)
        .setColor('Green')
        .setFooter({ text: 'EchoBot Modmail', iconURL: Icons.modIcon });
        message.author.send({ embeds: [Embed]});
    });

    
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return; 

        const modmailPrefix = 'modmail-';

       
        if (message.channel?.name?.startsWith(modmailPrefix)) {
            const username = message.channel.name.slice(modmailPrefix.length);
            const user = client.users.cache.find(user => user.username === username);

            if (user) {
                try {
                    await user.send(`**${message.author.tag} (Staff):** ${message.content}`);
                } catch (error) {
                    //console.error(`Error sending message to ${user.tag}:`, error);
                    message.channel.send('Failed to send message to the user.');
                }
            }
        }
    });

   
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_modmail') return;

        const channel = interaction.channel;
        if (!channel.name.startsWith('modmail-')) return;

        try {
           
            const username = channel.name.slice('modmail-'.length);
            const user = client.users.cache.find(u => u.username === username);

            if (user) {
                const embed = new EmbedBuilder()
                .setAuthor({
                    name: "Modmail Alert",
                    iconURL: Icons.tick2Icon,
                    url: "https://discord.gg/neEV7uKDja"
                })
                .setDescription('Your Ticket has been closed by the staff. Thank you for reaching out Feel free to contact us whenever you need!.')
                .setColor('Red')
                .setFooter({ text: 'EchoBot Modmail', iconURL: Icons.modIcon });
                await user.send({ embeds: [embed]});
            }

           
            await channel.delete();
            
           
            //console.log(`Closed Ticket: ${channel.name}`);
        } catch (error) {
            //console.error('Error closing Ticket:', error);
        }
    });
};
/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/
