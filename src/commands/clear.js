module.exports = {
    name: 'clear',
    description: 'Clears 100 messages from chat',
    aliases: ['clearchat'],
    execute(message, args, con) {
        if(!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES', false, false)) return;
        message.channel.bulkDelete(100, true);
    },
};