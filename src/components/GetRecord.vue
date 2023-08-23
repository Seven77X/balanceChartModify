<script>
  import { bitable } from '@base-open/web-api';
  import { ref, onMounted } from 'vue';
  import {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElTable,
  } from 'element-plus';

  export default {
    components: {
      ElButton,
      ElForm,
      ElFormItem,
      ElSelect,
      ElOption,
      ElTable,
    },
    setup() {
      let tableId,table,view,viewId;
      const recordIds = ref([])
      const input = ref('')
      const refreshData = async ()=>{
        const selection = await bitable.base.getSelection();
        tableId = selection.tableId;
        viewId = selection.viewId;
        if (tableId) {
          table = await bitable.base.getTableById(tableId);
          view = await table.getViewById(viewId); 
          recordIds.value = await view.getVisibleRecordIdList(); // 记录id列表 
          // recordIds.value = await table.getRecordIdList();
        }
      };
      const getRecord = async ()=>{
        await refreshData()
        // console.log(recordIds.value)
        const i = parseInt(input.value)
        const recordId = recordIds.value[i]
        console.log(i,recordId)
        const rec = await table.getRecordById(recordId);
        console.log(rec)
      }

      return {
        getRecord,
        input,
      };
    },
  };
</script>

<template>
  <el-button type="primary" plain size="large" @click="getRecord">getRecord</el-button>
  <el-input v-model="input" placeholder="recordId" />
</template>

<style scoped>
</style>
