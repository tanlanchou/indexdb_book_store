<template>
  <div
    class="absolute bg-gray-500 w-full h-full top-0 left-0 z-50 flex justify-center items-center"
  >
    <div class="bg-white w-4/5 2xl:w-1/3 xl:w-1/3 lg:w-1/2 md:w-2/3 rounded-md px-10 py-10">
      <section>
        <label for="file">Upload Book:</label>
        <input type="file" :ref="bookFile" id="file" @change="fileChange" />

        <img :src="curCover" alt="" />
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import epub from 'epubjs'
const bookFile = ref<File>()
const curCover = ref<string>('')
const fileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = function (e) {
      const fileData = e.target.result
      const book = epub(fileData, {})
      book.loaded.metadata.then(function (meta) {
        debugger
        console.log(meta)
      })

      book.loaded.cover.then(function (cover) {
        if (!!cover) {
          curCover.value = cover
        }
        debugger
        console.log(cover)
      })
    }
    reader.readAsArrayBuffer(file)
  } else {
    alert('Please select a file')
  }
}
</script>