<template>
  <div class="wrapper">
    <el-page-header :icon="null">
      <template #content>
        <div class="flex items-center">
          <el-avatar
            :size="32"
            class="mr-3"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="text-large font-600 mr-3"> AutoFi </span>
          <span v-if="account" class="text-sm mr-2" style="color: var(--el-text-color-regular)">
            {{ truncateEthAddress(account) }}
          </span>
          <el-tag>Alpha</el-tag>
        </div>
      </template>
      <template #extra>
        <div v-if="!account" class="flex items-center">
          <el-button>Sismo Connect</el-button>
          <el-button type="primary" class="ml-2" @click="connectUserWallet">Connect your wallet</el-button>
        </div>
      </template>
    </el-page-header>

    <el-card v-if="account" class="card">
      <h2>AutoFi Balances</h2>
      <p><strong>ETH:</strong> {{ walletBalance.eth }}</p>
      <p><strong>USDC:</strong> {{ walletBalance.usdc }}</p>
      <!-- <p><strong>Wallet Address:</strong> {{ wallet.address }}</p> -->
      <el-button type="primary" class="ml-2" @click="fundWallet">Fund Autofi Wallet</el-button>

      <h3>Recent Transactions</h3>
      <ul>
        <li v-for="transaction in recentTransactions" :key="transaction.id">
          <a :href="`https://blockscan.com/${transaction.link}`" target="_blank">{{ transaction.description }}</a>
        </li>
      </ul>
    </el-card>

    <el-button v-if="account" type="primary" class="ml-2 close-btn" @click="showAutoSwapForm = true">Add AutoSwap</el-button>

    <div v-if="showAutoSwapForm" class="popup">
      <el-button type="primary" class="ml-2 close-btn" @click="showAutoSwapForm = false">X</el-button>
      <h2>Add AutoSwap</h2>
      <AutoSwapForm @closeForm="showAutoSwapForm = false" @submit="handleFormSubmit" />
    </div>

    <!-- List of existing autoSwaps -->
    <div v-if="autoSwaps.length">
      <el-card v-for="swap in autoSwaps" :key="swap._id" class="box-card">
        <template #header>
          <div class="card-header">
            <span>AutoSwap for {{ swap.account }}</span>
            <el-button class="button" text>Operation button</el-button>
          </div>
        </template>
        <div class="text item">Amount to swap: {{ swap.amountToSwap }} {{ swap.currency.toUpperCase() }}</div>
        <div class="text item">Frequency: {{ swap.frequency }}</div>
        <div class="text item">Amount per Transaction: {{ swap.amountPerTransaction }} {{ swap.currency.toUpperCase() }}</div>
        <div class="text item">Number of Transactions: {{ swap.numberOfTransactions }}</div>
      </el-card>
    </div>
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
import AutoSwapForm from './AutoSwapForm.vue';

export default {
  name: 'App',

  components: {
    AutoSwapForm
  },

  data() {
    return {
      account: null,
      wallet: null,
      walletBalance: {
        eth: 0,
        usdc: 0,
      },
      signature: null,
      showAutoSwapForm: false,
      autoSwaps: [],

      // websocket connection
      ws: null,
    };
  },

  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },

  created() {
    this.fetchData();
  },

  methods: {
    // TODO not used
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

    async fetchData() {
      if (!this.account) return;

      try {
        this.autoSwaps = await JSON.parse(axios.get(`/autoswaps?account=${this.account}`));
        console.log(this.autoSwaps);
      } catch (error) {
        console.error(error);
      }
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
          await this.fetchData();
        } else {
          // Metamask is not installed
          console.log('Metamask is not installed. Please consider installing it: https://metamask.io/');
        }
      } catch (error) {
        console.error(error);
      }
    },

    truncateEthAddress(address) {
      const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
      const match = address.match(truncateRegex);
      if (!match)
          return address;
      return match[1] + "\u2026" + match[2];
    },

    handleFormSubmit(formData) {
      // Here you would actually perform the swap, using formData.amountToSwap,
      // formData.currency and formData.frequency
      console.log('Form data:', formData);
      this.scheduleSwap(formData);
    },

    async scheduleSwap(formData) {
      // form validation logic here
      if (this.amountToFund <= 0 || this.amountPerTransaction <= 0 || this.amountPerTransaction > this.amountToFund) {
        console.log('Invalid form data');
        return;
      }

      try {
        const response = await axios.post('/schedule-autoswap', {
          account: this.account,
          amountToFund: formData.amountToSwap,
          currency: formData.currency,
          frequency: formData.frequency,
          amountPerTransaction: formData.amountPerTransaction,
          numberOfTransactions: formData.numberOfTransactions,
        });

        if (response.data.success) {
          // handle successful form submission here
          console.log('Swap scheduled successfully');
          // You may clear the form here
          await this.fetchData();
        } else {
          // handle failed form submission here
          console.log('Failed to schedule swap:', response.data.error);
        }
      } catch (error) {
        // handle network error here
        console.log('Network error:', error);
      }
    }
  },
}
</script>

<style>
body {
  font-family: 'Gilroy-Medium', sans-serif;
  background-color: #EFF3FD;
}

h1 {
  font-family: 'Gilroy-Bold', sans-serif;
}

/* hide the back button of the header */
.el-page-header__left >
.el-page-header__back, .el-divider--vertical {
  display: none;
}
</style>
