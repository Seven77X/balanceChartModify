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
	setup() {
		let tableId, table, view, viewId;
		const tableMetaList = ref([]);
		const fieldMetaList = ref([]);
		const viewMetaList = ref([]);
		const recordIds = ref([]);
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
		const convertToTimestamp = (str) => {
			if (typeof str !== "string") {
				str = String(str);
			}
			// 使用正则表达式提取年、月、日
			const match = str.match(/^(\d{4})(\d{2})(\d{2})/);
			if (!match) {
				throw new Error("Invalid format");
			}
			const year = match[1];
			const month = match[2];
			const day = match[3];
			// 创建日期对象
			const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
			// 返回 Unix 时间戳
			return Math.floor(date.getTime());
		};
		const isObject = (value) => {
			return value && typeof value === "object" && value.constructor === Object;
		};
		const modifyTradeDate = async () => {
			await refreshData();
			//找到交易日期的fieldId
			let fieldTradeDate;
			if (fieldMetaList.value.some((field) => field.name.includes("交易日")))
				fieldTradeDate = fieldMetaList.value.find((field) => field.name.includes("交易日"));
			else if (fieldMetaList.value.some((field) => field.name.includes("交易时间")))
				fieldTradeDate = fieldMetaList.value.find((field) => field.name.includes("交易时间"));
			else console.log("没有找到交易日期");
			console.log(fieldTradeDate);

			//将所有record存储到一个数组
			const records = [];
			for (const recordId of recordIds.value) {
				const rec = await table.getRecordById(recordId);
				records.push(rec);
			}
			console.log(records);

			//将交易日字段改为date类型
			await table.setField(fieldTradeDate.id, { type: 5, name: "交易日期", property: { dateFormat: "yyyy/MM/dd" } });
			//将records中的tradedate转换为时间戳后填入交易日字段
			for (let i = 0; i < records.length; i++) {
				const rec = records[i];
				console.log(rec);
				let dateStr = rec.fields[fieldTradeDate.id];
				console.log(dateStr);
				do {
					if (Array.isArray(dateStr)) dateStr = dateStr[0];
					else if (isObject(dateStr)) dateStr = dateStr.text;
				} while (!(typeof dateStr === "string" || dateStr instanceof String));
				console.log(dateStr);
				const timestamp = convertToTimestamp(dateStr);
				console.log(timestamp);
				const res = await table.setRecord(recordIds.value[i], { fields: { [fieldTradeDate.id]: timestamp } });
				console.log(res);
			}
		};

		return {
			modifyTradeDate,
		};
	},
};
</script>

<template>
	<el-button type="primary" plain size="large" @click="modifyTradeDate">modifyTradeDate</el-button>
</template>

<style scoped></style>
