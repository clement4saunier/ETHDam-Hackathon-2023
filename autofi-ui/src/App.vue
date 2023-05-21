<template>

  <el-space direction="vertical" alignment="center" :size="30">
    <el-page-header :icon="null">
      <template #content>
        <div class="flex items-center">
          <img src="../public/Logo.svg" alt="">
          <!-- <el-dropdown trigger="click" @command="handleCommand">
            <el-badge :value="notifications.length" class="item">
              <el-icon name="bell"></el-icon>
            </el-badge>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="!notifications.length">
                No transactions
              </el-dropdown-item>
              <el-dropdown-item v-for="notification in notifications" :key="notification.hash" :command="notification">
                  <el-link :href="`https://etherscan.io/tx/${notification.hash}`" target="_blank">{{notification.hash}}</el-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </div>
      </template>
      <template #extra>
        <div v-if="!account" class="flex items-center">
          <el-button type="primary" @click="proveAndConnectSismo">Sismo Connect</el-button>
          <el-button type="primary" class="ml-2" @click="connectUserWallet"
            >Connect your wallet</el-button
          >
        </div>
        <div v-else class="profile">
          <span class="addr" style="color: var(--el-text-color-regular)">
            {{ truncateEthAddress(account) }}
          </span>
          <el-avatar
            :size="32"
            class="mr-3"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
        </div>
      </template>
    </el-page-header>

    <el-card v-if="account" class="card">
      <h2>AutoFi Balances: {{ wallet }}</h2>
      <p><strong>ETH:</strong> {{ walletBalance.eth }}</p>
      <p><strong>USDC:</strong> {{ walletBalance.usdc }}</p>
      <!-- <p><strong>Wallet Address:</strong> {{ wallet.address }}</p> -->
      <el-dialog v-model="showAutoFundForm" :show-close="false">
        <template #header="{ close }">
          <AutoFundForm @closeForm="close = false" @submit="handleFundSubmit" />
        </template>
        This is dialog content.
      </el-dialog>

      <el-divider />

      <h3>Recent Transactions</h3>
      <ul>
        <li v-for="transaction in recentTransactions" :key="transaction.id">
          <a :href="`https://blockscan.com/${transaction.link}`" target="_blank">{{
            transaction.description
          }}</a>
        </li>
      </ul>

      <el-divider />

      <el-button type="primary" class="ml-2" @click="showAutoFundForm = true">
        Deposit Funds
      </el-button>
    </el-card>

    <el-button
      v-if="account"
      type="primary"
      class="ml-2 mt-2 close-btn"
      @click="showAutoSwapForm = true"
      >Add AutoSwap</el-button
    >

    <el-button
      v-if="account"
      type="primary"
      class="ml-2 mt-2 close-btn"
      @click="deployUserWallet"
      >Create</el-button
    >

    <el-dialog v-model="showAutoSwapForm" :show-close="false">
      <template #header="{ close }">
        <AutoSwapForm @closeForm="close = false" @submit="handleFormSubmit" />
      </template>
      This is dialog content.
    </el-dialog>

    <!-- List of existing autoSwaps -->
    <el-container v-if="autoSwaps.length">
      <el-card v-for="swap in autoSwaps" :key="swap._id" class="box-card">
        <template #header>
          <div class="card-header">
            <span>AutoSwap for {{ swap.account }}</span>
            <el-button class="button" text>Modify</el-button>
          </div>
        </template>
        <div class="text item">
          Amount to swap: {{ swap.amountToFund }} {{ swap.currency.toUpperCase() }}
        </div>
        <div class="text item">Frequency: {{ swap.frequency }}</div>
        <div class="text item">
          Amount per Transaction: {{ swap.amountPerTransaction }} {{ swap.currency.toUpperCase() }}
        </div>
        <div class="text item">Number of Transactions: {{ swap.numberOfTransactions }}</div>
      </el-card>
    </el-container>
  </el-space>
</template>

<script>
import axios from 'axios';
import { ethers } from 'ethers';
import factoryAbi from './abi/WalletFactory.json';
import walletAbi from './abi/DCAWallet.json';

import { SismoConnect, AuthType } from "@sismo-core/sismo-connect-client";

const WALLET_FACTORY = "0xFa64f316e627aD8360de2476aF0dD9250018CFc5";

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
        eth: 0.00013494,
        usdc: 0.24517699,
      },
      signature: null,
      showAutoSwapForm: false,
      autoSwaps: [],
      notifications: [],
      recentTransactions: [
        {
          id: 1,
          link: 123,
          description: 'Account created'
        },
        {
          id: 1,
          link: 123,
          description: 'Funds transferred'
        },
        {
          id: 2,
          link: 123,
          description: 'Position signed'
        },
      ],
    };
  },

  async created() {
    await this.fetchData();
  },

  mounted() {
    // setInterval(this.fetchData, 5000); // poll every 5 seconds
    // console.log('HELO', process.env.VUE_APP_WALLET);
  },

  methods: {
    async fetchData() {
      if (!this.account) return;

      try {
        const response = await axios.get(`/autoswaps?account=${this.account}`);
        this.autoSwaps = response.data;
        console.log(this.autoSwaps);
      } catch (error) {
        console.error(error);
      }
    },

    handleCommand(notification) {
      window.open(`https://blockscan.com/eth/tx/${notification.hash}`, '_blank');
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
          this.wallet = await this.fetchUserWallet(accounts[0]);
          await this.fetchData();
        } else {
          // Metamask is not installed
          console.log('Metamask is not installed. Please consider installing it: https://metamask.io/');
        }
      } catch (error) {
        console.error(error);
      }
    },

    async fetchUserWallet(address) {
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const instance = new ethers.Contract(
        WALLET_FACTORY,
        factoryAbi,
        provider
      );

      const wallet = await instance.walletOf(address);

      console.log("Wallet:", wallet);
      return wallet;
    },

    async deployUserWallet() {
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const instance = new ethers.Contract(
        WALLET_FACTORY,
        factoryAbi,
        await provider.getSigner()
      );

      await instance.createWallet();
    },

    // prove of account ownership with Sismo Connect
    async proveAndConnectSismo() {
      try {
        // use Sismo Connect for seamless onboarding for those new to crypto
        const sismoConnect = new SismoConnect({
          appId: '0x5f1dc504b19e9058c3560e5c4866acba',
          devMode: {
            // will use the Dev Sismo Data Vault https://dev.vault-beta.sismo.io/
            enabled: true,
            // Display a modal at the end of the proof generation flow with the response
            // to help you generate response for development purpose
            displayRawResponse: true,
          }
        });
        const auth = {
            // user should prove that they own a EVM account
            authType: AuthType.EVM_ACCOUNT,
        };
        sismoConnect.request({ auth });
        const secondAuth = { authType: AuthType.TWITTER };
        sismoConnect.request({ auths: [auth, secondAuth] });
      } catch (error) {
        // Handle any errors that occur during the connection process
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
      // Here you would actually perform the swap, using formData.amountToFund,
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
          wallet: this.wallet,
          amountToFund: formData.amountToFund,
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
  background-color: #eff3fd;
  color: black;
}

h1 {
  font-family: 'Gilroy-Bold', sans-serif;
}

button {
  padding: 50px;
}

.profile {
  display: flex;
  flex-direction: row;
  align-content: center;
  transform: scale(1.6);
  padding-right: 20px;
}

.profile .addr {
  padding-top: 10px;
}

.el-space, .el-space__item {
  width: 100%;
}

.el-page-header {
  padding: 20px;
  background-color: white;
}

.el-page-header__header {
  display: flex;
  align-items: center;
}

/* hide the back button of the header */
.el-page-header__left > .el-page-header__back,
.el-divider--vertical {
  display: none;
}

.el-card {
  border-radius: 15px;
}

.el-button {
  background-color: #5A55D2;
  font-family: 'Gilroy-Bold', sans-serif;
  padding: 10px;
  border-radius: 5px;
}

.el-button:hover {
  background-color: hsl(214, 89%, 14%);
}
</style>
