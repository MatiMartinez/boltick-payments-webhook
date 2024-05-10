export const generateDateDDMMYYYYHHMM = (date: Date): string => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();

  let dayStr = day < 10 ? '0' + day : day.toString();
  let monthStr = month < 10 ? '0' + month : month.toString();
  let hoursStr = hours < 10 ? '0' + hours : hours.toString();
  let minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

  return `${dayStr}/${monthStr}/${year} - ${hoursStr}:${minutesStr}`;
};

export const formatARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});
