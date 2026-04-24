let coins = Number(localStorage.getItem("coins")) || 0;
let boxes = Number(localStorage.getItem("boxes")) || 0;
let rare = Number(localStorage.getItem("rare")) || 0;

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

const coinsEl = document.getElementById("coins");
const boxesEl = document.getElementById("boxes");
const rareEl = document.getElementById("rare");

function updateStats() {
  coinsEl.textContent = coins;
  boxesEl.textContent = boxes;
  rareEl.textContent = rare;

  localStorage.setItem("coins", coins);
  localStorage.setItem("boxes", boxes);
  localStorage.setItem("rare", rare);
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

openBtn.addEventListener("click", () => {
  openBtn.disabled = true;
  box.textContent = "🎁";
  box.classList.add("spin");
  result.textContent = "✨ ყუთი იხსნება...";

  setTimeout(() => {
    const item = chooseItem();

    coins += item.coins;
    boxes += 1;

    if (item.coins >= 150) {
      rare += 1;
    }

    box.textContent = item.emoji;

    result.innerHTML = `
      შენ მოიგე:<br>
      <b>${item.emoji} ${item.name}</b><br>
      🪙 +${item.coins} coins
    `;

    box.classList.remove("spin");
    openBtn.disabled = false;
    updateStats();
  }, 900);
});

updateStats();