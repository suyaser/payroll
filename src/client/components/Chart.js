import React from "react";
import { PieChart, Pie, Cell, Tooltip, Sector } from "recharts";

const renderActiveShape = props => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload
  } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#000000">
        <tspan x={cx} y={cy} dy="-.4em">
          {payload.name}
        </tspan>
        <tspan x={cx} y={cy} dy=".7em">
          {payload.value}
          &nbsp;/&nbsp;
          {payload.total}
        </tspan>
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

class Chart extends React.Component {
  state = { activeIndex: 0 };

  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index
    });
  };

  render() {
    const { num, numOk, numNok, numNp, Ok, Nok, Np } = this.props;
    const data = [
      { name: Ok, value: numOk, total: num },
      { name: Nok, value: numNok, total: num },
      { name: Np, value: numNp, total: num }
    ];

    const COLORS = ["#1add1a", "#dd1a1a", "#D3D3D3"];

    return (
      <div style={{ padding: "10px" }} className="text-center">
        <PieChart width={180} height={180} style={{ margin: "10px auto" }}>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            fill="#82ca9d"
            activeIndex={this.state.activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={this.onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    );
  }
}
export default Chart;
