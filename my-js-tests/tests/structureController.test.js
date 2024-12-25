// ADMIN -> STRUCTURE

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/structureController.js', () => ({
    updateSlide: jest.fn(),
    uploadImgSlide: jest.fn(),
    checkAddSlide: jest.fn(),
    checkAlbumExist: jest.fn(),
    addSlide: jest.fn(),
    deleteSlide: jest.fn(),
  }));
  
  const {
    updateSlide,
    uploadImgSlide,
    checkAddSlide,
    checkAlbumExist,
    addSlide,
    deleteSlide,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/structureController.js');
  
  document.querySelector = jest.fn((selector) => {
    const elements = {
      ".imgSlide": { src: "http://example.com/images/default.jfif" },
      ".nameSlide": { value: "Test Slide" },
      ".linkToSlide": { value: "123" },
      ".top .img-placeholder img": { src: "" },
    };
    return elements[selector] || {};
  });
  
  document.createElement = jest.fn(() => {
    return {
      type: '',
      click: jest.fn(),
      files: [{
        type: 'image/png',
        name: 'test.png'
      }],
      onchange: null,
    };
  });
  
  const mockAjax = jest.fn();
  global.$ = { ajax: mockAjax };
  global.customNotice = jest.fn();
  global.loadPageByAjax = jest.fn();
  global.confirm = jest.fn().mockReturnValue(true);
  global.getInfoAlbum = jest.fn(async () => JSON.stringify([{ maAlbum: 123 }]));
  
  describe('structureController', () => {
    beforeEach(() => {
      jest.clearAllMocks();
  
      updateSlide.mockImplementation((slideID) => {
        if (!checkAddSlide()) return;
        let imgInput = document.querySelector(".imgSlide");
        let nameInput = document.querySelector(".nameSlide");
        let linkToInput = document.querySelector(".linkToSlide");
        $.ajax({
          url: "util/structure.php?slideID=" + slideID +
               "&slideName=" + nameInput.value +
               "&slideImg=" + imgInput.src.split("/").pop() +
               "&slideLinkTo=" + parseInt(linkToInput.value) +
               "&action=updateSlide",
          type: "PUT",
          success: function (res) {
            if (res != "Success") {
              console.log(res);
            } else {
              customNotice("fa-sharp fa-light fa-circle-check", "Update successfully!", 1);
              loadPageByAjax("structureManager");
            }
          },
        });
      });
  
      uploadImgSlide.mockImplementation(() => {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.click();
        fileInput.onchange = () => {
          let file_data = fileInput.files[0];
          let form_data = new FormData();
          if (!file_data.type.startsWith("image/")) {
            customNotice("fa-sharp fa-light fa-circle-exclamation", "Please upload an image!", 3);
            return;
          }
          form_data.append("file", file_data);
          form_data.append("target_directory", "../data/slideShow/");
          $.ajax({
            url: "util/upload.php",
            type: "POST",
            data: form_data,
            dataType: "script",
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
              if (res) {
                document.querySelector(".top .img-placeholder img").src = "data/slideShow/" + fileInput.files[0].name;
                customNotice("fa-sharp fa-light fa-circle-check", "Uploaded successfully", 1);
              } else {
                customNotice("fa-sharp fa-light fa-circle-exclamation", "Upload failed", 3);
              }
            },
          });
        };
      });
  
      checkAddSlide.mockImplementation(() => {
        let imgInput = document.querySelector(".imgSlide");
        let nameInput = document.querySelector(".nameSlide");
        let linkToInput = document.querySelector(".linkToSlide");
        if (imgInput.src.split("/").pop() == "default.jfif") {
          customNotice("fa-sharp fa-light fa-circle-exclamation", "Please upload an image!", 3);
          return false;
        }
        if (nameInput.value == "") {
          customNotice("fa-sharp fa-light fa-circle-exclamation", "Please enter a name!", 3);
          return false;
        }
        if (linkToInput.value == "") {
          customNotice("fa-sharp fa-light fa-circle-exclamation", "Please enter a link!", 3);
          return false;
        }
        if (isNaN(linkToInput.value)) {
          customNotice("fa-sharp fa-light fa-circle-exclamation", "Please enter a id album in Linked To!", 3);
          return false;
        }
        return true;
      });
  
      checkAlbumExist.mockImplementation(async () => {
        let linkToInput = document.querySelector(".linkToSlide");
        let allAlbum = JSON.parse(await getInfoAlbum());
        let exist = false;
        for (let i = 0; i < allAlbum.length; i++) {
          if (allAlbum[i].maAlbum == parseInt(linkToInput.value)) exist = true;
        }
        if (!exist) {
          customNotice("fa-sharp fa-light fa-circle-exclamation", "Please enter a link exist!", 3);
          return false;
        }
        return true;
      });
  
      addSlide.mockImplementation(async () => {
        if (!checkAddSlide()) return;
        if (!(await checkAlbumExist())) return;
        let imgInput = document.querySelector(".imgSlide");
        let nameInput = document.querySelector(".nameSlide");
        let linkToInput = document.querySelector(".linkToSlide");
        $.ajax({
          url: "util/structure.php",
          type: "POST",
          data: {
            slideName: nameInput.value,
            slideImg: imgInput.src.split("/").pop(),
            slideLinkTo: parseInt(linkToInput.value),
            action: "addSlide",
          },
          success: function (res) {
            if (res != "Success") {
              console.log(res);
            } else {
              customNotice("fa-sharp fa-light fa-circle-check", "Added successfully!", 1);
              loadPageByAjax("Structure");
            }
          },
        });
      });
  
      deleteSlide.mockImplementation((slideID) => {
        let choice = confirm("Are you sure to delete this slide?");
        if (!choice) return;
        $.ajax({
          url: "util/structure.php?slideID=" + slideID + "&action=deleteSlide",
          type: "DELETE",
          success: function (res) {
            if (res != "Success") {
              console.log(res);
            } else {
              customNotice("fa-sharp fa-light fa-circle-check", "Deleted successfully!", 1);
              loadPageByAjax("Structure");
            }
          },
        });
      });
    });
  
    test('checkAddSlide returns false if image is default', () => {
      document.querySelector.mockReturnValueOnce({ src: "http://example.com/images/default.jfif" });
      expect(checkAddSlide()).toBe(false);
    });
  
    test('checkAddSlide returns false if name is empty', () => {
      document.querySelector.mockReturnValueOnce({ src: "http://example.com/images/test.png" });
      document.querySelector.mockReturnValueOnce({ value: "" });
      expect(checkAddSlide()).toBe(false);
    });
    
    test('checkAlbumExist returns false if album does not exist', async () => {
      global.getInfoAlbum = jest.fn(async () => JSON.stringify([]));
      expect(await checkAlbumExist()).toBe(false);
  });

  test('checkAlbumExist returns true if album exists', async () => {
    global.getInfoAlbum = jest.fn(async () => JSON.stringify([{ maAlbum: 123 }]));
    expect(await checkAlbumExist()).toBe(true);
  });

  test('deleteSlide sends correct AJAX request when confirmed', () => {
    deleteSlide(1);
    expect(mockAjax).toHaveBeenCalledWith({
      url: "util/structure.php?slideID=1&action=deleteSlide",
      type: "DELETE",
      success: expect.any(Function),
    });
  });

  test('deleteSlide does not send AJAX request when not confirmed', () => {
    global.confirm.mockReturnValueOnce(false);
    deleteSlide(1);
    expect(mockAjax).not.toHaveBeenCalled();
  });
});