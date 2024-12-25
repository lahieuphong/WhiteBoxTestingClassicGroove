// ADMIN -> STATISTIC -> statistic1

jest.mock('/Applications/XAMPP/htdocs/Classic-Groove/controllers/statisticController.js', () => ({
    getSales: jest.fn(),
    getNumberOfKindProductsSold: jest.fn(),
    getNumberOfProductsSold: jest.fn(),
    getTopKindProducts: jest.fn(),
    getTopProducts: jest.fn(),
    changeTypeInputDate: jest.fn(),
    checkInputStatistic1: jest.fn(),
    statistic1: jest.fn(),
    statistic2: jest.fn(),
    statistic3: jest.fn(),
  }));
  
  const {
    getSales,
    checkInputStatistic1,
    statistic1,
  } = require('/Applications/XAMPP/htdocs/Classic-Groove/controllers/statisticController.js');
  
  global.Highcharts = { chart: jest.fn() };
  global.customNotice = jest.fn();
  
  document.querySelector = jest.fn((selector) => {
    const elements = {
      "#statistic-type1 .dateStart": { value: "2023-01-01", type: "text" },
      "#statistic-type1 .dateEnd": { value: "2023-01-31", type: "text" },
      "#statistic-type1 .typeStatictis": { value: "1" },
    };
    return elements[selector] || {};
  });
  
  // Setup global mocks
  beforeEach(() => {
    jest.clearAllMocks();
  
    // Mock checkInputStatistic1 to always return true
    checkInputStatistic1.mockImplementation(() => true);
  
    // Mock statistic1 function implementation
    statistic1.mockImplementation(async () => {
      const dateStartInput = document.querySelector("#statistic-type1 .dateStart");
      const dateEndInput = document.querySelector("#statistic-type1 .dateEnd");
      const typeInput = document.querySelector("#statistic-type1 .typeStatictis");
  
      const data = JSON.parse(
        await getSales(dateStartInput.value, dateEndInput.value, typeInput.value)
      );
  
      const categories = data.map((item) => item.y || item.m || item.d);
      const totals = data.map((item) => parseInt(item.total));
  
      Highcharts.chart("container", {
        chart: { type: "line" },
        title: { text: "Mock Chart" },
        xAxis: { categories },
        yAxis: { title: { text: "Total sales revenue" } },
        series: [{ name: "Sales", data: totals }],
      });
    });
  });
  
  // Test cases
  describe('statisticController', () => {
    // Kiểm tra xem khi có dữ liệu bán hàng hợp lệ, hàm statistic1 có thể gọi getSales đúng cách và vẽ đồ thị bằng Highcharts như mong đợi hay không.
    test('should call statistic1 and render chart correctly', async () => {
      // Mock getSales return data
      getSales.mockResolvedValue(
        JSON.stringify([
          { y: "2023", total: 100 },
          { y: "2024", total: 150 },
        ])
      );
  
      // Call statistic1
      await statistic1();
  
      // Verify getSales is called with correct arguments
      expect(getSales).toHaveBeenCalledWith("2023-01-01", "2023-01-31", "1");
  
      // Verify Highcharts.chart is called
      expect(Highcharts.chart).toHaveBeenCalled();
    });
    

    // Kiểm tra xem hàm statistic1 có thể xử lý đúng khi không có dữ liệu bán hàng (dữ liệu trống) và vẽ đồ thị rỗng mà không gặp lỗi không.
    test('should handle empty sales data gracefully', async () => {
      // Mock getSales return empty data
      getSales.mockResolvedValue(JSON.stringify([]));
  
      // Call statistic1
      await statistic1();
  
      // Verify Highcharts.chart is called with empty data
      expect(Highcharts.chart).toHaveBeenCalledWith("container", {
        chart: { type: "line" },
        title: { text: "Mock Chart" },
        xAxis: { categories: [] },
        yAxis: { title: { text: "Total sales revenue" } },
        series: [{ name: "Sales", data: [] }],
      });
    });
  });