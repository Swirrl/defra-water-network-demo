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
