export const wait = async (sec = 1) =>
  new Promise<void>((res) => setTimeout(res, sec * 1000));

export const randNum = (min = 1, max = 5) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type ScrollToOptions = {
  y?: number;
  x?: number;
  behavior?: "auto" | "smooth";
};

export const scrollTo = (opts?: ScrollToOptions) => {
  const { y = 0, x = 0, behavior = "auto" } = opts || {};
  window.scrollTo({ top: y, left: x, behavior });
};
