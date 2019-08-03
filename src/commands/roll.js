function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
    name: 'roll',
    description: 'Roll a dice',
    aliases: ['dice'],
    usage: '<4|6|8|10|12|20> <number of times>',
    cooldown: 5,
    execute(message, args) {
        if(!args.length){
            return;
        }
        try{
            var dice = parseInt(args[0]);
            var times = args[1] != null ? parseInt(args[1]) : 1;
        }catch(exception){
            return message.channel.send('That is not a number try again');
        }
        
        var dices = [4, 6, 8, 10, 12, 20];
        if(!dices.includes(dice)){
            return message.channel.send('This dice does not exist try again');
        }
        var rtnMessage = `${message.author} rolled a \n`;
        for(var i = 0; i < times; i++){
             rtnMessage += (getRandomInt(dice) + 1) + '\n';
        }
        message.channel.send(rtnMessage);
    },
};