/!\ Work in progress, use at your own risk /!\

# Altamoon

> A trading interface for Binance Perpetual Futures.

Altamoon is a libre desktop & web app made by professional traders, designed for fast and precise trading.
Some of our main features:
- Place orders directly on the chart and change their price by dragging them
- See your liquidation price on the chart
- Place price alerts
- Use single-click buttons to place orders of a preset % of your account
- Keep an eye on all markets with the minicharts widget

![image](https://user-images.githubusercontent.com/1082083/140765511-810c7e04-5ecd-4749-b64e-07a18b3f60c3.png)

## Widgets

Altamoon provides a user-friendly customizable interface. Widgets can be resized & moved around and some of them provide configuration options using the settings icon. (More customization will be added with time)

### Trade with one click

Instead of manually entering fixed amounts to place orders, the "Quick Order" buttons let you place orders using a preset percentage of your account with just one click. The percentage on each button can be configured in the widget's settings.

![image](https://user-images.githubusercontent.com/1082083/140765814-6cfac8a6-6949-4687-9fa6-b579f1e050be.png)


### Candle chart

#### Draft orders

Prepare your order by double clicking on the chart (this works for limit orders only). A dashed line will show up under the cursor, you can drag it up or down to adjust the price and when you're ready, click on the green checkmark to place the order in the book.

![image](https://user-images.githubusercontent.com/1082083/140766021-3f9b3b20-2451-436b-9a75-5a27c560bc81.png)


#### Positions and orders on the chart

All your positions and open orders are displayed on the chart and order lines can be dragged to change their price.
Filled orders are represented as small right-pointing triangles.

![image](https://user-images.githubusercontent.com/1082083/140767139-07c12d1e-ef80-4982-bdf1-1278babaa752.png)


#### Price alerts

To create an alert, simply right click (NB: binding likely to change in the future) on the chart at the desired price.
Like orders, alert lines can be dragged to change their price. A sound will be played on trigger.

![image](https://user-images.githubusercontent.com/1082083/140766447-08d4046b-14c7-439c-91f7-942a3b5c66d1.png)

#### Predictive liquidation line

A solid red line shows your current position's liquidation price.
Altamoon also predicts your liquidation price based on your current position + draft order + open orders, letting you know were your position is going to be liquidated after all the orders are filled. It's displayed as a dashed red line and there is one for both the long and short sides.

![image](https://user-images.githubusercontent.com/1082083/140766618-6de0a645-5249-4d78-9528-1c26bc7a3883.png)


### Positions and Orders

All your open positions and orders in one place.

![image](https://user-images.githubusercontent.com/1082083/140766381-e57eabfb-6d93-4ccf-9c79-913cc649ebde.png)


### Wallet

The wallet widget shows your balance, the global Unrealized PNL of your positions, the margin amount used by your current position and orders, today's PNL to check your performance, etc.

![image](https://user-images.githubusercontent.com/1082083/140767429-975046b7-1145-4f0f-a939-1028e29ba8ac.png)


### Minicharts

Candle charts for all of the futures markets. Place price alerts on a market with a right click. You can also take a look at the standalone tool called [minichart-grid](https://altamoon.github.io/altamoon-minicharts).

![image](https://user-images.githubusercontent.com/1082083/140767525-889fb63e-d674-4b70-a498-7cf40485f37d.png)


### Last trades and Order book

And last but not least, the Last trades and Order book widgets.

![image](https://user-images.githubusercontent.com/1082083/140767557-7380d4cf-b665-4a65-9577-728c90037cd7.png)


## Plugins

Altamoon has a powerful plugin system. With an intuitive API and modern web development technologies, anybody who knows JavaScript can do whatever they want: create widgets, implement automated strategies, add third-party APIs. For more information take a look at [plugins documentation](https://github.com/Altamoon/altamoon-plugins).
