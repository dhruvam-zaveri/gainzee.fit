import { Web } from "sip.js";

const api = "http://localhost:8000";
const runButton = document.getElementById("runButton");
const hangupButton = document.getElementById("hangupButton");
//use 180 -> 100
var height = 0;
// use 75 -> 200
var weight = 0;
var exercises = [];
var amount = [];

const getAccount = async () => {
  const response = await fetch(`${api}/sip`);
  const { aor, endpoint } = await response.json();
  return { aor, endpoint };
};

const createUser = async (aor, server) => {
  const user = new Web.SimpleUser(server, { aor });
  await user.connect();
  await user.register();
  return user;
};

const runCall = async (aor, name) => {
  const data = { aor, name, exercise, amount };
  console.log("!!!!!!!!!!!!!!!!!!!");
  console.log(data);
  console.log("!!!!!!!!!!!!!!!!!!!");
  await fetch(`${api}/call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const setData = () => {
  let cardio_exercises = [
    "Jumping Jacks",
    "High Knees",
    "Burpees",
    "Scissor Steps",
    "Squats",
    "Mountain Climbers",
  ];
  let muscle_exercises = [
    "Push Ups",
    "Squats",
    "Pull Ups",
    "Planks",
    "Wall Sits",
    "Bench Press",
    "Incline Press",
  ];
  let duration = [15, 15, 15, 15, 15, 15];
  let set_reps = [
    "2 sets of 12",
    "2 sets of 15",
    "2 sets of 8",
    "15 seconds",
    "15 seconds",
    "3 sets of 8",
    "3 sets of 8",
  ];
  let height = document.getElementById("height").value;
  let weight = document.getElementById("weight").value;
  let bmi = Math.round((weight / (height * height)) * 10000, 1);
  // let exercises = [];
  // let amount = [];
  // let headers = [];
  if (bmi >= 25.0) {
    exercises = cardio_exercises;
    amount = duration;
  } else {
    exercises = muscle_exercises;
    amount = set_reps;
  }
};

const main = async () => {
  const { aor, endpoint } = await getAccount();
  const user = await createUser(aor, endpoint);

  const audio = new Audio();
  user.delegate = {
    onCallReceived: async () => {
      await user.answer();
      runButton.hidden = true;
      hangupButton.hidden = false;
      hangupButton.disabled = false;
      audio.srcObject = user.remoteMediaStream;
      audio.play();
    },
    onCallHangup: () => {
      audio.srcObject = null;
      runButton.hidden = false;
      runButton.disabled = false;
      hangupButton.hidden = true;
    },
  };

  runButton.addEventListener("click", async () => {
    runButton.disabled = true;
    setData();
    if (exercises != [] && amount != []) {
      runCall(aor, "Peter").catch(() => {
        runButton.disabled = false;
      });
    }
  });

  hangupButton.addEventListener("click", async () => {
    hangupButton.disabled = true;
    await user.hangup().catch(() => {
      hangupButton.disabled = false;
    });
  });
};

main();
