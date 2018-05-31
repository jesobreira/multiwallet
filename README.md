MultiWallet
===========

NodeJS multiple crypto-currencies wallet bindings that exposes the same API for every currency.

Not intented for browsers.

It uses external lightweight clients.

Supported currencies are:

* Bitcoin ([Electrum](https://electrum.org/))
* Litecoin ([Electrum-LTC](https://electrum-ltc.org/))
* Dash ([Electrum-Dash](https://electrum.dash.org/))
* Ethereum ([ethereum-cli](https://jesobreira.github.io/eth-cli))

To-do:

* Monero
* Decred
* Ripple

Install
-------

Make sure your server has Electrum, Electrum-LTC, Electrum-Dash and ethereum-cli installed. **Run each one of them after installing in order to create your wallet/seed.** Then install the lib.

```
npm i multicryptowallet
```

Usage
-----

Start by requiring the lib.

```javascript
const MultiWallet = require('multicryptowallet')
```

Now you have to instantiate it. You can have multiple instances. Use "btc", "ltc", "dash" or "eth".

```javascript
let btcWallet = new MultiWallet('btc')
let dashWallet = new MultiWallet('dash')
```

As second argument, you can set a few optional settings:

```javascript
let btcWallet = new MultiWallet('btc', {
	bin: '/path/to/electrum', // if not on PATH environment variable
	args: '', // additional electrum arguments (appended)
	rpchost: '127.0.0.1',
	rpcport: 7777,
	rpcuser: 'admin',
	rpcpassword: 'strong-password-here',
	walletpassword: 'stronger-password',
	testnet: false,
	web3: 'https://mainnet.infura.io' // for Ethereum only
	})
```

It's recommended to run the three Electrum versions outside your NodeJS application. You do not need to run ethereum-cli outside, as it is used as a library, and not as a command.

If you prefer so, the library can also try to load Electrum versions for you. However we highly advise not to do so, as it may not work in some environments or may not be safe at all.

```
await btcWallet.init()
```

It will initialize Electrum, although it is not recommended. To stop Electrum process:

```
await btcWallet.shutdown()
```

**Note:** when using Ethereum, you MUST call `init()`. But shutdown is not required.

```javascript
await ethWallet.init()
```

### Generating address

```javascript
let walletAddr = await Wallet.getNewAddress()
console.log("New address: "+walletAddr)
```

### Getting wallet balance

```javascript
let confirmedBalance = await Wallet.getBalance(1)
let unconfirmedBalance = await Wallet.getBalance(0)
console.log("Confirmed balance: "+confirmedBalance)
console.log("Unconfirmed balance: "+(unconfirmedBalance-confirmedBalance))
```

### Getting another address balance

```javascript
let walletConfBalance = await Wallet.getReceivedByAddress(walletAddr, 1)
let walletUnconfBalance = await Wallet.getReceivedByAddress(walletAddr, 0)
console.log("Wallet confirmed balance: "+walletConfBalance)
console.log("Wallet unconfirmed balance: "+(walletUnconfBalance-walletConfBalance))
```

### Sending coins

```javascript
let txId = await Wallet.sendToAddress('wallet', '0.0007')
```

### Raw Transactions

Creating  ("from_wallet" is required if using Ethereum):

```javascript
let rawTx = await Wallet.createRawTx('destination_wallet', '0.001', 'from_wallet')
```

Signing ("from" is required if using Ethereum):

```javascript
let signedRawTx = await Wallet.signTx(rawTx, from)
```

Pushing:

```javascript
let txId = await Wallet.pushTx(signedRawTx)
```

Developing new bindings
-----------------------

In order to add support for new coins, copy the source code at [docs/currency-bootstrap.js](docs/currency-bootstrap.js) and implement the functions listed. Copy your file to "lib/currencies", renaming it to your currency's code.

A testing script is available through `npm test`. Edit it on the "test" folder.