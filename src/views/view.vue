<script setup lang="ts">
import epub, { Book, NavItem, Rendition } from 'epubjs'
import { getBook } from '../api/bookStore'
import {
  QuestionCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'

import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const menu = ref([])
let book: Book
let rendition: Rendition

// ------------- 通用功能性方法 ---------------------
function goHome(word: string) {
  message.error(word)
  setTimeout(() => {
    router.push('/home')
  }, 1500)
}
// ------------- 通用功能性方法结束 ---------------------

function tocToMenu(toc: NavItem[]) {
  menu.value = []
  function buildTree(toc: NavItem[]) {
    const arr = [];
    toc.forEach((item: NavItem) => {
      let children = []
      if (Array.isArray(item.subitems) && item.subitems.length > 0) {
        children = buildTree(item.subitems);
      }

      arr.push({
        title: item.label,
        key: item.id,
        children
      })
    })
    return arr;
  }
  menu.value = buildTree(toc)
}

onMounted(() => {
  const id = route.query.id
  if (!id) {
    goHome(`参数错误，请检查链接`)
  } else {
    getBook(Number(id)).then((res: any) => {
      if (res.status === 200) {
        const bookResult = res.data
        book = epub(bookResult.content)

        rendition = book.renderTo('bookContent', {
          width: `100%`,
          stylesheet: '/book.css'
        })
        book.ready.then(() => {
          rendition.display()
          tocToMenu(book.navigation.toc)
        })
      } else {
        goHome(`没有找到图书`)
      }
    })
  }
})

//获取当前页数
//获取总共页数
//初始化目录并且显示
//利用indexDB存储图书读取进度
//当前页数和总共页数是否是动态的？
//是否允许划线

// ------------------- 图书操作方法 -------------------
const nextPage = function () {
  if (!rendition) {
    message.error('没有初始化图书')
  } else {
    rendition.next().then(() => {
      // book.locations.currentLocation;
      // var currentLocation = book.locations.current();
      // console.log("当前位置:", currentLocation);
      // book.on("renderer:locationChanged", function (location) {
      //     console.log("位置已改变:", location);
      // });
      // book.goto(targetLocation);
    })
  }
}

const prevPage = function () {
  if (!rendition) {
    message.error('没有初始化图书')
  } else {
    rendition.prev()
  }
}

//目录
const open = ref(false)
const openMenu = function () {
  open.value = !open.value
}
// ------------------- 图书操作方法结束 -------------------
</script>

<template>
  <div class="bookContent">
    <section class="bookList" id="bookContent">
      <a-float-button-group shape="circle" :style="{ right: '24px' }">
        <a-float-button @click="openMenu">
          <template #icon>
            <MenuOutlined />
          </template>
        </a-float-button>
        <a-float-button @click="prevPage">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
        </a-float-button>
        <a-float-button @click="nextPage">
          <template #icon>
            <ArrowRightOutlined />
          </template>
        </a-float-button>
      </a-float-button-group>
    </section>
  </div>

  <a-drawer v-model:open="open" title="目录" placement="left">
    <a-tree :tree-data="menu" :defaultExpandAll="true"> </a-tree>
  </a-drawer>
</template>

<style scoped>
.bookContent {
  width: 100%;
}

.bookContent .bookList {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  background-color: white;
}

.epub-view body {
  font-size: 40px;
}
</style>