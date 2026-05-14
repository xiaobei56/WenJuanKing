import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Card, Space, Tabs, Table, Tag, Modal, message, Typography, Divider, Popconfirm } from 'antd';
import {
  SaveOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, CopyOutlined,
  DragOutlined, SettingOutlined, HistoryOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, questionAPI } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';
import { getQuestionComponent } from '../components/QuestionComponents';

const { Title, Text } = Typography;
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
  { value: 8, label: '日期' },
  { value: 9, label: '日期范围' },
  { value: 14, label: '滑块' },
  { value: 15, label: '评分' },
  { value: 16, label: '开关' },
  { value: 17, label: '文件上传' },
  { value: 26, label: '数字' },
];

const PROJECT_TYPES = [
  { value: 1, label: '问卷' },
  { value: 2, label: '考试' },
  { value: 3, label: '投票' },
  { value: 4, label: '测评' },
];

const QuestionItem: React.FC<{
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ question, index, onEdit, onDelete }) => {
  let options: any[] = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch (e) {}

  const QuestionComponent = getQuestionComponent(question.type);

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DragOutlined style={{ cursor: 'grab', color: '#999' }} />
          <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
          <span style={{ flex: 1 }}>{question.title}</span>
          {question.required && <Tag color="red" style={{ margin: 0 }}>必填</Tag>}
        </div>
      }
      extra={
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
          <Popconfirm title="确认删除?" onConfirm={onDelete}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      }
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {QUESTION_TYPES.find(t => t.value === question.type)?.label || '未知'}
        </Text>
      </div>

      <QuestionComponent
        type={question.type}
        options={options}
        value={null}
        onChange={() => {}}
      />
    </Card>
  );
};

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

  useEffect(() => {
    if (!isNew && id) {
      fetchProject(id);
      fetchQuestions(id);
    }
  }, [id]);

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
        await projectAPI.update(id!, {
          name: values.name,
          description: values.description,
        });
      }
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = () => {
    setQuestionModalVisible(false);
    if (id && id !== 'new') {
      fetchQuestions(id);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!id) return;
    try {
      await questionAPI.delete(id, questionId);
      message.success('删除成功');
      fetchQuestions(id);
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      await projectAPI.publish(id);
      message.success('发布成功');
      fetchProject(id);
    } catch (err) {
      message.error('发布失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveProject}
            loading={loading}
          >
            保存项目
          </Button>
          {!isNew && project?.status === 0 && (
            <Button onClick={handlePublish}>发布</Button>
          )}
        </Space>
        {!isNew && (
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/project/${id}/preview`)}>
            预览
          </Button>
        )}
      </div>

      <Tabs
        items={[
          {
            key: 'basic',
            label: '基本信息',
            children: (
              <Card>
                <Form form={form} layout="vertical">
                  <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
                    <Input placeholder="请输入项目名称" />
                  </Form.Item>
                  <Form.Item label="项目类型" name="type" rules={[{ required: true }]}>
                    <Select options={PROJECT_TYPES} placeholder="请选择项目类型" disabled={!isNew} />
                  </Form.Item>
                  <Form.Item label="描述" name="description">
                    <TextArea rows={3} placeholder="请输入项目描述" />
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          ...(!isNew ? [{
            key: 'questions',
            label: `题目配置 (${questions.length})`,
            children: (
              <Card
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingQuestion(null);
                      setQuestionModalVisible(true);
                    }}
                  >
                    添加题目
                  </Button>
                }
              >
                {questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">暂无题目，点击添加按钮创建题目</Text>
                  </div>
                ) : (
                  questions.map((q, i) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      index={i}
                      onEdit={() => {
                        setEditingQuestion(q);
                        setQuestionModalVisible(true);
                      }}
                      onDelete={() => handleDeleteQuestion(q.id)}
                    />
                  ))
                )}
              </Card>
            ),
          }] : []),
        ]}
      />

      <Modal
        title={editingQuestion ? '编辑题目' : '添加题目'}
        open={questionModalVisible}
        onCancel={() => setQuestionModalVisible(false)}
        footer={null}
        width={700}
      >
        {id && id !== 'new' && (
          <QuestionEditor
            projectId={id}
            question={editingQuestion || undefined}
            onSave={handleSaveQuestion}
            onCancel={() => setQuestionModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProjectEditPage;