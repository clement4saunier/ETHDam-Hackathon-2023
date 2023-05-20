<template>
  <div class="wrapper">
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->
    <h1>Autofi</h1>

    <div v-if="!account">
      <button @click="connectUserWallet">Connect your wallet</button>
    </div>
    <!-- <div v-else-if="!wallet" class="content-group">
      <div>Welcome, {{account}}</div>
      <button @click="createNewWallet">Create Autofi wallet account</button>
    </div> -->

    <form v-else @submit.prevent="submitForm" class="form">
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
        <div class="errors">
          <div v-if="amountToFund <= 0">Amount per transaction must be a positive number.</div>
          <div v-if="amountPerTransaction > amountToFund">Amount per transaction cannot be greater than the total amount to fund.</div>
        </div>
      </div>

      <el-button type="primary">Click me</el-button>

      <div class="form-group">
        <label>Frequency of Transactions:</label>
        <div class="radio-group">
          <label>
            <input type="radio" value="daily" v-model="frequency" /> Daily
          </label>
          <label>
            <input type="radio" value="weekly" v-model="frequency" /> Weekly
          </label>
          <label>
            <input type="radio" value="monthly" v-model="frequency" /> Monthly
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="transaction-amount">Amount per Transaction:</label>
        <input v-model.number="amountPerTransaction" type="number" min="0" step="0.01" id="transaction-amount" />
      </div>

      <p>You can expect to make {{ numberOfTransactions }} transactions.</p>
      <button type="submit" class="submit-btn">Submit</button>
    </form>
  </div>
</template>

let ws = null;

function connect() {
  ws = new WebSocket('ws://localhost:3000/ws');

  ws.onopen = function() {
    console.log('WebSocket is connected.');
    // Send a message or do something else
  };

  ws.onmessage = function(e) {
    console.log('Received: ' + e.data);
  };

  ws.onerror = function(e) {
    console.log(`WebSocket error: ${e}`);
  };

  ws.onclose = function(e) {
    console.log(`WebSocket closed with code ${e.code}`);
    console.log('Attempting to reconnect...');
    setTimeout(connect, 1000);
  };
}

connect();

<script>
import axios from 'axios';

export default {
  name: 'App',

  data() {
    return {
      account: null,
      wallet: null,
      signature: null,
      amountToFund: 0,
      currency: 'eth',
      frequency: 'weekly',
      amountPerTransaction: 0,

      // websocket connection
      ws: null,
    };
  },

  async created() {
    this.connectWS();
    const response = await axios.get('http://localhost:3000/some');
    console.log(response);
  },

  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },

  computed: {
    numberOfTransactions() {
      if (this.amountToFund > 0 && this.amountPerTransaction > 0 && this.amountPerTransaction <= this.amountToFund) {
        return Math.ceil(this.amountToFund / this.amountPerTransaction);
      } else {
        return 'N/A';
      }
    },
  },

  methods: {
    connectWS() {
      this.ws = new WebSocket('ws://localhost:3000/ws');

      this.ws.onopen = function() {
        console.log('WebSocket is connected.');
        // Send a message or do something else
      };

      this.ws.onmessage = function(e) {
        console.log('Received: ' + e.data);
      };

      this.ws.onerror = function(e) {
        console.log(`WebSocket error: ${e}`);
      };

      this.ws.onclose = function(e) {
        console.log(`WebSocket closed with code ${e.code}`);
        console.log('Attempting to reconnect...');
        setTimeout(this.connectWS, 1000);
      };
    },

    // connects Metamask wallet account with the app
    async connectUserWallet() {
      try {
        // check if Metamask is installed
        if(window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

          // accounts contains a list of accounts user has allowed us to interact with
          this.account = accounts[0];

          console.log(this.account);

          // send an event to server
          this.ws.send(JSON.stringify({ event: 'userWalletConnected', payload: { accountAddress: this.account } }));
        } else {
          // Metamask is not installed
          console.log('Metamask is not installed. Please consider installing it: https://metamask.io/');
        }
      } catch (error) {
        console.error(error);
      }
    },

    toggleCurrency() {
      this.currency = this.currency === 'eth' ? 'usdc' : 'eth';
    },

    submitForm() {
      // TODO implement form submission,
      // this would send a transaction to a smart contract.
    },
  },
}
</script>

<style scoped>
.wrapper {
  margin: 2rem auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.content-group {
  text-align: center;
}

.errors {
  color: red;
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

/* .logo {
  display: block;
  margin: 0 auto 2rem;
} */

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

.amount-input {
  display: flex;
  align-items: center;
}

.currency-toggle {
  display: flex;
  margin-left: 20px;
}

.currency-toggle input[type="radio"] {
  display: none;
}

.currency-toggle label {
  padding: 5px 10px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.currency-toggle input[type="radio"]:checked + label {
  background-color: #ccc;
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
