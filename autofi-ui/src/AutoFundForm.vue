<template>
  <div class="form">
    <h3>AutoSwap Form</h3>
    
    <div class="form-group">
      <label for="amount">Amount to Fund:</label>
      <div class="amount-input">
        <input type="number" min="0" step="0.01" v-model.number="amountToFund" placeholder="Enter an amount..." />
        <div class="currency-toggle">
          <input type="radio" id="eth" value="eth" v-model="currency" />
          <label for="eth">ETH</label>
          <input type="radio" id="usdc" value="usdc" v-model="currency" />
          <label for="usdc">USDC</label>
        </div>
      </div>
    </div>
    <el-divider></el-divider>
    <el-button
      type="primary"
      class="ml-2 mt-2"
      @click.prevent="submitForm"
      >Add funds</el-button>
  </div>
</template>

<script>
export default {
  name: 'AutoFundForm',

  data() {
    return {
      amountToFund: 0,
      currency: 'eth',
      frequency: 'weekly',
    };
  },

  methods: {
    toggleCurrency() {
      this.currency = this.currency === 'eth' ? 'usdc' : 'eth';
    },

    submitForm() {
      // Emit the submit event with the form data
      this.$emit('submit', {
        amountToFund: this.amountToFund,
        currency: this.currency,
        frequency: this.frequency,
      });
    },
  },
};
</script>

<style scoped>
/* Styles for the form go here */
</style>
