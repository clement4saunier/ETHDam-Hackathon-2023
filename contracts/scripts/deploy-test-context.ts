import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");
  
  const [owner] = await ethers.getSigners();

  const Entrypoint = await ethers.getContractFactory("EntryPoint");
  const entrypoint = await Entrypoint.deploy();

  const Factory = await ethers.getContractFactory("WalletFactory");
  const factory = await Factory.deploy(entrypoint.address);

  const dcaWallet = await factory.createWallet();

  console.log(`[Entrypoint]: ${entrypoint.address}`);
  console.log(`[Factory]: ${factory.address}`);
  console.log(`[DCAWallet]: ${await factory.walletOf(owner.address)}`);

  // console.log(`[owner]: ${owner.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
