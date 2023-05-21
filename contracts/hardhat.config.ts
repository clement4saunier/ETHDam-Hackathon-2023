import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-gas-reporter";
import "hardhat-abi-exporter";

const config: HardhatUserConfig = {
  paths: {
    sources: `src/`
  },
  networks: {
    hardhat: {
      forking: { url: "https://arb-mainnet.g.alchemy.com/v2/vnog3b8tAFy5LoV691kDFpNmJuduMEmi" },
      allowUnlimitedContractSize: true
    },
    scrollAlpha: {
      url: `https://alpha-rpc.scroll.io/l2`,
      allowUnlimitedContractSize: true,
      accounts: [
        "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "6264c9cb335b78fd689d301b6be42311cfbc64d0d8a06bcccb20592653b0ad57",
        "3e3d3297264f12ef798ffdb65f2b5ef51d1f1fa557c48f03067bb15ef9775575"
      ]
    },
    goerli: {
      url: `https://endpoints.omniatech.io/v1/eth/goerli/public`,
      allowUnlimitedContractSize: true
    }
  },
  gasReporter: {
    enabled: true,
    currency: "EUR",
    // gasPrice: 11,
    coinmarketcap: "4c053119-3502-47be-a3e9-e7c71f53c126",
    token: "ETH"
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: ["DCAWallet", "WalletFactory", "EntryPoint"],
    spacing: 2,
    format: "minimal"
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000
      }
    }
  }
};

export default config;
