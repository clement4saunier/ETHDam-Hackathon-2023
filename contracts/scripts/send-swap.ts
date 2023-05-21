import { ethers } from "hardhat";

//ARB Ox
const UDSC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

async function main() {
  // const [owner] = await ethers.getSigners();

  const Entrypoint = await ethers.getContractFactory("EntryPoint");
  const entrypoint = await Entrypoint.deploy();

  const DCAWallet = await ethers.getContractFactory("DCAWallet");
  const dcaWallet = await DCAWallet.deploy(entrypoint.address, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789");

  await dcaWallet.deployed();

  console.log(`[Entrypoint]: ${entrypoint.address}`);
  console.log(`[DCAWallet]: ${dcaWallet.address}`);

  // console.log(`[owner]: ${owner.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
