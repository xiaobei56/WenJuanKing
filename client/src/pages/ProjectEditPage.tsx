import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Card, Space, Tabs, Table, Tag, Modal, message, Typography, Divider, Popconfirm } from 'antd';
import {
  SaveOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, CopyOutlined,
  DragOutlined, SettingOutlined, HistoryOutlined, HolderOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, questionAPI, answerAPI } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';
import QuestionTypePicker from '../components/QuestionTypePicker';
import { getQuestionComponent } from '../components/QuestionComponents';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  validation?: string;
  logic?: string;
  settings?: string;
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

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  let options: any[] = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch (e) {}

  const QuestionComponent = getQuestionComponent(question.type);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        size="small"
        style={{ marginBottom: 12, border: isDragging ? '2px solid #1890ff' : undefined }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              {...listeners}
              style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
            >
              <HolderOutlined style={{ color: '#999', fontSize: 16 }} />
            </span>
            <span style={{ fontWeight: 'bold', minWidth: 24 }}>{index + 1}.</span>
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
    </div>
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
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [examDuration, setExamDuration] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && id && id !== 'new') {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex);
        setQuestions(newQuestions);

        try {
          await questionAPI.sort(id, newQuestions.map((q) => q.id));
          message.success('题目顺序已保存');
        } catch (err) {
          message.error('保存顺序失败');
          fetchQuestions(id);
        }
      }
    }
  }, [questions, id]);

  const fetchProject = async (projectId: string) => {
    try {
      const res = await projectAPI.get(projectId);
      setProject(res.data);
      let duration = 0;
      if (res.data.settings) {
        try {
          const settings = JSON.parse(res.data.settings);
          duration = settings.examDuration || 0;
        } catch (e) {}
      }
      setExamDuration(duration);
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
      const settings: Record<string, any> = {};
      if (values.type === 2 && examDuration > 0) {
        settings.examDuration = examDuration;
      }
      const settingsStr = Object.keys(settings).length > 0 ? JSON.stringify(settings) : undefined;

      if (isNew) {
        const res = await projectAPI.create({
          name: values.name,
          description: values.description,
          type: values.type,
          settings: settingsStr,
        });
        projectId = res.data.id;
        navigate(`/project/${projectId}`, { replace: true });
      } else {
        await projectAPI.update(id!, {
          name: values.name,
          description: values.description,
          settings: settingsStr,
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

  const fetchStatistics = async (projectId: string) => {
    setStatsLoading(true);
    try {
      const res = await answerAPI.statistics(projectId);
      setStats(res.data);
    } catch (err) {
      message.error('获取统计数据失败');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const response = await answerAPI.export(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `answers_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (err) {
      message.error('导出失败');
    }
  };

  useEffect(() => {
    if (!isNew && id) {
      fetchProject(id);
      fetchQuestions(id);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew && id) {
      fetchStatistics(id);
    }
  }, [id]);

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
                  {project?.type === 2 && (
                    <Form.Item label="考试时长（分钟）">
                      <Input
                        type="number"
                        value={examDuration}
                        onChange={(e) => setExamDuration(parseInt(e.target.value) || 0)}
                        placeholder="0表示不限时"
                      />
                    </Form.Item>
                  )}
                </Form>
              </Card>
            ),
          },
          ...(!isNew ? [
            {
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
                      setSelectedQuestionType(null);
                      setTypePickerVisible(true);
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {questions.map((q, i) => (
                          <SortableQuestionItem
                            key={q.id}
                            question={q}
                            index={i}
                            onEdit={() => {
                              setEditingQuestion(q);
                              setQuestionModalVisible(true);
                            }}
                            onDelete={() => handleDeleteQuestion(q.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </Card>
              ),
            },
            {
              key: 'statistics',
              label: '数据统计',
              children: (
                <Card
                  extra={
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                      导出CSV
                    </Button>
                  }
                >
                  {statsLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
                  ) : stats ? (
                    <Space size="large" style={{ marginBottom: 24 }}>
                      <Card size="small">
                        <Text type="secondary">总答卷</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.total || 0}</div>
                      </Card>
                      <Card size="small">
                        <Text type="secondary">已完成</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{stats.completed || 0}</div>
                      </Card>
                      <Card size="small">
                        <Text type="secondary">已放弃</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>{(stats.total || 0) - (stats.completed || 0)}</div>
                      </Card>
                      <Card size="small">
                        <Text type="secondary">平均用时</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.avgTimeSpent ? `${Math.round(stats.avgTimeSpent / 60)}分钟` : '-'}</div>
                      </Card>
                    </Space>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">暂无答卷数据</Text>
                    </div>
                  )}
                </Card>
              ),
            },
          ] : []),
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
            questions={questions}
            initialType={selectedQuestionType || undefined}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setQuestionModalVisible(false);
              setSelectedQuestionType(null);
            }}
          />
        )}
      </Modal>

      <QuestionTypePicker
        open={typePickerVisible}
        onSelect={(type) => {
          setTypePickerVisible(false);
          setSelectedQuestionType(type);
          setEditingQuestion(null);
          setQuestionModalVisible(true);
        }}
        onCancel={() => setTypePickerVisible(false)}
      />
    </div>
  );
};

export default ProjectEditPage;