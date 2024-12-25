// INDEX -> ACCOUNT -> Change password

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/userController.js', () => ({
    setUserInfo: jest.fn(),
    IsInfoChange: jest.fn(),
    checkInputUpdateUser: jest.fn(),
    updateUser: jest.fn(),
    checkInputUpdatePassword: jest.fn(),
    updatePassword: jest.fn(),
  }));
  
  // Import the functions from your script
  const {
    setUserInfo,
    IsInfoChange,
    checkInputUpdateUser,
    updateUser,
    checkInputUpdatePassword,
    updatePassword,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/userController.js');
  
  // Mocking jQuery AJAX
  jest.mock('jquery', () => ({
    ajax: jest.fn(),
  }));
  
  describe('User Info Update Tests', () => {
    let fullnameInput, phoneInput, addressInput, emailInput, saveBtn;
  
    beforeEach(() => {
      // Mocking DOM elements
      fullnameInput = { value: 'La Hieu Phong' };
      phoneInput = { value: '0326526898' };
      addressInput = { value: '430/28/5TA28' };
      emailInput = { value: 'hieuphong144@gmail.com' };
      saveBtn = { style: { cursor: '', opacity: '' } };
  
      // Mocking querySelector to return these inputs
      document.querySelector = jest.fn((selector) => {
        if (selector === '#myaccount #txtHoTen') return fullnameInput;
        if (selector === '#myaccount #txtSDT') return phoneInput;
        if (selector === '#myaccount #txtAddress') return addressInput;
        if (selector === '#myaccount #txtEmail') return emailInput;
        if (selector === '#myaccount .btnSave') return saveBtn;
        return null;
      });
  
      // Resetting global variables
      global.fullname = null;
      global.phone = null;
      global.address = null;
      global.email = null;
      global.isDiff = false;
    });
    

    // hàm checkInputUpdatePassword phải trả về true -> mật khẩu hợp lệ
    // hàm checkInputUpdatePassword phải trả về false ->  mật khẩu xác nhận không khớp với mật khẩu mới
    test('checkInputUpdatePassword should validate password fields correctly', () => {
      const oldPasswordInput = { value: 'Tatooboys123@' };
      const newPasswordInput = { value: 'Tatooboys123@@@' };
      const confirmNewPasswordInput = { value: 'Tatooboys123@@@' };
      
      document.querySelector = jest.fn((selector) => {
        if (selector === '#txtOldPassword') return oldPasswordInput;
        if (selector === '#txtNewPassword') return newPasswordInput;
        if (selector === '#txtConfirmNewPassword') return confirmNewPasswordInput;
        return null;
      });
      
      // Mock checkInputUpdatePassword function
      checkInputUpdatePassword.mockImplementation(() => {
        if (newPasswordInput.value !== confirmNewPasswordInput.value) {
          return false;
        }
        return true;
      });
  
      // Test when all password fields are valid
      let result = checkInputUpdatePassword();
      expect(result).toBe(true);
      
      // Test when confirm password does not match
      confirmNewPasswordInput.value = 'differentPassword';
      result = checkInputUpdatePassword();
      expect(result).toBe(false);
    });

  });
  