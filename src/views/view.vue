<script setup lang="ts">
import epub, { Book, NavItem, Rendition } from 'epubjs'
import { addBookMark, getBook, getBookMarks, updateLocation } from '../api/bookStore'
import {
  QuestionCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  TagOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons-vue'

import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { result } from 'lodash'

const route = useRoute()
const router = useRouter()
const menu = ref([])
let originToc = null
let book: Book
let rendition: Rendition

// ------------- 通用功能性方法 ---------------------
function goHome(word: string) {
  message.error(word)
  setTimeout(() => {
    router.push('/home')
  }, 1500)
}

function getCfi() {
  return rendition.location.start.cfi
}

// ------------- 通用功能性方法结束 ---------------------

// ------------- 目录相关方法 ---------------------

function tocToMenu(toc: NavItem[]) {
  menu.value = []
  originToc = toc
  function buildTree(toc: NavItem[]) {
    const arr = []
    toc.forEach((item: NavItem) => {
      let children = []
      if (Array.isArray(item.subitems) && item.subitems.length > 0) {
        children = buildTree(item.subitems)
      }

      arr.push({
        title: item.label,
        key: item.id,
        children
      })
    })
    return arr
  }
  menu.value = buildTree(toc)
}

const handleMenuClick = function (e: any) {
  let result = null
  function deepTree(items: NavItem[]) {
    const r = items.find((item: NavItem) => {
      return item.id === e[0]
    })
    if (!r) {
      for (let i = 0; i < items.length; i++) {
        deepTree(items[i].subitems)
      }
    } else {
      result = r
    }
  }
  deepTree(originToc)

  if (result) {
    rendition.display(result.href).then(() => {
      markLocation()
      open.value = false
    })
  }
}

// ------------- 目录相关方法结束 ---------------------

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
          rendition.display(bookResult.location)
          tocToMenu(book.navigation.toc)
        })
      } else {
        goHome(`没有找到图书`)
      }
    })
  }
})

// ------------------- 图书操作方法 -------------------
const nextPage = function () {
  if (!rendition) {
    message.error('没有初始化图书')
  } else {
    rendition.next().then(() => {
      markLocation()
    })
  }
}

const markLocation = function () {
  const cfi = getCfi();
  updateLocation(Number(route.query.id), cfi)
}

const prevPage = function () {
  if (!rendition) {
    message.error('没有初始化图书')
  } else {
    rendition.prev().then(() => {
      markLocation()
    })
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
        <a-float-button @click="openMenu" tooltip="打开目录">
          <template #icon>
            <MenuOutlined />
          </template>
        </a-float-button>
        <a-float-button @click="prevPage" tooltip="上一页">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
        </a-float-button>
        <a-float-button @click="nextPage" tooltip="下一页">
          <template #icon>
            <ArrowRightOutlined />
          </template>
        </a-float-button>
      </a-float-button-group>
    </section>
  </div>

  <a-drawer v-model:open="open" title="目录" placement="left">
    <a-tree :tree-data="menu" @select="handleMenuClick" :defaultExpandAll="true"> </a-tree>
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