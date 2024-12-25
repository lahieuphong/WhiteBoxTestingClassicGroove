// INDEX -> CART...

const {
  addToCart, 
  deleteFromCart, 
  deleteByAlbumID, 
  checkChangeQuantity,
  updateTotalPrice,
  changeQuantity,
  summary,
  getSubTotalSelected,
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/cartController.js');

// Mock the customNotice function used in the original code
global.customNotice = jest.fn();

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/cartController.js', () => ({
  ...jest.requireActual('/Applications/XAMPP/htdocs/Classic-Groove/controllers/cartController.js'),
  checkChangeQuantity: jest.fn(),
}));

describe('addToCart', () => {
  // Test này sẽ kiểm tra xem hàm có gọi AJAX đúng và hiển thị thông báo đúng khi thêm sản phẩm vào giỏ hàng.
  test('should call addToCart and show success message if added successfully', () => {
      // Arrange: Mocking the $.ajax function
      $.ajax = jest.fn().mockImplementation((options) => {
      options.success("Added to your Cart");
      });

      // Act: Call the function with a sample albumID
      const albumID = 1;
      addToCart(albumID);

      // Assert: Check if $.ajax was called with the expected parameters
      expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
      url: 'util/cart.php',
      type: 'POST',
      data: { albumID: albumID, action: 'addToCart' },
      }));

      // Assert: Check if customNotice was called with the correct message
      expect(global.customNotice).toHaveBeenCalledWith(
      "fa-solid fa-cart-circle-plus",
      "Added to your Cart",
      1
      );
  });
});


describe('deleteFromCart', () => {
  // Kiểm tra việc xóa sản phẩm khỏi giỏ hàng và đảm bảo rằng phần tử sản phẩm được xóa khỏi DOM.
  test('should delete the album from the cart and remove product from DOM', async () => {
      // Arrange: Mock hàm deleteByAlbumID và giả lập phần tử DOM
      const albumID = 1;
      const mockElement = document.createElement('div');
      mockElement.className = 'product-placeholder';
      document.body.appendChild(mockElement);
  
      // Mock deleteByAlbumID trả về thành công
      const deleteByAlbumID = jest.fn().mockResolvedValue("Success");
  
      // Act: Gọi hàm deleteFromCart
      await deleteFromCart(albumID, mockElement);
  
      // Assert: Kiểm tra xem phần tử đã bị xóa khỏi DOM chưa
      expect(mockElement.parentNode).toBeNull();
  });
}); 


describe('updateTotalPrice', () => {
  // Kiểm tra xem giá tổng có được cập nhật đúng sau khi thay đổi số lượng không.
  test('should update the total price when quantity changes', () => {
      // Arrange: Giả lập DOM với giá và số lượng
      document.body.innerHTML = `<div class="product-placeholder">
      <div class="each">$10.00</div>
      <input class="quantity-info" value="2">
      <div class="total"></div>
      </div>`;
      const inputElement = document.querySelector(".quantity-info");
  
      // Act: Gọi hàm updateTotalPrice với số lượng mới
      updateTotalPrice(inputElement, 3);
  
      // Assert: Kiểm tra xem giá tổng đã được cập nhật chưa
      const totalElement = document.querySelector(".total");
      expect(totalElement.innerHTML).toBe("$30.00");
  });
});


describe('changeQuantity', () => {
  test('should change quantity and update the total price', () => {
    // Arrange: Mock hàm checkChangeQuantity
    const albumID = 1;
    const change = 1;
    const mockElement = document.createElement('div');
    mockElement.className = 'product-placeholder';
    mockElement.innerHTML = `
      <div class="each">$10.00</div>
      <input class="quantity-info" value="2">
      <div class="total"></div>
    `;
    document.body.appendChild(mockElement);
    const inputElement = mockElement.querySelector('.quantity-info');
    
    // Mock checkChangeQuantity trả về số lượng đúng
    checkChangeQuantity.mockReturnValue(3);
    
    // Act: Gọi hàm changeQuantity
    changeQuantity(albumID, change, inputElement);
    
    // Assert: Kiểm tra xem giá tổng đã được cập nhật chưa
    const totalElement = mockElement.querySelector(".total");
    expect(totalElement.innerHTML).toBe("$30.00");
  });
});  
    

// Kiểm tra việc tính toán tóm tắt giỏ hàng bao gồm tổng phụ, phí vận chuyển và tổng tiền.
describe('summary', () => {
  let albums;
  
  beforeEach(() => {
    // Set up a mock DOM structure
    document.body.innerHTML = `
      <div id="mycart">
        <div class="product-placeholder">
          <div class="product">
            <div class="check-button">
              <input type="checkbox" />
            </div>
            <div class="each">$20.00</div>
            <input type="number" class="quantity-info" value="2" />
          </div>
        </div>
        <div class="product-placeholder">
          <div class="product">
            <div class="check-button">
              <input type="checkbox" />
            </div>
            <div class="each">$15.00</div>
            <input type="number" class="quantity-info" value="3" />
          </div>
        </div>
      </div>
      <div class="subtotal"></div>
      <div class="shipping"></div>
      <div class="total-final"></div>
    `;
    
    // Simulate the "getSubTotalSelected" function's behavior
    albums = document.querySelectorAll("#mycart .check-button input[type='checkbox']");
  });
  
  // Kiểm tra khi người dùng chọn cả hai sản phẩm
  test('should correctly update the summary of the cart with products selected', () => {
    // Select both checkboxes
    albums[0].checked = true;
    albums[1].checked = true;

    // Manually call the summary function
    summary();

    // Assert that the correct values are displayed
    const subtotalInput = document.querySelector(".subtotal");
    const shippingInput = document.querySelector(".shipping");
    const totalInput = document.querySelector(".total-final");

    // Expected values
    const expectedSubTotal = "$85.00"; // 2 * 20 + 3 * 15 = 85
    const expectedShipping = "$30.00"; // 2 albums selected * 15 shipping per album
    const expectedTotal = "$115.00"; // 85 subtotal + 30 shipping

    expect(subtotalInput.innerHTML).toBe(expectedSubTotal);
    expect(shippingInput.innerHTML).toBe(expectedShipping);
    expect(totalInput.innerHTML).toBe(expectedTotal);
  });
  
  // Kiểm tra khi không có sản phẩm nào được chọn
  test('should update summary correctly when no products are selected', () => {
    // Uncheck all checkboxes
    albums[0].checked = false;
    albums[1].checked = false;

    // Manually call the summary function
    summary();

    // Assert that the correct values are displayed when no items are selected
    const subtotalInput = document.querySelector(".subtotal");
    const shippingInput = document.querySelector(".shipping");
    const totalInput = document.querySelector(".total-final");

    const expectedSubTotal = "$0.00";
    const expectedShipping = "$0.00";
    const expectedTotal = "$0.00";

    expect(subtotalInput.innerHTML).toBe(expectedSubTotal);
    expect(shippingInput.innerHTML).toBe(expectedShipping);
    expect(totalInput.innerHTML).toBe(expectedTotal);
  });
  
  // Kiểm tra khi chỉ có một sản phẩm được chọn
  test('should update summary correctly when only one product is selected', () => {
    // Select only the first album
    albums[0].checked = true;
    albums[1].checked = false;

    // Manually call the summary function
    summary();

    // Assert that the correct values are displayed
    const subtotalInput = document.querySelector(".subtotal");
    const shippingInput = document.querySelector(".shipping");
    const totalInput = document.querySelector(".total-final");

    const expectedSubTotal = "$40.00"; // 2 * 20 = 40
    const expectedShipping = "$15.00"; // 1 album selected * 15 shipping per album
    const expectedTotal = "$55.00"; // 40 subtotal + 15 shipping

    expect(subtotalInput.innerHTML).toBe(expectedSubTotal);
    expect(shippingInput.innerHTML).toBe(expectedShipping);
    expect(totalInput.innerHTML).toBe(expectedTotal);
  });
});  
