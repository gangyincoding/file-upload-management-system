<template>
  <div class="home">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">文件管理系统</h1>
        <p class="hero-subtitle">安全、高效的企业文件管理平台</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/login')">
            立即登录
          </el-button>
          <el-button size="large" @click="$router.push('/register')">
            注册账号
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>