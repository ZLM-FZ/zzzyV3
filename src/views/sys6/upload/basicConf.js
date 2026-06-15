
import { findIndex as _findIndex } from "lodash";

const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base"));
const _patchOpts =  __win_data?.patch;

//去掉号码的等号啊括号啊那些多余的东西
export const _removeSizeSymbol = (str) => {
  if (!str) return "";
  let arr = [];
  const o = str.indexOf(":");
  const o1 = str.indexOf("：");
  const i = str.indexOf("=");
  const j = str.indexOf("（");
  const k = str.indexOf("(");

  if (o !== -1) {
    arr = str.split(":");
  }else if (o1 !== -1) {
    arr = str.split("：");
  }else if (i !== -1) {
    arr = str.split("=");
  } else if (j !== -1) {
    arr = str.split("（");
  } else if (k !== -1) {
    arr = str.split("(");
  } else {
    arr = str.split();
  }
  return arr[1];
};

//设置随机颜色值
export const _setColor = () => {
  const res =
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padEnd(6, "0");
  return res;
};


// 分切产品规格的数据
export const _splitChangPingGuiGeOld = (str)=> {
    str = str.replaceAll('Other(Add In The Instruction)','With name and number')
    str = str.replaceAll('Custom ltems','Custom Items')
    str = str.replaceAll('Custom name and number','Custom Items')
    const keywords = ['Size', 'Specification', 'CUSTOM PATCH', 'PATCH', 'Custom Patch', 'Patch', 'MODEL', 'Custom Items', 'Instruction', 'Name and Number'];
    const positions = [];
    const resultObj = {};
    // 把关键字转换为驼峰命名
    const camelCaseKeywords = keywords.map(keyword => {
        return keyword
           .toLowerCase()
           .split(' ')
           .map((word, index) => {
                return index === 0? word : word.charAt(0).toUpperCase() + word.slice(1);
            })
           .join('');
    });

    // 初始化结果对象，将所有驼峰命名的关键字作为属性添加，值初始化为空字符串
    camelCaseKeywords.forEach(keyword => {
        resultObj[keyword] = '';
    });

    // 记录各个关键字的位置
    keywords.forEach((keyword, index) => {
        const keywordIndex = str.indexOf(keyword);
        if (keywordIndex!== -1) {
            positions.push({ keyword: camelCaseKeywords[index], index: keywordIndex });
        }
    });

    // 按位置排序
    positions.sort((a, b) => a.index - b.index);

    for (let i = 0; i < positions.length; i++) {
        const current = positions[i];
        const nextIndex = (i + 1 < positions.length)? positions[i + 1].index : str.length;
        let value = str.slice(current.index + keywords[camelCaseKeywords.indexOf(current.keyword)].length, nextIndex).trim();
        // 去掉冒号
        value = value.replace(':', '');
        resultObj[current.keyword] = value;
    }
    
    return resultObj;

}
//Size-尺寸， Specification-套装， CUSTOM PATCH-补丁， MODEL-袜子(值就是尺寸)，Custom Items-定制，Instruction-备注
export const _splitChangPingGuiGe = (str) => {
  // 1. 规范字符串
  str = str.replaceAll('Other(Add In The Instruction)', 'With name and number');
  str = str.replaceAll('Custom ltems', 'Custom Items');
  str = str.replaceAll('Custom name and number', 'Custom Items');

  // 🔥 新增：剥离价格后缀块，如 |$5.00_mimikyu_price_Custom Items:5.00
  // 格式: |$数字_mimikyu_price_字段名:数值
  str = str.replace(/\|\$\d+\.\d+_mimikyu_price_[^:]+:\d+\.\d+/g, '');

  const keywords = [
    'Size',
    'Specification',
    'CUSTOM PATCH',
    'PATCH',
    'Custom Patch',
    'Patch',
    'MODEL',
    'Custom Items',
    'Instruction',
    'Name and Number',
    'Players' // 🔥 新增：支持 Players 字段
  ];

  const resultObj = {};
  const keywordToCamel = {};

  // 2. 把关键字转成驼峰，并将所有 Patch 字段统一成 customPatch
  keywords.forEach((keyword) => {
    let camel = keyword
      .toLowerCase()
      .split(' ')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');

    // 🔥 所有 PATCH 都归到 customPatch 字段
    if (/patch/i.test(keyword)) {
      camel = 'customPatch';
    }

    keywordToCamel[keyword] = camel;

    // 初始化结果对象
    if (!(camel in resultObj)) {
      resultObj[camel] = '';
    }
  });

  // 3. 构造匹配 “关键字 + 冒号” 的正则（处理无空格的情况如 Size:26CUSTOM PATCH:No）
  const escapedKeywords = keywords.map(k =>
    k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`(${escapedKeywords.join('|')})\\s*:`, 'g');

  // 4. 找出所有匹配位置
  const matches = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    matches.push({
      keyword: m[1],
      start: m.index,
      valueStart: regex.lastIndex
    });
  }

  // 5. 切片值填入对象
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const end = next ? next.start : str.length;

    let value = str.slice(current.valueStart, end).trim();
    if (value.startsWith(':')) value = value.slice(1).trim();

    const camelKey = keywordToCamel[current.keyword];

    // 🔥 新增：Custom Patch 多值逗号分隔，转为换行分隔
    if (camelKey === 'customPatch' && value.includes(',')) {
      // 过滤掉空值（如 "NO," 这种情况），保留有效补丁名
      const patches = value.split(',').map(p => p.trim()).filter(p => p && p.toUpperCase() !== 'NO');
      value = patches.join('\n');
    }

    resultObj[camelKey] = value;
  }

  return resultObj;

}


// 配置中文的补丁
export const _setCnPatch = (str)=>{
  if(!str || str ==='NO' || str ==='No' || str ==='no') return ''
  // 🔥 新增：支持多值补丁（换行符分隔），分别转换后用换行符连接
  if (str.includes('\n')) {
    const patches = str.split('\n').map(p => _convertSinglePatch(p.trim()));
    return patches.join('\n');
  }
  return _convertSinglePatch(str);
}

// 单个补丁转换
const _convertSinglePatch = (str) => {
  if (!str) return '';
  const inx = _findIndex(_patchOpts, ['value', str]);
  if (inx === -1) {
    return str; // 找不到则返回原始值
  }
  if (__win_data.isPathUseEN) {
    return str;
  }
  return _patchOpts[inx].label;
}

// 配置中文的套装
export const _setCnSpecification = (str)=>{
  if(str === 'Suit' || str === 'suit'){
    return '套装'
  }
  if(str === 'Jacket' || str === 'jacket'){
    return '上衣'
  }
  if(str === 'Shorts' || str === 'shorts'){
    return '裤子'
  }
  return str
}

// 配置中文的袜子
export const _setCnModel = (str)=>{
  if(str === 'Adult' || str === 'adult'){
    return '大人'
  }
  if(str === 'Kids' || str === 'kids'){
    return '小孩'
  }
  return str
}

// 图片转成base64
export const _fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  });
};
async function getImageBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}