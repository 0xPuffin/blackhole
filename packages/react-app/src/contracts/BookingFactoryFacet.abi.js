module.exports = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "nft_",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "contract Booking",
        "name": "booking",
        "type": "address"
      }
    ],
    "name": "BookingCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nft_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pricePerBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "collatoral",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxBlocks_",
        "type": "uint256"
      }
    ],
    "name": "createBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nft_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id_",
        "type": "uint256"
      }
    ],
    "name": "getBooking",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];