<template>
  <div class="form">
    <h3>AutoSwap Form</h3>

    <div class="form-group">
      <label for="amount">Total budget</label>
      <div class="amount-input">
        <input type="number" min="0" step="0.01" v-model.number="amountToSwap" placeholder="Enter an amount..." />
        <span class="currency-toggle">
          <input type="radio" id="eth" value="eth" v-model="currency" />
          <label for="eth">ETH</label>
          <input type="radio" id="usdc" value="usdc" v-model="currency" />
          <label for="usdc">USDC</label>
        </span>
      </div>
    </div>

    <el-divider></el-divider>

    <div class="form-group">
      <label>Frequency of Swaps:</label>
      <div class="radio-group">
        <label> <input type="radio" value="5seconds" v-model="frequency" /> 5 seconds (testing) </label>
        <label> <input type="radio" value="daily" v-model="frequency" /> Daily </label>
        <label> <input type="radio" value="weekly" v-model="frequency" /> Weekly </label>
        <label> <input type="radio" value="monthly" v-model="frequency" /> Monthly </label>
      </div>
    </div>

    <el-divider></el-divider>

    <label for="amount">Amount per Swap</label>
    <div>
      <input v-model.number="amountPerTransaction" type="number" min="0" step="0.01" id="transaction-amount" />
    </div>


    <p>You can expect to make {{ numberOfTransactions }} swaps.</p>
    <el-divider></el-divider>
    <el-button
      type="primary"
      class="ml-2 mt-2"
      @click.prevent="submitForm"
      >Add AutoSwap</el-button>
  </div>
</template>

<script>
export default {
  name: 'AutoSwapForm',

  data() {
    return {
      amountToSwap: 0,
      currency: 'eth',
      frequency: 'weekly',
      amountPerTransaction: 0
    }
  },

  computed: {
    numberOfTransactions() {
      if (
        this.amountToSwap > 0 &&
        this.amountPerTransaction > 0 &&
        this.amountPerTransaction <= this.amountToSwap
      ) {
        return Math.ceil(this.amountToSwap / this.amountPerTransaction)
      } else {
        return 'N/A'
      }
    }
  },

  methods: {
    toggleCurrency() {
      this.currency = this.currency === 'eth' ? 'usdc' : 'eth'
    },

    submitForm() {
      // Emit the submit event with the form data
      this.$emit('submit', {
        amountToSwap: this.amountToSwap,
        currency: this.currency,
        frequency: this.frequency,
        numberOfTransactions: this.numberOfTransactions,
        amountPerTransaction: this.amountPerTransaction
      })
    }
  }
}
</script>

<style scoped>
/* Styles for the form go here */
</style>
