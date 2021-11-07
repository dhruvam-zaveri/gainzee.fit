const dasha = require("@dasha.ai/sdk");
const { v4: uuidv4, NIL } = require("uuid");
const express = require("express");
const cors = require("cors");
const exercises = ["Jumping Jacks", "High Knees", "Burpees", "Scissor Steps", "Squats", "Mountain Climbers"];
const durations = ["15000", "15000", "15000", "15000", "15000", "15000"];
var index_exercise = 0;
var index_duration = 0;
var user_weight = 0;
var user_height = 0;
var workout_type = -1; 


const expressApp = express();
expressApp.use(express.json());
expressApp.use(cors());

const main = async () => {
  const app = await dasha.deploy(`${__dirname}/app`);
  await app.start({ concurrency: 10 });

  expressApp.get("/sip", async (req, res) => {
    const domain = app.account.server.replace("app.", "sip.");
    const endpoint = `wss://${domain}/sip/connect`;

    // client sip address should:
    // 1. start with `sip:reg`
    // 2. to be unique
    // 3. use the domain as the sip server
    const aor = `sip:reg-${uuidv4()}@${domain}`;

    res.send({ aor, endpoint });
  });

  expressApp.post("/call", async (req, res) => {
    const { aor, name, weight, height } = req.body;
    user_weight = Number(weight);
    user_height = Number(height);
    var bmi = Number(Math.round(weight / Math.pow(height, 2) * 10000));
    console.log("==============")
    console.log(bmi);
    if (bmi <= 25) {
      // Muscle building workout
      workout_type = 1;
    } else if (bmi > 25) {
      // Cardio
      workout_type = 0;
    } else {
      workout_type = -1;
    }
    res.sendStatus(200);

    console.log("Start call for", req.body);
    const conv = app.createConversation({ endpoint: aor, name });
    conv.on("transcription", console.log);
    conv.audio.tts = "dasha";
    conv.audio.noiseVolume = 0;

    await conv.execute();
  });

  const server = expressApp.listen(8000, () => {
    console.log("Api started on port 8000.");
  });

  process.on("SIGINT", () => server.close());
  server.once("close", async () => {
    await app.stop();
    app.dispose();
  });

  // external function set exercise and duration variable to next one on list
  app.setExternal("next_exercise", (args, conv) => {
    var exercises;
    if (workout_type == 0) {
      exercises = ["Jumping Jacks", "High Knees", "Burpees", "Scissor Steps", "Squats", "Mountain Climbers"];
    } else {
      exercises = ["Push Ups", "Squats", "Pull Ups", "Planks", "Wall Sits", "Bench Press", "Incline Press"];
    }
    console.log(workout_type);
    const exercise = exercises[index_exercise];
    index_exercise = index_exercise + 1;
    if (index_exercise + 1 >= exercises.length) {
      return "-1";
    }
    return exercise;
  });

  app.setExternal("next_duration", (args, conv) => {
    // var durations = ["15000", "15000", "15000", "15000", "15000", "15000"];
    // const duration = durations[index_duration];
    // index_duration = index_duration + 1;
    // if (index_duration >= exercises.length) {
    //   return "-1";
    // }
    return "15";
  });

  
};

main();
