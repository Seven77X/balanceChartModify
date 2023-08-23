<script setup>
import KeyFields from "./components/KeyFields.vue";
import Modify1stCol from "./components/Modify1stCol.vue";
import Test from "./components/Test.vue";
import ModifyTradeDate from "./components/ModifyTradeDate.vue";
import GetRecord from "./components/GetRecord.vue";
import CheckBalance from "./components/CheckBalance.vue";

const keyFieldWords = ["交易日期", "交易金额", "recordId", "余额", "账户名称", "交易时间", "支取", "收入", "贷方金额", "借方金额", "对方户名", "摘要", "备注"];
</script>

<template>
	<main>
		<GetRecord />
		<Test :keyFieldWords="keyFieldWords" />
		<ModifyTradeDate />
		<Modify1stCol :keyFieldWords="keyFieldWords" />
		<CheckBalance />
		<KeyFields :keyFieldWords="keyFieldWords" />
	</main>
</template>

<style scoped>
main {
	padding: 1rem;
}
h4 {
	font-size: calc(1.275rem + 0.3vw);
	margin-bottom: 1rem;
}
code {
	font-size: 0.875em;
	color: #d63384;
	word-wrap: break-word;
}
</style>
