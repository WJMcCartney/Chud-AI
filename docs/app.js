const messagesEl = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const starters = document.getElementById("starters");

const MAX_HISTORY = 20; // 10 back-and-forth turns
const history = []; // { role: "user" | "chud", text }

const GREETINGS = [
  "ugh. what do you want.",
  "oh great, another person. ask your dumb question i guess.",
  "*sigh* fine. i'm listening. barely.",
];

// Used when WORKER_URL isn't set yet, so the page still works as a demo.
const DEMO_REPLIES = [
  "bro that's so easy. the answer is 7. it's always 7. *sigh*",
  "everyone knows that was invented by napoleon in 1994. read a book.",
  "the moon is actually a government drone. i can't believe you didn't know that.",
  "that's because of gravity. gravity is just wind going down. obviously.",
  "ugh. it's purple. next question.",
  "i'm not even going to answer that. ok fine: bananas. the answer is bananas.",
];

function addMessage(role, text, extraClass) {
  const row = document.createElement("div");
  row.className = `msg ${role}${extraClass ? " " + extraClass : ""}`;

  if (role === "chud") {
    const img = document.createElement("img");
    img.src = "chud.svg";
    img.alt = "";
    img.className = "avatar";
    row.appendChild(img);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return row;
}

async function askChud(message) {
  if (!WORKER_URL) {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));
    return { reply: DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)] };
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-MAX_HISTORY) }),
    });
    const data = await res.json().catch(() => ({}));
    return { reply: data.reply || "something broke and it's definitely your fault.", error: !res.ok };
  } catch {
    return { reply: "i can't reach my brain right now. probably your wifi. classic.", error: true };
  }
}

async function send(text) {
  const message = text.trim();
  if (!message || sendBtn.disabled) return;

  starters.hidden = true;
  input.value = "";
  sendBtn.disabled = true;
  addMessage("user", message);

  const typing = addMessage("chud", "Lil Chud is typing... reluctantly", "typing");
  const { reply, error } = await askChud(message);
  typing.remove();
  addMessage("chud", reply, error ? "error" : "");

  if (!error) {
    history.push({ role: "user", text: message }, { role: "chud", text: reply });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  }

  sendBtn.disabled = false;
  input.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  send(input.value);
});

starters.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") send(e.target.textContent);
});

addMessage("chud", GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
if (!WORKER_URL) addMessage("chud", "(demo mode: the AI isn't hooked up yet, so i'm just making stuff up. like usual.)");
input.focus();
