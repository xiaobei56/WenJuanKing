import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Row, Col, Card, Space } from 'antd';
import { FileTextOutlined, TeamOutlined, BarChartOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Title level={1}>欢迎使用 SurveyKing v2</Title>
      <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 40 }}>
        开源问卷/考试系统 - 使用 Go + React + PostgreSQL 构建
      </Paragraph>

      <Row gutter={[24, 24]} style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={4}>问卷创建</Title>
            <Paragraph>支持31种题型，灵活构建问卷</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <Title level={4}>数据收集</Title>
            <Paragraph>快速收集用户反馈数据</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <BarChartOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
            <Title level={4}>统计分析</Title>
            <Paragraph>实时查看答卷统计结果</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <RocketOutlined style={{ fontSize: 48, color: '#722ed1' }} />
            <Title level={4}>快速发布</Title>
            <Paragraph>一键发布，立即收集答卷</Paragraph>
          </Card>
        </Col>
      </Row>

      <Space size="large" style={{ marginTop: 50 }}>
        <Link to="/login">
          <Button type="primary" size="large">登录</Button>
        </Link>
        <Link to="/register">
          <Button size="large">注册</Button>
        </Link>
      </Space>
    </div>
  );
};

export default HomePage;