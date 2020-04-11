const {key} = require('../config.json');
const fetch = require('node-fetch');
const Discord = require('discord.js');
var emotes = require('../emotes.json');
const _ = require('lodash');
const async = require('async');


module.exports = {
    name: 'liveEUW',
    description: 'Displays ranked information for summoner',
    aliases: ['liveEUW'],
    cooldown: 5,
    execute(message, args, con) {
        var summonerNam = '';
        var blue = '', red = '';
        const eb = new Discord.RichEmbed();
        const playOb = [];
        
        if(!args.length){
            return;
        }
        args.forEach(a => {
            summonerNam += a + '%20';
        });
        summonerNam = summonerNam.slice(0, -3);
        fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerNam.trim() + `?api_key=${key}`, {
            method: 'get',
        }).then(function(response){
            return response.json();
        }).then(function(data){
            var summonerId = data.id;
            return fetch('https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/' + summonerId + `?api_key=${key}`, {method: 'get'}).then(function(response){
                return response.json();
            }).then(async function(r){
                var name = summonerNam.replace('%20', ' ');
                eb.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.3.1/img/profileicon/${data.profileIconId}.png`);
                eb.setTitle(name);
                eb.setColor(0x0099ff);
                eb.setURL('https://euw.op.gg/summoner/userName=' + summonerNam);
                if(r.status){
                    eb.setDescription(name + ' currently not in game');
                    message.channel.send({embed: eb});
                    return;
                }else{
                    if(r.gameMode === 'CLASSIC'){
                        eb.setDescription('Currently in Summoner\'s rift');
                    }else{
                        eb.setDescription('Currently in ' + r.gameMode);
                    }
                                
                    const loop = async () =>{
                        var count = 0;
                        async.each(r.participants, async function(player){    
                            var rank = '';      
                            var champ = emotes[player.championId];
                            fetch('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + player.summonerId + `?api_key=${key}`, {method: 'get'}).then(function(response){
                                return response.json();
                            }).then(function(n){
                                count++;
                                var sName = player.summonerName.replace('%20', ' ');
                                var lp = '', winrate = '';
                                var info = n[0];
                                if(n.length > 1){
                                    for(var i = 0; i < n.length; i++){
                                        if(n[i].queueType !== 'RANKED_SOLO_5x5'){
                                            continue;
                                        }
                                        info = n[i];                                        
                                    }
                                }

                                if(info === undefined) {
                                    rank = 'UNRANKED';
                                    lp = '00';
                                    winrate = '00%';
                                }else if(info.queueType === 'RANKED_SOLO_5x5'){
                                    rank = info.tier + ' ' + info.rank;
                                    lp = info.leaguePoints;
                                    var summoner = _.find(playOb, {'name': sName });
                                    summoner.rank = rank;
                                    winrate = `${(info.wins / (info.wins + info.losses) * 100).toFixed(0)}%`;
                                }
                                if(rank.length === 0){
                                    rank = 'UNRANKED';
                                    lp = '00';
                                    winrate = '00%';
                                }
                                if(player.teamId === 100){
                                    blue = blue + champ + '    ' + `**${sName}**` + '\n' + `${rank}` + ` -- ${lp}lp` + ` -- W/R: ${winrate}` + '\n';  
                                }else if(player.teamId === 200){
                                    red = red + champ + '    ' + `**${sName}**` + ' \n ' + `${rank}` + ` -- ${lp}lp` + ` -- W/R: ${winrate}` + '\n';  
                                }
                                if(count >= playOb.length){
                                    eb.addField('**Blue Team**', `>>> ${blue}`);
                                    eb.addField('**Red Team**', `>>> ${red}`);
                                    message.channel.send({embed: eb});
                                }
                            });   
                            playOb.push({'name': player.summonerName.replace('%20', ' '), 'team': player.teamId, 'champ': champ, 'rank': rank === '' ? 'unranked' : rank});
                        });

                    };
                    loop();

                }
            });
        });
    },
};
