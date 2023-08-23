<script>
import { bitable } from "@base-open/web-api";
import { ref, onMounted } from "vue";
import { ElButton } from "element-plus";

export default {
	components: {
		ElButton,
	},
	setup() {
		let tableId, table, view, viewId;
		const fieldMetaList = ref([]);
		const viewMetaList = ref([]);
		const recordIds = ref([]);
		const resCheckBalance = ref([]);
		const doneCheckBalance = ref(false);
		const refreshData = async () => {
			doneCheckBalance.value = false;
			resCheckBalance.value = [];
			const selection = await bitable.base.getSelection();
			tableId = selection.tableId;
			viewId = selection.viewId;
			if (tableId) {
				table = await bitable.base.getTableById(tableId);
				// viewMetaList.value = await table.getViewMetaList(); // 获取视图元信息列表
				view = await table.getViewById(viewId);
				fieldMetaList.value = await view.getFieldMetaList();
				recordIds.value = await view.getVisibleRecordIdList(); // 记录id列表
			}
		};
		const checkBalance = async () => {
			await refreshData();
			//找到“余额”
			const fieldBalance = fieldMetaList.value.find((field) => ["余额"].some((sub) => field.name.includes(sub)));
			console.log(fieldBalance);
			//set余额field
			await table.setField(fieldBalance.id, {
				name: "余额",
				type: 2,
			});
			await table.setField(fieldBalance.id, {
				property: {
					formatter: "0.00",
				},
			});
			//找到“交易金额”
			let fieldTradeAmount = fieldMetaList.value.find((field) => ["交易金额"].some((sub) => field.name.includes(sub)));
			console.log(fieldTradeAmount);
			if (fieldTradeAmount) {
				await table.setField(fieldTradeAmount.id, {
					name: "交易金额",
					type: 2,
				});
				await table.setField(fieldTradeAmount.id, {
					property: {
						formatter: "0.00",
					},
				});
			} else {
				//找到["借方金额","支取"]
				const fieldWithdrawAmount = fieldMetaList.value.find((field) => ["借方金额", "支取", "支出"].some((sub) => field.name.includes(sub)));
				console.log(fieldWithdrawAmount);
				await table.setField(fieldWithdrawAmount.id, {
					type: 2,
					name: "支出",
				});
				//找到["贷方金额","收入"]
				const fieldDebitAmount = fieldMetaList.value.find((field) => ["贷方金额", "收入"].some((sub) => field.name.includes(sub)));
				console.log(fieldDebitAmount);
				await table.setField(fieldDebitAmount.id, {
					type: 2,
					name: "收入",
				});
				//新建fieldTradeAmount
				fieldTradeAmount = {};
				fieldTradeAmount.id = await table.addField({
					// 新增一列多行文本类型的字段
					type: 2,
					name: "交易金额",
				});
				await table.setField(fieldTradeAmount.id, {
					property: {
						formatter: "0.00",
					},
				});
				//将借方和贷方金额填入交易金额
				for (let recordId of recordIds.value) {
					console.log(recordId);
					let valTradeAmount;
					const rec = await table.getRecordById(recordId);
					//
					console.log(rec);
					console.log(fieldWithdrawAmount.id, fieldDebitAmount.id);
					if (rec.fields[fieldWithdrawAmount.id] && !rec.fields[fieldDebitAmount.id]) {
						valTradeAmount = -rec.fields[fieldWithdrawAmount.id];
					} else if (!rec.fields[fieldWithdrawAmount.id] && rec.fields[fieldDebitAmount.id]) {
						valTradeAmount = rec.fields[fieldDebitAmount.id];
					}
					console.log(valTradeAmount);
					const res = await table.setRecord(recordId, {
						fields: {
							[fieldTradeAmount.id]: valTradeAmount,
						},
					});
					console.log(res);
				}
			}
			console.log(fieldTradeAmount, fieldBalance);
			for (let i = 1; i < recordIds.value.length; i++) {
				const rec = await table.getRecordById(recordIds.value[i]);
				const recf = await table.getRecordById(recordIds.value[i - 1]);
				let recBalance = rec.fields[fieldBalance.id],
					recfBalance = recf.fields[fieldBalance.id],
					recTradeAmount = rec.fields[fieldTradeAmount.id];
				if (!recBalance && recBalance !== 0) {
					recBalance = recfBalance + recTradeAmount;
					const res = await table.setRecord(recordIds.value[i], {
						fields: {
							[fieldBalance.id]: recBalance,
						},
					});
					console.log(res, recBalance);
				}
				if (Math.round(recBalance * 100) !== Math.round(recfBalance * 100) + Math.round(recTradeAmount * 100)) {
					// console.error("error")
					resCheckBalance.value.push(i);
				}
			}
			doneCheckBalance.value = true;
		};
		return {
			checkBalance,
			doneCheckBalance,
			resCheckBalance,
		};
	},
};
</script>

<template>
	<el-button type="primary" plain size="large" @click="checkBalance">checkBalance</el-button>
	<template v-if="doneCheckBalance">
		<template v-if="resCheckBalance.length == 0">
			<div>all checked!</div>
		</template>
		<template v-else>
			<ul>
				<li v-for="(value, index) in resCheckBalance" :key="index">第{{ value + 1 }}行的余额错误！！！</li>
			</ul>
		</template>
	</template>
</template>

<style scoped></style>
