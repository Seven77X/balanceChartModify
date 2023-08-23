<script>
import { bitable } from "@base-open/web-api";
import { ref, onMounted } from "vue";
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption, ElTable } from "element-plus";
import { deepclone } from "../commonFX";

export default {
	components: {
		ElButton,
		ElForm,
		ElFormItem,
		ElSelect,
		ElOption,
		ElTable,
	},
	props: {
		keyFieldWords: Array,
	},
	setup(props) {
		let tableId, table, view, viewId;
		const tableMetaList = ref([]);
		const fieldMetaList = ref([]);
		const viewMetaList = ref([]);
		const recordIds = ref([]);
		const keyFieldWords = props.keyFieldWords;
		const refreshData = async () => {
			const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
			tableId = selection.tableId;
			viewId = selection.viewId;
			if (tableId) {
				table = await bitable.base.getTableById(tableId);
				viewMetaList.value = await table.getViewMetaList();
				view = await table.getViewById(viewId);
				fieldMetaList.value = await view.getFieldMetaList();
				recordIds.value = await view.getVisibleRecordIdList();
			}
		};
		const test = async () => {
			await refreshData();
			console.log(fieldMetaList.value);
			console.log(keyFieldWords);
		};

		return {
			test,
		};
	},
};
</script>

<template>
	<el-button type="primary" plain size="large" @click="test">test</el-button>
</template>

<style scoped></style>
