// INDEX -> FAVORITES -> favorte/disliked

const {
    addToFavorite, 
    disLike,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/favoriteController.js');

  describe('Album Favorite and Dislike Tests', () => {
    let customNoticeSpy;
    let loadProductDetailsByAjaxSpy;
    
    beforeEach(() => {
      // Mock các hàm mà chúng ta muốn kiểm tra
      customNoticeSpy = jest.fn();
      loadProductDetailsByAjaxSpy = jest.fn();
      
      // Giả lập việc gọi các hàm đó trong mã của bạn
      global.customNotice = customNoticeSpy;
      global.loadProductDetailsByAjax = loadProductDetailsByAjaxSpy;
  
      // Mock jQuery AJAX để tránh việc thực sự gọi server
      global.$ = {
        ajax: jest.fn(),
      };
    });
    

    // Kiểm tra xem khi gọi addToFavorite(1) và server trả về kết quả thành công (trả về 'success'), 
    // hệ thống có gọi hàm customNotice để thông báo thành công và gọi hàm loadProductDetailsByAjax không.
    it('should add album to favorites successfully', () => {
      // Giả lập AJAX trả về "success"
      $.ajax.mockImplementationOnce((options) => {
        options.success('success');
      });
  
      // Gọi hàm addToFavorite với albumID là 1
      addToFavorite(1);
  
      // Kiểm tra các hành động sau khi AJAX trả về success
      expect(customNoticeSpy).toHaveBeenCalledWith(
        "fa-sharp fa-light fa-circle-check", 
        "Added to your Favorite", 
        1
      );
      expect(loadProductDetailsByAjaxSpy).toHaveBeenCalledWith(1);
    });
    

    // Kiểm tra khi gọi addToFavorite(2) và server trả về lỗi (ví dụ: 'Error: Unable to add'), 
    // hệ thống có thông báo lỗi đúng không.
    it('should show an error when adding album to favorites fails', () => {
      // Giả lập AJAX trả về lỗi
      $.ajax.mockImplementationOnce((options) => {
        options.success('Error: Unable to add');
      });
  
      // Gọi hàm addToFavorite với albumID là 2
      addToFavorite(2);
  
      // Kiểm tra thông báo lỗi
      expect(customNoticeSpy).toHaveBeenCalledWith(
        "fa-sharp fa-light fa-circle-exclamation", 
        'Error: Unable to add', 
        3
      );
    });
    

    // Kiểm tra xem khi gọi disLike(3) và server trả về kết quả thành công (trả về 'success'), 
    // hệ thống có gọi customNotice để thông báo thành công và gọi loadProductDetailsByAjax không.
    it('should remove album from favorites successfully', () => {
      // Giả lập AJAX trả về "success" cho hành động dislike
      $.ajax.mockImplementationOnce((options) => {
        options.success('success');
      });
  
      // Gọi hàm disLike với albumID là 3
      disLike(3);
  
      // Kiểm tra các hành động sau khi AJAX trả về success
      expect(customNoticeSpy).toHaveBeenCalledWith(
        "fa-sharp fa-light fa-circle-check", 
        "Removed from your Favorite", 
        1
      );
      expect(loadProductDetailsByAjaxSpy).toHaveBeenCalledWith(3);
    });
    
    // Kiểm tra khi gọi disLike(4) và server trả về lỗi (ví dụ: 'Error: Unable to remove'), 
    // hệ thống có thông báo lỗi đúng không.
    it('should show an error when removing album from favorites fails', () => {
      // Giả lập AJAX trả về lỗi cho hành động dislike
      $.ajax.mockImplementationOnce((options) => {
        options.success('Error: Unable to remove');
      });
  
      // Gọi hàm disLike với albumID là 4
      disLike(4);
  
      // Kiểm tra thông báo lỗi
      expect(customNoticeSpy).toHaveBeenCalledWith(
        "fa-sharp fa-light fa-circle-exclamation", 
        'Error: Unable to remove', 
        3
      );
    });
  });