import { chunk as _chunk} from 'lodash'
export const getSnText = ()=>{
    const {allOrder_sn} = window.__shop_save_datas || {}
    if(allOrder_sn){
        return snTxtStr(allOrder_sn)
    }
}

//数组分组成4个一组
export const snTxtStr = (arr)=>{
   const res = _chunk(arr,4)
   let str = ''
   res.map(mm=>{
    str=str+ mm.join(' ')+'\r\n'
   })
   return str
}

//获取对应规格的单号
export const getSpecSns=(arr)=>{
    if(!arr)return []
   return arr?.map(item=>item.order_sn)
}