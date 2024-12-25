// ADMIN -> ORDER -> Status

let orderStatus;
let orderID;
let isOrderDiff;

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/managerOrderController.js', () => ({
  setOrderInfo: jest.fn(),
  isOrderInfoChange: jest.fn(),
  updateOrder: jest.fn(),
}));

const {
  setOrderInfo,
  isOrderInfoChange,
  updateOrder,
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/managerOrderController.js');

document.querySelector = jest.fn((selector) => {
  const elements = {
    '#edit-order .orderStatus': { value: 'Shipped' },
    '#edit-order .orderID': { value: '11' },
    '#edit-order .btnOrderSave': { style: { cursor: '', opacity: '' }, focus: jest.fn() },
  };
  return elements[selector] || {};
});

const mockAjax = jest.fn();
global.$ = { ajax: mockAjax };
global.customNotice = jest.fn();
global.loadPageByAjax = jest.fn();

describe('managerOrderController', () => {
  beforeEach(() => {
    orderStatus = null;
    orderID = null;
    isOrderDiff = false;

    setOrderInfo.mockImplementation(() => {
      orderStatus = document.querySelector('#edit-order .orderStatus').value;
      orderID = document.querySelector('#edit-order .orderID').value;
    });

    isOrderInfoChange.mockImplementation(() => {
      let saveBtn = document.querySelector('#edit-order .btnOrderSave');
      if (orderStatus === document.querySelector('#edit-order .orderStatus').value) {
        saveBtn.style.cursor = 'no-drop';
        saveBtn.style.opacity = '0.5';
        isOrderDiff = false;
      } else {
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.opacity = '1';
        isOrderDiff = true;
      }
    });

    updateOrder.mockImplementation(() => {
      if (!isOrderDiff) return;
      setOrderInfo();
      $.ajax({
        url: 'util/order.php?status=' + orderStatus + '&orderID=' + orderID + '&action=updateOrder',
        type: 'PUT',
        success: function (res) {
          if (res === 'Not enough product quantity') {
            customNotice(
              'fa-sharp fa-light fa-circle-exclamation',
              'Not enough product quantity!',
              3
            );
          } else if (res !== 'Success') alert(res);
          else {
            customNotice(
              'fa-sharp fa-light fa-circle-check',
              'Update successfully!',
              1
            );
            loadPageByAjax('Order');
          }
        },
      });
    });

    jest.clearAllMocks();
  });


  // Kiểm tra hàm setOrderInfo có gán đúng thông tin đơn hàng từ giao diện vào các biến toàn cục (orderStatus và orderID) không.
  test('setOrderInfo correctly sets order information', () => {
    setOrderInfo();
    expect(orderStatus).toBe('Shipped');
    expect(orderID).toBe('11');
  });


  // Đảm bảo rằng khi có thay đổi trong thông tin đơn hàng (isOrderDiff = true), hàm updateOrder sẽ gửi yêu cầu AJAX với dữ liệu chính xác.
  test('updateOrder sends correct AJAX request', () => {
    isOrderDiff = true;
    setOrderInfo();
    updateOrder();
    expect(mockAjax).toHaveBeenCalledWith({
      url: 'util/order.php?status=Shipped&orderID=11&action=updateOrder',
      type: 'PUT',
      success: expect.any(Function),
    });
  });


  // Đảm bảo rằng nếu không có thay đổi trong thông tin đơn hàng (isOrderDiff = false), hàm updateOrder sẽ không gửi yêu cầu AJAX.
  test('updateOrder does not send AJAX request if isOrderDiff is false', () => {
    isOrderDiff = false;
    updateOrder();
    expect(mockAjax).not.toHaveBeenCalled();
  });

  // Kiểm tra rằng khi yêu cầu AJAX thành công (Success), thông báo phù hợp được hiển thị và giao diện được tải lại.
  test('updateOrder shows correct notice on success', () => {
    isOrderDiff = true;
    setOrderInfo();
    updateOrder();
    const successCallback = mockAjax.mock.calls[0][0].success;
    successCallback('Success');
    expect(customNotice).toHaveBeenCalledWith(
      'fa-sharp fa-light fa-circle-check',
      'Update successfully!',
      1
    );
    expect(loadPageByAjax).toHaveBeenCalledWith('Order');
  });

  // Đảm bảo rằng nếu yêu cầu AJAX trả về lỗi vì không đủ số lượng sản phẩm (Not enough product quantity), thông báo lỗi phù hợp sẽ được hiển thị.
  test('updateOrder shows correct notice on insufficient product quantity', () => {
    isOrderDiff = true;
    setOrderInfo();
    updateOrder();
    const successCallback = mockAjax.mock.calls[0][0].success;
    successCallback('Not enough product quantity');
    expect(customNotice).toHaveBeenCalledWith(
      'fa-sharp fa-light fa-circle-exclamation',
      'Not enough product quantity!',
      3
    );
  });
});
