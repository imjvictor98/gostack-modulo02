module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["airbnb-base"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "class-methods-use-this": "off", //para poder usar metodos de classe sem o this
    "no-param-reassign": "off", //receba um parametro e faça alteraçoes nele
    camelcase: "off", //desabilita o camelcase
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    //indent: ["error", 2],
    indent: [2, "tab"],
    "no-console": "off"
  }
};
