/* bootstrap */

let APP = {
	bin: 'electrum',
	preArgs: '',
	args: ''
}

module.exports = (opts) => { APP = Object.assign({}, APP, opts); return {init, generate_new_address, get_address_balance, get_transaction, create_raw_transaction, sign_tx, push_tx, send_to_address, send_from, get_balance} }

/* requires */



/* functions */

async function init() {

}

async function shutdown() {
	
}

async function generate_new_address() {
	
}

async function get_address_balance(addr, minconf) {

}

async function get_transaction(txid) {

}

async function create_raw_transaction(addr, amount, from) {

}

async function sign_tx(raw) {

}

async function push_tx(raw) {

}

async function send_to_address(addr, amount) {

}

async function send_from(addr, amount, from) {

}

async function get_balance(min_conf) {

}
