const cron = require('node-cron');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/autofi', { useNewUrlParser: true, useUnifiedTopology: true });

const autoSwapSchema = new mongoose.Schema({
  account: String,
  amountToSwap: Number,
  currency: String,
  frequency: String,
  amountPerTransaction: Number,
  numberOfTransactions: Number
}, { collection: 'autoswaps' });

const AutoSwap = mongoose.model('AutoSwap', autoSwapSchema);

const schedules = {
  '5seconds': '*/5 * * * * *', // for testing
  daily: '0 0 * * *',
  weekly: '0 0 * * 0',
  monthly: '0 0 1 * *'
};

for (const [frequency, schedule] of Object.entries(schedules)) {
  cron.schedule(schedule, async () => {
    console.log(`Running a task every ${frequency}`);
    const swaps = await AutoSwap.find({ frequency, numberOfTransactions: { $gt: 0 } });
    swaps.forEach(swap => {
      // Logic to execute the swap goes here
      console.log(`Executing swap for account: ${swap.account}`);
      
      // Decrease the number of transactions left
      swap.numberOfTransactions -= 1;
      swap.save();
    });
  });
}