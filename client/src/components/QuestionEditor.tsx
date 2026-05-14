import React, { useState } from 'react';
import { Form, Input, Upload, Select, Button, Space, Card, Typography, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { questionAPI } from '../services/api';

const { TextArea } = Input;

const { useForm } = Form;

interface Option {
  label: string;
  value: string;
  score?: number;
  enabled?: boolean;
}

interface LogicRule {
  condition: string;
  action: string;
  targetQuestionId?: string;
}

interface QuestionEditorProps {
  projectId: string;
  question?: {
    id?: string;
    title: string;
    type: number;
    required: boolean;
    options: string;
    validation: string;
    logic: string;
    settings: string;
  };
  onSave: () => void;
  onCancel: () => void;
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
  { value: 11, label: '日期时间范围' },
  { value: 12, label: '时间' },
  { value: 13, label: '时间范围' },
  { value: 14, label: '滑块' },
  { value: 15, label: '评分' },
  { value: 16, label: '开关' },
  { value: 17, label: '文件上传' },
  { value: 18, label: '多文件上传' },
  { value: 20, label: '按钮' },
  { value: 21, label: '图片' },
  { value: 22, label: '视频' },
  { value: 23, label: '音频' },
  { value: 24, label: '地址位置' },
  { value: 25, label: '手机号' },
  { value: 26, label: '数字' },
  { value: 27, label: '货币' },
  { value: 28, label: '网址' },
  { value: 29, label: '颜色选择' },
  { value: 30, label: '评分等级' },
  { value: 31, label: '签名' },
  { value: 33, label: '公告' },
  { value: 34, label: '分割线' },
  { value: 35, label: '分页符' },
];

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  projectId,
  question,
  onSave,
  onCancel,
}) => {
  const [form] = useForm();
  const [options, setOptions] = useState<Option[]>([]);
  const [logicRules, setLogicRules] = useState<LogicRule[]>([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (question) {
      form.setFieldsValue({
        title: question.title,
        type: question.type,
        required: question.required,
        options: question.options,
        validation: question.validation,
        logic: question.logic,
        settings: question.settings,
      });
      try {
        setOptions(JSON.parse(question.options || '[]'));
        setLogicRules(JSON.parse(question.logic || '[]'));
      } catch (e) {}
    } else {
      form.resetFields();
      setOptions([]);
      setLogicRules([]);
    }
  }, [question, form]);

  const handleAddOption = () => {
    const newOption: Option = {
      label: `选项${options.length + 1}`,
      value: `option_${options.length + 1}`,
      score: 0,
      enabled: true,
    };
    setOptions([...options, newOption]);
  };

  const handleUpdateOption = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddLogic = () => {
    setLogicRules([
      ...logicRules,
      { condition: 'equals', action: 'jump', targetQuestionId: '' },
    ]);
  };

  const handleUpdateLogic = (index: number, field: keyof LogicRule, value: any) => {
    const newRules = [...logicRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setLogicRules(newRules);
  };

  const handleDeleteLogic = (index: number) => {
    setLogicRules(logicRules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      const questionData = {
        title: values.title,
        type: values.type,
        required: values.required || false,
        options: JSON.stringify(options),
        validation: values.validation || '{}',
        logic: JSON.stringify(logicRules),
        settings: values.settings || '{}',
      };

      if (question?.id) {
        await questionAPI.update(projectId, question.id, questionData);
        message.success('更新成功');
      } else {
        await questionAPI.create(projectId, questionData);
        message.success('创建成功');
      }
      onSave();
    } catch (err) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={question?.id ? '编辑题目' : '添加题目'}>
      <Form form={form} layout="vertical">
        <Form.Item label="题目标题" name="title" rules={[{ required: true }]}>
          <Input placeholder="请输入题目标题" />
        </Form.Item>

        <Form.Item label="题目类型" name="type" rules={[{ required: true }]}>
          <Select options={QUESTION_TYPES} placeholder="请选择题目类型" />
        </Form.Item>

        <Form.Item name="required" valuePropName="checked">
          <label>
            <input type="checkbox" style={{ marginRight: 8 }} />
            必填题目
          </label>
        </Form.Item>

        <Card
          title="选项配置"
          extra={
            <Button type="link" icon={<PlusOutlined />} onClick={handleAddOption}>
              添加选项
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          {options.map((opt, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <Input
                placeholder="选项文字"
                value={opt.label}
                onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="分值"
                type="number"
                value={opt.score}
                onChange={(e) => handleUpdateOption(index, 'score', parseInt(e.target.value) || 0)}
                style={{ width: 80 }}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteOption(index)}
              />
            </div>
          ))}
          {options.length === 0 && (
            <Text type="secondary">暂无选项，点击添加按钮添加选项</Text>
          )}
        </Card>

        <Card
          title="跳题逻辑"
          extra={
            <Button type="link" icon={<PlusOutlined />} onClick={handleAddLogic}>
              添加逻辑
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          {logicRules.map((rule, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <Select
                value={rule.condition}
                onChange={(val) => handleUpdateLogic(index, 'condition', val)}
                style={{ width: 120 }}
                options={[
                  { value: 'equals', label: '等于' },
                  { value: 'not_equals', label: '不等于' },
                  { value: 'contains', label: '包含' },
                  { value: 'greater', label: '大于' },
                  { value: 'less', label: '小于' },
                ]}
              />
              <Select
                value={rule.action}
                onChange={(val) => handleUpdateLogic(index, 'action', val)}
                style={{ width: 120 }}
                options={[
                  { value: 'jump', label: '跳转到' },
                  { value: 'hide', label: '隐藏' },
                  { value: 'show', label: '显示' },
                ]}
              />
              <Input
                placeholder="目标题目ID"
                value={rule.targetQuestionId}
                onChange={(e) => handleUpdateLogic(index, 'targetQuestionId', e.target.value)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteLogic(index)}
              />
            </div>
          ))}
          {logicRules.length === 0 && (
            <Text type="secondary">暂无跳题逻辑</Text>
          )}
        </Card>

        <Form.Item label="高级设置" name="settings">
          <TextArea rows={3} placeholder="JSON格式设置" />
        </Form.Item>

        <Form.Item label="验证规则" name="validation">
          <TextArea rows={2} placeholder="JSON格式验证规则" />
        </Form.Item>
      </Form>

      <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit} loading={saving}>
          保存
        </Button>
      </Space>
    </Card>
  );
};

export default QuestionEditor;