<script setup lang="ts">
import epub from 'epubjs'
import { getBook } from '../api/bookStore'

import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
let book = null;

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

                // const firstPage = book.spine.get(0);
                // const result = book.
                const rendition = book.renderTo('bookContent', {
                    stylesheet: "/book.css"
                });
                var displayed = rendition.display();
            }
            else {
                goHome(`没有找到图书`);
            }
        })
    }

})

</script>

<template>
    <div class="bookContent">
        <section class="bookList" id="bookContent">

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