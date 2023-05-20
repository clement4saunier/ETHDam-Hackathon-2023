<template>
  <div class="wrapper">
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->
    <h1>Autofi</h1>

    <button v-if="!account" @click="connectWallet">Connect your wallet</button>

    <form v-else @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <label for="amount">Amount to Fund:</label>
        <input v-model.number="form.amountToFund" type="number" min="0" step="0.01" id="amount" />
        <button @click.prevent="toggleCurrency" class="toggle-btn">{{form.currency}}</button>
      </div>

      <div class="form-group">
        <label>Frequency of Transactions:</label>
        <div class="radio-group">
          <label>
            <input type="radio" value="Daily" v-model="form.frequency" /> Daily
          </label>
          <label>
            <input type="radio" value="Weekly" v-model="form.frequency" /> Weekly
          </label>
          <label>
            <input type="radio" value="Monthly" v-model="form.frequency" /> Monthly
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="transaction-amount">Amount per Transaction:</label>
        <input v-model.number="form.amountPerTransaction" type="number" min="0" step="0.01" id="transaction-amount" />
      </div>

      <button type="submit" class="submit-btn">Submit</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      account: null,
      form: {
        amountToFund: 0,
        currency: 'ETH',
        frequency: 'Weekly',
        amountPerTransaction: 0,
      },
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://server:3000/api/hello') // Docker compose will resolve 'server' to the correct IP
      this.message = response.data.message
    } catch (err) {
      console.error(err)
      this.message = 'Error fetching message'
    }
  },
  methods: {
    // connects Metamask wallet account with the app
    async connectWallet() {
      try {
        // check if Metamask is installed
        if(window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

          // accounts contains a list of accounts user has allowed us to interact with
          this.account = accounts[0];
          console.log(this.account);
        } else {
          // Metamask is not installed
          console.log('Metamask is not installed. Please consider installing it: https://metamask.io/');
        }
      } catch (error) {
        console.error(error);
      }
    },

    toggleCurrency() {
      this.form.currency = this.form.currency === 'ETH' ? 'USDC' : 'ETH';
    },

    submitForm() {
      console.log(this.form);
    },
  },
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.wrapper {
  width: 80%;
  margin: 2rem auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  border: none;
  background-color: #007BFF;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.radio-group {
  display: flex;
  justify-content: space-between;
}

.radio-group label {
  flex: 1;
}

.toggle-btn {
  margin-left: 10px;
}

.submit-btn {
  width: 100%;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
