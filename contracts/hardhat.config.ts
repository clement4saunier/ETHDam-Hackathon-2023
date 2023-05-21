import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  paths: {
    sources: `src/`
  },
  networks: {
    hardhat: {
      forking: { url: "https://arb-mainnet.g.alchemy.com/v2/vnog3b8tAFy5LoV691kDFpNmJuduMEmi" },
      allowUnlimitedContractSize: true
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'EUR',
    // gasPrice: 11,
    coinmarketcap: "4c053119-3502-47be-a3e9-e7c71f53c126",
    token: "ETH",
  },
  solidity: "0.8.18"
};

export default config;
