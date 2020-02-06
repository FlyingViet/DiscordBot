module.exports = {
    name: 'pinthis',
    description: 'Pins the current message',
    aliases: ['p'],
    cooldown: 1,
    execute(message, args, con) {
        if(!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES', false, false)) return;
        message.channel.fetchMessages({limit: 2}).then(result => {
            var itr = result.entries();       
            var newMsg = itr.next();
            try{
                newMsg.value[1].pin();
            }catch(exception){
                return console.log(exception);
            }
        });
    },
};