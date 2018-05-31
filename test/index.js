const MultiWallet = require('../')

main()

async function main() {

	return await test('eth')

	for(let currency of ['btc', 'ltc', 'dash']) {
		console.log("Testing "+currency)
		await test(currency)
	}

	await test('eth')
}

async function test(currency) {
	try {
		let folder_sufix = '',
			bin_sufix = ''

		if (currency=='ltc') {
			folder_sufix = '-LTC'
			bin_sufix = 'Electrum-LTC'
		}
		else if (currency=='dash') {
			folder_sufix = '-DASH'
			bin_sufix = 'electrum-dash-3.0.6.2.bin'
		}

		let Wallet = new MultiWallet(currency, {
			bin: '/Applications/Electrum'+folder_sufix+'.app/Contents/MacOS/'+bin_sufix,
			rpcuser: 'admin',
			rpcpassword: 'password',
			walletpassword: '',
			testnet: true
		})

		// start daemon (optional - do it only if you did not start the wallets previously on the terminal)
		// except with Ethereum, since the ethereum wallet is internal (so always required to be initialized)
		await Wallet.init()

		let walletAddr = await Wallet.getNewAddress()
		console.log("New address: "+walletAddr)

		let confirmedBalance = await Wallet.getBalance(1)
		let unconfirmedBalance = await Wallet.getBalance(0)
		console.log("Confirmed balance: "+confirmedBalance)
		console.log("Unconfirmed balance: "+(unconfirmedBalance-confirmedBalance))

		let walletConfBalance = await Wallet.getReceivedByAddress(walletAddr, 1)
		let walletUnconfBalance = await Wallet.getReceivedByAddress(walletAddr, 0)
		console.log("Wallet confirmed balance: "+walletConfBalance)
		console.log("Wallet unconfirmed balance: "+(walletUnconfBalance-walletConfBalance))

		let destinationWallet,
			from = undefined

		/*
			ALL these testing addresses are TESTNET only.
		*/
		switch (currency) {
			case 'btc':
				destinationWallet = 'mvwmhuZUtPa7LPZsGHZbtenVGkZGDSvGtB'
				break
			case 'ltc':
				destinationWallet = 'mgTbDyNGwJeewjdXmU9cRQe8WDauVqn4WK'
				break
			case 'dash':
				destinationWallet = 'yWdXnYxGbouNoo8yMvcbZmZ3Gdp6BpySxL'
				break
			case 'eth':
				destinationWallet = '0x5984Eae46E06279C144D1b085ce66e8b45C57bAb'
				from = '0x04faeada731b99a7f6080d1afe28e89d9f8244f7'
				break
		}

		let txId = await Wallet.sendToAddress(destinationWallet, '0.0007')
		console.log("Direct sending TxID: "+txId)

		// from is required on ethereum
		let rawTx = await Wallet.createRawTx(destinationWallet, '0.001', from)
		console.log("Unsigned transaction: "+rawTx)

		// from is required on ethereum
		let signedRawTx = await Wallet.signTx(rawTx, from)
		console.log("Signed transaction: "+signedRawTx)

		let txId2 = await Wallet.pushTx(signedRawTx)
		console.log("Transaction ID: "+txId2)

		await Wallet.shutdown()

		return true
	} catch(e) {
		console.log(e)
		return false
	}
}