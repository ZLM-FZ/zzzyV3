<template>
  <div class="main">
    <p class="title">开心快乐飞起~</p>

    <span class="psw">
      <label class="psw-label" for="登录密码">登录密码:</label>
      <el-input placeholder="请输入登录密码" v-model="input" show-password></el-input>
    </span>
    <el-button class="btn" type="primary" @click="login">登录</el-button>
  </div>
</template>

<script>
export default {
  name: 'Lock',
  data: () => {
    return {
      input: '',
      islock: sessionStorage.getItem('isShopLock'),
    }
  },
  methods: {
    login() {
      if (this.input === 'admins6868') {
        this.islock = true
        sessionStorage.setItem('isShopLock', true)
        this.$message({
          message: '登录成功',
          type: 'success',
          showClose: true,
          duration: 1000,
        })
        this.$emit('login', true)
      } else {
        this.$message({
          message: '密码错误',
          type: 'error',
          showClose: true,
          duration: 1000,
        })
      }
    },
  },
}
</script>
<style scoped lang="less">
.main {
  margin-top: 200px;
}
.title {
  font-size: 36px;
  font-weight: bolder;
  margin-bottom: 40px;
}
.psw {
  width: 400px;
  margin: auto;
  margin-bottom: 40px;
  display: flex;
  align-content: center;
  &-label {
    margin-right: 12px;
    line-height: 40px;
    width: 110px;
    text-align: right;
  }
}
.btn {
  width: 200px;
}
</style>
