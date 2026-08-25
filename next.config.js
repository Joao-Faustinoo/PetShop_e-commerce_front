module.exports = {
  compiler: {
    styledComponents: true,
  },
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/,
      // Sem o `issuer`, esta regra também captura o `src/app/icon.svg` que
      // o Next processa como metadata (favicon) e a build quebra. Com ele,
      // o SVGR só atua em SVG importado de dentro de um arquivo JS/TS.
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
