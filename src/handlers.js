const { getStates, getDistricts, getAvailableSessionsByDist } = require('./api')

const logger = (ctx, next) => {
  const message = ctx.match ? ctx.match.input : ctx.update.message.text;
  console.info(`${message} - ${ctx.from.first_name} - ${ctx.from.id} ${Date.now()}`);
  next();
}

const introMessage = 'As we all are aware of the current situation of *Covid-19* ' +
  'the only possible way of resisting the pandemic is by taking preventive measures ' +
  'and by taking the vaccination as soon as possible. As you know the availability ' +
  'of vaccine in India is less, getting a vaccine slot for us and our family is a ' +
  'tricky thing. So by considering the situation I am small chat bot trying to help ' +
  'you to get vaccination slots in a possible way I could. Please provide the State ' +
  'and District you are residing so that I could notify you through message whenever ' +
  'there is a available slots in your location\n\n\n' +
  'Please send a `register` message to initiate the process of choosing the location';


const welcomeUser = async(ctx) => {
  const greeting = `Hi *${ctx.from.first_name}* 👋`;
  await ctx.replyWithMarkdown(greeting);
  await ctx.replyWithMarkdown(introMessage);
}

const initialAction = async (ctx) => {
  const message = `Great decision to take vaccination lets check the Availability slots\nShall we start!`;
  const markupMessage = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Start", callback_data: 'start registration' }
        ],
      ]
    }
  }
  await ctx.telegram.sendMessage(ctx.chat.id, message, markupMessage);
};

const startAction = (ctx) => {
  const message = 'Started\nPlease select one state from the list';
  getStates().then(async ({states}) => {
    const statesList = states.map(({state_id, state_name}) => ([{
      text: state_name,
      callback_data: `state ${state_name} ${state_id}`
    }]))
    await ctx.telegram.sendMessage(ctx.chat.id, message, {
      reply_markup: {
        inline_keyboard: statesList
      }
    })
  })
};

const stateAction = (ctx) => {
  ctx.deleteMessage();
  const [,name, id] = ctx.match;
  const message = `You selected ${name} as the State\nPlease select a district`;
  getDistricts(id).then(async ({ districts }) => {
    const districtList = districts.map(({ district_id, district_name }) => ([{
      text: district_name,
      callback_data: `district ${district_name} ${district_id}`
    }]))
    await ctx.telegram.sendMessage(ctx.chat.id, message, {
      reply_markup: {
        inline_keyboard: districtList
      }
    })
  })
};

const messageFormatter = (ctx, {centers}) => {
  let availableCenters = 0;
  centers.forEach((center) => {
    const {name, address, state_name, district_name, pincode, sessions} = center;
    const header = `*${name}* \n${address},\n${state_name}, ${district_name}, ${pincode}`;
    let sessionDetails = '';
    sessions.forEach((session) => {
      const {
        date,
        available_capacity,
        available_capacity_dose1,
        available_capacity_dose2,
        min_age_limit,
        vaccine
      } = session;
      if (available_capacity > 0) {
        sessionDetails += '```\n\n';
        sessionDetails += `Date    - ${new Date(date).toDateString()}\n`
        sessionDetails += `Total   - ${available_capacity} Doses\n`
        sessionDetails += `Dose 1  - ${available_capacity_dose1} Doses\n`
        sessionDetails += `Dose 2  - ${available_capacity_dose2} Doses\n`
        sessionDetails += `Age     - ${min_age_limit}+ Minimum\n`;
        sessionDetails += `Vaccine - ${vaccine}\n`;
        sessionDetails += '\n\n```';
      }
    })
    if(sessionDetails.length > 0) {
      const messageAboutCenter = header + '\n' + sessionDetails;
      ctx.replyWithMarkdown(messageAboutCenter)
      availableCenters++;
    }
  })
  if(availableCenters <= 0){
    return ctx.replyWithMarkdown(`Sorry *${ctx.from.first_name}*\nThere are no available slots in your place!!`);
  }
}

const districtAction = (ctx) => {
  ctx.deleteMessage();
  const [,name, id] = ctx.match;
  ctx.reply(`You selected ${name} as the District`);
  getAvailableSessionsByDist(id).then((res) => {
    messageFormatter(ctx, res)
  }).catch(console.log);
};

const undefinedMessageAction = async (ctx) => {
  const message = `Sorry *${ctx.from.first_name}*, ` +
    'Not able to understand your last message. Please send `help` message to see the possible actions';
  await ctx.replyWithMarkdown(message)
}

module.exports = { logger, welcomeUser, initialAction, stateAction, startAction, districtAction, undefinedMessageAction }