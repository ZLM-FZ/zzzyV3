import { chunk as _chunk } from "lodash";
//----------单号导出---------
export const _snTxtStr = (arr) => {
  const res = _chunk(arr, 4);
  let str = "";
  res.map((mm) => {
    str = str + mm.join(" ") + "\r\n";
  });
  return str;
};

//获取年月日时分秒
export const getDay = () => {
  const d = new Date();
  const m = d.getMonth() + 1;
  const mm = m < 10 ? "0" + m : m;
  let time = d.getFullYear() + "-" + mm + "-" + d.getDate();

  return time;
};
