import { Web } from "sip.js";

const api = "http://localhost:8000";
const runButton = document.getElementById("runButton");
const hangupButton = document.getElementById("hangupButton");
//use 180 -> 100
var height = 0; 
// use 75 -> 200
var weight = 0;

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
  const data = { aor, name, weight, height };
  console.log("!!!!!!!!!!!!!!!!!!!");
  console.log(weight);
  console.log(height);
  await fetch(`${api}/call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
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
    height = document.getElementById('height').value;
    weight = document.getElementById('weight').value;
    runCall(aor, "Peter").catch(() => {
      runButton.disabled = false;
    });
  });

  hangupButton.addEventListener("click", async () => {
    hangupButton.disabled = true;
    await user.hangup().catch(() => {
      hangupButton.disabled = false;
    });
  });
};

main();
