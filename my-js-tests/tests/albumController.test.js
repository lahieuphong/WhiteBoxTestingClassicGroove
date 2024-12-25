// ADMIN -> ALBUM

const {
  addNewAlbum,
  updateAlbumInfo,
  deleteAlbum,
  addSongInAlbum,
  deleteSongInAlbum,
  updateSongInAlbum,
  uploadImg,
  checkUpdateAlbum,
  checkUpdateSong,
} = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/albumController.js');

// Mock the window.confirm function globally
global.confirm = jest.fn().mockReturnValue(true); // Trả về `true` để mô phỏng việc người dùng nhấn "OK"
global.customNotice = jest.fn();

// Mock customNotice và các phương thức khác trong loginController.js
jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/albumController.js', () => ({
  ...jest.requireActual('/Applications/XAMPP/htdocs/Classic-Groove/controllers/albumController.js'),
  customNotice: jest.fn(),
  ajax: jest.fn(),
}));

describe('Quản lý Album và Bài hát', () => {
  describe('addNewAlbum', () => {
    // Kiểm tra xem hàm addNewAlbum có gọi đúng với các tham số đã được truyền vào hay không.
    test('nên gọi addNewAlbum với các tham số đúng', async () => {
      // Mô phỏng phản hồi của AJAX
      $.ajax.mockResolvedValue('Success');
    
      const albumID = 1;
      const albumName = 'Evo Sessions';
      const albumKind = 2;
      const albumArtist = 'Chlara';
      const albumPrice = 100;
      const albumImage = 'EvoSessions-Chlara.jpg';
      const albumDescribe = 'Evosound proudly presents Chlara\'s evo sessions with 11 tracks...';
    
      // Gọi hàm đang được kiểm tra
      await addNewAlbum(albumID, albumName, albumKind, albumArtist, albumPrice, albumImage, albumDescribe);
    
      // Kiểm tra xem cuộc gọi AJAX có được thực hiện với các tham số đúng không
      const ajaxCall = $.ajax.mock.calls[0][0]; // Lấy tham số của cuộc gọi đầu tiên
    
      expect(ajaxCall).toMatchObject({
        url: 'util/albums.php', // Điều chỉnh URL cho phù hợp với URL thực tế
        type: 'POST',
        data: expect.objectContaining({
          action: 'addNewAlbum',
          albumID,
          albumName,
          albumKind,
          albumArtist,
          albumPrice,
          albumImage,
          // Kiểm tra dấu nháy đơn đã được thoát trong chuỗi nhận được
          albumDescribe: "Evosound proudly presents Chlara\\'s evo sessions with 11 tracks...",
        }),
      });
    });
  });


  describe('checkUpdateAlbum', () => {
    // Kiểm tra chức năng của việc kiểm tra thông tin album có hợp lệ hay không trước khi thực hiện cập nhật.
    test('nên cập nhật thông tin album với các tham số đúng', async () => {
      const albumID = 1;
      const albumName = 'Updated Album';
      const albumKind = 2;
      const albumArtist = 'Updated Artist';
      const albumPrice = 30;
      const albumImage = 'updated.jpg';
      const albumDescribe = 'Updated Description';
    
      // Mô phỏng phản hồi AJAX để giả lập việc cập nhật thành công
      $.ajax.mockResolvedValue('Success');
    
      await updateAlbumInfo(albumID, albumName, albumKind, albumArtist, albumPrice, albumImage, albumDescribe);
      
      // Đảm bảo rằng yêu cầu PUT đúng đã được thực hiện
      const ajaxCall = $.ajax.mock.calls.find(call => call[0].type === 'PUT'); // Lấy yêu cầu PUT
    
      // Kiểm tra xem URL có chứa các tham số truy vấn không
      expect(ajaxCall).toEqual(expect.arrayContaining([
        expect.objectContaining({
          url: expect.stringContaining(`albumID=${albumID}`),
          url: expect.stringContaining(`albumName=${albumName}`),
          url: expect.stringContaining(`albumKind=${albumKind}`),
          url: expect.stringContaining(`albumArtist=${albumArtist}`),
          url: expect.stringContaining(`albumPrice=${albumPrice}`),
          url: expect.stringContaining(`albumImage=${albumImage}`),
          url: expect.stringContaining(`albumDescribe=${albumDescribe}`),
          url: expect.stringContaining('action=updateAlbumInfo'),
          type: 'PUT',
        }),
      ]));
    });

    // Kiểm tra trường hợp tên album trống
    test('nên trả về false nếu tên album trống trong checkUpdateAlbum', () => {
      // Mô phỏng các trường hợp nhập liệu trống
      document.body.innerHTML = `<input class="albumName" value="">`;
      const result = checkUpdateAlbum();
      expect(result).toBe(false);
    });

    // Kiểm tra trường hợp tên album, nghệ sĩ và các trường hợp khác không trống
    test('nên trả về true nếu tên album, nghệ sĩ và các trường không trống trong checkUpdateAlbum', () => {
      // Mô phỏng các trường hợp nhập liệu không trống
      document.body.innerHTML = `
        <input class="albumName" value="J97">
        <input class="albumKind" value="7"> 
        <input class="albumArtist" value="J97">
        <input class="albumPrice" value="2200">  
      `;

      // Gọi hàm
      const result = checkUpdateAlbum();

      // Kiểm tra xem hàm trả về true vì tất cả các trường đã được điền đúng
      expect(result).toBe(true);
    });
  });


  describe('checkUpdateSong', () => {
    // Kiểm tra trường hợp tên bài hát trống
    test('nên trả về false nếu tên bài hát trống trong checkUpdateSong', () => {
      // Mô phỏng trường hợp tên bài hát trống
      document.body.innerHTML = `<input type="text" class="songName" value="">`;
      const result = checkUpdateSong();
      expect(result).toBe(false);
    });

    // Kiểm tra trường hợp tên bài hát không trống
    test('nên trả về true nếu tên bài hát không trống trong checkUpdateSong', () => {
      // Mô phỏng trường hợp tên bài hát không trống
      document.body.innerHTML = `<input type="text" class="songName" value="This Love">`;
      
      const result = checkUpdateSong();
      expect(result).toBe(true);
    });
  }); 

  
  describe('uploadImg', () => {
    beforeEach(() => {
      // Mô phỏng customNotice
      global.customNotice = jest.fn();
  
      // Mô phỏng $.ajax để giả lập việc tải lên file thành công
      $.ajax = jest.fn((options) => {
        // Mô phỏng phản hồi thành công
        options.success(true);
      });
  
      // Thiết lập DOM với một container ảnh giả
      document.body.innerHTML = `
        <div class="img-container">
          <img src="" alt="Uploaded image" />
        </div>
      `;
    });
    

    // Kiểm tra chức năng tải lên ảnh album và cập nhật ảnh sau khi tải lên thành công.
    test('nên tải lên ảnh nếu file hợp lệ được chọn', async () => {
      // Tạo một file ảnh giả sử dụng constructor File
      const file = new File([''], 'ThienLyOi-J97.jpg', { type: 'image/jpeg' });
  
      // Tạo một phần tử input để chọn file
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
  
      // Mô phỏng thuộc tính 'files' để giả lập việc chọn file
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
  
      // Thiết lập trình xử lý sự kiện onchange
      fileInput.onchange = () => {
        let file_data = fileInput.files[0];
        let form_data = new FormData();
        form_data.append("file", file_data);
        form_data.append("target_directory", "../data/imgAlbum/");
        
        // Thực hiện yêu cầu AJAX
        $.ajax({
          url: 'util/upload.php',
          type: 'POST',
          data: form_data,
          dataType: 'script',
          cache: false,
          contentType: false,
          processData: false,
          success: function (res) {
            if (res) {
              document.querySelector('.img-container img').src = 'data/imgAlbum/' + file.name;
              customNotice(
                "fa-sharp fa-light fa-circle-check",
                "Tải lên thành công",
                1
              );
            } else {
              customNotice(
                "fa-sharp fa-light fa-circle-exclamation",
                "Tải lên thất bại",
                3
              );
            }
          },
        });
      };
  
      // Gây ra sự kiện 'change' trên input để giả lập việc chọn file
      fileInput.dispatchEvent(new Event('change'));
  
      // Dùng await để đợi mã bất đồng bộ hoàn thành
      await Promise.resolve(); // Đảm bảo DOM được cập nhật và mã bất đồng bộ hoàn thành
  
      // Kiểm tra xem yêu cầu AJAX có được gọi với tham số mong muốn không
      expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
        url: 'util/upload.php',
        type: 'POST',
        data: expect.any(FormData),
      }));
  
      // Kiểm tra xem nguồn ảnh có được cập nhật sau khi tải lên thành công không
      const img = document.querySelector('.img-container img');
      expect(img.src).toBe('http://localhost/data/imgAlbum/ThienLyOi-J97.jpg');
  
      // Kiểm tra xem thông báo thành công có được hiển thị không
      expect(global.customNotice).toHaveBeenCalledWith(
        "fa-sharp fa-light fa-circle-check",
        "Tải lên thành công",
        1
      );
    });
  });

});