const tmi = require('tmi.js');
const config = require('./config.json');
var mqtt = require('mqtt')
var mq_client  = mqtt.connect(config.MQTT_URL);

mq_client.on('connect', function () {
    mq_client.subscribe('kaaroStream/streaming_canvas', function (err) {
      if (!err) {
        mq_client.publish('kaaroStream/twitch_chat_listener', 'Hello from twichBot')
      }
    })
  })
   

// Define configuration options
const opts = {
  identity: {
    username: config.BOT_USERNAME,
    password: config.OAUTH_TOKEN
  },
  channels: [
    config.CHANNEL_NAME
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!kaarodice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  }  else if (commandName === '!camera') {
      console.log(`Camera Switch Send`);
      mq_client.publish('kaaroStream/cameraSwitch', 'Poptarts');
  } else {
    console.log(`* Sending to MQTT ${commandName}`);
    mq_client.publish('kaaroStream/input', commandName);
  }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}