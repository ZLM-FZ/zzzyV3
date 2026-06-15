import { getDay } from "./main.js";
const emptyBottomTable = `<table>
<tr >
    <td></td>
    </table>`;

//----------报货的-------------
export const imgTable = ({ img, specStr, productName }) => {
    const prodName = simplifyProductName(productName)
  return `<table border="1"  align="center" bgcolor="#e5e9f2">  
    <tr align="center" valign="center">
        <td  height=200 width=200  align="center" valign="center"> <img src="https:${img}" width="160" height="160" /></td>
    </tr>
    <tr align="center">
        <td width="200">${specStr}</td>
    </tr>  
     <tr align="center">
        <td width="200">${prodName}</td>
    </tr>   
</table>`;
};

//图片空行
export const imgEmptyLeftTable = `<table  align="center" >
<tr align="center" valign="center">
    <td > </td>
</tr>
<tr align="center">
    <td ></td>
</tr>
<tr align="center">
    <td ></td>
</tr>
</table>${emptyBottomTable}`;

//-----------做单的-----------
export const emptyLeftTable = `<table  align="center" >
<colgroup>
    <col span="1"style="">
  </colgroup>
<tr align="center" valign="center">
    <td > </td>
</tr>
<tr align="center">
    <td ></td>
</tr>
<tr align="center">
    <td></td>
</tr>
<tr align="center">
    <td></td>
</tr>
<tr align="center">
    <td></td>
</tr>
<tr align="center">
    <td></td>
</tr>
<tr align="center">
    <td></td>
</tr>
<tr align="center">
    <td></td>
</tr>
</table>${emptyBottomTable}`;

export const indexOrderTable = (i) => {
  const date = getDay();
  return `<table border="1"  align="center" >
    <colgroup>
        <col span="1"style="">
      </colgroup>
    <tr align="center" valign="center">
        <td  height=200 width=200  align="center" valign="center"  style="color:#fd0004;font-size: 72px;">${i}</td>
    </tr>
    <tr align="center">
        <td>买家</td>
    </tr>
    <tr align="center">
        <td>购买选项</td>
    </tr>
    <tr align="center">
        <td>客户备注定制</td>
    </tr>
    <tr align="center">
        <td>补丁/规格</td>
    </tr>
    <tr align="center">
        <td>尺寸</td>
    </tr>
    <tr align="center">
        <td>订单号</td>
    </tr>
    <tr align="center">
    <td>订单备注</td>
</tr>
</table>`;
};
export const orderTable = ({
  textColor,
  img,
  bdAndgg,
  _instruction,
  DZnumber,
  business,
  buyerEmail,
  spec,
  size,
  order_sn,
  orderRemark,
  sBuyColor = "", //同个商家颜色
}) => {
  return `<table border="1"  align="center"  bgcolor="#e5e9f2">
        <colgroup>
            <col span="1"style="">
          </colgroup>
        <tr align="center" valign="center">
            <td  height=200 width=200  align="center" valign="center"> <img src="https:${img}" height="160" /></td>
        </tr>
        <tr align="center">
            <td  style="background-color:${
              sBuyColor || textColor
            }">${business}</td>
        </tr>
        <tr align="center">
            <td  >${spec}</td>
        </tr>
         <tr align="center">
            <td style="color:green">${_instruction}</td>
        </tr>
        <tr align="center">
            <td >${bdAndgg}</td>
        </tr>
        <tr align="center">
            <td style="color:red">${size}</td>
        </tr>
        <tr align="center">
            <td style="color:${sBuyColor ? textColor : "blue"}">${
    "&nbsp;" + order_sn
  }</td>
        </tr>
        <tr align="center">
        <td>${orderRemark}</td>
    </tr>
    </table>`;
};

export const simplifyProductName = (str) => {
  return String(str || "").replace(
    /Football Shirt?( Kids Size)? 1:1 Thai Quality/g,
    ""
  ).trim();
};