module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    ["react-native-reanimated/plugin"],
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
  ],
};
