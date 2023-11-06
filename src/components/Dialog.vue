<template>
  <div class="absolute bg-gray-500 w-full h-full top-0 left-0 z-50 flex justify-center items-center">
    <div class="bg-white w-4/5 2xl:w-1/3 xl:w-2/5 lg:w-3/5 md:w-2/3 rounded-md px-10 py-10">
      <section>
        <input type="file" id="file" @change="fileChange" />

        <ul>
          <li><label for="">图片: <img :src="info.cover" alt="" /></label></li>
        </ul>

      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import epub from 'epubjs'
import { type BookInfo } from '@/types/booStore';

const info = ref<BookInfo>({});
const fileChange = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = function (e) {
      const fileData = e.target!.result
      if (fileData) {
        const book = epub(fileData, {});
        Promise.all([
          book.coverUrl(),
          book.loaded.metadata
        ]).then(results => {
          if (results[0]) {
            info.value.cover = results[0]
          }
          if (results[1]) {
            const meta = results[1];
            info.value.creator = meta.creator;
            info.value.description = meta.description;
            info.value.identifier = meta.identifier;
            info.value.language = meta.language;
            info.value.modified_date = new Date(meta.modified_date);
            info.value.orientation = meta.orientation;
            info.value.pubdate = new Date(meta.pubdate);
            info.value.publisher = meta.publisher;
            info.value.rights = meta.rights;
            info.value.title = meta.title;
          }
        }).catch(ex => {
          console.error(ex);
          alert("加在图书失败")
        })
      }
    }
    reader.readAsArrayBuffer(file)
  } else {
    alert('Please select a file')
  }
}
</script>