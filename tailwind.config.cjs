module.exports = {
  content: ["./src/routes/**/*.{svelte,js,ts}","./src/lib/**/*.{svelte,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"],
  },
  theme: {
    extend: {
      scale: {
        '200': "2.00"
      }
    }
  }
};