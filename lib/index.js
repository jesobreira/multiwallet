const fs = require('fs')

module.exports = class {
	constructor(module, opts = {}) {
		if (fs.existsSync(module))
			this.module = require(module)(opts)
		else if (!fs.existsSync('./currencies/'+module))
			this.module = require('./currencies/'+module)(opts)
		else
			throw new Error("Currency not found or not supported: "+module)

		return this
	}

	async init() {
		return this.module.init()
	}

	async getNewAddress() {
		return await this.module.generate_new_address()
	}

	async getReceivedByAddress(addr, minconf = 0) {
		return await this.module.get_address_balance(addr, minconf)
	}

	async getTx(txid) {
		return await this.module.get_transaction(txid)
	}

	async createRawTx(addr, amount, from = undefined) {
		return await this.module.create_raw_transaction(addr, amount, from)
	}

	async signTx(raw, from = undefined) {
		return await this.module.sign_tx(raw, from)
	}

	async pushTx(raw) {
		return await this.module.push_tx(raw)
	}

	async sendToAddress(addr, amount, from = undefined) {
		if (typeof from === 'undefined')
			return await this.module.send_to_address(addr, amount)
		else
			return await this.module.send_from(addr, amount, from)
	}

	async getBalance(minconf = 0) {
		return this.module.get_balance(minconf)
	}

	async shutdown() {
		return await this.module.shutdown()
	}
}