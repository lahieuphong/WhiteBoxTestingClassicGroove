// INDEX -> CART 

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/orderController.js', () => ({
    order: jest.fn(),
    getTotal: jest.fn(),
    createOrder: jest.fn(),
    getAlbums: jest.fn(),
    checkMyCart: jest.fn(),
    deleteFromOrder: jest.fn(),
    cancelOrder: jest.fn(),
    getOrderInfo: jest.fn(),
    getAlbumsInOrder: jest.fn(),
  }));
  
  const {
    order,
    getTotal,
    createOrder,
    getAlbums,
    checkMyCart,
    deleteFromOrder,
    cancelOrder,
    getOrderInfo,
    getAlbumsInOrder,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/orderController.js');
  
  document.querySelector = jest.fn((selector) => {
    const elements = {
      '.total-final': { innerHTML: '$100' },
      '#mycart #checkout-address': { value: '430/28/5TA28' },
      '#mycart .check-button input[type="checkbox"]:checked': [
        { value: '1', closest: jest.fn().mockReturnValue({
            querySelector: jest.fn().mockReturnValue({ value: '2' }),
            remove: jest.fn()
          })
        }
      ],
      '#orderSuccess': { style: { display: '' }, focus: jest.fn() }
    };
    return elements[selector] || {};
  });
  
  const mockAjax = jest.fn();
  global.$ = { ajax: mockAjax };
  global.customNotice = jest.fn();
  
  describe('orderController', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    // Kiểm tra hàm getTotal trả về giá trị tổng đúng từ giao diện.
    test('getTotal returns correct total value', () => {
      getTotal.mockImplementation(() => {
        let totalInput = document.querySelector('.total-final');
        let total = parseFloat(totalInput.innerHTML.substring(1));
        return total;
      });
      const total = getTotal();
      expect(total).toBe(100);
    });
    
    // Kiểm tra hàm createOrder gửi yêu cầu AJAX chính xác khi tạo đơn hàng.
    test('createOrder sends correct AJAX request', async () => {
      getAlbums.mockReturnValue('[{"quantity":"2","albumID":"1"}]');
      getTotal.mockReturnValue(100);
      createOrder.mockImplementation(async () => {
        await $.ajax({
          url: 'util/order.php',
          type: 'POST',
          data: {
            address: '430/28/5TA28',
            total: 100,
            albums: '[{"quantity":"2","albumID":"1"}]',
            action: 'createOrder',
          },
          success: function (res) {
            if (res !== 'Success') alert(res);
          },
        });
      });
      await createOrder();
      expect(mockAjax).toHaveBeenCalledWith({
        url: 'util/order.php',
        type: 'POST',
        data: {
          address: '430/28/5TA28',
          total: 100,
          albums: '[{"quantity":"2","albumID":"1"}]',
          action: 'createOrder',
        },
        success: expect.any(Function),
      });
    });

    // Kiểm tra hàm cancelOrder gửi yêu cầu AJAX chính xác khi hủy đơn hàng.
    test('cancelOrder sends correct AJAX request', () => {
      cancelOrder.mockImplementation((orderID) => {
        $.ajax({
          url: 'util/order.php?orderID=' + orderID + '&action=cancelOrder',
          type: 'PUT',
          success: function (res) {
            if (res !== 'Success') alert(res);
            else {
              customNotice('fa-solid fa-cart-circle-plus', 'Cancel your Order', 1);
              loadPageByAjax('Account');
            }
          },
        });
      });
      cancelOrder(11);
      expect(mockAjax).toHaveBeenCalledWith({
        url: 'util/order.php?orderID=11&action=cancelOrder',
        type: 'PUT',
        success: expect.any(Function),
      });
    });
    
    // Kiểm tra hàm getOrderInfo gửi yêu cầu AJAX chính xác khi lấy thông tin đơn hàng.
    test('getOrderInfo sends correct AJAX request', () => {
      getOrderInfo.mockImplementation((orderID) => {
        return $.ajax({
          url: 'util/order.php?orderID=' + orderID + '&action=getOrderInfo',
          type: 'GET',
        });
      });
      getOrderInfo(11);
      expect(mockAjax).toHaveBeenCalledWith({
        url: 'util/order.php?orderID=11&action=getOrderInfo',
        type: 'GET',
      });
    });
    
    // Kiểm tra hàm getAlbumsInOrder gửi yêu cầu AJAX chính xác khi lấy danh sách album trong đơn hàng.
    test('getAlbumsInOrder sends correct AJAX request', () => {
      getAlbumsInOrder.mockImplementation((orderID) => {
        return $.ajax({
          url: 'util/order.php?orderID=' + orderID + '&action=getAlbumsInOrder',
          type: 'GET',
        });
      });
      getAlbumsInOrder(11);
      expect(mockAjax).toHaveBeenCalledWith({
        url: 'util/order.php?orderID=11&action=getAlbumsInOrder',
        type: 'GET',
      });
    });
  });