// INDEX -> Login/Register

const { 
  login, 
  checkInputLogin, 
  logout, 
  register, 
  checkInputRegister, 
  isVietnamesePhoneNumberValid, isPasswordValid, 
  isUsernameExist, 
  isLogin, 
  getRole, 
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/loginController.js');
  
describe('Login and Check Input Tests', () => {
  let customNoticeSpy;
  let locationHrefSpy;

  beforeEach(() => {
    // Mock các hàm DOM và các hàm ngoài
    customNoticeSpy = jest.fn();
    locationHrefSpy = jest.fn();

    // Giả lập các hàm trong môi trường DOM
    global.customNotice = customNoticeSpy;
    global.location.href = locationHrefSpy;

    // Giả lập việc truy vấn DOM
    document.body.innerHTML = `
      <input id="username-field" type="text" />
      <input id="password-field" type="password" />
    `;
  });


  // Kiểm tra xem khi trường tên đăng nhập trống, 
  // hàm checkInputLogin có hiển thị thông báo lỗi đúng không.
  test('should show error when username is empty', () => {
    // Giả lập trường hợp không có tên đăng nhập
    document.querySelector("#username-field").value = "";
    document.querySelector("#password-field").value = "Tatooboys123@";

    // Gọi hàm checkInputLogin
    const result = checkInputLogin();

    // Kiểm tra rằng thông báo lỗi được hiển thị cho tên đăng nhập trống
    expect(customNoticeSpy).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation", 
      "Please, enter username!", 
      3
    );
    expect(result).toBe(false); // Trả về false khi tên đăng nhập trống
  });


  // Kiểm tra xem khi trường mật khẩu trống, 
  // hàm checkInputLogin có hiển thị thông báo lỗi đúng không.
  test('should show error when password is empty', () => {
    // Giả lập trường hợp không có mật khẩu
    document.querySelector("#username-field").value = "lahieuphong_customer";
    document.querySelector("#password-field").value = "";

    // Gọi hàm checkInputLogin
    const result = checkInputLogin();

    // Kiểm tra rằng thông báo lỗi được hiển thị cho mật khẩu trống
    expect(customNoticeSpy).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation", 
      "Please, enter your password!", 
      3
    );
    expect(result).toBe(false); // Trả về false khi mật khẩu trống
  });


  // Kiểm tra khi người dùng nhập đầy đủ thông tin (tên đăng nhập và mật khẩu), 
  // hàm checkInputLogin có trả về true hay không.
  test('should return true when both username and password are provided', () => {
    // Giả lập trường hợp tên đăng nhập và mật khẩu hợp lệ
    document.querySelector("#username-field").value = "lahieuphong_customer";
    document.querySelector("#password-field").value = "Tatooboys123@";

    // Gọi hàm checkInputLogin
    const result = checkInputLogin();

    // Kiểm tra rằng hàm trả về true khi tên và mật khẩu không trống
    expect(result).toBe(true);
  });

  // Kiểm tra khi login thất bại, hệ thống có hiển thị thông báo lỗi chính xác không.
  test('should show error when login fails', () => {
    // Mock AJAX để trả về lỗi
    $.ajax = jest.fn().mockImplementationOnce((options) => {
      options.success("Invalid credentials");
    });

    // Giả lập tên đăng nhập và mật khẩu hợp lệ
    document.querySelector("#username-field").value = "lahieuphong_customer";
    document.querySelector("#password-field").value = "wrongpassword";

    // Gọi hàm login
    login();

    // Kiểm tra xem hệ thống có hiển thị thông báo lỗi không
    expect(customNoticeSpy).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation", 
      "Invalid credentials", 
      3
    );
  });
});


describe('Register Functionality Tests', () => {
  let customNoticeMock;
  let loadLoginByAjaxMock;
  let isUsernameExistMock;
  let isVietnamesePhoneNumberValidMock;
  let isPasswordValidMock;

  beforeEach(() => {
    // Mocking functions
    customNoticeMock = jest.fn();
    loadLoginByAjaxMock = jest.fn();
    isUsernameExistMock = jest.fn();
    isVietnamesePhoneNumberValidMock = jest.fn();
    isPasswordValidMock = jest.fn();

    // Mocking DOM elements
    document.body.innerHTML = `
      <div id="login">
        <div class="register">
          <input class="name" />
          <input class="phonenumber" />
          <input class="username" />
          <input class="password" />
          <input class="confirmPassword" />
        </div>
      </div>
    `;

    // Replace real functions with mocks
    global.$ = {
      ajax: jest.fn(),
    };
    global.customNotice = customNoticeMock;
    global.loadLoginByAjax = loadLoginByAjaxMock;
    global.isUsernameExist = isUsernameExistMock;
    global.isVietnamesePhoneNumberValid = isVietnamesePhoneNumberValidMock;
    global.isPasswordValid = isPasswordValidMock;
  });

  test('should show an error if username already exists', async () => {
    // Setup mock responses
    isUsernameExistMock.mockResolvedValue(true);  // Username already exists

    // Simulate input values
    document.querySelector('.username').value = 'lahieuphong_customer';

    // Call the register function
    await register();

    // Check that the error notice was shown
    expect(customNoticeMock).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation",
      "Username already exists!",
      3
    );
  });

  test('should show an error if phone number is invalid', async () => {
    // Setup mock responses
    isUsernameExistMock.mockResolvedValue(false);
    isVietnamesePhoneNumberValidMock.mockReturnValue(false); // Invalid phone number

    // Simulate input values
    document.querySelector('.name').value = 'La Hiểu Phong (customer)';
    document.querySelector('.phonenumber').value = 'abc';
    document.querySelector('.username').value = 'lahieuphong_customer';
    document.querySelector('.password').value = 'Tatooboys123@';
    document.querySelector('.confirmPassword').value = 'Tatooboys123@';

    // Call the register function
    await register();

    // Check that the error notice was shown for invalid phone number
    expect(customNoticeMock).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation",
      "Invalid phone number!",
      3
    );
  });

  test('should show an error if passwords do not match', async () => {
    // Setup mock responses
    isUsernameExistMock.mockResolvedValue(false);
    isVietnamesePhoneNumberValidMock.mockReturnValue(true);
    isPasswordValidMock.mockReturnValue(true);

    // Simulate input values
    document.querySelector('.password').value = 'Tatooboys123@';
    document.querySelector('.confirmPassword').value = 'Tatooboys123@@@';

    // Call the register function
    await register();

    // Check that the error notice was shown for password mismatch
    expect(customNoticeMock).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation",
      "Confirm password incorrect!",
      3
    );
  });

  test('should show an error if password is invalid', async () => {
    // Setup mock responses
    isUsernameExistMock.mockResolvedValue(false);
    isVietnamesePhoneNumberValidMock.mockReturnValue(true);
    isPasswordValidMock.mockReturnValue(false); // Invalid password

    // Simulate input values
    document.querySelector('.name').value = 'La Hiểu Phong';
    document.querySelector('.phonenumber').value = '0326526898';
    document.querySelector('.username').value = 'lahieuphong_customer';
    document.querySelector('.password').value = '12345';
    document.querySelector('.confirmPassword').value = '12345';

    // Call the register function
    await register();

    // Check that the error notice was shown for invalid password
    expect(customNoticeMock).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation",
      "Password that contain at least eight characters, including at least one number and includes both lowercase and uppercase letters and special characters, for example #, ?, !.",
      3
    );
  });

  test('should show an error if required fields are empty', async () => {
    // Setup mock responses
    isUsernameExistMock.mockResolvedValue(false);
    isVietnamesePhoneNumberValidMock.mockReturnValue(true);
    isPasswordValidMock.mockReturnValue(true);

    // Simulate empty inputs
    document.querySelector('.name').value = '';
    document.querySelector('.phonenumber').value = '';
    document.querySelector('.username').value = '';
    document.querySelector('.password').value = '';
    document.querySelector('.confirmPassword').value = '';

    // Call the register function
    await register();

    // Check that the error notice was shown for empty name field
    expect(customNoticeMock).toHaveBeenCalledWith(
      "fa-sharp fa-light fa-circle-exclamation",
      "Please, enter your name!",
      3
    );
  });
});
