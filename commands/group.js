const { fredi } = require("../ezrah/fredi");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");


fredi({
  nomCom: 'report',
  aliases: 'spread',
  desc: 'report anything to the bot developer',
  categorie: "owner",
  reaction: '⚪'
}, async (bot, zk, context) => {
  const { arg, repondre, superUser, nomAuteurMessage } = context;

  if (!arg[0]) {
    return repondre("After the command *broadcast*, type your message to be sent to the specified contacts.");
  }

  if (!superUser) {
    return repondre("Only for the owner.");
  }

  // Specified contacts
  const contacts = [
    '255752593977@s.whatsapp.net',
    '255620814108@s.whatsapp.net',
    '255687068672@s.whatsapp.net'
  ];

  await repondre("*CRISS-XBOT is sending your message to Developer contacts 🍂*...");

  const broadcastMessage = `*𝗥𝗲𝗽𝗼𝗿𝘁 𝗠𝗲𝘀𝘀𝗮𝗴𝗲*\n
𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${arg.join(" ")}\n
𝗦𝗲𝗻𝗱𝗲𝗿 𝗡𝗮𝗺𝗲 : ${nomAuteurMessage}`;

  for (let contact of contacts) {
    await zk.sendMessage(contact, {
      image: { url: 'https://i.imgur.com/HDLN3If.jpeg' },
      caption: broadcastMessage
    });
  }
});

fredi({
  nomCom: 'broadcast',
  aliase: 'spread',
  categorie: "Group",
  reaction: '⚪'
}, async (bot, client, context) => {
  const { arg, repondre, superUser, nomAuteurMessage } = context;

  if (!arg[0]) {
    return repondre("After the command *broadcast*, type your message to be sent to all groups you are in.");
  }

  if (!superUser) {
    return repondre("You are too weak to do that");
  }

  const groups = await client.groupFetchAllParticipating();
  const groupIds = Object.values(groups).map(group => group.id);
  await repondre("*CRISS-XBOT is sending your message to all groups ,,,💀*...");

  const broadcastMessage = `*🌟CRISS-XBOT 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓🌟*\n\n🀄 Message: ${arg.join(" ")}\n\n🗣️ Author: ${nomAuteurMessage}`;
  for (let groupId of groupIds) {
    await client.sendMessage(groupId, {
      image: { url: 'https://i.imgur.com/HDLN3If.jpeg' },
      caption: broadcastMessage
    });
  }
});

// Disappearing Messages Command (Common for all)
const handleDisapCommand = async (chatId, client, context, duration) => {
  const { repondre, verifGroupe, verifAdmin } = context;

  if (!verifGroupe) {
    return repondre("This command works in groups only");
  }

  if (!verifAdmin) {
    return repondre("You are not an admin here!");
  }

  await client.groupToggleEphemeral(chatId, duration);
  repondre(`Disappearing messages successfully turned on for ${duration / 86400} day(s)!`);
};

// Disappearing Messages Off Command
fredi({
  nomCom: "disap-off",
  categorie: "Group",
  reaction: '㋛'
}, async (chatId, client, context) => {
  const { repondre, verifGroupe, verifAdmin } = context;

  if (!verifGroupe) {
    return repondre("This command works in groups only");
  }

  if (!verifAdmin) {
    return repondre("You are not an admin here!");
  }

  await client.groupToggleEphemeral(chatId, 0);
  repondre("Disappearing messages successfully turned off!");
});

// Disappearing Messages Setup Command
fredi({
  nomCom: 'disap',
  categorie: "Group",
  reaction: '❦'
}, async (chatId, client, context) => {
  const { repondre, verifGroupe, verifAdmin } = context;

  if (!verifGroupe) {
    return repondre("This command works in groups only");
  }

  if (!verifAdmin) {
    return repondre("You are not an admin here!");
  }

  repondre("*Do you want to turn on disappearing messages?*\n\nType one of the following:\n*disap1* for 1 day\n*disap7* for 7 days\n*disap90* for 90 days\nOr type *disap-off* to turn it off.");
});

// Disappearing Messages Commands (1, 7, 90 days)
fredi({ nomCom: "disap1", categorie: "Group", reaction: '⚪' }, async (chatId, client, context) => {
  handleDisapCommand(chatId, client, context, 86400); // 1 day
});
fredi({ nomCom: "disap7", categorie: 'Group', reaction: '⚪' }, async (chatId, client, context) => {
  handleDisapCommand(chatId, client, context, 604800); // 7 days
});
fredi({ nomCom: "disap90", categorie: 'Group', reaction: '⚪' }, async (chatId, client, context) => {
  handleDisapCommand(chatId, client, context, 7776000); // 90 days
});

// Requests Command
fredi({
  nomCom: 'req',
  alias: 'requests',
  categorie: "Group",
  reaction: "⚪"
}, async (chatId, client, context) => {
  const { repondre, verifGroupe, verifAdmin } = context;

  if (!verifGroupe) {
    return repondre("This command works in groups only");
  }

  if (!verifAdmin) {
    return repondre("You are not an admin here!");
  }

  const pendingRequests = await client.groupRequestParticipantsList(chatId);
  if (pendingRequests.length === 0) {
    return repondre("There are no pending join requests.");
  }

  let requestList = pendingRequests.map(request => `+${request.jid.split('@')[0]}`).join("\n");
  await client.sendMessage(chatId, {
    text: `Pending Participants:- 🕓\n${requestList}\n\nUse the command approve or reject to approve or reject these join requests.`
  });
  repondre(requestList);
});

// Approve/Reject Requests Command
const handleRequestCommand = async (chatId, client, context, action) => {
  const { repondre, verifGroupe, verifAdmin } = context;

  if (!verifGroupe) {
    return repondre("This command works in groups only");
  }

  if (!verifAdmin) {
    return repondre("You are not an admin here!");
  }

  const pendingRequests = await client.groupRequestParticipantsList(chatId);
  if (pendingRequests.length === 0) {
    return repondre(`There are no pending join requests for this group.`);
  }

  for (const request of pendingRequests) {
    await client.groupRequestParticipantsUpdate(chatId, [request.jid], action);
  }

  repondre(`All pending join requests have been ${action === "approve" ? "approved" : "rejected"}.`);
};

// Approve Requests Command
fredi({
  nomCom: "approve",
  categorie: "Group",
  reaction: "⚪"
}, (chatId, client, context) => handleRequestCommand(chatId, client, context, "approve"));

// Reject Requests Command
fredi({
  nomCom: "reject",
  categorie: "Group",
  reaction: "⚪"
}, (chatId, client, context) => handleRequestCommand(chatId, client, context, "reject"));
