<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();
const toAdd = function () {
  router.push('/add');
}

onMounted(() => {
  
})

</script>

<template>
  <a-page-header class="header" title="图书室" sub-title="列表">
    <template #extra>
      <a-button key="3" type="primary" @click="toAdd">添加图书</a-button>
    </template>
  </a-page-header>
  <main>
    <a-card hoverable style="width: 240px">
      <template #cover>
        <img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
      </template>
      <a-card-meta title="Europe Street beat">
        <template #description>www.instagram.com</template>
      </a-card-meta>
    </a-card>
  </main>
</template>
