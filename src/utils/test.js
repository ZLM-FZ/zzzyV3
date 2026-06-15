

const size = ['S', 'M', 'L', 'XL', 'XXL', '16', '18', '20']
const sizes = [
  {
    size: 'XL=GG',
    num: 8,
  },
  {
    size: 'M=M',
    num: 1,
  },
  {
    size: 'XXL=GGG',
    num: 3,
  },

  {
    size: '12',
    num: 2,
  },
  {
    size: '20',
    num: 2,
  },
  {
    size: '',
    num: 3,
  },
  {
    size: 'S=P',
    num: 2,
  },
  {
    size: 'L=G',
    num: 1,
  },
  {
    size: '18',
    num: 2,
  },
]
const fen = (str) => {
  if (!str) return '均码'
  let arr = []
  const i = str.indexOf('=')
  const j = str.indexOf('（')

  if (i !== -1) {
    arr = str.split('=')
  } else if (j !== -1) {
    arr = str.split('（')
  } else {
    arr = str.split()
  }
  return arr[0]
}
let res = []
size.map((s0) => {
  sizes.map((item, i) => {
    const i_s = fen(item.size)
    if (i_s === s0) {
      res.push(item)
      sizes.splice(i, 1)
    }
    // item.s_n = fen(item.size) + item.num
    // const str = item.size
    // const j = str.indexOf(s0)
    // if (j !== -1) {
    //   res.push(item)
    //   sizes.splice(i, 1)
    // }
  })
})
res = res.concat(sizes)
console.log(res, '----------------', sizes)
//号码尺寸排序


