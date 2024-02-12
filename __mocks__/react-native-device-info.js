const DeviceInfo = {
  getVersion: jest.fn(() => '1.0.0'),
  getModel: jest.fn(() => 'iPhone X'),
  getBuildNumber: jest.fn(() => '1.13.0'),
  // Add other mocked methods and properties as needed
};

export default DeviceInfo;
