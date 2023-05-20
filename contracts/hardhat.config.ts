import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  paths: {
    sources: `src/`,
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    }
  },
  solidity: "0.8.18",
};

export default config;
