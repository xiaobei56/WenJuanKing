import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, message, Badge } from 'antd';
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined, SwapOutlined } from 'antd';
import { projectAPI } from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
  answerCount: number;
  createTime: string;
}

const DashboardPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.list(1, 100);
      setProjects(res.data.items || []);
    } catch (err) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = (type: number) => {
    const types = ['问卷', '考试', '投票', '测评'];
    return types[type - 1] || '问卷';
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: number) => <Tag color="blue">{getTypeName(type)}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Badge
          status={status === 1 ? 'success' : 'warning'}
          text={status === 1 ? '已发布' : '草稿'}
        />
      ),
    },
    {
      title: '答卷数',
      dataIndex: 'answerCount',
      key: 'answerCount',
      width: 100,
      render: (count: number) => <span style={{ color: '#1890ff' }}>{count}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Project) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">统计</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>控制台</h2>
        <Space>
          <Button.Group>
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            />
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            />
          </Button.Group>
        </Space>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {projects.length}
            </div>
            <div style={{ color: '#666' }}>项目总数</div>
          </Card>
          <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
              {projects.filter(p => p.status === 1).length}
            </div>
            <div style={{ color: '#666' }}>已发布</div>
          </Card>
          <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
              {projects.reduce((sum, p) => sum + (p.answerCount || 0), 0)}
            </div>
            <div style={{ color: '#666' }}>答卷总数</div>
          </Card>
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;