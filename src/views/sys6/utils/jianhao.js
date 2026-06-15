import { toLower as _toLower, } from "lodash";

export const jianhaoInit =  (dzDatasource)=>{
  if(!dzDatasource.length)return
  const fData =  flatData(dzDatasource)
  const excelArrData =  getAllDzGoods(fData)
  return excelArrData
}

// 提取出所有的定制商品
const getAllDzGoods = (arr) =>{
  const res = []
  arr.map(item => {
    const spec = _toLower(item.spec)
    if(spec !== 'no' && spec !== ''){
      res.push(item)
    }
  })
  return res
}

// 把数据弄成一维平铺数据
const flatData = (arr)=>{
  let _dataArr = []
  arr.map(item =>{
    const { goodsList } = item
    _dataArr = _dataArr.concat(goodsList)
  })
  return _dataArr
}