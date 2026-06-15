import { getDay } from "./main.js";
import { simplifyProductName } from "./excelFormat.js";

const date = getDay();

export const jianhaoExcelInit = (arr) => {
  if(!arr.length)return
  let trStrs = '';
  arr.map(item=>{
    trStrs = trStrs + jianhaoExcelTableCenter(item)
  })
  let s0 = jianhaoExcelTableStart()
  let s1 = jianhaoExcelTableEnd()
  const res = s0+trStrs+s1
  return res
}


 const jianhaoExcelTableStart = () => {
  return `<table align="left" border="1" style="color: black;">  
        <tr align="left" bgcolor="#feff41" style="font-weight:bolder;font-size: 16px;">
            <td width="150" height="36">衬衫${date}</td>
            <td width="300" height="36">款式</td>
            <td width="300" height="36">姓名和号码</td>
            <td width="150" height="36">胸章</td>
            <td width="150" height="36">臂章</td>
            <td width="100" height="36" style="text-align: center;">款式</td>
            <td width="100" height="36" style="text-align: center;">数量</td>
            <td width="100" height="36" style="text-align: center;">码数</td>
            <td width="300" height="36">订单号</td>
        </tr>
        `
}
 const jianhaoExcelTableEnd = () => {
  return `    
    </table>`
}

const dz = ["With name and number","onlyHasPatch","Other(Add In The Instruction)"]
function resetAIfInDz(a) {
  if (dz.includes(a)) {
      return '';
  }
  return a;
}
 const jianhaoExcelTableCenter = ({
  imgUrl,
  productName,
  number,
  orderCode,
  size,
  textColor,
  _customPatch,
  spec,// spec和_instruction，如果是定制姓名和号码，应该只有一个才是正确的姓名和号码
  _instruction,
}) => {
  const type = isNumeric(size)?'童装':''
  let name = _instruction?_instruction:spec
  name = resetAIfInDz(name)

  const prodName = simplifyProductName(productName || "")
  return `<tr align="left">
          <td  width="150" height="150"><img style="width: 100%;" src="https:${imgUrl}" width="150" height="150" alt=""></td>
          <td>${prodName}</td>
          <td style="font-weight:bolder;color: red;font-size: 18px;">${name}</td>
          <td>${'&nbsp;'}</td>
          <td style="font-weight:bolder;font-size: 18px;">${_customPatch}</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">${type}</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">${number}</td>
          <td  style="text-align: center;">${size}</td>
          <td style="color: ${textColor};">${
            "&nbsp;" + orderCode
          }</td>
        </tr>`
}

function isNumeric(value) {
  // 如果是数字类型（number），返回 true
  if (typeof value === 'number') {
    return true;
  }
  // 如果是字符串，检查是否可以解析为数字
  if (typeof value === 'string') {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }
  // 其他情况（如 boolean、object、undefined 等）返回 false
  return false;
}

/**
 * 捡号真 xlsx 用：与 `jianhaoExcelTableCenter` 同字段逻辑
 * @param {Array<object>} arr `jianhaoDataSource`
 */
export function prepareJianhaoSheetRows(arr) {
  if (!arr || !arr.length) return [];
  return arr.map((item) => {
    const type = isNumeric(item.size) ? "童装" : "";
    let name = item._instruction ? item._instruction : item.spec;
    name = resetAIfInDz(name);
    return {
      imgUrl: item.imgUrl,
      prodName: simplifyProductName(item.productName || ""),
      displayName: name,
      armPatch: item._customPatch || "",
      typeLabel: type,
      number: item.number,
      size: item.size,
      orderCode: item.orderCode,
      textColor: item.textColor,
    };
  });
}

export const testxxx = ()=> {
  return `<table align="left" border="1" style="color: black;">  
        <tr align="left" bgcolor="#feff41" style="font-weight:bolder;font-size: 16px;">
            <td width="150" height="36">衬衫</td>
            <td width="400" height="36">款式</td>
            <td width="300" height="36">姓名和号码</td>
            <td width="150" height="36">胸章</td>
            <td width="150" height="36">臂章</td>
            <td width="100" height="36" style="text-align: center;">码数</td>
            <td width="100" height="36" style="text-align: center;">款式</td>
            <td width="100" height="36" style="text-align: center;">数量</td>
            <td width="300" height="36">订单号(删)</td>
        </tr>
        <tr align="left">
          <td height="150"><img style="width: 100%;" src="" alt=""></td>
          <td>25/26维拉客场黑色是这一件吗</td>
          <td style="font-weight:bolder;color: red;font-size: 18px;">柠檬 #8</td>
          <td>xz</td>
          <td style="font-weight:bolder;font-size: 18px;">西甲联赛</td>
          <td  style="text-align: center;">L</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">童装</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">1</td>
          <td style="color: red;">1232312321313</td>
        </tr>   
        <tr align="left">
          <td height="150"><img style="width: 100%;" src="" alt=""></td>
          <td>25/26维拉客场黑色是这一件吗</td>
          <td style="font-weight:bolder;color: red;font-size: 18px;">柠檬 #8</td>
          <td>xz</td>
          <td style="font-weight:bolder;font-size: 18px;">西甲联赛</td>
          <td  style="text-align: center;">L</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">童装</td>
          <td style="font-weight:bolder;font-size: 18px;text-align: center;">1</td>
          <td style="color: red;">1232312321313</td>
        </tr>   
    </table>`
}