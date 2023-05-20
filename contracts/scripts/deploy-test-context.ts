import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  const Entrypoint = await ethers.getContractFactory("EntryPoint");
  const entrypoint = await Entrypoint.deploy();

  const DCAWallet = await ethers.getContractFactory("DCAWallet");
  const dcaWallet = await DCAWallet.deploy(entrypoint.address);

  await dcaWallet.deployed();

  console.log(`[Entrypoint]: ${entrypoint.address}`);
  console.log(`[DCAWallet]: ${dcaWallet.address}`);

  console.log(`[owner]: ${owner.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
