// ADMIN -> ACCOUNT

let usernameAcc;
let emailAcc;
let nameAcc;
let phoneAcc;
let roleAcc;
let passwordAcc;
let addressAcc;
let isAccountDiff;

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/managerAccountController.js', () => ({
  setAccountInfo: jest.fn(),
  updateAccount: jest.fn(),
  checkInputUpdateAccount: jest.fn(),
  isAccountInfoChange: jest.fn(),
  createNewAccount: jest.fn(),
  checkInputCreateNewAccount: jest.fn(),
}));

const {
  setAccountInfo,
  updateAccount,
  checkInputUpdateAccount,
  isAccountInfoChange,
  createNewAccount,
  checkInputCreateNewAccount,
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/managerAccountController.js');

document.querySelector = jest.fn((selector) => {
  const elements = {
    '#edit-account .accountID': { value: 'lahieuphong_customer' },
    '#edit-account .nameAccount': { value: 'LaHieuPhong' },
    '#edit-account .emailAccount': { value: 'hieuphong144@gmail.com' },
    '#edit-account .phoneAccount': { value: '0326526898' },
    '#edit-account .roleAccount': { value: '1' },
    '#edit-account .passwordAccount': { value: 'Tatooboys123@' },
    '#edit-account .addressAccount': { value: '430/28/5TA28Q12' },
    '#new-account .username': { value: 'lahieuphong' },
    '#new-account .name': { value: 'LHP' },
    '#new-account .email': { value: 'lhp@gmail.com' },
    '#new-account .phoneNumber': { value: '0326526898' },
    '#new-account .role': { value: '3' },
    '#new-account .password': { value: 'Tatooboys123@@@' },
    '#new-account .address': { value: '430/28/5TA28' },
    '#edit-account .btnAccountSave': { style: { cursor: '', opacity: '' }, focus: jest.fn() },
  };
  return elements[selector] || {};
});

const mockAjax = jest.fn();
global.$ = { ajax: mockAjax };
global.customNotice = jest.fn();

describe('managerOrderController', () => {
  beforeEach(() => {
    usernameAcc = null;
    emailAcc = null;
    nameAcc = null;
    phoneAcc = null;
    roleAcc = null;
    passwordAcc = null;
    addressAcc = null;
    isAccountDiff = false;

    setAccountInfo.mockImplementation(() => {
      usernameAcc = 'lahieuphong_customer';
      nameAcc = 'LaHieuPhong';
      emailAcc = 'hieuphong144@gmail.com';
      phoneAcc = '0326526898';
      roleAcc = 1;
      passwordAcc = 'Tatooboys123@';
      addressAcc = '430/28/5TA28Q12';
    });

    checkInputUpdateAccount.mockImplementation(() => isAccountDiff);
    checkInputCreateNewAccount.mockResolvedValue(true);

    jest.clearAllMocks();
  });

//   Kiểm tra gán thông tin tài khoản.
  test('setAccountInfo correctly sets account information', () => {
    setAccountInfo();
    expect(usernameAcc).toBe('lahieuphong_customer');
    expect(nameAcc).toBe('LaHieuPhong');
    expect(emailAcc).toBe('hieuphong144@gmail.com');
    expect(phoneAcc).toBe('0326526898');
    expect(roleAcc).toBe(1);
    expect(passwordAcc).toBe('Tatooboys123@');
    expect(addressAcc).toBe('430/28/5TA28Q12');
  });

//   Kiểm tra gửi AJAX đúng thông tin khi cập nhật tài khoản.
  test('updateAccount sends correct AJAX request', () => {
    setAccountInfo();
    updateAccount.mockImplementation(() => {
      $.ajax({
        url: 'util/user.php?fullname=LaHieuPhong&email=hieuphong144@gmail.com&phone=0326526898&password=Tatooboys123@&address=430/28/5TA28Q12&username=lahieuphong_customer&role=1&action=updateAccount',
        type: 'PUT',
        success: function (res) {
          if (res != 'Success') alert(res);
          else {
            customNotice(
              'fa-sharp fa-light fa-circle-check',
              'Update successfully!',
              1
            );
            isAccountInfoChange();
          }
        },
      });
    });
    updateAccount();
    expect(mockAjax).toHaveBeenCalledWith({
      url: 'util/user.php?fullname=LaHieuPhong&email=hieuphong144@gmail.com&phone=0326526898&password=Tatooboys123@&address=430/28/5TA28Q12&username=lahieuphong_customer&role=1&action=updateAccount',
      type: 'PUT',
      success: expect.any(Function),
    });
  });

//   Kiểm tra logic xác định thông tin tài khoản có thay đổi hay không.
  test('checkInputUpdateAccount returns false if isAccountDiff is false', () => {
    isAccountDiff = false;
    expect(checkInputUpdateAccount()).toBe(false);
  });

//   Kiểm tra gửi AJAX đúng thông tin khi tạo tài khoản mới.
  test('createNewAccount sends correct AJAX request', async () => {
    await createNewAccount.mockImplementation(async () => {
      $.ajax({
        url: 'util/user.php',
        type: 'POST',
        data: {
          username: 'lahieuphong',
          name: 'LHP',
          email: 'lhp@gmail.com',
          phone: '0326526898',
          role: 3,
          password: 'Tatooboys123@@@',
          address: '430/28/5TA28',
          action: 'createNewAccount',
        },
        success: function (res) {
          if (res == 'Success') {
            customNotice(
              'fa-sharp fa-light fa-circle-check',
              'Account successfully created',
              1
            );
          } else {
            customNotice('fa-sharp fa-light fa-circle-exclamation', res, 3);
          }
        },
      });
    });
    await createNewAccount();
    expect(mockAjax).toHaveBeenCalledWith({
      url: 'util/user.php',
      type: 'POST',
      data: {
        username: 'lahieuphong',
        name: 'LHP',
        email: 'lhp@gmail.com',
        phone: '0326526898',
        role: 3,
        password: 'Tatooboys123@@@',
        address: '430/28/5TA28',
        action: 'createNewAccount',
      },
      success: expect.any(Function),
    });
  });

//   Kiểm tra validate (xác thực) dữ liệu khi tạo tài khoản mới.
  test('checkInputCreateNewAccount returns false if username is empty', async () => {
    document.querySelector.mockReturnValueOnce({ value: '', focus: jest.fn() });
    checkInputCreateNewAccount.mockImplementation(async () => {
      let usernameInput = document.querySelector('#new-account .username');
      if (usernameInput.value == '') {
        customNotice(
          'fa-sharp fa-light fa-circle-exclamation',
          'Please, enter your user name!',
          3
        );
        usernameInput.focus();
        return false;
      }
      return true;
    });
    expect(await checkInputCreateNewAccount()).toBe(false);
  });
});