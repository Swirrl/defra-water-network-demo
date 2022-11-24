export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout, ...args);
  };
};

export const ensureHttps = (url) => {
  return url.replace(/http:/, "https:");
};

export const bristolFieldLabels = {
  tc_cfu: "Total Coliforms (CFU)",
  ec_cfu: "E Coli (CFU)",
  tc_mpn: "Total Coliforms (MPN)",
  ec_mpn: "E. Coli (MPN)",
  p_ecc_cfu: "Presumptive Enterococchi (CFU)",
  fs_cfu: "Faecal Streptococchi (CFU)",
  temp: "Temperature",
  ph: "pH",
  cond: "Conductivity",
  do: "Dissolved Oxygen",
  dopc: "Dissolved Oxygen (%)",
  phosphate_p: "Phosphate as P",
  salinity: "Salinity",
  clost_perf: "Clostridium Perfringens (CFU)",
  ammonium_nh4: "Ammonium as NH4",
  turb: "Turbidity",
  ammonium_n: "Ammonium as Nitrate",
  nitrite: "Nitrite",
  nitrate: "Nitrate",
  fcoliforms: "Faecal Coliforms",
  salmonella: "Salmonella",
  bod: "BOD",
  cod: "COD",
  sussolids: "Suspended Solids",
  total_coliform: "Total Coliform",
  total_ecoli: "Total E Coli",
};
