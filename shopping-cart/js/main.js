let cartCounter = document.querySelector(".cart_counter");
let cart = document.querySelector(".cart");
let addToCartButton = document.querySelectorAll(".btn_add_to_cart");
let totalAmount = document.querySelector("#total_cost");
let totalItems = document.querySelector(".total_counter");
let checkOutBtn = document.querySelector("#btn_checkout");
let clearCartBtn = document.querySelector("#clear_cart");

let paymentMethod = document.querySelectorAll(
  'input[type="radio"][name="payment_method"]'
);
let selectedPaymentMethod = document.querySelectorAll(
  'input[type="radio"][name="payment_method"]:checked'
);

let phone = document.querySelector("#phone");
let paymentType = "paypal";

paymentMethod.forEach((method) => {
  method.addEventListener("click", (e) => {
    if (method.value == "evc") {
      phone.classList.add("active");
      paymentType = "evc";
    } else {
      phone.classList.remove("active");
      paymentType = "paypal";
    }
  });
});

checkOutBtn.addEventListener("click", () => {
  if (paymentType === "paypal") checkoutPaypal();
  else checkoutEvc();
});

clearCartBtn.addEventListener("click", () => clearCart());

let cartItems = JSON.parse(localStorage.getItem("cart_items")) || [];

document.addEventListener("DOMContentLoaded", getCartItems);

cartCounter.addEventListener("click", () => {
  cart.classList.toggle("active");
});

addToCartButton.forEach((btn) => {
  btn.addEventListener("click", () => {
    let parent = btn.parentElement.parentElement.parentElement;
    const product = {
      id: parent.querySelector("#product_item_id").value,
      image: parent.querySelector(".product_image").getAttribute("src"),
      name: parent.querySelector(".product_name").innerText,
      quantity: 1,
      price: parent.querySelector(".price").innerText.replace("$", ""),
    };

    let isAdded = cartItems.filter((item) => item.id === product.id).length > 0;

    if (!isAdded) {
      addToCart(product);
      btn.innerText = "Added";
      btn.style = "background:green;";
      //   btn.disabled = true;
    } else {
      alert("product is already in the cart");
      return;
    }

    const cartItem = document.querySelectorAll(".cart_item");
    cartItem.forEach((item) => {
      if (item.querySelector("#product_id").value == product.id) {
        increaseQuantity(item, product);
        decreaseQuantity(item, product);
        removeItem(item, product);
      }
    });

    cartItems.push(product);
    saveToTheLocalStorage();
    countTotal();
  });
});

function addToCart(product) {
  cart.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="cart_item">
          <input type="hidden" id="product_id" value="${product.id}" />
          <img src="${product.image}" alt="" id="product_image" />
          <h4 id="product_name">${product.name}</h4>
          <a style="background:#b1b1b1;" action="decrease" class="btn_small">&minus;</a>
          <h4 id="product_qty">${product.quantity}</h4>
          <a action="increase" class="btn_small">&plus;</a>
          <span id="product_price">$${product.price}</span>
          <a action="remove" class="btn_small btn_remove">&times;</a>
        </div>
    `
  );
}

function countTotal() {
  let total = 0;
  cartItems.forEach((item) => {
    total += item.quantity * item.price;
  });

  totalAmount.innerHTML = total;
  totalItems.innerHTML = cartItems.length;
}

function increaseQuantity(item, product) {
  item.querySelector('[action="increase"]').addEventListener("click", () => {
    cartItems.forEach((cartItem) => {
      if (cartItem.id === product.id) {
        item.querySelector("#product_qty").innerText = ++cartItem.quantity;
        countTotal();
        saveToTheLocalStorage();
        item.querySelector('[action="decrease"]').style =
          "background: rgb(2, 27, 91);";
      }
    });
  });
}

function decreaseQuantity(item, product) {
  item.querySelector('[action="decrease"]').addEventListener("click", () => {
    cartItems.forEach((cartItem) => {
      if (cartItem.id === product.id) {
        if (cartItem.quantity === 2) {
          item.querySelector('[action="decrease"]').disabled = true;
          item.querySelector('[action="decrease"]').style =
            "background:#b1b1b1;";
        }

        if (cartItem.quantity > 1) {
          item.querySelector("#product_qty").innerText = --cartItem.quantity;
          countTotal();
          saveToTheLocalStorage();
        } else {
          /* item.remove();
          cartItems = cartItems.filter((newItems) => newItems.id !== product.id); */
          // countTotal();
        }
      }
    });
  });
}
function removeItem(item, product) {
  item.querySelector('[action="remove"]').addEventListener("click", () => {
    cartItems.forEach((cartItem) => {
      if (cartItem.id === product.id) {
        item.remove();
        cartItems = cartItems.filter((newItems) => newItems.id !== product.id);
        countTotal();
        saveToTheLocalStorage();
      }
    });
  });
}

function getCartItems() {
  if (cartItems.length > 0) {
    cartItems.forEach((product) => {
      addToCart(product);

      const cartItem = document.querySelectorAll(".cart_item");
      cartItem.forEach((item) => {
        if (item.querySelector("#product_id").value == product.id) {
          increaseQuantity(item, product);
          decreaseQuantity(item, product);
          removeItem(item, product);
        }
      });

      countTotal();
      saveToTheLocalStorage();
    });
  }
}

function saveToTheLocalStorage() {
  localStorage.setItem("cart_items", JSON.stringify(cartItems));
}

function clearCart() {
  localStorage.clear();
  cartItems = [];

  document.querySelectorAll(".cart_item").forEach((item) => {
    item.remove();
    countTotal();
  });
}

function checkoutPaypal() {
  let form = `
    <form target="_blank" id="paypal_form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
    <input type="hidden" name="cmd" value="_cart">
    <input type="hidden" name="upload" value="1">
    <input type="hidden" name="business" value="hudeifapaypal@gmail.com">
  `;

  cartItems.forEach((item, index) => {
    index++;
    form += `<input type="hidden" name="item_name_${index}" value="${item.name}">
    <input type="hidden" name="amount_${index}" value="${item.price}">
    <input type="hidden" name="quantity_${index}" value="${item.quantity}">
   `;
  });

  document.querySelector("body").insertAdjacentHTML("afterend", form);
  document.querySelector("#paypal_form").submit();
  // clearCart();
}

function checkoutEvc() {
  console.log("payed via evc");
}
