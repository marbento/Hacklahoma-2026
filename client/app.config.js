const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      elevenLabsApiKey: process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY,
    },
  },
};
