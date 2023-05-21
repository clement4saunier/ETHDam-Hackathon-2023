const cron = require("node-cron");
const mongoose = require("mongoose");
const ethers = require("ethers");
const factoryAbi = require("./abi/WalletFactory.json");
const walletAbi = require("./abi/DCAWallet.json");
const entryPointAbi = require("./abi/IEntryPoint.json");
const { fillAndSignUserOp } = require("./UserOpUtils");

const ENTRYPOINT = "0xFf6974a7732d12499246056f3aCeF80051bB48f5";
const WALLET_FACTORY = "0xFa64f316e627aD8360de2476aF0dD9250018CFc5";

mongoose.connect("mongodb://mongo:27017/autofi", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const autoSwapSchema = new mongoose.Schema(
  {
    account: String,
    amountToSwap: Number,
    currency: String,
    frequency: String,
    amountPerTransaction: Number,
    numberOfTransactions: Number
  },
  { collection: "autoswaps" }
);

const AutoSwap = mongoose.model("AutoSwap", autoSwapSchema);

const schedules = {
  "5seconds": "*/5 * * * * *", // for testing
  daily: "0 0 * * *",
  weekly: "0 0 * * 0",
  monthly: "0 0 1 * *"
};

async function triggerSwap(walletAddress) {
  const provider = new ethers.JsonRpcProvider("localhost:8545");
  const signer = new ethers.Wallet(
    "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
    provider
  ); // Dummy private key, used to trigger the wallet (doesn't have to have any gas)
  const entrypoint = new ethers.Contract(ENTRYPOINT, entryPointAbi, signer);
  const wallet = new ethers.Contract(walletAddress, walletAbi, signer);

  console.log(`Calling swap on ${walletAddress}`);

  const setOwnerCall = wallet.interface.encodeFunctionData("setOwner", [
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
  ]);
  const executeSwapCall = wallet.interface.encodeFunctionData("execute", [
    walletAddress,
    0,
    setOwnerCall
  ]);

  const userOperation = await fillAndSignUserOp(
    { sender: walletAddress, callData: executeSwapCall },
    signer,
    ENTRYPOINT
  );

  await entrypoint.connect(signer).handleOps([userOperation], signer.address);
}

const 

for (const [frequency, schedule] of Object.entries(schedules)) {
  cron.schedule(schedule, async () => {
    console.log(`Running a task every ${frequency}`);
    const swaps = await AutoSwap.find({ frequency, numberOfTransactions: { $gt: 0 } });
    swaps.forEach(async swap => {
      // Logic to execute the swap goes here
      if (!swap.wallet) {
        console.log("Couldn't find wallet for ", swap.account);
        return;
      }
      console.log(`Executing swap for account: ${swap.wallet}`);

      await triggerSwap(swap.wallet);
      // Decrease the number of transactions left
      swap.numberOfTransactions -= 1;
      swap.save();
    });
  });
}
