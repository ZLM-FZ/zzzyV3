import { find as _find, chunk as _chunk } from 'lodash'
import { getDay2 } from './base'
export const emptyBottomTable = `<table>
<tr >
    <td></td>
    </table>`
// 空行
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
</table>${emptyBottomTable}`
// 索引
export const indexTable = (i) => {
    const date = getDay2()
    return `<table border="1"  align="center" >
    <colgroup>
        <col span="1"style="">
      </colgroup>
    <tr align="center" valign="center">
        <td  height=200 width=200 align="center" valign="center"  style="color:#fd0004;font-size: 72px;">${i}</td>
    </tr>
    <tr align="center">
        <td>买家（${date}）</td>
    </tr>
    <tr align="center">
        <td  >名字</td>
    </tr>
    <tr align="center">
        <td>号码</td>
    </tr>
    <tr align="center">
        <td>规格</td>
    </tr>
    <tr align="center">
        <td>尺寸</td>
    </tr>
    <tr align="center">
        <td>订单号</td>
    </tr>
    <tr align="center">
    <td>备注</td>
</tr>
</table>`
}
// 数据
export const dataTable = ({ img, spec, business, buyName, number, sizeAndNum, order_sn, bgColor }) => {
    return `<table border="1"  align="center"  bgcolor="#e5e9f2">
        <colgroup>
            <col span="1"style="">
          </colgroup>
        <tr align="center" valign="center">
            <td  height=200 width=200 align="center" valign="center"> <img src="${img}" height="100" /></td>
        </tr>
       
        <tr align="center">
            <td  style="background-color:${bgColor}">${business}</td>
        </tr>
        <tr align="center">
            <td  >${buyName}</td>
        </tr>
        <tr align="center">
            <td style="color:green">${number}</td>
        </tr>
        <tr align="center">
            <td >${spec}</td>
        </tr>
        <tr align="center">
            <td style="color:red">${sizeAndNum}</td>
        </tr>
        <tr align="center">
            <td style="color:blue">${order_sn}</td>
        </tr>
        <tr align="center">
        <td></td>
    </tr>
    </table>`
}

//相同图片统计格式
export const imgTable = ({ img, specStr }) => {
    return `<table border="1"  align="center" bgcolor="#e5e9f2">  
    <tr align="center" valign="center">
        <td  height=200 width=200 align="center" valign="center"> <img src="${img}" width="100" height="100" /></td>
    </tr>
    <tr align="center">
        <td width="200">${specStr}</td>
    </tr>       
</table>`
}

//图片空行
export const imgEmptyLeftTable = `<table  align="center" >
<tr align="center" valign="center">
    <td > </td>
</tr>
<tr align="center">
    <td ></td>
</tr>
</table>${emptyBottomTable}`