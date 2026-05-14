import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Tag, Modal, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { projectAPI } from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
  createTime: string;
  updateTime: string;
}

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchProjects = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await projectAPI.list(pageNum, 20);
      setProjects(res.data.items || []);
      setTotal(res.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await projectAPI.delete(id);
      message.success('删除成功');
      fetchProjects(page);
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await projectAPI.publish(id);
      message.success('发布成功');
      fetchProjects(page);
    } catch (err) {
      message.error('发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await projectAPI.unpublish(id);
      message.success('取消发布成功');
      fetchProjects(page);
    } catch (err) {
      message.error('取消发布失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/project/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const types = ['问卷', '考试', '投票', '测评'];
        return types[type - 1] || '问卷';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/project/${record.id}/preview`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/project/${record.id}`)}
          />
          {record.status === 1 ? (
            <Button
              type="text"
              icon={<StopOutlined />}
              onClick={() => handleUnpublish(record.id)}
            />
          ) : (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handlePublish(record.id)}
            />
          )}
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>我的项目</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/project/new')}
        >
          新建项目
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: (p) => fetchProjects(p),
          }}
        />
      </Card>
    </div>
  );
};

export default ProjectListPage;