let coins = Number(localStorage.getItem("coins")) || 0;
let boxes = Number(localStorage.getItem("boxes")) || 0;
let rare = Number(localStorage.getItem("rare")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;
let lastDaily = localStorage.getItem("lastDaily") || "";
let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");

const items = [
  { name: "Common Coin Bag", emoji: "🪙", coins: 20, chance: 60 },
  { name: "Silver Chest", emoji: "🥈", coins: 45, chance: 25 },
  { name: "Golden Chest", emoji: "🥇", coins: 80, chance: 10 },
  { name: "Diamond Drop", emoji: "💎", coins: 150, chance: 4 },
  { name: "Legendary Crown", emoji: "👑", coins: 300, chance: 1 }
];

const box = document.getElementById("box");
const openBtn = document.getElementById("openBtn");
const result = document.getElementById("result");
const cooldown = document.getElementById("cooldown");
const panel = document.getElementById("panel");

const coinsEl = document.getElementById("coins");
const boxesEl = document.getElementById("boxes");
const rareEl = document.getElementById("rare");
const streakEl = document.getElementById("streak");
const API_URL = "https://ravine-outcome-suitor.ngrok-free.dev";

let user_id = 0;

openBtn.addEventListener("click", async () => {

  if (lastDaily === todayString()) {
    result.textContent = "⏳ დღეს უკვე გახსენი ყუთი.";
    return;
  }

  openBtn.disabled = true;
  result.textContent = "✨ იღბალი ტრიალებს...";
  box.classList.add("spin");

  try {
    const res = await fetch(API_URL + "/api/daily", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id })
    });

    const data = await res.json();

    setTimeout(() => {
      box.classList.remove("spin");
      box.textContent = data.emoji;

      result.innerHTML = `
        🎉 შენ მოიგე:<br>
        <b>${data.emoji} ${data.item}</b><br>
        🪙 +${data.reward} coins<br>
        🔥 Bonus: +${data.bonus}
      `;

      coins = data.coins;
      streak = data.streak;

      updateStats();
      openBtn.disabled = false;

    }, 1500);

  } catch (err) {
    console.error(err);
    result.textContent = "❌ შეცდომა. სცადე ისევ.";
    openBtn.disabled = false;
  }

});

if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
  user_id = window.Telegram.WebApp.initDataUnsafe.user.id;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function loadProfile() {
  const res = await fetch(API_URL + "/api/profile", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({user_id})
  });

  const data = await res.json();

  coins = data.coins;
  boxes = data.boxes;
  rare = data.rare;
  streak = data.streak;

  updateStats();
}

function save() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("boxes", boxes);
  localStorage.setItem("rare", rare);
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastDaily", lastDaily);
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

function updateStats() {
  coinsEl.textContent = coins;
  boxesEl.textContent = boxes;
  rareEl.textContent = rare;
  streakEl.textContent = streak;

  const today = todayString();

  if (lastDaily === today) {
    openBtn.disabled = true;
    cooldown.textContent = "⏳ დღიური ყუთი უკვე გახსნილია. დაბრუნდი ხვალ.";
  } else {
    openBtn.disabled = false;
    cooldown.textContent = "✅ Daily Box მზადაა გასახსნელად";
  }

  save();
}

function chooseItem() {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  let pick = Math.random() * total;

  for (const item of items) {
    if (pick < item.chance) return item;
    pick -= item.chance;
  }

  return items[0];
}

function addInventory(item) {
  const key = `${item.emoji} ${item.name}`;
  inventory[key] = (inventory[key] || 0) + 1;
}

function updateStreak() {
  if (lastDaily === yesterdayString()) {
    streak += 1;
  } else if (lastDaily !== todayString()) {
    streak = 1;
  }
}

openBtn.addEventListener("click", () => {
  if (lastDaily === todayString()) {
    result.textContent = "⏳ დღეს უკვე გახსენი ყუთი.";
    updateStats();
    return;
  }

  openBtn.disabled = true;
  result.textContent = "✨ იღბალი ტრიალებს...";
  box.textContent = "🎁";
  box.classList.add("spin");

  const frames = ["🎁", "🥈", "🥇", "💎", "👑", "🎁"];
  let i = 0;

  const interval = setInterval(() => {
    box.textContent = frames[i % frames.length];
    i++;
  }, 180);

  setTimeout(() => {
    clearInterval(interval);

    const item = chooseItem();
    const streakBonus = streak + 1 > 1 ? (streak + 1) * 5 : 5;

    updateStreak();

    coins += item.coins + streakBonus;
    boxes += 1;

    if (item.coins >= 150) {
      rare += 1;
    }

    lastDaily = todayString();
    addInventory(item);

    box.classList.remove("spin");
    box.textContent = item.emoji;

    const rareText = item.coins >= 150 ? `<br><span class="rare">💎 RARE DROP!</span>` : "";

    result.innerHTML = `
      🎉 შენ მოიგე:<br>
      <b>${item.emoji} ${item.name}</b><br>
      🪙 +${item.coins} coins<br>
      🔥 Streak bonus: +${streakBonus}
      ${rareText}
    `;

    updateStats();
  }, 1800);
});

function showInventory() {
  const keys = Object.keys(inventory);

  if (keys.length === 0) {
    panel.innerHTML = "🎒 Inventory ცარიელია. გახსენი Daily Box.";
    return;
  }

  let html = "🎒 <b>Inventory</b><br><br>";
  keys.forEach(key => {
    html += `${key} x${inventory[key]}<br>`;
  });

  panel.innerHTML = html;
}

function showProfile() {
  panel.innerHTML = `
    👤 <b>Profile</b><br><br>
    🪙 Coins: ${coins}<br>
    🎁 Boxes opened: ${boxes}<br>
    💎 Rare drops: ${rare}<br>
    🔥 Daily streak: ${streak}<br>
  `;
}

function showTop() {
  panel.innerHTML = `
    🏆 <b>Top Players</b><br><br>
    ჯერ local ვერსიაა.<br>
    შემდეგ ეტაპზე leaderboard-ს Python database-ს დავუკავშირებთ.
  `;
}

updateStats();
showProfile();
