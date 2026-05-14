import React, { useState } from 'react';
import { Card, Button, Empty, message, Modal, Form, Input, Select, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined, ShareAltOutlined, MoreOutlined } from 'ant-design/icons';
import { useNavigate } from 'react-router-dom';
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

const ProjectCard: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  onShare: () => void;
}> = ({ project, onEdit, onDelete, onDuplicate, onPreview, onShare }) => {
  const getTypeName = (type: number) => {
    const types = ['问卷', '考试', '投票', '测评'];
    return types[type - 1] || '问卷';
  };

  const getTypeColor = (type: number) => {
    const colors = ['blue', 'green', 'orange', 'purple'];
    return colors[type - 1] || 'blue';
  };

  return (
    <Card
      hoverable
      className="project-card"
      actions={[
        <Tooltip title="预览" key="preview">
          <EyeOutlined onClick={onPreview} />
        </Tooltip>,
        <Tooltip title="编辑" key="edit">
          <EditOutlined onClick={onEdit} />
        </Tooltip>,
        <Tooltip title="复制" key="duplicate">
          <CopyOutlined onClick={onDuplicate} />
        </Tooltip>,
        <Tooltip title="分享" key="share">
          <ShareAltOutlined onClick={onShare} />
        </Tooltip>,
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{project.name}</div>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
            {project.description || '暂无描述'}
          </div>
          <Space>
            <Tag color={getTypeColor(project.type)}>{getTypeName(project.type)}</Tag>
            <Tag color={project.status === 1 ? 'success' : 'default'}>
              {project.status === 1 ? '已发布' : '草稿'}
            </Tag>
          </Space>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
            {project.answerCount || 0}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>答卷数</div>
        </div>
      </div>
      <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
        创建于 {new Date(project.createTime).toLocaleDateString()}
      </div>
    </Card>
  );
};

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [form] = Form.useForm();

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

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const res = await projectAPI.create(values);
      message.success('创建成功');
      setCreateVisible(false);
      form.resetFields();
      navigate(`/project/${res.data.id}`);
    } catch (err) {
      message.error('创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectAPI.delete(id);
      message.success('删除成功');
      fetchProjects();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await projectAPI.duplicate(id);
      message.success('复制成功');
      fetchProjects();
    } catch (err) {
      message.error('复制失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await projectAPI.publish(id);
      message.success('发布成功');
      fetchProjects();
    } catch (err) {
      message.error('发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await projectAPI.unpublish(id);
      message.success('取消发布成功');
      fetchProjects();
    } catch (err) {
      message.error('取消发布失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>项目管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateVisible(true)}
        >
          新建项目
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="暂无项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setCreateVisible(true)}>
              创建第一个项目
            </Button>
          </Empty>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => navigate(`/project/${project.id}`)}
              onDelete={() => handleDelete(project.id)}
              onDuplicate={() => handleDuplicate(project.id)}
              onPreview={() => navigate(`/project/${project.id}/preview`)}
              onShare={() => {
                navigator.clipboard.writeText(`${window.location.origin}/survey/${project.id}`);
                message.success('链接已复制');
              }}
            />
          ))}
        </div>
      )}

      <Modal
        title="新建项目"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select
              options={[
                { value: 1, label: '问卷' },
                { value: 2, label: '考试' },
                { value: 3, label: '投票' },
                { value: 4, label: '测评' },
              ]}
            />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectListPage;