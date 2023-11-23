<script setup lang="ts">
import epub, { Book, Rendition } from 'epubjs'
import { getBook } from '../api/bookStore'
import { QuestionCircleOutlined, ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';

import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
let book: Book;
let rendition: Rendition;

function goHome(word: string) {
    message.error(word);
    setTimeout(() => {
        router.push('/home');
    }, 1500);
}

onMounted(() => {
    const id = route.query.id;
    if (!id) {
        goHome(`参数错误，请检查链接`);
    }
    else {
        getBook(Number(id)).then((res: any) => {
            if (res.status === 200) {
                const bookResult = res.data;
                book = epub(bookResult.content);

                book.ready.then(() => {
                    rendition = book.renderTo('bookContent', {
                        width: `100%`,
                        stylesheet: "/book.css"
                    });
                    rendition.display();
                });

            }
            else {
                goHome(`没有找到图书`);
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

const nextPage = function () {
    if (!rendition) {
        message.error("没有初始化图书");
    }
    else {
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
        message.error("没有初始化图书");
    }
    else {
        rendition.prev();
    }
}
</script>

<template>
    <div class="bookContent">
        <section class="bookList" id="bookContent">
            <a-float-button-group shape="circle" :style="{ right: '24px' }">
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