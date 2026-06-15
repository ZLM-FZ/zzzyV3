import { SPEC2, SPEC1, SPEC } from './enum'

//获取window信息
export const window_href = () => {
  const HREF = window.location.href
  const PAGE_TYPE1 = HREF.indexOf('type=1')
  const PAGE_TYPE2 = HREF.indexOf('type=2')
  let curPage = ''//order-ning店；old-旧店；new-新排序
  let which_spec = []
  if (PAGE_TYPE1 > 0) {
    which_spec = SPEC1
    curPage = 'order'
  } else if (PAGE_TYPE2 > 0) {
    which_spec = SPEC2
    curPage = 'old'
  } else {
    which_spec = SPEC
    curPage = 'new'
  }
  return {
    which_spec,
    curPage
  }
}

//获取年月日时分秒
export const getDay = () => {
  const d = new Date();
  // d.getFullYear() + "-" ++ ":" + d.getSeconds()
  let time = (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + d.getMinutes() + "分";

  return time
}

//获取年月日时分秒
export const getDay2 = () => {
  const d = new Date();
  const m = d.getMonth() + 1
  const mm = m < 10 ? '0' + m : m
  let time =d.getFullYear() + '-' + mm + "-" + d.getDate();

  return time
}

// //获取某个keys
// export const setKeys = (arr, key) => {
//   return arr.map(item => {
//     return item[key]
//   })
// }

//获取某个keys
export const setKeys = (arr, key) => {
  const res = []
   arr.map(item => {
    if(item[key]){
      res.push(item[key]) 
    }
  })
  return res
}


//设置随机颜色值
export const set_color = () => {
  const res = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0")
  return res
}

//图片
export const getItem_img = (str) => {
  return `https://s-cf-br.shopeesz.com/file/${str}_tn`
}

//获取时间
export const getItem_time = (obj) => {
  return ''
}

//获取尺寸
export const getItem_size = (str) => {
  const arr = str.split('=')
  return arr[0]
}

//获取规格
export const getItem_spec_size = (obj) => {
  const str = obj.item_model.name
  const arr = str.split(',')
  const o = {
    spec: arr[0],
  }
  if (arr.length > 1) {
    o.size = arr[1]
  }
  return o
}


//获取sku 一个商品多规格
export const getSku_spec_size = (name) => {
  const arr = name.split(',')
  const o = {
    spec: arr[0],
  }
  if (arr.length > 1) {
    o.size = arr[1]
  }
  return o
}


//获取尺寸
export const getSize = (str) => {
  if (!str) return '没码数'
  // return str
  let arr = []
  const i = str.indexOf('=')
  const j = str.indexOf('（')
  const k = str.indexOf('(')

  if (i !== -1) {
    arr = str.split('=')
  } else if (j !== -1) {
    arr = str.split('（')
  } else if (k !== -1) {
    arr = str.split('(')
  } else {
    arr = str.split()
  }
  return arr[0]
}
