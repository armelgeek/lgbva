module.exports = {
  gToMg(value) {
    return Number(value) * 1000;
  },
  MlToMg(value) {
    return this.gToMg(value);
  },
  lToMg(value) {
    return this.gToMg(value) * 1000;
  },
  kgToMg(value) {
    return Number(value) * 1000000;
  },
  MgToCC(value) {
    return Number(value) / 1000;
  },
  CCToMg(value) {
    return Number(value) * 1 * 1000;
  },
  MgTog(value) {
    return Number(value) / 1000;
  },
  MgToMl(value) {
    return this.MgTog(value);
  },
  MgTol(value) {
    return this.MgToMl(value) / 1000;
  },
  MgToKg(value) {
    return Number(value) / 1000000;
  },
};
