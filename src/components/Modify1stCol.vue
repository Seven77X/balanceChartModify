<script>
import { bitable } from "@base-open/web-api";
import { ref, onMounted } from "vue";
import { ElButton } from "element-plus";
import { isString } from "@vueuse/shared";

export default {
	components: {
		ElButton,
	},
	props: {
		keyFieldWords: Array,
	},
	setup(props) {
		let tableId, table, view, viewId;
		const fieldMetaList = ref([]);
		const viewMetaList = ref([]);
		const recordIds = ref([]);
		const keyFieldWords = props.keyFieldWords;
		const refreshData = async () => {
			const selection = await bitable.base.getSelection();
			tableId = selection.tableId;
			viewId = selection.viewId;
			if (tableId) {
				table = await bitable.base.getTableById(tableId);
				// viewMetaList.value = await table.getViewMetaList(); // 获取视图元信息列表
				view = await table.getViewById(viewId);
				fieldMetaList.value = await view.getFieldMetaList();
				recordIds.value = await view.getVisibleRecordIdList(); // 记录id列表
				// console.log(viewMetaList.value.find(item=>item.id == viewId).name)
				// console.log(fieldMetaList.value)
			}
		};
		const modify1stCol = async () => {
			await refreshData();
			//找到第一列
			const fieldFirstCol = fieldMetaList.value[0];
			console.log(fieldFirstCol);
			//判断第一列是否是keyfield,如果是，复制到新列
			if (keyFieldWords.some((word) => fieldFirstCol.name.includes(word))) {
				console.log("1stCol is keyfield");
				//创建新的列与source列一样
				let fieldCloneId;
				if (fieldMetaList.value.some((field) => field.name.includes(fieldFirstCol.name + "clone"))) {
					console.log("1stColClone is exist");
					fieldCloneId = fieldMetaList.value.find((field) => field.name.includes(fieldFirstCol.name + "clone")).id;
				} else {
					fieldCloneId = await table.addField({
						type: fieldFirstCol.type,
						name: fieldFirstCol.name + "clone",
					});
				}
				//数据复制
				for (let recordId of recordIds.value) {
					const rec = await table.getRecordById(recordId);
					if (rec.fields[fieldFirstCol.id] !== rec.fields[fieldCloneId]) {
						const res = await table.setRecord(recordId, {
							fields: {
								[fieldCloneId]: rec.fields[fieldFirstCol.id],
							},
						});
					}
				}
			}
			//将第一列的字段属性改为text
			await table.setField(fieldFirstCol.id, {
				name: "recordId",
				type: 1,
			});
			//将recordId复制到第一列
			for (const recordId of recordIds.value) {
				const res = await table.setRecord(recordId, {
					fields: {
						[fieldFirstCol.id]: [
							{
								type: "text",
								text: recordId,
							},
						],
					},
				});
				console.log(res);
			}
		};
		return {
			modify1stCol,
		};
	},
};
</script>

<template>
	<el-button type="primary" plain size="large" @click="modify1stCol">modify1stCol</el-button>
</template>

<style scoped></style>
