import { downBtn2, downBtn1, downBtn } from './enum'
import { filter as _filter, cloneDeep as _cloneDeep, includes as _includes, find as _find, findIndex as _findIndex, uniqBy as _uniqBy, get as _get } from 'lodash'
import { getAllOrder, MAX_PRICE, setBuyer, yesDataSort, changeSamneBuyerData } from './baseItem'
import { setKeys } from '../utils/base'

const HREF = window.location.href
const PAGE_TYPE1 = HREF.indexOf('type=1')
const PAGE_TYPE2 = HREF.indexOf('type=2')

const down_Btn = PAGE_TYPE1 > 0 ? downBtn1 : PAGE_TYPE2 > 0 ? downBtn2 : downBtn

//容器-原始数据
let sourceAllArrs = []//所有源数据
let sourceParentAllArrs = []//所有父亲
let sourcechildsAllArrs = []//所有Ba


//容器-大于230
let specBig230 = []//大于230的直接丢进来，不再做处理
let specSmall230 = []

//容器-买家
let userBuyOnce = []//客户只下了一个单
let userBuyMore = []//客户只下了多个单
let userOnceIds = []
let userMoreIds = []

//容器-规格容器
let specArrsDatas = {}
const setSpecKey = () => {
    down_Btn.map(item => {
        specArrsDatas[`${item.id}`] = []
    })
}



const firstOrderCode = ''//???记录第一条订单号在表格里
//------------------------

const reset = () => {
    sourceAllArrs = []
    sourcechildsAllArrs = []
    sourceParentAllArrs = []

    specBig230 = []
    specSmall230 = []

    userBuyOnce = []
    userBuyMore = []
    userMoreIds = []
    userOnceIds = []
    specArrsDatas = {}
    setSpecKey()
}
//step1-源数据clone

//-----------step1--挑出父亲Ba数据,容器配置-----------
const getCorrectDataFunc = (arrs) => {
    sourceAllArrs = _cloneDeep(arrs)
    let parent0 = []
    let child0 = []

    arrs.map(item => {
        // 父亲
        const p = JSON.parse(item.parent)

        parent0.push(p)
        //Ba
        item.childs.map(child => {
            child0.push(JSON.parse(child.value))
        })
    })
    const parentApi = getAllOrder(parent0, 'package_list')
    const childApi = getAllOrder(child0, 'orders')

    //防止重复单号，数据去重
    sourceParentAllArrs = _uniqBy(parentApi, 'order_sn')
    sourcechildsAllArrs = _uniqBy(childApi, 'order_sn')

    

}
//父亲数组处理
const splitParentDatasFunc = (arrs) => {
    arrs.map(item => {
        const obj = {
            parcel_price: item.parcel_price,
            order_sn: item.order_sn,
            user_id: item.user_id
        }
        //排序230元
        if (parseFloat(item.parcel_price) > MAX_PRICE) {
            specBig230.push(obj)
        } else {
            specSmall230.push(obj)
        }
        //获取购买的用户
        const res = setBuyer({
            userBuyMore,
            userBuyOnce,
            obj,
            item,
        })
    })

    userOnceIds = setKeys(userBuyOnce, 'user_id')
    userMoreIds = setKeys(userBuyMore, 'user_id')//父亲有重复，不做过滤尼
    // console.log(userBuyMore, '====userBuyMore', userMoreIds)
    // console.log(userBuyOnce, '====userOnceIds', userOnceIds)

}

//补齐用户id
const repairUser_id= (childArr,parentArr)=>{
    const allOrder_sn = []
   childArr.map(item=>{
        allOrder_sn.push(item.order_sn)
        const inx =  _findIndex(parentArr,['order_sn',item.order_sn])
        if(inx!==-1){
            parentArr[inx].user_id =  _get(item,'buyer_user.user_id')
        }
    })
    window['__shop_save_datas']={
        allOrder_sn
    }
    //父亲数据跳去
    splitParentDatasFunc(sourceParentAllArrs)
}

//Ba数据处理
const sortChildDatasFunc = (arrs) => {
    repairUser_id(arrs,sourceParentAllArrs)
    
    const sameBuyerArrs = []
    //剔除230的数据
    arrs.map(item => {
        const is230 = _findIndex(specBig230, ['order_sn', item.order_sn])
        const isBuyMore = _findIndex(userBuyMore, ['order_sn', item.order_sn])
        //过滤230
        if (is230 !== -1) {
            specArrsDatas['spec009'].push(item)
            //过滤已申请取消的单
        } else if (item.status_ext === 16) {
            specArrsDatas['specCancel'].push(item)
            //过滤购买多件的,购买多件同个商家排靠近？？？changeSamneBuyerData
        } else if (isBuyMore !== -1) {
            sameBuyerArrs.push(item)
            // specArrsDatas['spec007'].push(item)
        } else {
            //定义与不定制
            yesDataSort({
                item,
                specArrsDatas
            })
        }
    })
    specArrsDatas['spec007'] = changeSamneBuyerData(userMoreIds, sameBuyerArrs)
    //处理完Ba
    console.log(specArrsDatas, '=======源数据规格转化完成数据')

}

export const startSort = ({ arrs }) => {
    reset()
    //获取父亲Ba数据
    getCorrectDataFunc(arrs)
    //Ba数据归类
    sortChildDatasFunc(sourcechildsAllArrs)
    const res = _cloneDeep(specArrsDatas)
    return res
}



//---------规格归类---------
/** 规格归类
 * 1、排除不满足金额的单（排除）（1表）
 * 2、1件直接归类（1表）
 * 3、多件：（1表）
 *      1-全是同一件：直接规格归类样规格，回到对应规格分类 
 *      2-不同规格
 * 4、同一个客户在当前数据里购买超过1次单独归类，并附个颜色值（1表）
 * 
 */

/** 第一步
 * 1、查出所有单的所有金额不满足直接拎走；
 * 2、分出购买1件和多件的顾客；
 * 3、先查顾客，一个买家一次的走其他条件归类，一个买家多个单的直接归sameBuyer
 * 4、一个买家一次：1件，多件
 */

/** 第二步
 * 数据格式转化
 */