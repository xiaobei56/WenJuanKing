import React, { useState } from 'react';
import { Card, Typography, Progress, Row, Col, Statistic, Table, Pie } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';

const { Title, Text } = Typography;

interface AnswerStatistics {
  total: number;
  completed: number;
  abandoned: number;
  avgTimeSpent: number;
  scoreDistribution: Record<string, number>;
  dailyTrend?: number[];
}

interface StatisticsCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, suffix, icon, color }) => (
  <Card hoverable>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 32, color }}>{icon}</div>
      <div>
        <Text type="secondary">{title}</Text>
        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
          {value}
          {suffix && <span style={{ fontSize: 14 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  </Card>
);

interface AnswerStatisticsChartProps {
  statistics: AnswerStatistics;
}

export const AnswerStatisticsChart: React.FC<AnswerStatisticsChartProps> = ({ statistics }) => {
  const completionRate = statistics.total > 0
    ? Math.round((statistics.completed / statistics.total) * 100)
    : 0;

  const pieOption = {
    title: { text: '答卷完成率', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: true, formatter: '{b}: {c} ({d}%)' },
        data: [
          { value: statistics.completed, name: '已完成', itemStyle: { color: '#52c41a' } },
          { value: statistics.abandoned, name: '未完成', itemStyle: { color: '#ff4d4f' } },
        ],
      },
    ],
  };

  const barOption = {
    title: { text: '分数分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: Object.keys(statistics.scoreDistribution || {}),
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: Object.values(statistics.scoreDistribution || {}),
        itemStyle: { color: '#1890ff' },
      },
    ],
  };

  const trendOption = {
    title: { text: '每日趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        data: statistics.dailyTrend || [120, 200, 150, 80, 70, 110, 130],
        smooth: true,
        areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
        itemStyle: { color: '#1890ff' },
      },
    ],
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="总答卷数"
            value={statistics.total}
            icon={<BarChartOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="完成数"
            value={statistics.completed}
            icon={<PieChartOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="平均时长"
            value={Math.round(statistics.avgTimeSpent / 60)}
            suffix="分钟"
            icon={<LineChartOutlined />}
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="完成率"
              value={completionRate}
              suffix="%"
              valueStyle={{ color: completionRate > 50 ? '#52c41a' : '#ff4d4f' }}
            />
            <Progress
              percent={completionRate}
              showInfo={false}
              strokeColor={completionRate > 50 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactEcharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactEcharts option={barOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card>
            <ReactEcharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

interface AnswerListProps {
  answers: any[];
  loading: boolean;
}

export const AnswerList: React.FC<AnswerListProps> = ({ answers, loading }) => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true },
    { title: '用户', dataIndex: 'userId', key: 'userId', ellipsis: true },
    { title: '得分', dataIndex: 'score', key: 'score', width: 80 },
    { title: '用时', dataIndex: 'timeSpent', key: 'timeSpent', width: 100,
      render: (t: number) => `${Math.round(t / 60)}分钟` },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
    { title: '提交时间', dataIndex: 'createTime', key: 'createTime', width: 180,
      render: (t: string) => new Date(t).toLocaleString() },
  ];

  return (
    <Table
      columns={columns}
      dataSource={answers}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default AnswerStatisticsChart;