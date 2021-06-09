// noinspection DuplicatedCode

const { Telegraf } = require('telegraf');

const { getAvailableSessionsByDist } = require("./api");

const bot = new Telegraf(process.env.BOT_TOKEN);

const schedules = require('./schedules.json');

const formatSessionMessage = (session) => {
  const { date, available_capacity, available_capacity_dose1, available_capacity_dose2, min_age_limit, vaccine } = session;
  if (available_capacity <= 0) return '';
  let msg = '';
  msg += '```\n\n';
  msg += `Date    - ${date}\n`
  msg += `Total   - ${available_capacity} Doses\n`
  msg += `Dose 1  - ${available_capacity_dose1} Doses\n`
  msg += `Dose 2  - ${available_capacity_dose2} Doses\n`
  msg += `Age     - ${min_age_limit}+ Minimum\n`;
  msg += `Vaccine - ${vaccine}\n`;
  msg += '\n\n```';
  return msg;
}

// const formatNoSlotsAvailableMessage = (name) => `Sorry *${name}*\nThere are no available slots in your place!!`

const messageFormatter = (center, username) => {
    const {name, address, state_name, district_name, pincode, sessions} = center;
    const header = `*${name}* \n${address},\n${state_name}, ${district_name}, ${pincode}\n`;
    const sessionDetails = sessions.reduce((msg, session) => msg + formatSessionMessage(session), '');
    return sessionDetails === '' ? '' : header + sessionDetails;
}

const formatAndSendMessage = ({ centers }, username, userId) => {
  centers.forEach(async (center) => {
    const message = messageFormatter(center, username)
    // console.log(message)
    message && await bot.telegram.sendMessage(userId, message, {parse_mode: 'Markdown'});
  });
}

fetchDataAndNotify = ({ districtId, name, userId }) => {
  console.log(`Started the schedule for ${name} ${userId}`, new Date().toLocaleString())
  getAvailableSessionsByDist(districtId).then((res) => {
    console.log("Fetched Data");
    formatAndSendMessage(res, name, userId);
  }).catch(console.log);
}

setInterval(() => schedules.forEach(fetchDataAndNotify), 0.5 * 60 * 1000);
