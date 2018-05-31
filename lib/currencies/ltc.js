/* bootstrap */

let APP = {
	bin: 'electrum-ltc',
	args: '',
	testnet: false,
	rpchost: '127.0.0.1',
	rpcport: 7778,
	rpcuser: '',
	rpcpassword: '',
	walletpassword: ''
}

module.exports = (opts) => { APP = Object.assign({}, APP, opts); return {init, generate_new_address, get_address_balance, get_transaction, create_raw_transaction, sign_tx, push_tx, send_to_address, send_from, get_balance, shutdown} }

/* requires */

const { promisify } = require('util')
const fetch = require('node-fetch')
const exec = require('child_process').exec
const execAsync = promisify(exec)

/* functions */

async function init() {
	if (APP.testnet) APP.args += ' --testnet'

	await execAsync(APP.bin+' setconfig rpchost '+APP.rpchost+APP.args)
	await execAsync(APP.bin+' setconfig rpcport '+APP.rpcport+APP.args)
	await execAsync(APP.bin+' setconfig rpcuser '+APP.rpcuser+APP.args)
	await execAsync(APP.bin+' setconfig rpcpassword '+APP.rpcpassword+APP.args)

	await execAsync(APP.bin+' setconfig password '+APP.walletpassword+APP.args)
	
	let daemon = exec(APP.bin+' daemon'+APP.args)
	APP.daemonProc = daemon

	return new Promise((resolve) => setTimeout(async() => {
		await execAsync(APP.bin+' daemon load_wallet'+APP.args)
		resolve()
	}, 2000))
}

async function shutdown() {
	try {
		await execAsync(APP.bin+' daemon stop')
	} catch(e) {
		// fail silently
	}
}

async function generate_new_address() {
	return electrum('createnewaddress')
}

async function get_address_balance(addr, min_conf) {
	let bal = await electrum('getaddressbalance', [addr])
	if(min_conf)
		return Number(bal.confirmed) ? Number(bal.confirmed) : 0
	else
		return (Number(bal.unconfirmed) ? Number(bal.unconfirmed) : 0) + (Number(bal.confirmed) ? Number(bal.confirmed) : 0)
}

async function get_transaction(txid) {
	return electrum('gettransaction', [txid])
}

async function create_raw_transaction(destination, amount, from_addr = null) {
	if (isNaN(amount))
		throw new Error("Invalid amount")

	let opts = {
		destination,
		amount,
		password: APP.walletpassword,
		unsigned: true
	}

	if(from_addr)
		opts.from_addr = from_addr

	let { hex } = await electrum('payto', opts)
	return hex
}

async function sign_tx(raw) {
	let { hex } = await electrum('signtransaction', {tx: raw, password: APP.walletpassword})
	return hex
}

async function push_tx(raw) {
	let tx = await electrum('broadcast', {tx: raw})
	if (tx[0]) {
		return tx[1]
	} else {
		throw new Error(tx[1])
	}
}

async function send_to_address(addr, amount) {
	let rawTx = await create_raw_transaction(addr, amount)
	let signedTx = await sign_tx(rawTx)
	return await push_tx(signedTx)
}

async function send_from(addr, amount, from) {
	let rawTx = await create_raw_transaction(addr, amount, from)
	let signedTx = await sign_tx(rawTx)
	return await push_tx(signedTx)
}

async function get_balance(min_conf) {
	let bal = await electrum('getbalance')
	if(min_conf)
		return Number(bal.confirmed) ? Number(bal.confirmed) : 0
	else
		return (Number(bal.unconfirmed) ? Number(bal.unconfirmed) : 0) + (Number(bal.confirmed) ? Number(bal.confirmed) : 0)
}

/* internal functions */

function electrum(method, params = {}) {
	return new Promise((resolve, reject) => {
		let postdata = {
			id: 0,
			method,
			params
		}

		let auth = Buffer.from(APP.rpcuser+':'+APP.rpcpassword).toString('base64')

		fetch('http://'+APP.rpchost+':'+APP.rpcport+'/', {
			method: 'POST',
			body: JSON.stringify(postdata),
			headers: {
				'Content-Type': 'application/octet-stream',
				'Authorization': 'Basic '+auth
			}
		})
		.then(res => res.json())
		.then(json => {
			if(json.error)
				reject(json.error)
			else
				resolve(json.result)
		})
		.catch(reject)
	})
}