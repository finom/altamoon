import * as d3 from 'd3';
import { FuturesChartCandle } from 'node-binance-api';
import techan, { FinancetimeScale, PlotMixin, ZoomableScale } from 'techan';
import { listenChange } from 'use-change';
import convertType from '../../../lib/convertType';
import { TodoAny } from '../../../types';

interface Item {
  date: Date | null;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  date: Date | null;
  type: 'buy' | 'sell' | 'buy-pending' | 'sell-pending';
  price: number;
  quantity: number;
}

const margin = {
  top: 10, right: 10, bottom: 20, left: 20,
};
const getWidth = (w: number) => w - margin.left - margin.right;
const getHeight = (h: number) => h - margin.top - margin.bottom;

export default class CandleChart {
  public candles: FuturesChartCandle[] = [];

  #container: d3.Selection<SVGGElement, unknown, null, undefined>;

  #node: HTMLElement;

  #candlestick: PlotMixin<Item>;

  #tradearrow: PlotMixin<Trade>;

  #valueText: d3.Selection<SVGTextElement, unknown, null, undefined>;

  #xAxis: d3.Axis<d3.NumberValue>;

  #yAxis: d3.Axis<d3.NumberValue>;

  #x: FinancetimeScale;

  #y: d3.ScaleLinear<number, number, never>;

  #zoomableScale: ZoomableScale;

  constructor(node: HTMLElement, w = 300, h = 200, candles: FuturesChartCandle[]) {
    const width = getWidth(w);
    const height = getHeight(h);

    const dateFormat = d3.timeFormat('%d-%b-%y');
    const valueFormat = d3.format(',.2f');

    const x = techan.scale.financetime()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const candlestick = techan.plot.candlestick<Item>()
      .xScale(x)
      .yScale(y);

    const container = d3.select(node).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const valueText = container.append('text')
      .style('text-anchor', 'end')
      .attr('class', 'coords')
      .attr('x', width - 5)
      .attr('y', 15);

    const xAxis = d3.axisBottom(x);

    const yAxis = d3.axisLeft(y);

    const zoom = d3.zoom().on('zoom', () => {
      const { event } = convertType<{ event: d3.D3ZoomEvent<Element, unknown> }>(d3);
      // const rescaledY = event.transform.rescaleY(y);
      // yAxis.scale(rescaledY);
      // candlestick.yScale(rescaledY);

      // Emulates D3 behaviour, required for financetime due to secondary zoomable scale
      x.zoomable()
        .domain(event.transform.rescaleX(convertType<d3.ZoomScale>(this.#zoomableScale)).domain());

      // draw
      container.select('g.candlestick').call(candlestick as TodoAny);
      // using refresh method is more efficient as it does not perform any data joins
      // Use this if underlying data is not changing
      //        svg.select("g.candlestick").call(candlestick.refresh);
      container.select('g.x.axis').call(xAxis as TodoAny);
      // container.select('g.y.axis').call(yAxis as TodoAny);
    });

    container.append('rect')
      .attr('class', 'pane')
      .attr('width', width)
      .attr('height', height)
      .call(zoom as TodoAny);

    const tradearrow = techan.plot.tradearrow<Trade>()
      .xScale(x)
      .yScale(y)
      .orient((d) => (d.type.startsWith('buy') ? 'up' : 'down'))
      .on('mouseenter', (d) => {
        valueText.style('display', 'inline');
        valueText.text(`Trade: ${d.date ? dateFormat(d.date) : ''}, ${d.type}, ${valueFormat(d.price)}`);
      })
      .on('mouseout', () => {
        valueText.style('display', 'none');
      });

    /*
    const trades: Trade[] = [
      { date: data[67].date, type: 'buy', price: data[67].low, quantity: 1000 },
      { date: data[100].date, type: 'sell', price: data[100].high, quantity: 200 },
    ];
    */

    container.append('g')
      .attr('class', 'candlestick');

    container.append('g')
      .attr('class', 'tradearrow');

    container.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`);

    container.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');

    this.#container = container;
    this.#node = node;
    this.#candlestick = candlestick;
    this.#tradearrow = tradearrow;
    this.#valueText = valueText;
    this.#xAxis = xAxis;
    this.#yAxis = yAxis;
    this.#x = x;
    this.#y = y;
    this.#zoomableScale = x.zoomable().clamp(false).copy();

    this.candles = candles;

    this.draw();

    listenChange(this, 'candles', () => this.draw());
  }

  resize = (newW: number, newH: number): void => {
    const newWidth = getWidth(newW);
    const newHeight = getHeight(newH);

    this.#candlestick.xScale(this.#x.range([0, newWidth])).yScale(this.#y.range([newHeight, 0]));

    d3.select(this.#node).select('svg').attr('width', newWidth + margin.left + margin.right)
      .attr('height', newHeight + margin.top + margin.bottom);

    this.#valueText.attr('x', newWidth - 5);

    this.#container.selectAll('g.candlestick').call(this.#candlestick as TodoAny);
    this.#container.selectAll('g.tradearrow').call(this.#tradearrow as TodoAny);

    this.#container.selectAll('g.x.axis').attr('transform', `translate(0,${newHeight})`).call(this.#xAxis as TodoAny);
    this.#container.selectAll('g.y.axis').call(this.#yAxis as TodoAny);
  };

  draw = (trades: Trade[] = []): void => {
    const accessor = this.#candlestick.accessor();

    const data = this.candles.map((d) => ({
      date: new Date(d.time),
      open: +d.open,
      high: +d.high,
      low: +d.low,
      close: +d.close,
      volume: +d.volume,
    })).sort((a, b) => d3.ascending(accessor.d(a), accessor.d(b)));

    this.#x.zoomable();
    // .domain(event.transform.rescaleX(convertType<d3.ZoomScale>(this.#zoomableScale)).domain());

    this.#x.domain(data.map(this.#candlestick.accessor().d));

    this.#y.domain(techan.scale.plot.ohlc(data, this.#candlestick.accessor()).domain());

    this.#container.selectAll('g.candlestick').datum(data).call(this.#candlestick as TodoAny);
    this.#container.selectAll('g.tradearrow').datum(trades).call(this.#tradearrow as TodoAny);

    this.#container.selectAll('g.x.axis').call(this.#xAxis as TodoAny);
    this.#container.selectAll('g.y.axis').call(this.#yAxis as TodoAny);
  };
}
