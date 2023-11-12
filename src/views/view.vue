<script setup lang="ts">
import epub from 'epubjs'
import { getBook } from '../api/bookStore'

import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();

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
        getBook(id).then((res: any) => {
            if (res.status === 200) {
                const bookResult = res.data;
                const book = epub(bookResult.content);
                const rendition = book.renderTo('bookContent',{width: 600, height: 400});
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
    <div>
        <section id="bookContent"></section>
    </div>
</template>