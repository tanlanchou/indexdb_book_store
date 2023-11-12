<script setup lang="ts">
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import cloneDeep from "lodash/cloneDeep"
import { getImageDataByUrl } from '../common/img';

const router = useRouter();
const toList = function () {
    router.push('/');
}

import { ref } from 'vue'
import epub from 'epubjs'
import { type BookInfo } from '../types/booStore';
import { addBook, existBook } from '../api/bookStore'
import { keyToWords } from '@/common/words';

const spinning = ref(false);
const info = ref<BookInfo>({});
const enableAdd = ref(true);

const fileChange = (file: any) => {
    if (file) {
        spinning.value = true;
        enableAdd.value = true;
        const reader = new FileReader()
        reader.onload = async function (e) {
            const fileData: ArrayBuffer = e.target!.result as ArrayBuffer;
            if (fileData) {
                try {
                    const book = epub(fileData, {});
                    const blobCover = await book.coverUrl();
                    info.value.cover = blobCover || undefined;
                    if (blobCover) {
                        const base64Cover = await getImageDataByUrl(blobCover);
                        info.value.cover = base64Cover.data;
                    }

                    const meta = await book.loaded.metadata;
                    info.value.title = meta.title;
                    info.value.creator = meta.creator;
                    info.value.publisher = meta.publisher;
                    info.value.description = meta.description;
                    info.value.identifier = meta.identifier;
                    info.value.language = meta.language;
                    if (meta.modified_date)
                        info.value.modified_date = new Date(meta.modified_date);
                    info.value.orientation = meta.orientation;
                    if (meta.pubdate)
                        info.value.pubdate = new Date(meta.pubdate);
                    info.value.rights = meta.rights;
                    info.value.content = fileData;
                    const existResult = await existBook(info.value.title);
                    if (existResult.data === true) {
                        message.error("已存在相同图书，请重新上传其他图书");
                        setTimeout(() => {
                            clear();
                        }, 1500);
                    }
                    else {
                        enableAdd.value = false;
                    }
                }
                catch (ex: any) {
                    console.error(ex);
                    message.error("加在图书失败");
                }
            }
            else {
                message.error("获取图书失败，请确认文件是否完整");
            }

            spinning.value = false
        }

        reader.onerror = function () {
            message.error("读取图书失败");
            spinning.value = false;
        }

        reader.onabort = function () {
            message.error("读取图书被中断");
            spinning.value = false;
        }

        reader.readAsArrayBuffer(file)
    } else {
        message.error('Please select a file')
    }
    return false;
}

const removeFile = function () {
    info.value = {};
    return true;
}

const save = function () {
    if (!info.value.content) {
        message.error(`没有获取到内容`);
        return;
    }

    if (!info.value.title) {
        message.error(`没有获取到标题`);
        return;
    }

    addBook(cloneDeep(info.value)).then(res => {
        if (res.status === 200) {
            message.success("添加图书成功，正在为您跳转");
            setTimeout(() => {
                router.push('/');
            }, 1500);
        }
        else {
            message.error(res.message || "存入数据库出错");
        }
    })
}

const clear = function () {
    info.value = {};
}
</script>

<template>
    <a-page-header class="header" title="图书室" sub-title="新增图书" @back="toList">
        <template #extra>
            <a-button key="3" type="primary" :disabled="enableAdd" @click="save">保存图书</a-button>
        </template>
    </a-page-header>

    <main class="main">
        <section class="content">
            <a-spin :spinning="spinning">
                <a-card title="上传图书">
                    <a-upload :before-upload="fileChange" :max-count="1" @remove="removeFile">
                        <a-button>
                            <upload-outlined></upload-outlined>
                            选择文件
                        </a-button>
                    </a-upload>
                </a-card>
            </a-spin>

            <a-card v-if="!!info.title">
                <a-descriptions :title="info.title" bordered>
                    <a-descriptions-item :span="3" label="封面">
                        <a-image :src="info.cover" />
                    </a-descriptions-item>
                    <template v-for="(value, key) in info" :key="key">
                        <a-descriptions-item :span="3" v-if="!!value && key !== 'cover' && key !== 'content'" :label="keyToWords(key)">
                            {{ value }}
                        </a-descriptions-item>
                    </template>
                </a-descriptions>
            </a-card>
        </section>
    </main>
</template>
