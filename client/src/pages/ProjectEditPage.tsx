import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, message, Tabs, Table, Tag, Modal, Typography
} from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { projectAPI, questionAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Question {
  id: string;
  projectId: string;
  title: string;
  type: number;
  required: boolean;
  options: string;
  orderNum: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
}

const QUESTION_TYPES = [
  { value: 1, label: '单选' },
  { value: 2, label: '多选' },
  { value: 3, label: '输入框' },
  { value: 4, label: '文本域' },
  { value: 5, label: '下拉选择' },
  { value: 6, label: '多选下拉' },
  { value: 7, label: '级联选择' },
  { value: 8, label: '日期' },
  { value: 9, label: '日期范围' },
  { value: 10, label: '日期时间' },
  { value: 14, label: '滑块' },
  { value: 15, label: '评分' },
  { value: 16, label: '开关' },
  { value: 26, label: '数字' },
];

const PROJECT_TYPES = [
  { value: 1, label: '问卷' },
  { value: 2, label: '考试' },
  { value: 3, label: '投票' },
  { value: 4, label: '测评' },
];

const ProjectEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form] = Form.useForm();
  const [project, setProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [questionForm] = Form.useForm();

  useEffect(() => {
    if (!isNew && id) {
      fetchProject(id);
      fetchQuestions(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const res = await projectAPI.get(projectId);
      setProject(res.data);
      form.setFieldsValue({
        name: res.data.name,
        description: res.data.description,
        type: res.data.type,
      });
    } catch (err) {
      message.error('获取项目失败');
    }
  };

  const fetchQuestions = async (projectId: string) => {
    try {
      const res = await questionAPI.list(projectId);
      setQuestions(res.data || []);
    } catch (err) {
      message.error('获取题目失败');
    }
  };

  const handleSaveProject = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      let projectId = id;

      if (isNew) {
        const res = await projectAPI.create({
          name: values.name,
          description: values.description,
          type: values.type,
        });
        projectId = res.data.id;
        navigate(`/project/${projectId}`, { replace: true });
      } else {
        await projectAPI.update(id!, values);
      }
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!project && !id) {
      message.error('请先保存项目');
      return;
    }

    const projectId = project?.id || id!;
    setSaving(true);
    try {
      const values = questionForm.getFieldsValue();
      const questionData = {
        title: values.title,
        type: values.type,
        required: values.required || false,
        options: JSON.stringify(values.options || []),
      };

      if (editingQuestion) {
        await questionAPI.update(projectId, editingQuestion.id, questionData);
        message.success('更新题目成功');
      } else {
        await questionAPI.create(projectId, questionData);
        message.success('添加题目成功');
      }

      setQuestionModalVisible(false);
      questionForm.resetFields();
      setEditingQuestion(null);
      fetchQuestions(projectId);
    } catch (err) {
      message.error('保存题目失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const projectId = project?.id || id!;
    try {
      await questionAPI.delete(projectId, questionId);
      message.success('删除成功');
      fetchQuestions(projectId);
    } catch (err) {
      message.error('删除失败');
    }
  };

  const openQuestionModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      const options = question.options ? JSON.parse(question.options) : [];
      questionForm.setFieldsValue({
        title: question.title,
        type: question.type,
        required: question.required,
        options,
      });
    } else {
      setEditingQuestion(null);
      questionForm.resetFields();
    }
    setQuestionModalVisible(true);
  };

  const questionColumns = [
    {
      title: '序号',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const qt = QUESTION_TYPES.find(t => t.value === type);
        return qt?.label || '未知';
      },
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Question) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openQuestionModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuestion(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveProject}
          loading={loading}
        >
          保存项目
        </Button>
      </Space>

      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>
              <Form.Item label="项目类型" name="type" rules={[{ required: true }]}>
                <Select options={PROJECT_TYPES} placeholder="请选择项目类型" />
              </Form.Item>
              <Form.Item label="描述" name="description">
                <TextArea rows={3} placeholder="请输入项目描述" />
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {!isNew && (
          <TabPane tab={`题目 (${questions.length})`} key="questions">
            <Card
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openQuestionModal()}
                >
                  添加题目
                </Button>
              }
            >
              <Table
                columns={questionColumns}
                dataSource={questions}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </TabPane>
        )}
      </Tabs>

      <Modal
        title={editingQuestion ? '编辑题目' : '添加题目'}
        open={questionModalVisible}
        onOk={handleSaveQuestion}
        onCancel={() => setQuestionModalVisible(false)}
        confirmLoading={saving}
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item label="题目标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入题目标题" />
          </Form.Item>
          <Form.Item label="题目类型" name="type" rules={[{ required: true }]}>
            <Select options={QUESTION_TYPES} placeholder="请选择题目类型" />
          </Form.Item>
          <Form.Item name="required" valuePropName="checked">
            <label>
              <input type="checkbox" /> 必填
            </label>
          </Form.Item>
          <Form.Item label="选项（JSON格式）" name="options">
            <Input.TextArea
              rows={4}
              placeholder='例如: [{"label": "选项1", "value": "1"}]'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectEditPage;