require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",

  networks:{
    hardhat: {},
    ganache:{
      url: "http://127.0.0.1:7545", 
      accounts:[
        '0xd432423129da82adf6afd49374321afcab542d1116105f2fc639a16d8199138f',
        '0x0112795728f1afd135191cfac45910d7060d392c1f9cae27f9a24dee8fd0a27c'

      ]
    },
    sepolia:{
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    auroraTestnet: {
      url: `https://testnet.aurora.dev`,
      accounts: [process.env.PRIVATE_KEY],
    },
  }
};
