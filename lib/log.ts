export default function log(...args: any[]) {
  return console.log.apply(null, [...args]);
};
