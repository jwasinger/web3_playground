const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const async = require('async')
const Ganache = require("./ganache-core/index.js")
const BigNumber = require("bignumber.js")

// spin up a testrpc server with single account
function TestRPCServer() {
    var options = {
        port: '8545',
        hostname: 'localhost',
        accounts: [
            {
                secretKey: '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8',
                balance: '10000000000000000000000' 
            }
        ],
        locked: false
    }

    var server = Ganache.server(options);
    return new Promise((resolve, reject) => {
        server.listen(options.port, options.hostname, function(err, blockchain) {
            if (err) {
              reject(err)
            }
            resolve(blockchain)
        })
    })
}


TestRPCServer().then((err, blockchain) => {
    // Connect to local Ethereum node
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    // Compile the source code
    const input = fs.readFileSync('Token.sol');
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':Token'].bytecode;
    const abi = JSON.parse(output.contracts[':Token'].interface);

    // Deploy contract instance
    const contractInstance = new web3.eth.Contract(abi);

    contractInstance.deploy({
        'data': bytecode
    }).send({
        from: '0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B',
        gas: 1000000,
        gasPrice: 1
    }).then(function(newContractInstance){
        //console.log(newContractInstance.options.address) // instance with the new contract address
        newContractInstance.methods.sink().send({from: '0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B', gas: 100000, gasPrice: 1}).on('error', function(err) {
          web3.eth.getBalance("0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B").then(function(balance) {
              console.log(balance)
          })
        }).on('confirmation', function(confirmationNumber, receipt) {
          web3.eth.getBalance("0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B").then(function(balance) {
              console.log(balance)
          })
        })
    })
})
