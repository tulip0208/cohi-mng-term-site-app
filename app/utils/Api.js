// api.js
const activateDevice = async (activationCode, deviceId) => {
    try {
      let response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activationCode: activationCode,
          deviceId: deviceId,
        }),
      });
      let responseJson = await response.json();
      // ここでアクティベーション成功時の処理を行う
      return responseJson; // 応答を返す
    } catch (error) {
      console.error(error);
    }
  };
  
  export { activateDevice };