import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Input, Modal, Form, message, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, AppstoreOutlined, StarOutlined, ShareOutlined } from '@ant-design/icons';
import { repoAPI } from '../services/api';

const { useForm } = Form;

interface Template {
  id: string;
  name: string;
  description: string;
  type: number;
  isPublic: boolean;
  useCount: number;
  createTime: string;
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = useForm();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await repoAPI.list(1, 50);
      setTemplates(res.data.items || []);
    } catch (err) {
      message.error('获取模板失败');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await repoAPI.create({
        name: values.name,
        description: values.description,
        type: values.type,
        content: '{}',
        isPublic: false,
      });
      message.success('创建成功');
      setVisible(false);
      form.resetFields();
      fetchTemplates();
    } catch (err) {
      message.error('创建失败');
    }
  };

  const handleUse = (template: Template) => {
    message.info(`使用模板: ${template.name}`);
  };

  const handlePublish = async (template: Template) => {
    try {
      // Simulated publish
      message.success('发布成功');
    } catch (err) {
      message.error('发布失败');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    t.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>模板库</h2>
        <Space>
          <Input
            placeholder="搜索模板"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setVisible(true)}
          >
            创建模板
          </Button>
        </Space>
      </div>

      <Card>
        {filteredTemplates.length === 0 ? (
          <Empty description="暂无模板" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={filteredTemplates}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button type="link" key="use" onClick={() => handleUse(item)}>
                      使用
                    </Button>,
                    <Button type="link" key="publish" onClick={() => handlePublish(item)}>
                      发布
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        {item.name}
                        {item.isPublic && <Tag color="green">公开</Tag>}
                      </Space>
                    }
                    description={
                      <div>
                        <p style={{ color: '#666', fontSize: 12 }}>{item.description}</p>
                        <div style={{ marginTop: 8 }}>
                          <Tag>{['问卷', '考试', '投票', '测评'][item.type - 1]}</Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            使用 {item.useCount} 次
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="创建模板"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true }]}
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
        </Form>
      </Modal>
    </div>
  );
};

export default TemplatesPage;