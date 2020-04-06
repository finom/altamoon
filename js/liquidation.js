module.exports = { getLiquidation }

function getLiquidation (balance, direction, entryPrice, qty) {
    /* https://binance.zendesk.com/hc/en-us/articles/360037941092-How-to-Calculate-Liquidation-Price
    
        @balance         // = Margin in isolated mode
        @direction       // 1 (buy) or -1 (sell)
        @entryPrice      // Average entry price
        @qty             // in BTC (or other coin)
     */
    var maintenance

    var position = direction * qty * entryPrice

    var maintenanceTable = [
        // Position max ($k), Maintenance rate, Maintenance amount ($)
        [50, 0.004, 0],
        [250, 0.005, 50],
        [1000, 0.01, 1300],
        [5000, 0.025, 16300],
        [10000, 0.05, 141300],
        [20000, 0.1, 641300],
        [35000, 0.125, 1141300],
        [50000, 0.15, 2016300],
        [9999999999999, 0.25, 7016300]
    ]
    for (let x of maintenanceTable)
        if (qty * entryPrice < x[0] * 1000) {
            maintenance = { rate: x[1], amount: x[2] }
            break
        }    

    return (balance + maintenance.amount - position) 
            / (qty * (maintenance.rate - direction))
}