import { emptyBottomTable, indexTable, dataTable, emptyLeftTable, } from './format'
import { find as _find, chunk as _chunk } from 'lodash'
import { startSetImgExcelData } from './imgExport'
import { set_color, getItem_spec_size, getSku_spec_size } from './base'


//获取所有订单数据
export const startSetExcelDate = ({
  arrDatas,
  key,
  defineIndex
}) => {
  const flatDatas = setFlatData(arrDatas, key)//每种规格所有商品平铺完数据
  // console.log(flatDatas, '=========每种规格所有商品平铺完数据')
  const tableDatas = setTabelFormat(flatDatas.arr, defineIndex)//规格的excel格式
  // console.log(tableDatas, '-------商品转成table的数据')
  const imgExportData = startSetImgExcelData(flatDatas.arr)//图片汇总导出
  // console.log(imgExportData, '---imgExportData')
  //---------step3: 导出---------
  return {
    defineIndex: tableDatas.defineIndex,
    tableArrs: tableDatas.arr,
    goodsImgNum: flatDatas.goodsImgNum,
    imgExportData
  }
}




//---------step2:分4块一组 + 转table---------
export const setTabelFormat = (arrs, defineIndex) => {
  //先分4块一组
  const chunkArrs = _chunk(arrs, 4)
  //变换成table
  const res = []
  chunkArrs.map((arr, i) => {
    // 先设置索引table
    let obj = {
      left: indexTable(defineIndex)
    }
    //每一组的小数据
    arr.map((item, j) => {
      obj[`data${j}`] = dataTable(item)//一定要j,excel的列唯一
      obj[`empty${j}-`] = emptyLeftTable
    })
    res.push(obj)
    //每一组，defineIndex++
    defineIndex++
  })

  return {
    arr: res,
    defineIndex
  }
}

//-------step1: 平铺并转json数据---------

export const setFlatData = (arrDatas, key) => {
  //处理同个商家颜色
  let goodsImgNum = 0
  const data = []
  arrDatas?.map(item => {
    //每一条数据都是一个单，可有多个商品
    const { order_items, order_sn, buyer_user } = item
    //如果一个单多个商品,把背景色和商家标出来
    let orderParams = {
      bgColor: '',
      business: ''
    }
    if (item.order_items.length > 1) {
      orderParams.bgColor = set_color()
      orderParams.business = buyer_user.user_name
    }
    //同个商家购买多件
    if (key === 'spec007') {
      orderParams.bgColor = sameBuyerBgColor(buyer_user)
      orderParams.business = buyer_user.user_name
    }
    //一个订单，多个规格，多个商品
    order_items.map((mm, n) => {
      const { item_list } = mm

      //一个规格一件商品
      if (item_list.length === 0) {
        const specSize = getItem_spec_size(mm)
        for (let y = 0; y < mm.amount; y++) {
          const href = mm.product.images[0]
          const parmas = {
            ...orderParams,
            order_sn,
            img: `https://s-cf-br.shopeesz.com/file/${href}_tn`,
            imgId: href,
            spec: specSize.spec,
            sizeAndNum: `${specSize.size}`,
            buyName: '',
            number: '',
          }
          data.push(parmas)
          goodsImgNum++
        }
      } else {
        const { bundle_deal_model, bundle_deal_product } = mm
        // bundle_deal_model:规格
        //bundle_deal_product:图片
        //item_list：数量
        // 一个规格多件商品
        if (!orderParams.bgColor) {
          orderParams.bgColor = set_color()
        }
        if (!orderParams.business) {
          orderParams.business = buyer_user.user_name
        }
        //同个商家购买多件
        if (key === 'spec007') {
          orderParams.bgColor = sameBuyerBgColor(buyer_user)
          orderParams.business = buyer_user.user_name
        }

        item_list.map((ww, x) => {
          const specSize = getSku_spec_size(bundle_deal_model[x].name)
          const href = bundle_deal_product[x].images[0]
          for (let x = 0; x < ww.amount; x++) {
            const parmas = {
              ...orderParams,
              order_sn,
              img: `https://s-cf-br.shopeesz.com/file/${href}_tn`,
              imgId: href,
              spec: specSize.spec,
              sizeAndNum: `${specSize.size}`,
              buyName: '',
              number: '',
            }
            //转完添加
            data.push(parmas)
            goodsImgNum++
          }
        })
      }

    })
  })
  return {
    arr: data,
    goodsImgNum
  }
}


//设置商家的背景颜色
let isSameBuyer = ''
let isSameBuyerBg = ''
const sameBuyerBgColor = (buyer_user,) => {

  if (buyer_user.user_id !== isSameBuyer) {
    isSameBuyerBg = set_color()
    isSameBuyer = buyer_user.user_id
  }

  return isSameBuyerBg
}