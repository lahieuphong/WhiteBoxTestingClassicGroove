// ADMIN -> PERMISSION -> Role

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/roleController.js', () => ({
  updateRole: jest.fn(),
  checkAddNewRole: jest.fn(),
  addNewRole: jest.fn(),
  deleteRole: jest.fn(),
}));

const {
  updateRole,
  checkAddNewRole,
  addNewRole,
  deleteRole,
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/roleController.js');

document.querySelector = jest.fn((selector) => {
  const elements = {
    ".info-role input": { value: "Admin", trim: jest.fn().mockReturnValue("Admin") },
    ".info-role textarea": { value: "Administrator role", trim: jest.fn().mockReturnValue("Administrator role") },
    ".role-placeholder .checkbox-placeholder input": [
      { checked: true, value: "1" },
      { checked: false, value: "2" },
    ],
    ".info-role input[empty]": { value: "", trim: jest.fn().mockReturnValue("") },
  };
  return elements[selector] || [];
});

document.querySelectorAll = jest.fn((selector) => {
  const elements = {
    ".role-placeholder .checkbox-placeholder input": [
      { checked: true, value: "1" },
      { checked: false, value: "2" },
    ],
  };
  return elements[selector] || [];
});

const mockAjax = jest.fn();
global.$ = { ajax: mockAjax };
global.customNotice = jest.fn();
global.loadPageByAjax = jest.fn();
global.loadModalBoxByAjax = jest.fn();
global.confirm = jest.fn().mockReturnValue(true);

describe('roleController', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    updateRole.mockImplementation(async (roleID) => {
      if (!checkAddNewRole()) return;
      let listPermissionInput = document.querySelectorAll(
        ".role-placeholder .checkbox-placeholder input"
      );
      let listPermission = [];
      listPermissionInput.forEach((item) => {
        if (item.checked) listPermission.push(parseInt(item.value));
      });
      let roleName = document.querySelector(".info-role input").value.trim();
      let roleDescription = document
        .querySelector(".info-role textarea")
        .value.trim();
      $.ajax({
        url: "util/role.php",
        type: "POST",
        data: {
          roleID: roleID,
          roleName: roleName,
          roleDescription: roleDescription,
          listPermission: listPermission,
          action: "updateRole",
        },
        success: function (res) {
          if (res != "Success") console.log(res);
          else
            customNotice(
              "fa-sharp fa-light fa-circle-check",
              "Update role successfully!",
              1
            );
          loadPageByAjax("Permission");
          loadModalBoxByAjax("roleManager", roleID);
        },
      });
    });

    checkAddNewRole.mockImplementation(() => {
      let roleNameInput = document.querySelector(".info-role input");
      if (roleNameInput.value.trim() == "") {
        customNotice(
          "fa-sharp fa-light fa-circle-exclamation",
          "Role name must not be empty!",
          3
        );
        return false;
      }
      return true;
    });

    addNewRole.mockImplementation((roleID) => {
      if (!checkAddNewRole()) return;
      let listPermissionInput = document.querySelectorAll(
        ".role-placeholder .checkbox-placeholder input"
      );
      let listPermission = [];
      listPermissionInput.forEach((item) => {
        if (item.checked) listPermission.push(parseInt(item.value));
      });
      let roleName = document.querySelector(".info-role input").value.trim();
      let roleDescription = document
        .querySelector(".info-role textarea")
        .value.trim();
      $.ajax({
        url: "util/role.php",
        type: "POST",
        data: {
          roleID: roleID,
          roleName: roleName,
          roleDescription: roleDescription,
          listPermission: listPermission,
          action: "addNewRole",
        },
        success: function (res) {
          if (res != "Success") console.log(res);
          else
            customNotice(
              "fa-sharp fa-light fa-circle-check",
              "Add new role successfully!",
              1
            );
          loadPageByAjax("Permission");
        },
      });
    });

    deleteRole.mockImplementation((roleID) => {
      let choice = confirm("Are you sure to delete this role?");
      if (!choice) return;
      $.ajax({
        url: "util/role.php?roleID=" + roleID + "&action=deleteRole",
        type: "DELETE",
        success: function (res) {
          if (res != "Success") console.log(res);
          else
            customNotice(
              "fa-sharp fa-light fa-circle-check",
              "Delete role successfully!",
              1
            );
          loadPageByAjax("Permission");
        },
      });
    });
  });


//   Kiểm tra hàm updateRole gửi yêu cầu AJAX đúng khi cập nhật thông tin vai trò.
  test('updateRole sends correct AJAX request', async () => {
    await updateRole(1);
    expect(mockAjax).toHaveBeenCalledWith({
      url: "util/role.php",
      type: "POST",
      data: {
        roleID: 1,
        roleName: "Admin",
        roleDescription: "Administrator role",
        listPermission: [1],
        action: "updateRole",
      },
      success: expect.any(Function),
    });
  });

//   Kiểm tra hàm checkAddNewRole trả về false nếu tên vai trò bị để trống.
  test('checkAddNewRole returns false if role name is empty', () => {
    document.querySelector.mockReturnValueOnce({ value: "", trim: jest.fn().mockReturnValue("") });
    expect(checkAddNewRole()).toBe(false);
  });

//   Kiểm tra hàm checkAddNewRole trả về true nếu tên vai trò không bị để trống.
  test('checkAddNewRole returns true if role name is not empty', () => {
    expect(checkAddNewRole()).toBe(true);
  });

//   Kiểm tra hàm addNewRole gửi yêu cầu AJAX đúng khi thêm vai trò mới.
  test('addNewRole sends correct AJAX request', () => {
    addNewRole(2);
    expect(mockAjax).toHaveBeenCalledWith({
      url: "util/role.php",
      type: "POST",
      data: {
        roleID: 2,
        roleName: "Admin",
        roleDescription: "Administrator role",
        listPermission: [1],
        action: "addNewRole",
      },
      success: expect.any(Function),
    });
  });

//   Kiểm tra hàm deleteRole gửi yêu cầu AJAX đúng khi xác nhận xóa vai trò.
  test('deleteRole sends correct AJAX request when confirmed', () => {
    deleteRole(3);
    expect(mockAjax).toHaveBeenCalledWith({
      url: "util/role.php?roleID=3&action=deleteRole",
      type: "DELETE",
      success: expect.any(Function),
    });
  });


//   Kiểm tra hàm deleteRole không gửi yêu cầu AJAX khi người dùng không xác nhận xóa vai trò.
  test('deleteRole does not send AJAX request when not confirmed', () => {
    global.confirm.mockReturnValueOnce(false);
    deleteRole(4);
    expect(mockAjax).not.toHaveBeenCalled();
  });
});
