const WHATSAPP_NUMBER = "554899695663";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Rua%200%2C%2000";

const products = [
  {
    id: "mini-chocolate",
    name: "Mini Bolo de Chocolate",
    category: "individuais",
    tag: "Individual",
    description: "Mini bolo de chocolate com cobertura, chantilly e morango.",
    image: "images/mapa-real-3.jpg"
  },
  {
    id: "mini-morango",
    name: "Mini Bolo com Morango",
    category: "individuais",
    tag: "Delicado",
    description: "Uma opção individual decorada com chocolate e morango fresco.",
    image: "images/mapa-real-3.jpg"
  },
  {
    id: "bolo-morango",
    name: "Bolo de Morango",
    category: "inteiros",
    tag: "Frutas frescas",
    description: "Bolo inteiro com cobertura clara e decoração de morangos.",
    image: "images/mapa-real-4.jpg"
  },
  {
    id: "bolo-familia",
    name: "Bolo para Compartilhar",
    category: "inteiros",
    tag: "Sob encomenda",
    description: "Escolha tamanho, massa, recheio e acabamento para compartilhar.",
    image: "images/mapa-real-4.jpg"
  },
  {
    id: "bolo-festa",
    name: "Bolo para Festa",
    category: "festas",
    tag: "Celebrações",
    description: "Orçamento personalizado conforme o número de convidados e a ocasião.",
    image: "images/mapa-real-3.jpg"
  },
  {
    id: "bolo-personalizado",
    name: "Bolo Personalizado",
    category: "personalizados",
    tag: "Do seu jeito",
    description: "Envie o tema, as cores e sua referência para receber um orçamento.",
    image: "images/mapa-real-4.jpg"
  }
];

const state = {
  filter: "todos",
  items: []
};

const productGrid = document.querySelector("#productGrid");
const quoteDrawer = document.querySelector("#quoteDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const quoteItems = document.querySelector("#quoteItems");
const emptyState = document.querySelector("#emptyState");
const customerFields = document.querySelector("#customerFields");
const quoteCount = document.querySelector("#quoteCount");
const quoteForm = document.querySelector("#quoteForm");
const addressFields = document.querySelector("#addressFields");
const formError = document.querySelector("#formError");

function renderProducts() {
  const visibleProducts = state.filter === "todos"
    ? products
    : products.filter((product) => product.category === state.filter);

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <button class="button button-dark" type="button" data-add-product="${product.id}">
          Pedir orçamento
        </button>
      </div>
    </article>
  `).join("");
}

function openQuote() {
  drawerBackdrop.hidden = false;
  quoteDrawer.classList.add("open");
  quoteDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeQuote() {
  quoteDrawer.classList.remove("open");
  quoteDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => {
    drawerBackdrop.hidden = true;
  }, 240);
}

function addProduct(productId) {
  const existingItem = state.items.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.items.push({ productId, quantity: 1, note: "" });
  }
  renderQuote();
  openQuote();
}

function updateQuantity(productId, change) {
  const item = state.items.find((candidate) => candidate.productId === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    state.items = state.items.filter((candidate) => candidate.productId !== productId);
  }
  renderQuote();
}

function removeItem(productId) {
  state.items = state.items.filter((item) => item.productId !== productId);
  renderQuote();
}

function renderQuote() {
  const hasItems = state.items.length > 0;
  emptyState.hidden = hasItems;
  customerFields.hidden = !hasItems;
  quoteCount.textContent = state.items.reduce((total, item) => total + item.quantity, 0);

  quoteItems.innerHTML = state.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return `
      <div class="quote-item">
        <img src="${product.image}" alt="">
        <div>
          <h4>${product.name}</h4>
          <div class="quantity" aria-label="Quantidade de ${product.name}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Diminuir">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remover ${product.name}">×</button>
        <label class="item-note">
          <input type="text" value="${escapeAttribute(item.note)}" data-note="${product.id}" placeholder="Observação deste item">
        </label>
      </div>
    `;
  }).join("");
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function selectedFulfillment() {
  return document.querySelector('input[name="fulfillment"]:checked').value;
}

function updateFulfillment() {
  const delivery = selectedFulfillment() === "Entrega";
  addressFields.classList.toggle("hidden", !delivery);
}

function nextQuoteNumber() {
  const current = Number(localStorage.getItem("padariaQuoteNumber") || "0");
  const next = current + 1;
  localStorage.setItem("padariaQuoteNumber", String(next));
  return String(next).padStart(4, "0");
}

function getValue(selector) {
  return document.querySelector(selector).value.trim();
}

function validateForm() {
  const requiredValues = [
    ["#customerName", "Informe seu nome."],
    ["#customerPhone", "Informe seu WhatsApp."]
  ];

  if (selectedFulfillment() === "Entrega") {
    requiredValues.push(
      ["#street", "Informe a rua para entrega."],
      ["#streetNumber", "Informe o número do endereço."],
      ["#district", "Informe o bairro."]
    );
  }

  const missing = requiredValues.find(([selector]) => !getValue(selector));
  if (missing) {
    document.querySelector(missing[0]).focus();
    formError.textContent = missing[1];
    return false;
  }

  formError.textContent = "";
  return true;
}

function buildWhatsAppMessage() {
  const quoteNumber = nextQuoteNumber();
  const fulfillment = selectedFulfillment();
  const lines = [
    `*PEDIDO DE ORÇAMENTO #${quoteNumber}*`,
    "*Padaria*",
    "",
    "*PRODUTOS DE INTERESSE*"
  ];

  state.items.forEach((item, index) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    lines.push(`${index + 1}. ${item.quantity}x ${product.name}`);
    if (item.note) lines.push(`   Obs.: ${item.note}`);
  });

  lines.push(
    "",
    "*CLIENTE*",
    `Nome: ${getValue("#customerName")}`,
    `WhatsApp: ${getValue("#customerPhone")}`
  );

  if (getValue("#customerCpf")) lines.push(`CPF: ${getValue("#customerCpf")}`);

  lines.push("", "*ATENDIMENTO*", `Modalidade: ${fulfillment}`);

  if (fulfillment === "Entrega") {
    lines.push(
      `Endereço: ${getValue("#street")}, ${getValue("#streetNumber")}`,
      `Bairro: ${getValue("#district")}`
    );
    if (getValue("#complement")) lines.push(`Complemento: ${getValue("#complement")}`);
    if (getValue("#referencePoint")) lines.push(`Referência: ${getValue("#referencePoint")}`);
  }

  if (getValue("#preferredTime")) lines.push(`Preferência: ${getValue("#preferredTime")}`);
  if (getValue("#generalNotes")) lines.push(`Observações: ${getValue("#generalNotes")}`);

  lines.push(
    "",
    "Gostaria de confirmar sabores, tamanhos, disponibilidade e valor.",
    `Referência do local: ${MAPS_URL}`
  );

  return lines.join("\n");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-product]");
  const filterButton = event.target.closest("[data-filter]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) addProduct(addButton.dataset.addProduct);

  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
    });
    renderProducts();
  }

  if (quantityButton) {
    updateQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  }

  if (removeButton) removeItem(removeButton.dataset.remove);
  if (event.target.closest("[data-open-quote]")) openQuote();
  if (event.target.closest("[data-close-quote]")) closeQuote();
});

quoteItems.addEventListener("input", (event) => {
  if (!event.target.matches("[data-note]")) return;
  const item = state.items.find((candidate) => candidate.productId === event.target.dataset.note);
  if (item) item.note = event.target.value;
});

document.querySelectorAll('input[name="fulfillment"]').forEach((input) => {
  input.addEventListener("change", updateFulfillment);
});

drawerBackdrop.addEventListener("click", closeQuote);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quoteDrawer.classList.contains("open")) closeQuote();
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.items.length || !validateForm()) return;
  const message = buildWhatsAppMessage();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

renderProducts();
renderQuote();
updateFulfillment();
