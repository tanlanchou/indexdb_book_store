<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getBooks, deleteBook } from '@/api/bookStore';
import { message } from 'ant-design-vue';
import { type IResult } from '../types/booStore';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';


const router = useRouter();
const toAdd = function () {
  router.push('/add');
}

const books = ref<any>([]);

function getBookList() {
  getBooks().then((result: IResult) => {
    if (result.status === 200) {
      books.value = result.data;
    }
    else {
      message.error(`获取数据错误, ${result.message}`);
    }
  }).catch(ex => {
    message.error(`获取数据错误, ${ex.message}`);
  })
}

onMounted(() => {
  getBookList();
})

/* card action */
const viewDetail = function (item: any) {
  router.push(`/detail?id=${item.id}`);
}

import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import { Modal } from 'ant-design-vue';
const deleteBookAction = function (item: any) {
  Modal.confirm({
    title: `确定删除,${item.title}`,
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除之后无法恢复,请谨慎！',
    onOk() {
      return deleteBook(item.id).then(res => {
        message.success("删除图书成功");
        getBookList();
      }).catch(ex => {
        console.error(ex);
        message.error("删除图书失败，请稍后再试");
      })
    },
    onCancel() { },
  });
}

</script>

<template>
  <a-page-header class="header" title="图书室" sub-title="列表">
    <template #extra>
      <a-button key="3" type="primary" @click="toAdd">添加图书</a-button>
    </template>
  </a-page-header>
  <main>
    <Flex wrap="wrap">
      <a-card class="bookCard" hoverable v-for="(item, index) in books" :key="index">
        <template #cover>
          <img :alt="item.title" :src="item.cover" />
        </template>
        <template #actions>
          <eye-outlined key="view" style="color: blue" @click="viewDetail(item)" />
          <delete-outlined key="delete" style="color: red" @click="deleteBookAction(item)" alt="删除图书" />
        </template>
        <a-card-meta :title="item.title" :description="item.description">
        </a-card-meta>
      </a-card>
    </Flex>
  </main>
</template>

<style scoped>
.bookCard {
  border: 1px solid gary;
  width: 300px;
  display: inline-block;
  margin: 20px
}
</style>

