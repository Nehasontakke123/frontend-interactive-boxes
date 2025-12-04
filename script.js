// Product data
const productData = {
    1: { price: 10.00, originalPrice: 24.00 },
    2: { price: 18.00, originalPrice: 24.00 },
    3: { price: 24.00, originalPrice: 24.00 }
};

// Cart storage
const cartItems = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeProductSelector();
});

function initializeProductSelector() {
    const productBoxes = document.querySelectorAll('.product-box');
    const radioButtons = document.querySelectorAll('input[name="product"]');
    const totalAmountElement = document.getElementById('total-amount');

    // Set initial state - 1 Unit is selected by default and expanded
    const defaultBox = document.querySelector('.product-box[data-unit="1"]');
    if (defaultBox) {
        defaultBox.classList.add('active');
        updateTotal(10.00);
    }

    // Add click event to each product box
    productBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            // Don't trigger if clicking on dropdowns or their labels
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'LABEL' && e.target.classList.contains('dropdown-label')) {
                return;
            }

            const unit = this.getAttribute('data-unit');
            const radioButton = document.getElementById(`unit-${unit}`);
            
            // Set radio button
            if (radioButton) {
                radioButton.checked = true;
            }

            // Activate this box and deactivate others
            activateBox(this);
            
            // Update total price
            const price = parseFloat(this.getAttribute('data-price'));
            updateTotal(price);
        });
    });

    // Sync radio button clicks with box selection
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const unit = this.value;
                const box = document.querySelector(`.product-box[data-unit="${unit}"]`);
                if (box) {
                    activateBox(box);
                    const price = parseFloat(box.getAttribute('data-price'));
                    updateTotal(price);
                }
            }
        });
    });

    // Prevent dropdown clicks from triggering box selection
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function activateBox(box) {
    // Remove active class from all boxes
    document.querySelectorAll('.product-box').forEach(b => {
        b.classList.remove('active');
    });

    // Add active class to clicked box
    box.classList.add('active');
}

function updateTotal(price) {
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        totalAmountElement.textContent = `$${price.toFixed(2)}`;
    }
}

/**
 * Get the currently selected product
 * @returns {Object|null} Selected product object or null if none selected
 */
function getSelectedProduct() {
    const selectedRadio = document.querySelector('input[name="product"]:checked');
    if (!selectedRadio) {
        return null;
    }
    
    const unit = selectedRadio.value;
    const box = document.querySelector(`.product-box[data-unit="${unit}"]`);
    
    if (!box) {
        return null;
    }
    
    return {
        unit: parseInt(unit),
        price: parseFloat(box.getAttribute('data-price')),
        box: box
    };
}

/**
 * Collect selected options (sizes and colours) for the selected product
 * @param {number} unit - The unit count (1, 2, or 3)
 * @returns {Object} Object containing sizes and colours for each item
 */
function collectSelectedOptions(unit) {
    const options = {
        sizes: {},
        colours: {}
    };
    
    for (let i = 1; i <= unit; i++) {
        const sizeSelect = document.querySelector(`select[data-item="${i}"][data-type="size"][data-unit="${unit}"]`);
        const colourSelect = document.querySelector(`select[data-item="${i}"][data-type="colour"][data-unit="${unit}"]`);
        
        if (sizeSelect) {
            options.sizes[`item${i}`] = sizeSelect.value;
        }
        
        if (colourSelect) {
            options.colours[`item${i}`] = colourSelect.value;
        }
    }
    
    return options;
}

/**
 * Create and add a cart item to the cartItems array
 * @param {Object} product - The selected product object
 * @param {Object} options - The selected options (sizes and colours)
 * @returns {Object} The created cart item
 */
function addToCart(product, options) {
    const cartItem = {
        unitCount: product.unit,
        price: product.price,
        sizes: options.sizes,
        colours: options.colours,
        timestamp: new Date().toISOString()
    };
    
    cartItems.push(cartItem);
    
    // Console log for validation
    console.log('Cart Items Array:', cartItems);
    console.log('Latest Cart Item:', cartItem);
    
    return cartItem;
}

/**
 * Show a confirmation message with fade-in and fade-out animation
 * @param {string} message - The message to display
 * @param {string} type - Message type: 'success' or 'warning'
 */
function showConfirmationMessage(message, type = 'success') {
    // Remove any existing messages
    const existingMessage = document.querySelector('.cart-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `cart-message cart-message-${type}`;
    messageEl.textContent = message;
    
    // Append to container
    const container = document.querySelector('.container');
    container.appendChild(messageEl);
    
    // Trigger fade-in animation
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);
    
    // Remove after animation (3 seconds for success, 4 seconds for warning)
    const duration = type === 'success' ? 3000 : 4000;
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300); // Wait for fade-out animation
    }, duration);
}

// Initialize Add to Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Get selected product
            const selectedProduct = getSelectedProduct();
            
            // Validate selection
            if (!selectedProduct) {
                showConfirmationMessage('Please select a unit option before adding to cart.', 'warning');
                return;
            }
            
            // Collect selected options
            const options = collectSelectedOptions(selectedProduct.unit);
            
            // Add to cart
            addToCart(selectedProduct, options);
            
            // Show success message
            showConfirmationMessage('Item added to cart successfully!', 'success');
            
            // Visual feedback on button
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
});

