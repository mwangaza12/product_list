let data = [];
let cart = [];

// Fetch product data
async function getData() {
  const response = await fetch("./data.json");
  data = await response.json();
  renderProducts(data);
}

// Rendering product cards
function renderProducts(products) {
  const list = document.querySelector('.products.list');

  products.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image.desktop}" alt="${item.name}" class="card-img">
      <button class="add-to-cart">🛒 Add to Cart</button>
      <div class="card-body">
        <p class="category">${item.category}</p>
        <h2 class="product-name">${item.name}</h2>
        <p class="price">$${item.price.toFixed(2)}</p>
      </div>
    `;
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(item));
    list.appendChild(card);
  });
}

// Add item to cart
function addToCart(product) {
  if (!product.id) {
    // Fallback ID using name + category combo
    product.id = `${product.name}-${product.category}`;
  }

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }
  updateCartUI();
}



// Remove item completely
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
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
  }
}

// Update cart interface
function updateCartUI() {
  const cartTitle = document.querySelector('.cart-title');
  const cartImg = document.querySelector('.cart-img');
  const cartEmpty = document.querySelector('.cart-empty');
  const cartDiv = document.querySelector('.cart');

  // Update cart count
  cartTitle.textContent = `Your Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})`;

  // Remove previous items
  cartDiv.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length > 0) {
    cartImg.style.display = 'none';
    cartEmpty.style.display = 'none';

    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <p>${item.name}</p>
        <p>$${item.price.toFixed(2)} @ ${item.quantity}</p>
        <div class="controls">
          <button class="decrease">-</button>
          <button class="increase">+</button>
          <button class="remove">🗑️</button>
        </div>
      `;

      itemDiv.querySelector('.increase').addEventListener('click', () => changeQuantity(item.id, 1));
      itemDiv.querySelector('.decrease').addEventListener('click', () => changeQuantity(item.id, -1));
      itemDiv.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));

      cartDiv.appendChild(itemDiv);
    });
  } else {
    cartImg.style.display = 'block';
    cartEmpty.style.display = 'block';
  }
}

// Modal handling
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.confirm-order')?.addEventListener('click', () => {
    if (cart.length === 0) return alert("Cart is empty.");
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
  modalContent.innerHTML = ''; // Clear previous content

  const header = document.createElement('div');
  header.className = 'confirmation-header';
  header.innerHTML = `
    <span class="checkmark">✅</span>
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
    img.src = product.image.desktop;
    img.alt = item.name;

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<p>${item.name}</p><p>${item.quantity}x $${item.price.toFixed(2)}</p>`;

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

document.querySelector('.confirm-order')?.addEventListener('click', () => {
  if (cart.length === 0) return alert("Cart is empty.");
  populateModal();
  document.getElementById('modal').classList.remove('hidden');
});
