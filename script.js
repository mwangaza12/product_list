let data = [];
let cart = [];

// Fetch product data
async function getData() {
  const response = await fetch("data.json");
  const dataFromJSON = await response.json();
  data = dataFromJSON.map((item, index) => ({
    id: index,
    name: item.name,
    category: item.category,
    price: item.price,
    image: item.image.desktop,
  }));
  renderProducts(data);
}

// Rendering product cards
function renderProducts(products) {
  const list = document.querySelector('.products.list');

  products.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', item.id); // Add this
    const isInCart = cart.find(p => p.id === item.id);

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.className = 'card-img';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart';
    addToCartBtn.innerHTML = `<img src="./assets/images/icon-add-to-cart.svg" alt="cart"> Add to Cart`;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
      <p class="category">${item.category}</p>
      <h2 class="product-name">${item.name}</h2>
      <p class="price">$${item.price.toFixed(2)}</p>
    `;

    buttonContainer.appendChild(addToCartBtn);
    card.append(img, buttonContainer, cardBody);
    list.appendChild(card);

    addToCartBtn.addEventListener('click', () => {
      addToCart(item);
      showStepper(buttonContainer, item);
    });

    if (isInCart) {
      showStepper(buttonContainer, item);
    }
  });
}

function showStepper(container, item) {
  container.innerHTML = '';

  const stepper = document.createElement('div');
  stepper.className = 'stepper';

  const decreaseBtn = document.createElement('button');
  decreaseBtn.textContent = '−';

  const qtySpan = document.createElement('span');
  qtySpan.className = 'qty';
  qtySpan.textContent = cart.find(i => i.id === item.id)?.quantity || 1;

  const increaseBtn = document.createElement('button');
  increaseBtn.textContent = '+';

  decreaseBtn.addEventListener('click', () => {
    changeQuantity(item.id, -1);
    const inCart = cart.find(i => i.id === item.id);
    if (!inCart) {
      showAddToCart(container, item);
    } else {
      qtySpan.textContent = inCart.quantity;
    }
  });

  increaseBtn.addEventListener('click', () => {
    changeQuantity(item.id, 1);
    const updated = cart.find(i => i.id === item.id);
    qtySpan.textContent = updated.quantity;
  });

  stepper.append(decreaseBtn, qtySpan, increaseBtn);
  container.appendChild(stepper);
}

function showAddToCart(container, item) {
  container.innerHTML = '';

  const addToCartBtn = document.createElement('button');
  addToCartBtn.className = 'add-to-cart';
  addToCartBtn.innerHTML = `<img src="./assets/images/icon-add-to-cart.svg" alt="cart"> Add to Cart`;
  addToCartBtn.addEventListener('click', () => {
    addToCart(item);
    showStepper(container, item);
  });

  container.appendChild(addToCartBtn);
}

// Add item to cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }
  updateCartUI();
  const container = document.querySelector(`.card[data-id="${product.id}"] .button-container`);
  if (container) showStepper(container, product);
}

// Remove item completely
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  const container = document.querySelector(`.card[data-id="${productId}"] .button-container`);
  const product = data.find(p => p.id === productId);
  if (container && product) showAddToCart(container, product);
}

// Increase/decrease quantity
function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
      const container = document.querySelector(`.card[data-id="${productId}"] .button-container`);
      const product = data.find(p => p.id === productId);
      if (container && product) showStepper(container, product);
    }
}

// Update cart interface
function updateCartUI() {
  const cartTitle = document.querySelector('.cart-title');
  const cartImg = document.querySelector('.cart-img');
  const cartEmpty = document.querySelector('.cart-empty');
  const cartDiv = document.querySelector('.cart');
  let total = 0;

  cartTitle.textContent = `Your Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})`;

  cartDiv.querySelectorAll('.cart-item').forEach(el => el.remove());
  const existingTotalDiv = cartDiv.querySelector('.cart-total');
  if (existingTotalDiv) existingTotalDiv.remove();

  if (cart.length > 0) {
    cartImg.style.display = 'none';
    cartEmpty.style.display = 'none';

    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      total += item.price * item.quantity;
      itemDiv.innerHTML = `
        <p>${item.name}</p>
        <p>$${item.price.toFixed(2)} @ ${item.quantity}</p>
        <div class="controls">
          <button class="remove"><img src="./assets/images/icon-remove-item.svg"></button>
        </div>
      `;
      itemDiv.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));
      cartDiv.appendChild(itemDiv);
    });

    // Add total at the bottom
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    cartDiv.appendChild(totalDiv);
  } else {
    cartImg.style.display = 'block';
    cartEmpty.style.display = 'block';
  }
}


// Modal handling
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.confirm-order')?.addEventListener('click', () => {
    if (cart.length === 0) return alert("Cart is empty.");
    populateModal();
    document.getElementById('modal').classList.remove('hidden');
  });

  document.querySelector('.new-order')?.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
  });

  getData();
});

function populateModal() {
  const modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'confirmation-header';
  header.innerHTML = `
    <span class="checkmark"><img src="./assets/images/icon-order-confirmed.svg" alt="Empty Cart" class="cart-img"></span>
    <h2>Order Confirmed</h2>
    <p>We hope you enjoy your food!</p>
  `;

  const summaryList = document.createElement('ul');
  summaryList.className = 'order-summary';

  let total = 0;

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'item';

    const img = document.createElement('img');
    const product = data.find(p => p.id === item.id);
    img.src = product.image;
    img.alt = item.name;

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<p>${item.name}</p><p><span>${item.quantity}x </span> @ $${item.price.toFixed(2)}</p>`;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    li.append(img, infoDiv, price);
    summaryList.appendChild(li);

    total += item.price * item.quantity;
  });

  const totalDiv = document.createElement('div');
  totalDiv.className = 'order-total';
  totalDiv.innerHTML = `<strong>Order Total</strong><span>$${total.toFixed(2)}</span>`;

  const newOrderBtn = document.createElement('button');
  newOrderBtn.className = 'new-order';
  newOrderBtn.textContent = 'Start New Order';
  newOrderBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
    document.getElementById('modal').classList.add('hidden');
  });

  modalContent.append(header, summaryList, totalDiv, newOrderBtn);
}
