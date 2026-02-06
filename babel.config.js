module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.ts", ".android.ts", ".ts", ".ios.tsx", ".android.tsx", ".tsx", ".jsx", ".js", ".json"],
        alias: {
          "@assets": "./src/assets/",
          "@store": "./src/store/",
          "@components": "./src/components/",
          "@navigations": "./src/navigations/",
          "@screens": "./src/screens/",
          "@services": "./src/services/",
          "@shared": "./src/shared/",
          "@themes": "./src/themes/",
          "@localization": "./src/localization/",
          "@src": "./src/",
        },
      },
    ],
    // Worklets plugin MUST be last
    'react-native-worklets/plugin',
  ],
};