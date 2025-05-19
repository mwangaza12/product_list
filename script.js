let data = [];

async function getData() {
    const response = await fetch("./data.json");
    data = await response.json();
    return data;
}

getData().then(data => {
    const list = document.querySelector('.list');
    data.forEach(item => {
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

    list.appendChild(card);
    });
});