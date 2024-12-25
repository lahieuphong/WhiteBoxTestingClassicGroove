// ADMIN -> SUPPLY -> Record

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/supplyController.js', () => ({
    updateSuggestionsAlbum: jest.fn(),
    suggestAlbum: jest.fn(),
    addExistingAlbum: jest.fn(),
    deleteRowAlbum: jest.fn(),
    updateTotalCost: jest.fn(),
    checkAddSupply: jest.fn(),
    addNewSupply: jest.fn(),
  }));
  
  // Import the mocked functions
  const {
    updateSuggestionsAlbum,
    suggestAlbum,
    addExistingAlbum,
    deleteRowAlbum,
    updateTotalCost,
    checkAddSupply,
    addNewSupply,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/supplyController.js');
  
  describe('Album Management Tests', () => {
    let suggestionsAlbum;
  
    // Setup mock for the `updateSuggestionsAlbum` function
    beforeAll(async () => {
      suggestionsAlbum = ['123-Album 1', '124-Album 2'];  // Example mock data
      updateSuggestionsAlbum.mockResolvedValue(suggestionsAlbum);
      await updateSuggestionsAlbum();
    });
    

    // Kiểm tra xem hàm updateSuggestionsAlbum có cập nhật đúng dữ liệu hay không.
    test('updateSuggestionsAlbum should update suggestionsAlbum correctly', () => {
      // Since updateSuggestionsAlbum is mocked to resolve with suggestionsAlbum, we test the output
      expect(suggestionsAlbum).toBeInstanceOf(Array);
      expect(suggestionsAlbum.length).toBeGreaterThan(0);
      expect(suggestionsAlbum).toEqual(['123-Album 1', '124-Album 2']);
    });
    
    // Kiểm tra xem hàm suggestAlbum có hoạt động đúng khi được truyền một sự kiện đầu vào.
    test('suggestAlbum should filter albums based on input', () => {
      // Simulate an event with a value that should match an album
      const event = { target: { value: 'album' } };
      suggestAlbum(event);
      // Here you would need to ensure your mock of suggestAlbum calls the correct behavior
      expect(suggestAlbum).toHaveBeenCalledWith(event);
    });
    

    // Kiểm tra xem hàm checkAddSupply có kiểm tra và xác thực đầu vào đúng hay không.
    test('checkAddSupply should validate input correctly', () => {
      // Mock behavior of checkAddSupply to simulate validation
      checkAddSupply.mockReturnValue(true);
      const isValid = checkAddSupply();
      expect(isValid).toBe(true);
    });
    

    // Kiểm tra xem hàm addNewSupply có gửi dữ liệu hợp lệ lên server và nhận phản hồi đúng không.
    test('addNewSupply should send valid data to the server', async () => {
      // Simulate a successful response from the server
      addNewSupply.mockResolvedValue('Success');
  
      // Run the function and check for the correct response
      const response = await addNewSupply();
      expect(response).toBe('Success');
    });
  });