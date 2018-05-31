let APP = {
	'web3': 'https://api.myetherapi.com/eth',
	'testnet': false,
	'walletpassword': ''
}

/* requires */
const EthereumWallet = require('node-ethereum-wallet')
const web3 = require('web3')

/* bootstrap */
module.exports = (opts) => {
	APP = Object.assign({}, APP, opts)

	if (APP.testnet && APP.web3=='https://api.myetherapi.com/eth')
		APP.web3 = 'https://api.myetherapi.com/rop'

	APP._wallet = new EthereumWallet(APP.web3)

	return {init, generate_new_address, get_address_balance, get_transaction, create_raw_transaction, sign_tx, push_tx, send_to_address, send_from, get_balance}
}

/* functions */

async function init() {
	await APP._wallet.init()

	if (!APP._wallet.hasKeystore) {
		throw new Error("Your Ethereum wallet is not set up. Please install and run ethereum-cli (npm i node-ethereum-wallet -g) in order to create your wallet.")
	}

	await APP._wallet.unlock(APP.walletpassword)
}

async function shutdown() {
	return
}

async function generate_new_address() {
	return APP._wallet.getNewAddress()
}

async function get_address_balance(addr, minconf) {
	return web3.utils.fromWei(await APP._wallet.getBalance(addr, minconf), 'ether')
}

async function get_transaction(txid) {
	return APP._wallet.getTransaction(txid)
}

async function create_raw_transaction(addr, amount, from) {
	amount = web3.utils.toWei(amount, 'ether')
	return APP._wallet.createRawTx(from, addr, amount)
}

async function sign_tx(raw, from) {
	return APP._wallet.signTx(raw, from)
}

async function push_tx(raw) {
	return APP._wallet.pushTx(raw)
}

async function send_to_address(addr, amount) {
	amount = web3.utils.toWei(amount, 'ether')
	return APP._wallet.sendToAddress(APP._wallet.addresses[0], addr, amount)
}

async function send_from(addr, amount, from) {
	amount = web3.utils.toWei(amount, 'ether')
	return APP._wallet.sendToAddress(from, addr, amount)
}

async function get_balance(min_conf) {
	let bal = await APP._wallet.balance
	return web3.utils.fromWei(bal, 'ether')
}
