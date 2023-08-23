<script>
import { bitable } from "@base-open/web-api";
import { ref, onMounted } from "vue";
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption, ElTable } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";

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
		const keyFields = ref([]);
		const keyFieldWords = props.keyFieldWords;
		const refreshData = async () => {
			const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
			tableId = selection.tableId;
			viewId = selection.viewId;
			if (tableId) {
				table = await bitable.base.getTableById(tableId);
				viewMetaList.value = await table.getViewMetaList(); // 获取视图元信息列表
				view = await table.getViewById(viewId);
				fieldMetaList.value = await view.getFieldMetaList();
				recordIds.value = await view.getVisibleRecordIdList(); // 记录id列表
			}
		};
		//找到关键字段
		const keepKeyFields = async () => {
			await refreshData();
			keyFields.value = fieldMetaList.value.filter((field) => keyFieldWords.some((str) => field.name.includes(str)));
			console.log(keyFields.value);
			//找到关键字段以外的字段
			const otherFields = fieldMetaList.value.filter((field) => !keyFieldWords.some((str) => field.name.includes(str)));
			console.log(otherFields);
			//删除关键字段以外的字段

			for (const field of otherFields) {
				if (field.isPrimary) continue;
				const res = await table.deleteField(field.id);
				console.log(res); // true
			}
		};
		return {
			keepKeyFields,
			keyFields,
		};
	},
};
</script>

<template>
	<el-button type="primary" plain size="large" @click="keepKeyFields">keepKeyFields</el-button>
	<!-- <el-table :data="keyFields" style="width: 100%">
		<el-table-column prop="id" label="Id" />
		<el-table-column prop="type" label="Type" />
		<el-table-column prop="name" label="Name" />
		<el-table-column prop="property" label="Property" width="180" />
	</el-table> -->
</template>

<style scoped></style>
