const walletModel = require('../models/wallet');
const transactionModel = require('../models/transaction')

function getDescription(transaction) {
  switch (transaction.transactionType) {
    case 'release':
      return 'Milestone released';

    case 'escrow':
      return 'Escrow hold';

    case 'withdrawal':
      return 'Wallet withdrawal';

    case 'refund':
      return 'Booking refund';

    default:
      return 'Transaction';
  }
}